import fs from "fs";
import mammoth from "mammoth";
import { extractPdfText } from "./pdfText.js";

export const parseResume = async (filePath) => {
  const ext = filePath.split(".").pop().toLowerCase();
  let text = "";

  // ==========================
  // PDF
  // ==========================
  if (ext === "pdf") {
    try {
      text = await extractPdfText(filePath);
    } catch (e) {
      console.log("Error reading PDF file:", e.message);
    }
  }

  // ==========================
  // DOCX
  // ==========================
  if (ext === "docx") {
    try {
      const result = await mammoth.extractRawText({
        path: filePath,
      });
      text = result.value || "";
    } catch (e) {
      console.log("Error reading DOCX file:", e.message);
    }
  }

  // ==========================
  // Email
  // ==========================
  const emailMatch = text.match(
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
  );

  // ==========================
  // Phone
  // ==========================
  const phoneMatch = text.match(/(\+91[\s-]?)?[6-9]\d{9}/);

  // ==========================
  // Experience
  // ==========================
  const expMatch = text.match(/(\d+)\+?\s*years?/i);
  const experience = expMatch ? Number(expMatch[1]) : 0;

  // ==========================
  // Skills Detection
  // ==========================
  const skillList = [
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
  ];

  const skills = skillList.filter((skill) =>
    text.toLowerCase().includes(skill.toLowerCase()),
  );

  // ==========================
  // Education
  // ==========================
  const education = [];
  if (/b\.?tech|bachelor/i.test(text)) education.push("Bachelor");
  if (/m\.?tech|master/i.test(text)) education.push("Master");
  if (/mba/i.test(text)) education.push("MBA");
  if (/bca/i.test(text)) education.push("BCA");
  if (/mca/i.test(text)) education.push("MCA");

  // ==========================
  // AI Score
  // ==========================
  let aiScore = 50;
  aiScore += skills.length * 5;
  aiScore += Math.min(experience * 3, 25);
  if (education.length) aiScore += 10;
  if (aiScore > 100) aiScore = 100;

  // ==========================
  // AI Summary
  // ==========================
  const aiSummary =
    `Candidate has ${experience} years experience. ` +
    `${skills.length} technical skills detected. ` +
    `${education.length} education records found. ` +
    `Overall AI suitability score is ${aiScore}/100.`;

  return {
    resumeText: text,
    email: emailMatch ? emailMatch[0] : "",
    phone: phoneMatch ? phoneMatch[0] : "",
    skills,
    experience,
    education,
    aiScore,
    aiSummary,
  };
};
