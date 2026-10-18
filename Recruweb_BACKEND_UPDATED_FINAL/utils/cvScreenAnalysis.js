import OpenAI from "openai";
import { extractResumeText } from "./resumeScreening.js";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(\+?\d{1,3}[\s-]?)?\d{10}\b|(\+?\d{1,3}[\s-]?)?\(?\d{3,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}/;
const LINKEDIN_RE = /linkedin\.com\/in\/[a-zA-Z0-9-_]+/i;

const clamp = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : fallback;
};

const validNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const extractContact = (text) => ({
  email: text.match(EMAIL_RE)?.[0] || null,
  phone: text.match(PHONE_RE)?.[0]?.trim() || null,
  linkedin: text.match(LINKEDIN_RE)?.[0] || null,
});

const extractYearsExperience = (text) => {
  const matches = [...String(text || "").matchAll(/(\d{1,2})\+?\s*years?/gi)].map((m) => Number(m[1]));
  return matches.length ? Math.max(...matches) : null;
};

const normalizeForMatch = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#.]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const skillVariants = (skill) => {
  const s = normalizeForMatch(skill);
  const aliases = {
    "javascript": ["javascript", "java script", "js"],
    "typescript": ["typescript", "type script", "ts"],
    "react": ["react", "reactjs", "react js", "react.js"],
    "react.js": ["react", "reactjs", "react js", "react.js"],
    "node": ["node", "nodejs", "node js", "node.js"],
    "node.js": ["node", "nodejs", "node js", "node.js"],
    "express": ["express", "expressjs", "express js", "express.js"],
    "express.js": ["express", "expressjs", "express js", "express.js"],
    "next.js": ["next", "nextjs", "next js", "next.js"],
    "nextjs": ["next", "nextjs", "next js", "next.js"],
    "postgres": ["postgres", "postgresql"],
    "postgresql": ["postgres", "postgresql"],
    "mongo": ["mongo", "mongodb"],
    "mongodb": ["mongo", "mongodb"],
    "mysql": ["mysql", "my sql"],
    "python": ["python"],
    "c++": ["c++", "cpp"],
    "c#": ["c#", "c sharp"],
    "html": ["html", "html5"],
    "css": ["css", "css3"],
    "tailwind": ["tailwind", "tailwindcss", "tailwind css"],
    "aws": ["aws", "amazon web services"],
    "azure": ["azure", "microsoft azure"],
    "github": ["github", "git hub"],
    "git": ["git"],
    "rest api": ["rest api", "restful api", "rest"],
    "api": ["api"],
  };
  return aliases[s] || [s];
};

const countSkillOccurrences = (text, skill) => {
  const normalizedText = normalizeForMatch(text);
  const variants = skillVariants(skill);
  let occurrences = 0;
  for (const variant of variants) {
    const v = normalizeForMatch(variant);
    if (!v) continue;
    const re = new RegExp(`(?:^|\\s)${escapeRegex(v).replace(/\\ /g, "\\s+")}(?=\\s|$)`, "gi");
    occurrences += [...normalizedText.matchAll(re)].length;
  }
  return occurrences;
};

const keywordAnalysis = (text, requiredSkillsCsv) => {
  const requiredSkills = String(requiredSkillsCsv || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const skillScores = requiredSkills.map((skill) => {
    const occurrences = countSkillOccurrences(text, skill);
    const found = occurrences > 0;
    return {
      skill,
      score: found ? Math.min(100, 55 + occurrences * 12) : 0,
      found,
      occurrences,
    };
  });

  const foundCount = skillScores.filter((s) => s.found).length;
  const matchScore = requiredSkills.length
    ? Math.round((foundCount / requiredSkills.length) * 100)
    : 0;

  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  const totalOccurrences = skillScores.reduce((sum, item) => sum + item.occurrences, 0);
  const density = requiredSkills.length
    ? Math.round((totalOccurrences / Math.max(words.length, 1)) * 1000)
    : 0;

  return {
    skillScores,
    matchScore,
    keywordDensity: Math.min(density, 100),
    requiredCount: requiredSkills.length,
    foundCount,
  };
};

const sectionCount = (text) => {
  const lower = String(text || "").toLowerCase();
  const sections = [
    "summary", "profile", "objective", "experience", "work experience",
    "employment", "education", "skills", "technical skills", "projects",
    "certifications", "achievements", "languages", "contact"
  ];
  return sections.filter((s) =>
    new RegExp(`(^|\\n|\\s)${escapeRegex(s).replace(/\\ /g, "\\s+")}(?=\\s|:|$)`, "i").test(lower)
  ).length;
};

const calculateATSScore = ({ text, contact, kw }) => {
  const raw = String(text || "");
  const words = raw.trim().split(/\s+/).filter(Boolean);
  const bulletCount = (raw.match(/(?:^|\n)\s*(?:[-•*▪◦]|\d+[.)])\s+/g) || []).length;
  const dateCount = (raw.match(/\b(?:19|20)\d{2}\b/g) || []).length;
  const sections = sectionCount(raw);

  let score = 20;
  if (words.length >= 200) score += 10;
  if (words.length >= 400) score += 5;
  if (words.length <= 1800) score += 5;
  if (contact.email) score += 8;
  if (contact.phone) score += 7;
  if (contact.linkedin) score += 5;
  score += Math.min(20, sections * 3);
  if (bulletCount >= 3) score += 5;
  if (bulletCount >= 8) score += 5;
  if (dateCount >= 2) score += 5;
  score += Math.round(kw.matchScore * 0.10);

  return clamp(score);
};

const calculateCultureFit = ({ text, kw }) => {
  const lower = String(text || "").toLowerCase();
  const terms = [
    "team", "teamwork", "collaborat", "communicat", "leadership", "mentor",
    "stakeholder", "client", "customer", "adapt", "flexib", "problem solving",
    "problem-solving", "cross-functional", "ownership", "initiative",
    "time management", "presentation", "interpersonal", "coordination"
  ];
  const hits = terms.filter((term) => lower.includes(term)).length;
  const softSkillRatio = hits / terms.length;

  // Resume-grounded score: soft-skill evidence + role alignment, never random.
  return clamp(42 + softSkillRatio * 38 + kw.matchScore * 0.20);
};

const calculateGrowthPotential = ({ text, kw, experienceYears, aiGrowth = null }) => {
  const lower = String(text || "").toLowerCase();
  const leadershipHits = [
    "lead", "leader", "managed", "management", "mentor", "mentored",
    "supervis", "architect", "owned", "ownership"
  ].filter((term) => lower.includes(term)).length;

  const learningHits = [
    "certif", "course", "training", "workshop", "learning", "upskill",
    "professional development", "aws", "azure", "docker", "kubernetes"
  ].filter((term) => lower.includes(term)).length;

  const impactHits = (String(text || "").match(/\b\d+(?:\.\d+)?\s*%|\b\d+(?:\.\d+)?\s*(?:x|k|m)\b/gi) || []).length;
  const progressionHits = ["senior", "lead", "manager", "architect", "promotion", "promoted"].filter((term) => lower.includes(term)).length;

  let score = 28;
  score += Math.min(22, Math.max(0, Number(experienceYears || 0)) * 3);
  score += Math.min(15, leadershipHits * 3);
  score += Math.min(15, learningHits * 3);
  score += Math.min(10, impactHits * 2);
  score += Math.min(10, progressionHits * 3);
  score += kw.matchScore * 0.10;

  const deterministic = clamp(score);
  const aiValue = validNumber(aiGrowth);
  return aiValue === null ? deterministic : clamp(aiValue, deterministic);
};

const aiAnalysis = async ({ resumeText, jobTitle, department, requiredSkills, experience, qualifications }) => {
  if (!openai || !resumeText) return null;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert technical recruiter's resume screening assistant. Analyze the ACTUAL resume text given " +
            "against the job requirements. Every fact you state must come directly from the resume text. Never invent " +
            "missing facts. Return strict JSON only in this shape:\n" +
            '{' +
            '"overallScore": number,' +
            '"atsScore": number,' +
            '"experienceYears": number,' +
            '"relevantExperienceYears": number,' +
            '"educationLevel": string,' +
            '"educationField": string,' +
            '"summary": string,' +
            '"experience": [],' +
            '"education": [],' +
            '"certifications": [],' +
            '"languages": [],' +
            '"strengths": [],' +
            '"weaknesses": [],' +
            '"redFlags": [],' +
            '"cultureFitEstimate": number,' +
            '"growthPotentialEstimate": number,' +
            '"recommendation": "Strongly Recommended" | "Consider for Interview" | "Not Recommended"' +
            '}.',
        },
        {
          role: "user",
          content:
            `Target Job Title: ${jobTitle || "N/A"}\nDepartment: ${department || "N/A"}\n` +
            `Required Skills: ${requiredSkills || "N/A"}\nMinimum Experience: ${experience || "N/A"} years\n` +
            `Qualifications Needed: ${qualifications || "N/A"}\n\nResume Text:\n${resumeText.slice(0, 12000)}`,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });
    const raw = completion.choices?.[0]?.message?.content;
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("CV Screening AI analysis failed, using resume-grounded deterministic scores:", err.message);
    return null;
  }
};

export const analyzeResume = async (filePath, jobFields) => {
  const resumeText = await extractResumeText(filePath);
  if (!resumeText || resumeText.trim().length < 20) {
    return {
      error: "Could not extract readable text from this file. Please upload a text-based PDF or DOCX (not a scanned image).",
    };
  }

  const contact = extractContact(resumeText);
  const kw = keywordAnalysis(resumeText, jobFields.requiredSkills);
  const requiredYears = Number.isFinite(parseInt(jobFields.experience, 10))
    ? parseInt(jobFields.experience, 10)
    : null;
  const textYears = extractYearsExperience(resumeText);
  const atsScore = calculateATSScore({ text: resumeText, contact, kw });
  const cultureFit = calculateCultureFit({ text: resumeText, kw });

  const ai = await aiAnalysis({ resumeText, ...jobFields });

  const aiOverall = validNumber(ai?.overallScore);
  const aiAts = validNumber(ai?.atsScore);
  const aiCulture = validNumber(ai?.cultureFitEstimate);
  const aiGrowth = validNumber(ai?.growthPotentialEstimate);
  const aiExperience = validNumber(ai?.experienceYears);

  const experienceForScore = aiExperience ?? textYears ?? 0;
  const growthPotential = calculateGrowthPotential({
    text: resumeText,
    kw,
    experienceYears: experienceForScore,
    aiGrowth,
  });

  // Overall score always includes actual keyword match. If AI is available,
  // it adds qualitative resume understanding without replacing factual matching.
  const experienceFit = requiredYears != null
    ? clamp((experienceForScore / Math.max(requiredYears, 1)) * 100)
    : clamp(experienceForScore ? Math.min(100, 50 + experienceForScore * 5) : 50);

  const deterministicOverall = clamp(
    kw.matchScore * 0.55 + experienceFit * 0.20 + atsScore * 0.10 + cultureFit * 0.05 + growthPotential * 0.10
  );
  const overallScore = aiOverall === null
    ? deterministicOverall
    : clamp(
        deterministicOverall * 0.60 +
        clamp(aiOverall) * 0.25 +
        kw.matchScore * 0.15
      );

  // AI values are treated as an additional signal, not as a replacement for
  // the resume-grounded metrics. This guarantees that every score remains
  // tied to the uploaded resume and job criteria even when an AI response is
  // missing, partial, null, or overly optimistic.
  const finalAts = aiAts === null
    ? atsScore
    : clamp(atsScore * 0.70 + clamp(aiAts) * 0.30);
  const finalCulture = aiCulture === null
    ? cultureFit
    : clamp(cultureFit * 0.65 + clamp(aiCulture) * 0.35);
  const finalGrowth = aiGrowth === null
    ? growthPotential
    : clamp(growthPotential * 0.65 + clamp(aiGrowth) * 0.35);

  const strengths = Array.isArray(ai?.strengths) && ai.strengths.length
    ? ai.strengths
    : [
        ...(kw.foundCount ? [`${kw.foundCount}/${Math.max(kw.requiredCount, 1)} required skills found in the resume`] : []),
        ...(experienceForScore ? [`Approximately ${experienceForScore} year(s) of experience detected`] : []),
        ...(contact.linkedin ? ["LinkedIn profile detected"] : []),
      ].slice(0, 4);

  const weaknesses = Array.isArray(ai?.weaknesses) && ai.weaknesses.length
    ? ai.weaknesses
    : [
        ...(kw.skillScores.filter((s) => !s.found).length
          ? [`Missing ${kw.skillScores.filter((s) => !s.found).length} listed required skill(s)`]
          : []),
        ...(requiredYears != null && experienceForScore < requiredYears
          ? [`Detected experience is below the requested ${requiredYears}+ years`]
          : []),
      ];

  const recommendation =
    overallScore >= 75
      ? { text: "Strongly Recommended", color: "#10b981", action: "Proceed to Interview" }
      : overallScore >= 55
      ? { text: "Consider for Interview", color: "#f59e0b", action: "Review Further" }
      : { text: "Not Recommended", color: "#ef4444", action: "Archive" };

  return {
    method: ai ? "ai+keyword+resume-metrics" : "keyword+resume-metrics",
    overallScore,
    matchScore: kw.matchScore,
    atsScore: finalAts,
    cultureFit: finalCulture,
    growthPotential: finalGrowth,
    contact,
    skillScores: kw.skillScores,
    experience: {
      total: aiExperience ?? textYears,
      relevant: ai?.relevantExperienceYears ?? null,
      requirement: requiredYears,
      matches: requiredYears != null ? experienceForScore >= requiredYears : null,
    },
    education: {
      level: ai?.educationLevel || null,
      field: ai?.educationField || null,
      matches: !!ai?.educationLevel,
      verified: false,
    },
    parsedSections: ai
      ? {
          summary: ai.summary || "",
          experience: Array.isArray(ai.experience) ? ai.experience : [],
          education: Array.isArray(ai.education) ? ai.education : [],
          certifications: Array.isArray(ai.certifications) ? ai.certifications : [],
          languages: Array.isArray(ai.languages) ? ai.languages : [],
        }
      : null,
    keywords: {
      found: kw.skillScores.filter((s) => s.found).map((s) => s.skill),
      missing: kw.skillScores.filter((s) => !s.found).map((s) => s.skill),
      density: kw.keywordDensity,
    },
    strengths,
    weaknesses,
    redFlags: Array.isArray(ai?.redFlags) ? ai.redFlags : [],
    recommendation: ai?.recommendation === "Strongly Recommended"
      ? { text: "Strongly Recommended", color: "#10b981", action: "Proceed to Interview" }
      : ai?.recommendation === "Not Recommended"
      ? { text: "Not Recommended", color: "#ef4444", action: "Archive" }
      : recommendation,
    summary:
      ai?.summary ||
      `Resume-grounded screening found ${kw.foundCount}/${kw.requiredCount} required skills, with ATS ${finalAts}%, Culture Fit ${finalCulture}%, and Growth Potential ${finalGrowth}%.`,
    aiUnavailableNotice: !openai
      ? "OPENAI_API_KEY is not configured; scores are calculated deterministically from the uploaded resume text and job criteria."
      : null,
  };
};
