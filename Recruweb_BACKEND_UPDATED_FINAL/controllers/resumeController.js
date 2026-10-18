import { Resume } from "../models/index.js";
import { scoreResumeData, quickScoreResumeData, generateSummaryAI, improveBulletAI } from "../utils/resumeBuilderScore.js";
import { importResumeFile } from "../utils/resumeImport.js";
import fs from "fs";

// GET /api/resumes — every resume the logged-in candidate has built
export const listMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.findAll({
      where: { userId: req.user.id },
      order: [["updatedAt", "DESC"]],
      attributes: { exclude: ["data"] }, // list view doesn't need full content
    });
    res.status(200).json({ success: true, count: resumes.length, data: resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load resumes", error: error.message });
  }
};

// GET /api/resumes/:id
export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });
    res.status(200).json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load resume", error: error.message });
  }
};

// POST /api/resumes — create a new resume
export const createResume = async (req, res) => {
  try {
    const { title, templateId, accentColor, data, targetJobTitle, targetJobDescription } = req.body;
    const resume = await Resume.create({
      userId: req.user.id,
      title: title || "Untitled Resume",
      templateId: templateId || "modern-sidebar",
      accentColor: accentColor || "#2E5AAC",
      data: data || {},
      targetJobTitle: targetJobTitle || null,
      targetJobDescription: targetJobDescription || null,
    });
    res.status(201).json({ success: true, message: "Resume created", data: resume });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create resume", error: error.message });
  }
};

// PUT /api/resumes/:id — save progress (autosave-friendly)
export const updateResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });

    const { title, templateId, accentColor, data, targetJobTitle, targetJobDescription, isPrimary } = req.body;

    if (isPrimary) {
      await Resume.update({ isPrimary: false }, { where: { userId: req.user.id } });
    }

    await resume.update({
      ...(title !== undefined && { title }),
      ...(templateId !== undefined && { templateId }),
      ...(accentColor !== undefined && { accentColor }),
      ...(data !== undefined && { data }),
      ...(targetJobTitle !== undefined && { targetJobTitle }),
      ...(targetJobDescription !== undefined && { targetJobDescription }),
      ...(isPrimary !== undefined && { isPrimary }),
    });

    res.status(200).json({ success: true, message: "Resume saved", data: resume });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to save resume", error: error.message });
  }
};

// DELETE /api/resumes/:id
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });
    await resume.destroy();
    res.status(200).json({ success: true, message: "Resume deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete resume", error: error.message });
  }
};

// POST /api/resumes/:id/duplicate
export const duplicateResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });
    const copy = await Resume.create({
      userId: req.user.id,
      title: `${resume.title} (Copy)`,
      templateId: resume.templateId,
      accentColor: resume.accentColor,
      data: resume.data,
      targetJobTitle: resume.targetJobTitle,
      targetJobDescription: resume.targetJobDescription,
    });
    res.status(201).json({ success: true, message: "Resume duplicated", data: copy });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to duplicate resume", error: error.message });
  }
};

// POST /api/resumes/score — real-time ATS score for in-progress resume data.
// Works on unsaved data (body.data) OR a saved resume (body.resumeId), and
// persists the result onto the resume row when resumeId is given.
export const scoreResume = async (req, res) => {
  try {
    const { resumeId, data, targetJobTitle, targetJobDescription } = req.body;

    let resume = null;
    let payload = data;
    let jobTitle = targetJobTitle;
    let jobDesc = targetJobDescription;

    if (resumeId) {
      resume = await Resume.findOne({ where: { id: resumeId, userId: req.user.id } });
      if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });
      payload = data || resume.data;
      jobTitle = targetJobTitle ?? resume.targetJobTitle;
      jobDesc = targetJobDescription ?? resume.targetJobDescription;
    }

    if (!payload) {
      return res.status(400).json({ success: false, message: "Resume data is required" });
    }

    const result = await scoreResumeData(payload, jobTitle, jobDesc);

    if (resume) {
      await resume.update({
        atsScore: result.score,
        atsSummary: result.summary,
        atsSuggestions: result.suggestions,
        atsKeywordMatches: result.keywordMatches,
        atsMissingKeywords: result.missingKeywords,
        atsScoredAt: new Date(),
      });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to score resume", error: error.message });
  }
};

// POST /api/resumes/quick-score — instant deterministic-only score + category
// breakdown for the "live score" sidebar. Runs on every debounced edit, so it
// never calls OpenAI and never touches the database — just real-time rule
// checks against whatever the candidate has typed so far.
export const quickScoreResume = async (req, res) => {
  try {
    const { data, targetJobDescription } = req.body;
    if (!data) return res.status(400).json({ success: false, message: "Resume data is required" });
    const result = quickScoreResumeData(data, targetJobDescription);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to compute live score", error: error.message });
  }
};

// POST /api/resumes/import — upload an existing resume (or a LinkedIn "Save
// to PDF" export) and get back structured data to pre-fill the builder.
export const importResume = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "A resume file is required" });
    const result = await importResumeFile(file.path);
    fs.unlink(file.path, () => {});
    if (result.error) return res.status(200).json({ success: false, message: result.error });
    res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to import resume", error: error.message });
  }
};

// POST /api/resumes/generate-summary — AI professional summary from real profile facts
export const generateSummary = async (req, res) => {
  try {
    const { headline, yearsExperience, topSkills, achievement, tone } = req.body;
    const summary = await generateSummaryAI({ headline, yearsExperience, topSkills, achievement, tone });
    res.status(200).json({ success: true, data: { summary } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to generate summary", error: error.message });
  }
};

// POST /api/resumes/improve-bullet — AI-rewrite one experience bullet
export const improveBullet = async (req, res) => {
  try {
    const { text, jobTitle } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "text is required" });
    const improved = await improveBulletAI(text, jobTitle);
    res.status(200).json({ success: true, data: { text: improved } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to improve bullet", error: error.message });
  }
};
