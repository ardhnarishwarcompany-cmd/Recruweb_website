import OpenAI from "openai";

// AI Cover Letter generator. Grounded strictly in facts the candidate
// actually provides (their own summary/skills/achievement + the real target
// job info) — never invents employers, numbers, or experience.

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export const generateCoverLetterAI = async ({
  fullName,
  targetJobTitle,
  companyName,
  jobDescription,
  candidateSummary,
  topSkills = [],
  keyAchievement,
  tone = "professional",
}) => {
  if (!openai) {
    // Deterministic, honest fallback template — no AI needed, no invented facts.
    const skillsLine = topSkills.length ? `My core strengths include ${topSkills.slice(0, 5).join(", ")}.` : "";
    return (
      `Dear Hiring Manager,\n\n` +
      `I am writing to express my interest in the ${targetJobTitle || "role"} position` +
      `${companyName ? ` at ${companyName}` : ""}. ${candidateSummary || ""}\n\n` +
      `${skillsLine} ${keyAchievement ? keyAchievement + "." : ""}\n\n` +
      `I would welcome the opportunity to discuss how my background aligns with your team's needs. Thank you for your time and consideration.\n\n` +
      `Sincerely,\n${fullName || "[Your Name]"}`
    );
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            `You write concise, ${tone}, 3-4 paragraph cover letters (250-350 words). ` +
            "Use ONLY the facts given by the candidate — never invent employers, numbers, dates, or skills not provided. " +
            "If a target job description is given, naturally reference 2-3 of its real requirements. " +
            "Output plain text only (no markdown, no placeholders in brackets except the closing signature line).",
        },
        {
          role: "user",
          content:
            `Candidate Name: ${fullName || "N/A"}\n` +
            `Target Job Title: ${targetJobTitle || "N/A"}\n` +
            `Company: ${companyName || "N/A"}\n` +
            `Job Description: ${(jobDescription || "N/A").slice(0, 3000)}\n` +
            `Candidate Summary: ${candidateSummary || "N/A"}\n` +
            `Top Skills: ${topSkills.join(", ") || "N/A"}\n` +
            `Key Achievement: ${keyAchievement || "N/A"}`,
        },
      ],
      temperature: 0.5,
    });
    return completion.choices?.[0]?.message?.content?.trim() || "";
  } catch (err) {
    console.error("Cover letter AI generation failed:", err.message);
    return "";
  }
};
