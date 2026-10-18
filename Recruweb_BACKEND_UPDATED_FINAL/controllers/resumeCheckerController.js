import fs from "fs";
import { checkResumeFile } from "../utils/resumeCheckerAnalysis.js";

// POST /api/resume-checker/analyze — public tool, single file, optional
// target job title/description to sharpen the keyword-match score.
export const checkResume = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: "A resume file is required" });
    }

    const { targetJobTitle, targetJobDescription } = req.body;
    const result = await checkResumeFile(file.path, targetJobTitle, targetJobDescription);
    fs.unlink(file.path, () => {}); // don't retain uploaded resumes beyond analysis

    if (result.error) {
      return res.status(200).json({ success: false, message: result.error });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Resume check failed", error: error.message });
  }
};
