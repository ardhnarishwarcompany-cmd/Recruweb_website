import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import OpenAI from "openai";
import { parseJobDescription } from "./jdParser.js";
import { extractPdfText } from "./pdfText.js";

// Applied Candidate Module — Resume Screening.
// Combines two real, non-random signals against the real Application +
// Job rows already in the database:
//   1. Keyword/skill match (always runs — free, instant, no API key needed)
//   2. AI qualitative scoring via OpenAI (runs automatically when
//      OPENAI_API_KEY is configured; silently skipped otherwise)
// Final resumeScore is the blended result when both are available.

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

let PDFParse = null;
try {
  const mod = await import("pdf-parse/node");
  PDFParse = mod.PDFParse || mod.default?.PDFParse || null;
} catch {
  // pdf-parse not available — PDF resumes just won't be text-extracted.
}

const SKILL_LIST = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node",
  "Express",
  "MongoDB",
  "MySQL",
  "PostgreSQL",
  "Python",
  "Java",
  "C++",
  "HTML",
  "CSS",
  "Tailwind",
  "Bootstrap",
  "Docker",
  "AWS",
  "Azure",
  "Git",
  "GitHub",
  "REST API",
  "Redux",
  "GraphQL",
  "Angular",
  "Vue",
  "Firebase",
  "Excel",
  "Power BI",
  "Tally",
  "Payroll",
  "Recruitment",
  "Sourcing",
  "HRIS",
  "Compliance",
  "SAP",
];

// Extracts plain text out of an uploaded resume file (pdf/doc/docx).
export const extractResumeText = async (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) return "";
  const ext = path.extname(filePath).toLowerCase();
  try {
    if (ext === ".pdf") {
      return await extractPdfText(filePath); 
    }
    if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || "";
    }
  } catch (err) {
    console.error("extractResumeText failed:", err.message);
  }
  return "";
};

const keywordScore = (resumeText, jobDescription) => {
  const text = String(resumeText || "").toLowerCase();
  const foundSkills = SKILL_LIST.filter((s) => text.includes(s.toLowerCase()));

  let jdSkills = [];
  if (jobDescription) {
    jdSkills = parseJobDescription(jobDescription).skills || [];
  }

  let overlapPct = 0;
  if (jdSkills.length) {
    const matched = jdSkills.filter((s) =>
      text.includes(String(s).toLowerCase()),
    );
    overlapPct = Math.round((matched.length / jdSkills.length) * 100);
  }

  const expMatch = text.match(/(\d+)\+?\s*years?/i);
  const experience = expMatch ? Number(expMatch[1]) : 0;

  let score = 40 + foundSkills.length * 4 + Math.min(experience * 3, 20);
  if (jdSkills.length) score = Math.round(score * 0.5 + overlapPct * 0.5);
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    skills: foundSkills,
    summary:
      `Keyword screening found ${foundSkills.length} relevant skills` +
      (jdSkills.length
        ? ` (${overlapPct}% overlap with job requirements)`
        : "") +
      (experience ? `, ~${experience} years experience mentioned` : "") +
      `.`,
  };
};

const aiScore = async ({
  resumeText,
  coverLetter,
  jobTitle,
  jobDescription,
}) => {
  if (!openai) return null;
  if (!resumeText && !coverLetter) return null;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a resume screening assistant for a recruitment agency. " +
            "Score how well a candidate's resume fits a job on a 0-100 scale. " +
            'Respond ONLY with strict JSON: {"score": number, "skills": string[], "summary": string}. ' +
            "summary must be 1-2 sentences, factual, based only on the resume text given.",
        },
        {
          role: "user",
          content:
            `Job Title: ${jobTitle || "N/A"}\n` +
            `Job Description: ${(jobDescription || "N/A").slice(0, 3000)}\n\n` +
            `Resume Text: ${(resumeText || "N/A").slice(0, 6000)}\n` +
            `Cover Letter: ${(coverLetter || "N/A").slice(0, 1500)}`,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });
    const raw = completion.choices?.[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      summary: parsed.summary || "",
    };
  } catch (err) {
    console.error(
      "AI resume screening failed, falling back to keyword-only:",
      err.message,
    );
    return null;
  }
};

/**
 * Screens a single Application against its Job.
 * @param {object} application  Application model instance (or plain object)
 * @param {object} job          Job model instance (or plain object), optional
 * @returns {{score:number, skills:string[], summary:string, method:string}}
 */
export const screenApplication = async (application, job) => {
  let resumeText = "";
  if (application.resume) {
    const filePath = path.join(
      process.cwd(),
      application.resume.replace(/^\//, ""),
    );
    resumeText = await extractResumeText(filePath);
  }

  const kw = keywordScore(
    resumeText || application.coverLetter,
    job?.description,
  );
  const ai = await aiScore({
    resumeText: resumeText || application.coverLetter,
    coverLetter: application.coverLetter,
    jobTitle: job?.title,
    jobDescription: job?.description,
  });

  if (!ai) {
    return { ...kw, method: "keyword" };
  }

  // Blend: AI qualitative judgement weighted a bit higher than raw keyword match.
  const blendedScore = Math.round(ai.score * 0.6 + kw.score * 0.4);
  const mergedSkills = Array.from(
    new Set([...(ai.skills || []), ...kw.skills]),
  );

  return {
    score: blendedScore,
    skills: mergedSkills,
    summary: ai.summary || kw.summary,
    method: "ai+keyword",
  };
};
