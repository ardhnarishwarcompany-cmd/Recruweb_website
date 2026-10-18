import OpenAI from "openai";
import { parseJobDescription } from "./jdParser.js";

// Real ATS scoring for resumes built with the Resume Builder.
// Two signals, exactly like backend/utils/resumeScreening.js:
//   1. Deterministic checks — completeness, action verbs, quantified impact,
//      length, contact info, section coverage. Always runs, free, instant.
//   2. OpenAI qualitative pass — runs automatically when OPENAI_API_KEY is
//      configured; silently skipped otherwise. Final score blends both.
// Nothing here is randomised — every number is derived from the resume's
// actual text content (and, if provided, the real target job description).

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const ACTION_VERBS = [
  "led", "built", "created", "designed", "developed", "managed", "launched",
  "improved", "increased", "reduced", "achieved", "delivered", "implemented",
  "optimized", "negotiated", "coordinated", "streamlined", "spearheaded",
  "drove", "generated", "recruited", "trained", "mentored", "automated",
  "analyzed", "resolved", "executed", "scaled", "established",
];

// Flattens the structured resume JSON (see resumeController.js for the
// exact shape) into a single plain-text block for keyword/AI analysis.
export const resumeDataToText = (data = {}) => {
  const parts = [];
  const p = data.personal || {};
  parts.push([p.fullName, p.headline, p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean).join(" "));
  if (data.summary) parts.push(data.summary);

  (data.experience || []).forEach((e) => {
    parts.push(
      [e.jobTitle, e.company, e.location, e.startDate, e.endDate || (e.current ? "Present" : ""), e.description]
        .filter(Boolean)
        .join(" "),
    );
    (e.bullets || []).forEach((b) => parts.push(b));
  });

  (data.education || []).forEach((ed) => {
    parts.push([ed.degree, ed.institution, ed.location, ed.startDate, ed.endDate, ed.grade].filter(Boolean).join(" "));
  });

  if (Array.isArray(data.skills)) parts.push(data.skills.join(", "));
  (data.projects || []).forEach((pr) => parts.push([pr.name, pr.description, pr.techStack].filter(Boolean).join(" ")));
  (data.certifications || []).forEach((c) => parts.push([c.name, c.issuer, c.date].filter(Boolean).join(" ")));
  if (Array.isArray(data.languages)) parts.push(data.languages.map((l) => (typeof l === "string" ? l : `${l.name} (${l.level || ""})`)).join(", "));
  (data.achievements || []).forEach((a) => parts.push(typeof a === "string" ? a : a.text));

  return parts.filter(Boolean).join("\n");
};

// Category weights mirror how enhancv-style checkers break a score down:
// Content (impact/quantified writing), Format (length/structure/contact),
// Sections (completeness of the standard resume sections), Optimization
// (keyword/ATS match against a target role). Every point below is derived
// directly from the resume's real content — nothing here is randomised.
const deterministicScore = (data, text, jobDescription) => {
  const suggestions = [];

  const p = data.personal || {};
  const allBullets = (data.experience || []).flatMap((e) => e.bullets || []);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  // ---- Format (contact info + overall length/structure) — out of 100 ----
  let formatScore = 0;
  const hasContact = !!(p.fullName && p.email && p.phone);
  if (hasContact) formatScore += 40;
  else suggestions.push("Add your full name, a professional email, and a phone number so recruiters and ATS parsers can reach you.");

  if (p.linkedin || p.website) formatScore += 10;

  if (wordCount >= 250 && wordCount <= 900) formatScore += 50;
  else if (wordCount > 0) {
    formatScore += 25;
    if (wordCount < 250) suggestions.push("Your resume looks a little thin — add more detail to experience/projects so it reads as a complete 1-page profile.");
    else suggestions.push("Your resume is quite long — trim to the most relevant, recent, and impactful points (ideally 1-2 pages).");
  }
  formatScore = Math.min(100, formatScore);

  // ---- Sections (completeness of standard resume sections) — out of 100 ----
  let sectionsScore = 0;
  const summaryLen = (data.summary || "").trim().split(/\s+/).filter(Boolean).length;
  if (summaryLen >= 25 && summaryLen <= 80) sectionsScore += 25;
  else if (summaryLen > 0) {
    sectionsScore += 12;
    suggestions.push("Aim for a 2-4 sentence professional summary (roughly 30-60 words) that leads with your strongest, most relevant achievement.");
  } else {
    suggestions.push("Add a professional summary — a short, punchy intro that states your role, years of experience, and top strengths.");
  }

  const expCount = (data.experience || []).length;
  if (expCount > 0) sectionsScore += 30;
  else suggestions.push("Add at least one work experience entry — ATS systems and recruiters weight this section the most.");

  if ((data.education || []).length > 0) sectionsScore += 20;
  else suggestions.push("Add your education — most ATS filters treat a missing education section as an incomplete profile.");

  const skillCount = Array.isArray(data.skills) ? data.skills.length : 0;
  if (skillCount >= 6) sectionsScore += 25;
  else if (skillCount > 0) {
    sectionsScore += 12;
    suggestions.push("List at least 6-10 relevant skills as individual keywords — ATS software scans this section directly.");
  } else {
    suggestions.push("Add a Skills section with the specific tools, technologies, and competencies relevant to your target role.");
  }
  sectionsScore = Math.min(100, sectionsScore);

  // ---- Content (quantified impact + strong action verbs) — out of 100 ----
  let contentScore = 0;
  if (allBullets.length > 0) {
    const quantified = allBullets.filter((b) => /\d/.test(b));
    const qPct = quantified.length / allBullets.length;
    contentScore += Math.round(qPct * 55);
    if (qPct < 0.4) {
      suggestions.push("Quantify more of your bullet points with real numbers (%, $, team size, time saved) — measurable impact scores far higher with ATS and recruiters.");
    }

    const verbHits = allBullets.filter((b) => ACTION_VERBS.some((v) => b.trim().toLowerCase().startsWith(v)));
    const vPct = verbHits.length / allBullets.length;
    contentScore += Math.round(vPct * 45);
    if (vPct < 0.5) {
      suggestions.push('Start bullet points with strong action verbs ("Led", "Built", "Increased") instead of passive phrases like "Responsible for".');
    }
  } else if (expCount > 0) {
    suggestions.push("Add bullet points under each work experience entry describing what you did and the impact you had.");
  }
  contentScore = Math.min(100, contentScore);

  // ---- Optimization (keyword/ATS match vs target job) — out of 100 ----
  let keywordMatches = [];
  let missingKeywords = [];
  let optimizationScore = Math.min(100, skillCount * 12); // baseline: how keyword-rich the skills list itself is
  if (jobDescription) {
    const jdSkills = parseJobDescription(jobDescription).skills || [];
    const lower = text.toLowerCase();
    keywordMatches = jdSkills.filter((s) => lower.includes(String(s).toLowerCase()));
    missingKeywords = jdSkills.filter((s) => !lower.includes(String(s).toLowerCase()));
    if (jdSkills.length) {
      optimizationScore = Math.round((keywordMatches.length / jdSkills.length) * 100);
      if (missingKeywords.length) {
        suggestions.push(
          `Target job mentions these keywords your resume is missing: ${missingKeywords.slice(0, 8).join(", ")}.`,
        );
      }
    }
  } else if (skillCount === 0) {
    optimizationScore = 0;
  }

  const breakdown = {
    content: contentScore,
    format: formatScore,
    sections: sectionsScore,
    optimization: optimizationScore,
  };

  // Overall = weighted blend of the four categories (weights mirror the
  // emphasis recruiters/ATS place on each: content and sections matter most).
  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(contentScore * 0.3 + sectionsScore * 0.3 + formatScore * 0.2 + optimizationScore * 0.2),
    ),
  );

  return {
    score,
    breakdown,
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

// Exported so the public Resume Checker (raw uploaded file, no structured
// builder data) can reuse the exact same AI qualitative pass.
export const aiScore = async ({ text, targetJobTitle, targetJobDescription }) => {
  if (!openai || !text) return null;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert ATS (Applicant Tracking System) resume reviewer and professional resume coach. " +
            "Evaluate the resume text for ATS-compatibility, clarity, impact, and (if a target role is given) fit for that role. " +
            'Respond ONLY with strict JSON: {"score": number (0-100), "summary": string (2-3 sentences), "suggestions": string[] (3-6 concrete, specific, actionable bullet points)}. ' +
            "Base every point strictly on the resume text provided — never invent facts about the candidate.",
        },
        {
          role: "user",
          content:
            `Target Job Title: ${targetJobTitle || "Not specified"}\n` +
            `Target Job Description: ${(targetJobDescription || "Not specified").slice(0, 3000)}\n\n` +
            `Resume Text:\n${text.slice(0, 6000)}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });
    const raw = completion.choices?.[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
      summary: parsed.summary || "",
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    };
  } catch (err) {
    console.error("AI resume-builder scoring failed, falling back to deterministic score:", err.message);
    return null;
  }
};

/**
 * Scores a Resume Builder resume (structured JSON) for ATS-friendliness.
 * @param {object} data                     resume.data JSON
 * @param {string} [targetJobTitle]
 * @param {string} [targetJobDescription]
 */
export const scoreResumeData = async (data, targetJobTitle, targetJobDescription) => {
  const text = resumeDataToText(data);
  const det = deterministicScore(data, text, targetJobDescription);
  const ai = await aiScore({ text, targetJobTitle, targetJobDescription });

  if (!ai) {
    return {
      score: det.score,
      breakdown: det.breakdown,
      summary: det.summary,
      suggestions: det.suggestions,
      keywordMatches: det.keywordMatches,
      missingKeywords: det.missingKeywords,
      method: "deterministic",
    };
  }

  const blendedScore = Math.round(ai.score * 0.6 + det.score * 0.4);
  const mergedSuggestions = Array.from(new Set([...(ai.suggestions || []), ...det.suggestions])).slice(0, 8);

  return {
    score: blendedScore,
    breakdown: det.breakdown,
    summary: ai.summary || det.summary,
    suggestions: mergedSuggestions,
    keywordMatches: det.keywordMatches,
    missingKeywords: det.missingKeywords,
    method: "ai+deterministic",
  };
};

// Instant, deterministic-only score — no OpenAI call, safe to run on every
// debounced keystroke for a "live score" sidebar while the candidate edits.
// Same underlying rules as the full score above, just without the AI pass.
export const quickScoreResumeData = (data, targetJobDescription) => {
  const text = resumeDataToText(data);
  const det = deterministicScore(data, text, targetJobDescription);
  return {
    score: det.score,
    breakdown: det.breakdown,
    summary: det.summary,
    suggestions: det.suggestions,
    keywordMatches: det.keywordMatches,
    missingKeywords: det.missingKeywords,
    method: "deterministic-live",
  };
};

// AI-generate a professional summary from real, user-entered profile facts
// (role, years of experience, top skills, one achievement) — never invents
// experience the candidate didn't provide.
export const generateSummaryAI = async ({ headline, yearsExperience, topSkills = [], achievement, tone = "professional" }) => {
  if (!openai) {
    const skillsPart = topSkills.length ? ` skilled in ${topSkills.slice(0, 4).join(", ")}` : "";
    const yrsPart = yearsExperience ? `${yearsExperience}+ years of experience` : "experience";
    return `${headline || "Professional"} with ${yrsPart}${skillsPart}. ${achievement ? achievement + "." : "Committed to delivering measurable results and driving team success."}`;
  }
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            `You write concise, ${tone} 2-3 sentence resume professional summaries (30-60 words). ` +
            "Use only the facts given — never invent employers, numbers, or skills not provided. Output plain text only, no quotes, no markdown.",
        },
        {
          role: "user",
          content: `Role/Headline: ${headline || "N/A"}\nYears of Experience: ${yearsExperience || "N/A"}\nTop Skills: ${topSkills.join(", ") || "N/A"}\nKey Achievement: ${achievement || "N/A"}`,
        },
      ],
      temperature: 0.5,
    });
    return completion.choices?.[0]?.message?.content?.trim() || "";
  } catch (err) {
    console.error("AI summary generation failed:", err.message);
    return "";
  }
};

// AI-rewrite a single work-experience bullet point to be more impactful
// (stronger verb, quantified where possible) — grounded in what the user wrote.
export const improveBulletAI = async (bulletText, jobTitle) => {
  if (!bulletText) return bulletText;
  if (!openai) return bulletText;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You rewrite a single resume bullet point to start with a strong action verb and be as specific/impactful as possible. " +
            "Do NOT invent numbers or facts that are not implied by the original text. Keep it to one line, plain text, no quotes.",
        },
        { role: "user", content: `Role: ${jobTitle || "N/A"}\nOriginal bullet: ${bulletText}` },
      ],
      temperature: 0.4,
    });
    return completion.choices?.[0]?.message?.content?.trim() || bulletText;
  } catch (err) {
    console.error("AI bullet improvement failed:", err.message);
    return bulletText;
  }
};
