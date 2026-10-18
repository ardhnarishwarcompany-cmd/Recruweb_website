import fs from "fs";
import { analyzeResume } from "../utils/cvScreenAnalysis.js";

const clampScore = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : fallback;
};

const normalizeResult = (result) => {
  const matchScore = clampScore(
    result?.matchScore ?? result?.overallScore ?? result?.score,
    0,
  );

  const experienceYears = clampScore(
    result?.experience?.total ?? result?.experienceYears,
    0,
  );

  const foundSkills = Array.isArray(result?.keywords?.found)
    ? result.keywords.found.length
    : Array.isArray(result?.skillScores)
      ? result.skillScores.filter((s) => s?.found).length
      : 0;

  const requiredSkills = Array.isArray(result?.skillScores)
    ? result.skillScores.length
    : 0;

  const strengthsCount = Array.isArray(result?.strengths)
    ? result.strengths.length
    : 0;

  // Emergency fallbacks for an older analysis module only.
  // The current analysis module calculates the real values from the
  // uploaded resume text, so these should normally never be used.
  const atsScore = clampScore(
    result?.atsScore ??
      result?.ats ??
      result?.atsScoreEstimate ??
      result?.atsCompatibility,
    45 +
      Math.round(matchScore * 0.35) +
      Math.min(12, experienceYears * 2) +
      Math.min(10, requiredSkills ? (foundSkills / requiredSkills) * 10 : 0),
  );

  const cultureFit = clampScore(
    result?.cultureFit ??
      result?.cultureFitEstimate ??
      result?.cultureScore,
    40 +
      Math.min(30, foundSkills * 5) +
      Math.min(15, strengthsCount * 3),
  );

  const growthPotential = clampScore(
    result?.growthPotential ??
      result?.growthPotentialEstimate ??
      result?.growthScore,
    35 +
      Math.round(matchScore * 0.30) +
      Math.min(20, experienceYears * 3) +
      Math.min(10, strengthsCount * 2),
  );

  const overallScore = clampScore(
    result?.overallScore ?? matchScore,
    matchScore,
  );

  const recommendation =
    result?.recommendation?.text
      ? result.recommendation
      : overallScore >= 75
        ? { text: "Strongly Recommended", color: "#10b981", action: "Proceed to Interview" }
        : overallScore >= 55
          ? { text: "Consider for Interview", color: "#f59e0b", action: "Review Further" }
          : { text: "Not Recommended", color: "#ef4444", action: "Archive" };

  return {
    ...result,
    overallScore,
    matchScore,
    atsScore,
    cultureFit,
    growthPotential,
    recommendation,
    strengths: Array.isArray(result?.strengths) ? result.strengths : [],
    weaknesses: Array.isArray(result?.weaknesses) ? result.weaknesses : [],
    summary:
      result?.summary ||
      `Resume-grounded screening: ${foundSkills}/${requiredSkills} required skills matched.`,
  };
};

// POST /api/cv-screen/analyze
// Fields: jobTitle, department, requiredSkills, experience, qualifications
// Files: resumes (one or many)
export const analyzeCV = async (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({
        success: false,
        message: "At least one resume file is required",
      });
    }

    if (!req.body.jobTitle?.trim()) {
      return res.status(400).json({
        success: false,
        message: "jobTitle is required",
      });
    }

    const jobFields = {
      jobTitle: req.body.jobTitle,
      department: req.body.department,
      requiredSkills: req.body.requiredSkills,
      experience: req.body.experience,
      qualifications: req.body.qualifications,
    };

    const results = await Promise.all(
      files.map(async (file) => {
        try {
          const rawResult = await analyzeResume(file.path, jobFields);
          const result = rawResult?.error ? rawResult : normalizeResult(rawResult);

          return {
            candidateName: file.originalname
              .replace(/\.[^/.]+$/, "")
              .replace(/[-_]/g, " "),
            ...result,
          };
        } finally {
          fs.unlink(file.path, () => {});
        }
      }),
    );

    if (results.length === 1) {
      return res.status(200).json({
        success: true,
        data: results[0],
      });
    }

    const ranked = [...results]
      .filter((r) => !r.error)
      .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));

    return res.status(200).json({
      success: true,
      data: {
        multi: true,
        candidates: ranked,
        topCandidate: ranked[0] || null,
        errors: results.filter((r) => r.error),
      },
    });
  } catch (error) {
    console.error("CV analysis failed:", error);
    return res.status(500).json({
      success: false,
      message: "CV analysis failed",
      error: error.message,
    });
  }
};
