import { generateCoverLetterAI } from "../utils/coverLetterAI.js";

// POST /api/cover-letter/generate — logged-in candidates only (same gating
// as the other AI writing tools in the Resume Builder).
export const generateCoverLetter = async (req, res) => {
  try {
    const {
      fullName,
      targetJobTitle,
      companyName,
      jobDescription,
      candidateSummary,
      topSkills,
      keyAchievement,
      tone,
    } = req.body;

    if (!targetJobTitle?.trim()) {
      return res.status(400).json({ success: false, message: "Target job title is required" });
    }

    const letter = await generateCoverLetterAI({
      fullName,
      targetJobTitle,
      companyName,
      jobDescription,
      candidateSummary,
      topSkills: Array.isArray(topSkills) ? topSkills : [],
      keyAchievement,
      tone,
    });

    res.status(200).json({ success: true, data: { letter } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to generate cover letter", error: error.message });
  }
};
