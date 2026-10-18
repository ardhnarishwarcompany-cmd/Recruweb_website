// Phase 8 — AI Job Matching & Candidate Ranking.
// Scores are computed purely from real Candidate + Job records already in
// the database (skills, experience, education, aiScore from resume
// parsing). No dummy/random numbers.

import { parseJobDescription } from "./jdParser.js";

const norm = (s) => String(s || "").trim().toLowerCase();

/**
 * @param {object} candidate  Candidate model instance/plain object
 * @param {object} job        Job model instance/plain object
 * @returns {{score:number, breakdown:object}}
 */
export const computeMatchScore = (candidate, job) => {
  const candidateSkills = (candidate.skills || []).map(norm);

  // Prefer the Job's own `skills` JSON column; fall back to parsing its
  // free-text description so older jobs without a `skills` array still work.
  let jobSkills = (job.skills || []).map(norm);
  if (!jobSkills.length && job.description) {
    jobSkills = parseJobDescription(job.description).skills.map(norm);
  }

  let skillOverlapPct = 0;
  let matchedSkills = [];
  if (jobSkills.length) {
    matchedSkills = jobSkills.filter((s) => candidateSkills.includes(s));
    skillOverlapPct = Math.round((matchedSkills.length / jobSkills.length) * 100);
  }

  // Experience fit — full marks if candidate meets/exceeds a rough
  // requirement parsed from the JD text (or falls within 2 years short).
  const parsedJd = job.description ? parseJobDescription(job.description) : {};
  const requiredExp = parsedJd.minExperience || 0;
  const candidateExp = Number(candidate.experience || 0);
  let experienceFitPct = 100;
  if (requiredExp > 0) {
    if (candidateExp >= requiredExp) experienceFitPct = 100;
    else
      experienceFitPct = Math.max(
        0,
        Math.round(100 - (requiredExp - candidateExp) * 20),
      );
  }

  // Resume-quality signal already computed at upload time by resumeParser.js
  const resumeQualityPct = Math.min(Number(candidate.aiScore || 0), 100);

  // Weighted composite score.
  const score = Math.round(
    skillOverlapPct * 0.5 + experienceFitPct * 0.3 + resumeQualityPct * 0.2,
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    breakdown: {
      skillOverlapPct,
      experienceFitPct,
      resumeQualityPct,
      matchedSkills,
      jobSkillsConsidered: jobSkills,
      requiredExperience: requiredExp,
      candidateExperience: candidateExp,
    },
  };
};

/**
 * Ranks a list of candidates against a single job, highest score first.
 */
export const rankCandidatesForJob = (candidates, job) =>
  candidates
    .map((c) => {
      const { score, breakdown } = computeMatchScore(c, job);
      return { candidate: c, score, breakdown };
    })
    .sort((a, b) => b.score - a.score);
