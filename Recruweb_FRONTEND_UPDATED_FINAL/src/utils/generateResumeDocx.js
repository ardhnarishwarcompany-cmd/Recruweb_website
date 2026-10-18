import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";

// Builds a real, ATS-friendly .docx file directly from the resume's
// structured data (the same `data` object the builder edits and the
// preview renders) — nothing here is a screenshot or an image, it's real
// selectable/parseable text, which is exactly what ATS software needs.
const accentColorToHex = (c) => (c || "#2E5AAC").replace("#", "");

const heading = (text, accentHex) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    border: { bottom: { color: accentHex, space: 2, style: BorderStyle.SINGLE, size: 6 } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, color: accentHex, size: 22 })],
  });

const bulletPara = (text) =>
  new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 40 } });

export const buildResumeDocx = async (data = {}, accentColor) => {
  const accentHex = accentColorToHex(accentColor);
  const p = data.personal || {};
  const children = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 40 },
      children: [new TextRun({ text: p.fullName || "Your Name", bold: true, size: 40, color: accentHex })],
    }),
  );
  if (p.headline) {
    children.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: p.headline, size: 24, italics: true })] }));
  }
  const contactLine = [p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean).join("  |  ");
  if (contactLine) {
    children.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: contactLine, size: 20 })] }));
  }

  if (data.summary) {
    children.push(heading("Summary", accentHex));
    children.push(new Paragraph({ text: data.summary, spacing: { after: 100 } }));
  }

  if ((data.experience || []).some((e) => e.jobTitle || e.company)) {
    children.push(heading("Experience", accentHex));
    data.experience.forEach((e) => {
      if (!e.jobTitle && !e.company) return;
      const dateRange = [e.startDate, e.current ? "Present" : e.endDate].filter(Boolean).join(" - ");
      children.push(
        new Paragraph({
          spacing: { before: 100 },
          children: [
            new TextRun({ text: [e.jobTitle, e.company].filter(Boolean).join(" — "), bold: true, size: 22 }),
            dateRange ? new TextRun({ text: `   ${dateRange}`, italics: true, size: 20, color: "666666" }) : new TextRun(""),
          ],
        }),
      );
      if (e.location) children.push(new Paragraph({ children: [new TextRun({ text: e.location, size: 18, color: "666666" })] }));
      if (e.description) children.push(new Paragraph({ text: e.description, spacing: { after: 40 } }));
      (e.bullets || []).filter(Boolean).forEach((b) => children.push(bulletPara(b)));
    });
  }

  if ((data.education || []).some((e) => e.degree || e.institution)) {
    children.push(heading("Education", accentHex));
    data.education.forEach((ed) => {
      if (!ed.degree && !ed.institution) return;
      const dateRange = [ed.startDate, ed.endDate].filter(Boolean).join(" - ");
      children.push(
        new Paragraph({
          spacing: { before: 80 },
          children: [
            new TextRun({ text: [ed.degree, ed.institution].filter(Boolean).join(" — "), bold: true, size: 21 }),
            dateRange ? new TextRun({ text: `   ${dateRange}`, italics: true, size: 19, color: "666666" }) : new TextRun(""),
          ],
        }),
      );
      if (ed.grade) children.push(new Paragraph({ children: [new TextRun({ text: ed.grade, size: 18 })] }));
    });
  }

  if (Array.isArray(data.skills) && data.skills.length) {
    children.push(heading("Skills", accentHex));
    children.push(new Paragraph({ text: data.skills.join("  •  "), spacing: { after: 100 } }));
  }

  if ((data.projects || []).some((pr) => pr.name)) {
    children.push(heading("Projects", accentHex));
    data.projects.forEach((pr) => {
      if (!pr.name) return;
      children.push(new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: pr.name, bold: true, size: 21 })] }));
      if (pr.techStack) children.push(new Paragraph({ children: [new TextRun({ text: pr.techStack, italics: true, size: 18, color: "666666" })] }));
      if (pr.description) children.push(new Paragraph({ text: pr.description, spacing: { after: 40 } }));
    });
  }

  if ((data.certifications || []).some((c) => c.name)) {
    children.push(heading("Certifications", accentHex));
    data.certifications.forEach((c) => {
      if (!c.name) return;
      children.push(new Paragraph({ text: [c.name, c.issuer, c.date].filter(Boolean).join(" — "), spacing: { after: 40 } }));
    });
  }

  if (Array.isArray(data.languages) && data.languages.length) {
    children.push(heading("Languages", accentHex));
    const text = data.languages.map((l) => (typeof l === "string" ? l : `${l.name}${l.level ? ` (${l.level})` : ""}`)).join("  •  ");
    children.push(new Paragraph({ text, spacing: { after: 100 } }));
  }

  const achievementLines = (data.achievements || []).filter(Boolean);
  if (achievementLines.length) {
    children.push(heading("Achievements", accentHex));
    achievementLines.forEach((a) => children.push(bulletPara(typeof a === "string" ? a : a.text)));
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  return Packer.toBlob(doc);
};

export const downloadResumeDocx = async (data, accentColor, filename = "resume") => {
  const blob = await buildResumeDocx(data, accentColor);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename.replace(/[^a-z0-9-_]+/gi, "_") || "resume"}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
