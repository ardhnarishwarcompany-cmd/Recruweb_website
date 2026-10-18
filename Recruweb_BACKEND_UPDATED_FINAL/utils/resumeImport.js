import OpenAI from "openai";
import { extractResumeText } from "./resumeScreening.js";

// "Import from existing resume" — candidate uploads a PDF/DOCX resume (their
// own, or e.g. a LinkedIn "Save to PDF" export) and we parse the REAL text
// into the Resume Builder's structured schema so they don't have to retype
// everything. Every field is grounded in the extracted text; nothing is
// invented. Requires OPENAI_API_KEY — without it we can't reliably turn free
// text into structured sections, so we return a clear error instead of
// guessing.

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const SCHEMA_INSTRUCTIONS =
  'Respond ONLY with strict JSON in this exact shape (use "" or [] for anything not found in the text — never invent data):\n' +
  '{\n' +
  '  "personal": {"fullName": string, "headline": string, "email": string, "phone": string, "location": string, "linkedin": string, "website": string},\n' +
  '  "summary": string,\n' +
  '  "experience": [{"jobTitle": string, "company": string, "location": string, "startDate": string, "endDate": string, "current": boolean, "description": string, "bullets": string[]}],\n' +
  '  "education": [{"degree": string, "institution": string, "location": string, "startDate": string, "endDate": string, "grade": string}],\n' +
  '  "skills": string[],\n' +
  '  "projects": [{"name": string, "description": string, "techStack": string}],\n' +
  '  "certifications": [{"name": string, "issuer": string, "date": string}],\n' +
  '  "languages": string[],\n' +
  '  "achievements": string[]\n' +
  '}';

export const importResumeFile = async (filePath) => {
  const text = await extractResumeText(filePath);
  if (!text || text.trim().length < 20) {
    return { error: "Could not extract readable text from this file. Please upload a text-based PDF or DOCX (not a scanned image)." };
  }
  if (!openai) {
    return { error: "Resume import needs an OpenAI API key configured on the server to structure the content — please fill the builder manually for now." };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You extract structured resume data from raw resume text for a resume-builder form. " +
            "Use ONLY facts present in the text — never invent employers, dates, numbers, or skills. " +
            SCHEMA_INSTRUCTIONS,
        },
        { role: "user", content: text.slice(0, 10000) },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });
    const raw = completion.choices?.[0]?.message?.content;
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed) return { error: "Could not parse this resume. Please try a different file or fill the builder manually." };

    return {
      data: {
        personal: {
          fullName: parsed.personal?.fullName || "",
          headline: parsed.personal?.headline || "",
          email: parsed.personal?.email || "",
          phone: parsed.personal?.phone || "",
          location: parsed.personal?.location || "",
          linkedin: parsed.personal?.linkedin || "",
          website: parsed.personal?.website || "",
        },
        summary: parsed.summary || "",
        experience: Array.isArray(parsed.experience) && parsed.experience.length
          ? parsed.experience.map((e) => ({
              jobTitle: e.jobTitle || "", company: e.company || "", location: e.location || "",
              startDate: e.startDate || "", endDate: e.endDate || "", current: !!e.current,
              description: e.description || "", bullets: Array.isArray(e.bullets) && e.bullets.length ? e.bullets : [""],
            }))
          : [{ jobTitle: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "", bullets: [""] }],
        education: Array.isArray(parsed.education) && parsed.education.length
          ? parsed.education.map((e) => ({
              degree: e.degree || "", institution: e.institution || "", location: e.location || "",
              startDate: e.startDate || "", endDate: e.endDate || "", grade: e.grade || "",
            }))
          : [{ degree: "", institution: "", location: "", startDate: "", endDate: "", grade: "" }],
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        projects: Array.isArray(parsed.projects) && parsed.projects.length
          ? parsed.projects.map((p) => ({ name: p.name || "", description: p.description || "", techStack: p.techStack || "" }))
          : [{ name: "", description: "", techStack: "" }],
        certifications: Array.isArray(parsed.certifications) && parsed.certifications.length
          ? parsed.certifications.map((c) => ({ name: c.name || "", issuer: c.issuer || "", date: c.date || "" }))
          : [{ name: "", issuer: "", date: "" }],
        languages: Array.isArray(parsed.languages) ? parsed.languages : [],
        achievements: Array.isArray(parsed.achievements) && parsed.achievements.length ? parsed.achievements : [""],
      },
    };
  } catch (err) {
    console.error("Resume import AI parsing failed:", err.message);
    return { error: "Could not parse this resume right now. Please try again or fill the builder manually." };
  }
};
