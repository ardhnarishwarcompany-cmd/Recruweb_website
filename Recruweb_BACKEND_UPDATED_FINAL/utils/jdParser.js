// Phase 8 — AI: Job Description Parser.
// Rule-based extraction (mirrors utils/resumeParser.js's skill detection so
// candidate-skills and JD-skills are pulled from the same vocabulary and can
// be compared apples-to-apples in utils/matching.js). No external API
// required; runs on the real JD text passed in.

const SKILL_LIST = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node", "Express",
  "MongoDB", "MySQL", "PostgreSQL", "Python", "Java", "C++", "C#",
  "HTML", "CSS", "Tailwind", "Bootstrap", "Docker", "Kubernetes",
  "AWS", "Azure", "GCP", "Git", "GitHub", "REST API", "Redux",
  "GraphQL", "Angular", "Vue", "Firebase", "Sales", "Marketing",
  "Recruitment", "HR", "Payroll", "Accounting", "Excel", "SAP",
  "Communication", "Leadership", "Project Management", "Agile", "Scrum",
];

const EDUCATION_PATTERNS = [
  { re: /b\.?tech|bachelor of technology/i, label: "Bachelor" },
  { re: /m\.?tech|master of technology/i, label: "Master" },
  { re: /\bmba\b/i, label: "MBA" },
  { re: /\bbca\b/i, label: "BCA" },
  { re: /\bmca\b/i, label: "MCA" },
  { re: /\bgraduate\b/i, label: "Graduate" },
];

export const parseJobDescription = (text = "") => {
  const clean = String(text || "");

  const skills = SKILL_LIST.filter((s) =>
    clean.toLowerCase().includes(s.toLowerCase()),
  );

  const education = EDUCATION_PATTERNS.filter((p) => p.re.test(clean)).map(
    (p) => p.label,
  );

  const expRangeMatch = clean.match(
    /(\d+)\s*-\s*(\d+)\s*\+?\s*years?/i,
  );
  const expMinMatch = clean.match(/(\d+)\+?\s*years?/i);

  let minExperience = 0;
  let maxExperience = null;
  if (expRangeMatch) {
    minExperience = Number(expRangeMatch[1]);
    maxExperience = Number(expRangeMatch[2]);
  } else if (expMinMatch) {
    minExperience = Number(expMinMatch[1]);
  }

  // Very rough "must-have" line detection — bullet lines containing
  // "required", "must", "mandatory" are surfaced separately from the rest.
  const lines = clean.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const mustHaves = lines.filter((l) =>
    /required|must have|mandatory|must-have/i.test(l),
  );

  return {
    skills,
    education,
    minExperience,
    maxExperience,
    mustHaves,
    keywordCount: skills.length,
  };
};
