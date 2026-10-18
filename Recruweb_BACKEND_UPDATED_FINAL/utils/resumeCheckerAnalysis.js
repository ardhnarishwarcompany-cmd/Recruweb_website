import { extractResumeText } from "./resumeScreening.js";
import { parseJobDescription } from "./jdParser.js";
import { aiScore } from "./resumeBuilderScore.js";

// Public "Resume Checker" tool (frontend: pages/ResumeChecker.jsx).
// Unlike the Resume Builder score (which works on structured step-by-step
// data) or the CV Screening tool (which compares candidates for a
// recruiter), this scores ANY uploaded resume file — PDF or DOCX — on its
// own ATS-friendliness. Everything below is derived from the real extracted
// text: real regex checks, real section-header detection, real keyword
// matching against a real (optional) target job description. Nothing is
// randomised or invented.

const ACTION_VERBS = [
  "led", "built", "created", "designed", "developed", "managed", "launched",
  "improved", "increased", "reduced", "achieved", "delivered", "implemented",
  "optimized", "negotiated", "coordinated", "streamlined", "spearheaded",
  "drove", "generated", "recruited", "trained", "mentored", "automated",
  "analyzed", "resolved", "executed", "scaled", "established",
];

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(\+?\d{1,3}[\s-]?)?\d{10}\b|(\+?\d{1,3}[\s-]?)?\(?\d{3,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}/;
const LINKEDIN_RE = /linkedin\.com\/in\/[a-zA-Z0-9-_]+/i;

const SECTION_HEADERS = {
  summary: /\b(summary|objective|profile)\b/i,
  experience: /\b(experience|employment|work history)\b/i,
  education: /\b(education|academic)\b/i,
  skills: /\b(skills|technical skills|core competencies)\b/i,
};

// Splits the resume into rough "lines that look like bullets" — used as a
// stand-in for structured bullet points since we only have raw text here.
const getBulletLikeLines = (text) =>
  text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && (/^[•\-*▪◦]/.test(l) || l.length < 200));

const deterministicTextScore = (text, jobDescription) => {
  const suggestions = [];
  const lower = text.toLowerCase();
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const email = text.match(EMAIL_RE)?.[0] || null;
  const phone = text.match(PHONE_RE)?.[0]?.trim() || null;
  const linkedin = text.match(LINKEDIN_RE)?.[0] || null;

  // ---- Format ----
  let formatScore = 0;
  if (email && phone) formatScore += 40;
  else suggestions.push("Make sure your email and phone number are clearly visible as plain text (not inside an image) so ATS software can read them.");
  if (linkedin) formatScore += 10;
  if (wordCount >= 250 && wordCount <= 900) formatScore += 50;
  else if (wordCount > 0) {
    formatScore += 25;
    if (wordCount < 250) suggestions.push("Your resume looks short — most recruiters expect at least half a page to a full page of real detail.");
    else suggestions.push("Your resume is quite long — trim to the most relevant, recent, and impactful points (ideally 1-2 pages).");
  }
  formatScore = Math.min(100, formatScore);

  // ---- Sections ----
  let sectionsScore = 0;
  const foundSections = Object.entries(SECTION_HEADERS).filter(([, re]) => re.test(text)).map(([k]) => k);
  sectionsScore += foundSections.length * 25;
  if (!foundSections.includes("summary")) suggestions.push("Add a Summary or Objective section near the top stating your role, experience, and top strengths.");
  if (!foundSections.includes("experience")) suggestions.push("Add a clearly labeled Work Experience / Employment History section — ATS parsers look for this heading.");
  if (!foundSections.includes("education")) suggestions.push("Add a clearly labeled Education section.");
  if (!foundSections.includes("skills")) suggestions.push("Add a clearly labeled Skills section listing specific tools and technologies.");
  sectionsScore = Math.min(100, sectionsScore);

  // ---- Content ----
  const bulletLines = getBulletLikeLines(text);
  let contentScore = 0;
  if (bulletLines.length > 0) {
    const quantified = bulletLines.filter((b) => /\d/.test(b));
    const qPct = quantified.length / bulletLines.length;
    contentScore += Math.round(qPct * 55);
    if (qPct < 0.3) suggestions.push("Quantify more of your bullet points with real numbers (%, $, team size, time saved) — measurable impact scores far higher with ATS and recruiters.");

    const verbHits = bulletLines.filter((b) => ACTION_VERBS.some((v) => b.replace(/^[•\-*▪◦]\s*/, "").toLowerCase().startsWith(v)));
    const vPct = verbHits.length / bulletLines.length;
    contentScore += Math.round(vPct * 45);
    if (vPct < 0.35) suggestions.push('Start more bullet points with strong action verbs ("Led", "Built", "Increased") instead of passive phrases like "Responsible for".');
  }
  contentScore = Math.min(100, contentScore);

  // ---- Optimization (keyword match vs target job) ----
  let keywordMatches = [];
  let missingKeywords = [];
  let optimizationScore = 50; // neutral baseline when no target job given
  if (jobDescription) {
    const jdSkills = parseJobDescription(jobDescription).skills || [];
    keywordMatches = jdSkills.filter((s) => lower.includes(String(s).toLowerCase()));
    missingKeywords = jdSkills.filter((s) => !lower.includes(String(s).toLowerCase()));
    if (jdSkills.length) {
      optimizationScore = Math.round((keywordMatches.length / jdSkills.length) * 100);
      if (missingKeywords.length) {
        suggestions.push(`Target job mentions these keywords your resume is missing: ${missingKeywords.slice(0, 8).join(", ")}.`);
      }
    }
  }

  const breakdown = { content: contentScore, format: formatScore, sections: sectionsScore, optimization: optimizationScore };
  const score = Math.max(
    0,
    Math.min(100, Math.round(contentScore * 0.3 + sectionsScore * 0.3 + formatScore * 0.2 + optimizationScore * 0.2)),
  );

  return {
    score,
    breakdown,
    contact: { email, phone, linkedin },
    foundSections,
    suggestions,
    keywordMatches,
    missingKeywords,
    summary:
      score >= 80
        ? "Strong, ATS-friendly resume with quantified impact and good keyword coverage."
        : score >= 60
        ? "Solid resume — a few targeted improvements below will meaningfully raise your ATS match rate."
        : "Your resume needs work in several core sections before it will pass most ATS filters reliably.",
  };
};

/**
 * Full checker pipeline for one uploaded resume file (no login required).
 * @param {string} filePath   path to the uploaded resume file on disk
 * @param {string} [targetJobTitle]
 * @param {string} [targetJobDescription]
 */
export const checkResumeFile = async (filePath, targetJobTitle, targetJobDescription) => {
  const text = await extractResumeText(filePath);
  if (!text || text.trim().length < 20) {
    return {
      error: "Could not extract readable text from this file. Please upload a text-based PDF or DOCX (not a scanned image).",
    };
  }

  const det = deterministicTextScore(text, targetJobDescription);
  const ai = await aiScore({ text, targetJobTitle, targetJobDescription });

  if (!ai) {
    return { ...det, method: "deterministic" };
  }

  const blendedScore = Math.round(ai.score * 0.6 + det.score * 0.4);
  const mergedSuggestions = Array.from(new Set([...(ai.suggestions || []), ...det.suggestions])).slice(0, 8);

  return {
    ...det,
    score: blendedScore,
    summary: ai.summary || det.summary,
    suggestions: mergedSuggestions,
    method: "ai+deterministic",
  };
};
