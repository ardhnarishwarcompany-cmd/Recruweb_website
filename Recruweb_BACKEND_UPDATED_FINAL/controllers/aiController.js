import { Job, Candidate } from "../models/index.js";
import { parseJobDescription } from "../utils/jdParser.js";
import { computeMatchScore, rankCandidatesForJob } from "../utils/matching.js";
import { generateEmail } from "../utils/aiEmailWriter.js";
import { parseResume } from "../utils/resumeParser.js";

// POST /api/ai/parse-jd  { text } OR { jobId } — parses a real job's description
export const parseJD = async (req, res) => {
  try {
    let { text, jobId } = req.body;
    if (jobId) {
      const job = await Job.findByPk(jobId);
      if (!job) {
        return res.status(404).json({ success: false, message: "Job not found" });
      }
      text = job.description;
    }
    if (!text) {
      return res.status(400).json({ success: false, message: "text or jobId is required" });
    }
    const parsed = parseJobDescription(text);
    res.status(200).json({ success: true, data: parsed });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to parse job description", error: error.message });
  }
};

// POST /api/ai/re-parse-resume/:candidateId — re-runs the resume parser
// against the candidate's already-uploaded resume file on disk.
export const reparseResume = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.candidateId);
    if (!candidate) {
      return res.status(404).json({ success: false, message: "Candidate not found" });
    }
    if (!candidate.resume) {
      return res.status(400).json({ success: false, message: "Candidate has no uploaded resume" });
    }
    const path = await import("path");
    const filePath = path.default.join(process.cwd(), candidate.resume.replace(/^\//, ""));
    const parsed = await parseResume(filePath);
    await candidate.update({
      resumeText: parsed.resumeText,
      skills: parsed.skills,
      experience: parsed.experience || candidate.experience,
      education: parsed.education,
      aiScore: parsed.aiScore,
      aiSummary: parsed.aiSummary,
    });
    res.status(200).json({ success: true, message: "Resume re-parsed", data: parsed });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to re-parse resume", error: error.message });
  }
};

// GET /api/ai/match/:jobId — ranked list of every candidate against a real job
export const matchCandidatesForJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    const candidates = await Candidate.findAll({ where: { isActive: true } });
    const ranked = rankCandidatesForJob(candidates, job);

    res.status(200).json({
      success: true,
      jobId: job.id,
      jobTitle: job.title,
      count: ranked.length,
      data: ranked.map((r) => ({
        candidateId: r.candidate.id,
        candidateName: `${r.candidate.firstName} ${r.candidate.lastName || ""}`.trim(),
        score: r.score,
        breakdown: r.breakdown,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to match candidates", error: error.message });
  }
};

// GET /api/ai/rank/:jobId — same as match, but scoped to candidates already
// applied/linked to this job (candidate.jobId), i.e. AI Candidate Ranking
// within an active pipeline rather than the whole database.
export const rankCandidatesInPipeline = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    const candidates = await Candidate.findAll({ where: { jobId: job.id } });
    const ranked = rankCandidatesForJob(candidates, job);

    res.status(200).json({
      success: true,
      jobId: job.id,
      jobTitle: job.title,
      count: ranked.length,
      data: ranked.map((r, idx) => ({
        rank: idx + 1,
        candidateId: r.candidate.id,
        candidateName: `${r.candidate.firstName} ${r.candidate.lastName || ""}`.trim(),
        pipelineStage: r.candidate.pipelineStage,
        score: r.score,
        breakdown: r.breakdown,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to rank candidates", error: error.message });
  }
};

// POST /api/ai/match-score  { candidateId, jobId } — single pair score
export const getMatchScore = async (req, res) => {
  try {
    const { candidateId, jobId } = req.body;
    const [candidate, job] = await Promise.all([
      Candidate.findByPk(candidateId),
      Job.findByPk(jobId),
    ]);
    if (!candidate || !job) {
      return res.status(404).json({ success: false, message: "Candidate or Job not found" });
    }
    const result = computeMatchScore(candidate, job);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to compute match score", error: error.message });
  }
};

// POST /api/ai/generate-email
// { type, candidateId, jobId, extra } — builds context from real DB rows,
// never invents candidate/job facts.
export const writeEmail = async (req, res) => {
  try {
    const { type = "custom", candidateId, jobId, extra = {} } = req.body;

    const context = { ...extra };
    if (candidateId) {
      const candidate = await Candidate.findByPk(candidateId);
      if (candidate) {
        context.candidateName = `${candidate.firstName} ${candidate.lastName || ""}`.trim();
        context.candidateEmail = candidate.email;
      }
    }
    if (jobId) {
      const job = await Job.findByPk(jobId);
      if (job) {
        context.jobTitle = job.title;
        context.companyName = job.company;
      }
    }

    const email = await generateEmail(type, context);
    res.status(200).json({ success: true, data: email });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to generate email", error: error.message });
  }
};
