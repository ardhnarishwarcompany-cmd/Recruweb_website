import OpenAI from "openai";

// Phase 8 — AI Email Writer.
// Uses OPENAI_API_KEY (already used elsewhere in this project — see
// routes/aiChatRoutes.js) when configured. Falls back to a real, fully
// populated template built from the actual candidate/job/client record
// passed in — never a placeholder/lorem-ipsum draft.

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const TEMPLATES = {
  interview_invite: ({ candidateName, jobTitle, companyName, interviewDate, interviewTime, mode }) => ({
    subject: `Interview Invitation — ${jobTitle} at ${companyName}`,
    body:
      `Dear ${candidateName},\n\n` +
      `We are pleased to invite you for an interview for the position of ${jobTitle} at ${companyName}.\n\n` +
      (interviewDate
        ? `Date: ${interviewDate}\n` + (interviewTime ? `Time: ${interviewTime}\n` : "")
        : "") +
      (mode ? `Mode: ${mode}\n` : "") +
      `\nPlease confirm your availability at your earliest convenience.\n\n` +
      `Best regards,\nRecruweb Talent Acquisition Team`,
  }),
  offer: ({ candidateName, jobTitle, companyName, ctc, joiningDate }) => ({
    subject: `Offer of Employment — ${jobTitle} at ${companyName}`,
    body:
      `Dear ${candidateName},\n\n` +
      `Congratulations! We are delighted to extend an offer for the position of ${jobTitle} at ${companyName}.\n\n` +
      (ctc ? `Compensation: ${ctc}\n` : "") +
      (joiningDate ? `Proposed Joining Date: ${joiningDate}\n` : "") +
      `\nPlease review the attached offer letter and confirm your acceptance.\n\n` +
      `Warm regards,\nRecruweb HR Team`,
  }),
  rejection: ({ candidateName, jobTitle, companyName }) => ({
    subject: `Update on your application — ${jobTitle}`,
    body:
      `Dear ${candidateName},\n\n` +
      `Thank you for taking the time to interview for the ${jobTitle} role at ${companyName}. ` +
      `After careful consideration, we have decided to move forward with another candidate at this time.\n\n` +
      `We appreciate your interest and encourage you to apply for future openings that match your profile.\n\n` +
      `Best wishes,\nRecruweb Talent Acquisition Team`,
  }),
  follow_up: ({ candidateName, jobTitle, companyName }) => ({
    subject: `Following up — ${jobTitle} application`,
    body:
      `Dear ${candidateName},\n\n` +
      `We wanted to check in regarding your application for ${jobTitle} at ${companyName}. ` +
      `Please let us know if you have any questions or need additional information.\n\n` +
      `Best regards,\nRecruweb Talent Acquisition Team`,
  }),
  custom: ({ candidateName, prompt }) => ({
    subject: "Message from Recruweb",
    body: `Dear ${candidateName || "Candidate"},\n\n${prompt || ""}\n\nBest regards,\nRecruweb Team`,
  }),
};

/**
 * @param {string} type interview_invite|offer|rejection|follow_up|custom
 * @param {object} context real data pulled from Candidate/Job/CrmClient by the caller
 */
export const generateEmail = async (type, context = {}) => {
  const templateFn = TEMPLATES[type] || TEMPLATES.custom;
  const fallback = templateFn(context);

  if (!openai) {
    return { ...fallback, source: "template" };
  }

  try {
    const prompt =
      `Write a professional, concise recruitment email of type "${type}".\n` +
      `Context (use only these real facts, do not invent details): ${JSON.stringify(context)}\n` +
      `Return strictly as JSON: {"subject": "...", "body": "..."}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a professional HR recruiter writing emails for an Indian staffing company called Recruweb. Be concise and professional. Only use facts given to you.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 400,
      temperature: 0.6,
    });

    const raw = completion.choices[0]?.message?.content || "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.subject && parsed.body) {
        return { subject: parsed.subject, body: parsed.body, source: "ai" };
      }
    }
    return { ...fallback, source: "template" };
  } catch (err) {
    console.error("AI email generation failed, using template:", err.message);
    return { ...fallback, source: "template" };
  }
};
