import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Drafts a reply for a live chat thread (client<->staff or candidate<->staff),
// grounded strictly in the real message history passed in — never invents
// facts, offers, dates, or figures that weren't in the conversation.
export const draftChatReply = async ({ history, askedBy, question }) => {
  const transcript = history
    .slice(-20)
    .map((m) => `${m.senderRole === "staff" ? "Recruiter" : m.senderRole === "ai" ? "AI" : "User"}: ${m.message}`)
    .join("\n");

  if (!openai) {
    return "AI assistant is not configured on this server yet (missing OPENAI_API_KEY). You can still reply manually below.";
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant embedded inside a recruitment platform's live chat. " +
            "You can see the real conversation history below. Draft a concise, professional, helpful reply. " +
            "Only use facts present in the conversation — if you don't know something (a specific date, policy, or number), say the recruiter will confirm it rather than inventing a value. " +
            "Keep it under 80 words unless the question needs more detail.",
        },
        {
          role: "user",
          content: `Conversation so far:\n${transcript}\n\n${askedBy} is asking the AI assistant: "${question}"\n\nDraft a reply.`,
        },
      ],
      temperature: 0.4,
    });
    return completion.choices?.[0]?.message?.content?.trim() || "";
  } catch (err) {
    console.error("AI chat reply drafting failed:", err.message);
    return "The AI assistant couldn't generate a reply right now — please try again in a moment, or reply manually.";
  }
};
