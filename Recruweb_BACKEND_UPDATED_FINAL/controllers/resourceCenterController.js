import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  SalaryGuide,
  InterviewQuestion,
  HrTemplate,
  ComplianceChecklist,
} from "../models/index.js";
import { logAudit } from "../utils/auditLogger.js";
import { calculateSalaryBreakup } from "../utils/payrollCalculator.js";

// Absolute path anchored to this file's own directory (backend/uploads/
// hr-templates) instead of a relative "uploads/hr-templates" path, which
// Node would otherwise resolve relative to process.cwd(). The upload
// middleware (middleware/hrTemplateUpload.js) writes files using an
// absolute path anchored the same way, so these read/delete paths must
// match it exactly or every template would look "missing on server".
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HR_TEMPLATES_DIR = path.join(__dirname, "..", "uploads", "hr-templates");

const publishedOnly = (req) => (req.user ? {} : { isPublished: true });

// =========================================================
// Salary Guides — Noida / Delhi NCR / BPO / Sales / IT ...
// =========================================================

export const getSalaryGuides = async (req, res) => {
  try {
    const { category, experienceLevel } = req.query;
    const where = { ...publishedOnly(req) };
    if (category) where.category = category;
    if (experienceLevel) where.experienceLevel = experienceLevel;

    const guides = await SalaryGuide.findAll({
      where,
      order: [
        ["category", "ASC"],
        ["displayOrder", "ASC"],
        ["roleTitle", "ASC"],
      ],
    });

    res.status(200).json({ success: true, count: guides.length, data: guides });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch salary guides",
        error: error.message,
      });
  }
};

export const createSalaryGuide = async (req, res) => {
  try {
    const guide = await SalaryGuide.create(req.body);
    await logAudit({
      req,
      action: "create",
      module: "resource_center",
      targetType: "SalaryGuide",
      targetId: guide.id,
      description: `Added salary guide: ${guide.roleTitle} (${guide.category})`,
    });
    res.status(201).json({ success: true, data: guide });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: "Failed to create salary guide",
        error: error.message,
      });
  }
};

export const updateSalaryGuide = async (req, res) => {
  try {
    const guide = await SalaryGuide.findByPk(req.params.id);
    if (!guide)
      return res
        .status(404)
        .json({ success: false, message: "Salary guide not found" });
    const before = guide.toJSON();
    await guide.update(req.body);
    await logAudit({
      req,
      action: "update",
      module: "resource_center",
      targetType: "SalaryGuide",
      targetId: guide.id,
      changes: { before, after: guide.toJSON() },
      description: `Updated salary guide: ${guide.roleTitle}`,
    });
    res.status(200).json({ success: true, data: guide });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: "Failed to update salary guide",
        error: error.message,
      });
  }
};

export const deleteSalaryGuide = async (req, res) => {
  try {
    const guide = await SalaryGuide.findByPk(req.params.id);
    if (!guide)
      return res
        .status(404)
        .json({ success: false, message: "Salary guide not found" });
    await guide.destroy();
    await logAudit({
      req,
      action: "delete",
      module: "resource_center",
      targetType: "SalaryGuide",
      targetId: req.params.id,
      description: `Deleted salary guide #${req.params.id}`,
    });
    res.status(200).json({ success: true, message: "Salary guide deleted" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete salary guide",
        error: error.message,
      });
  }
};

// =========================================================
// Interview Question Bank
// =========================================================

export const getInterviewQuestions = async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const where = { ...publishedOnly(req) };
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;

    const questions = await InterviewQuestion.findAll({
      where,
      order: [
        ["category", "ASC"],
        ["displayOrder", "ASC"],
        ["id", "ASC"],
      ],
    });

    res
      .status(200)
      .json({ success: true, count: questions.length, data: questions });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch interview questions",
        error: error.message,
      });
  }
};

export const createInterviewQuestion = async (req, res) => {
  try {
    const q = await InterviewQuestion.create(req.body);
    await logAudit({
      req,
      action: "create",
      module: "resource_center",
      targetType: "InterviewQuestion",
      targetId: q.id,
      description: `Added interview question (${q.category})`,
    });
    res.status(201).json({ success: true, data: q });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: "Failed to create interview question",
        error: error.message,
      });
  }
};

export const updateInterviewQuestion = async (req, res) => {
  try {
    const q = await InterviewQuestion.findByPk(req.params.id);
    if (!q)
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    const before = q.toJSON();
    await q.update(req.body);
    await logAudit({
      req,
      action: "update",
      module: "resource_center",
      targetType: "InterviewQuestion",
      targetId: q.id,
      changes: { before, after: q.toJSON() },
      description: "Updated interview question",
    });
    res.status(200).json({ success: true, data: q });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: "Failed to update interview question",
        error: error.message,
      });
  }
};

export const deleteInterviewQuestion = async (req, res) => {
  try {
    const q = await InterviewQuestion.findByPk(req.params.id);
    if (!q)
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    await q.destroy();
    await logAudit({
      req,
      action: "delete",
      module: "resource_center",
      targetType: "InterviewQuestion",
      targetId: req.params.id,
      description: `Deleted interview question #${req.params.id}`,
    });
    res.status(200).json({ success: true, message: "Question deleted" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete interview question",
        error: error.message,
      });
  }
};

// =========================================================
// HR Templates — Offer Letters & Notice Period Policies
// =========================================================

export const getHrTemplates = async (req, res) => {
  try {
    const { type } = req.query;
    const where = { ...publishedOnly(req) };
    if (type) where.type = type;

    const templates = await HrTemplate.findAll({
      where,
      order: [
        ["type", "ASC"],
        ["displayOrder", "ASC"],
        ["title", "ASC"],
      ],
      attributes: { exclude: ["fileName"] }, // don't leak disk filename publicly
    });

    res
      .status(200)
      .json({ success: true, count: templates.length, data: templates });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch templates",
        error: error.message,
      });
  }
};

export const createHrTemplate = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Template file is required" });
    }
    const { type, title, description } = req.body;
    const template = await HrTemplate.create({
      type,
      title,
      description,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: path.extname(req.file.originalname).replace(".", ""),
      createdById: req.user?.id ?? null,
    });

    await logAudit({
      req,
      action: "create",
      module: "resource_center",
      targetType: "HrTemplate",
      targetId: template.id,
      description: `Uploaded HR template: ${template.title}`,
    });
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: "Failed to upload template",
        error: error.message,
      });
  }
};

export const updateHrTemplate = async (req, res) => {
  try {
    const template = await HrTemplate.findByPk(req.params.id);
    if (!template)
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });

    const updates = { ...req.body };
    if (req.file) {
      // Replace the file on disk; remove the old one.
      const oldPath = path.join(HR_TEMPLATES_DIR, template.fileName);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      updates.fileName = req.file.filename;
      updates.originalName = req.file.originalname;
      updates.fileType = path.extname(req.file.originalname).replace(".", "");
    }

    await template.update(updates);
    await logAudit({
      req,
      action: "update",
      module: "resource_center",
      targetType: "HrTemplate",
      targetId: template.id,
      description: `Updated HR template: ${template.title}`,
    });
    res.status(200).json({ success: true, data: template });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: "Failed to update template",
        error: error.message,
      });
  }
};

export const deleteHrTemplate = async (req, res) => {
  try {
    const template = await HrTemplate.findByPk(req.params.id);
    if (!template)
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });

    const filePath = path.join(HR_TEMPLATES_DIR, template.fileName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await template.destroy();
    await logAudit({
      req,
      action: "delete",
      module: "resource_center",
      targetType: "HrTemplate",
      targetId: req.params.id,
      description: `Deleted HR template #${req.params.id}`,
    });
    res.status(200).json({ success: true, message: "Template deleted" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete template",
        error: error.message,
      });
  }
};

// Public download — increments the live downloadCount and streams the file.
export const downloadHrTemplate = async (req, res) => {
  try {
    const template = await HrTemplate.findOne({
      where: { id: req.params.id, isPublished: true },
    });
    if (!template)
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });

    const filePath = path.join(HR_TEMPLATES_DIR, template.fileName);
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ success: false, message: "File missing on server" });
    }

    await template.increment("downloadCount");
    await logAudit({
      req,
      action: "download",
      module: "resource_center",
      targetType: "HrTemplate",
      targetId: template.id,
      description: `Downloaded template: ${template.title}`,
    });

    res.download(filePath, template.originalName || template.fileName);
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Download failed",
        error: error.message,
      });
  }
};

// =========================================================
// HR Compliance Checklists
// =========================================================

export const getComplianceChecklists = async (req, res) => {
  try {
    const { category } = req.query;
    const where = { ...publishedOnly(req) };
    if (category) where.category = category;

    const checklists = await ComplianceChecklist.findAll({
      where,
      order: [
        ["displayOrder", "ASC"],
        ["title", "ASC"],
      ],
    });

    res
      .status(200)
      .json({ success: true, count: checklists.length, data: checklists });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch checklists",
        error: error.message,
      });
  }
};

export const createComplianceChecklist = async (req, res) => {
  try {
    const checklist = await ComplianceChecklist.create({
      ...req.body,
      createdById: req.user?.id ?? null,
    });
    await logAudit({
      req,
      action: "create",
      module: "resource_center",
      targetType: "ComplianceChecklist",
      targetId: checklist.id,
      description: `Added compliance checklist: ${checklist.title}`,
    });
    res.status(201).json({ success: true, data: checklist });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: "Failed to create checklist",
        error: error.message,
      });
  }
};

export const updateComplianceChecklist = async (req, res) => {
  try {
    const checklist = await ComplianceChecklist.findByPk(req.params.id);
    if (!checklist)
      return res
        .status(404)
        .json({ success: false, message: "Checklist not found" });
    const before = checklist.toJSON();
    await checklist.update(req.body);
    await logAudit({
      req,
      action: "update",
      module: "resource_center",
      targetType: "ComplianceChecklist",
      targetId: checklist.id,
      changes: { before, after: checklist.toJSON() },
      description: `Updated checklist: ${checklist.title}`,
    });
    res.status(200).json({ success: true, data: checklist });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: "Failed to update checklist",
        error: error.message,
      });
  }
};

export const deleteComplianceChecklist = async (req, res) => {
  try {
    const checklist = await ComplianceChecklist.findByPk(req.params.id);
    if (!checklist)
      return res
        .status(404)
        .json({ success: false, message: "Checklist not found" });
    await checklist.destroy();
    await logAudit({
      req,
      action: "delete",
      module: "resource_center",
      targetType: "ComplianceChecklist",
      targetId: req.params.id,
      description: `Deleted checklist #${req.params.id}`,
    });
    res.status(200).json({ success: true, message: "Checklist deleted" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete checklist",
        error: error.message,
      });
  }
};

// Public download — generates a plain-text printable version on the fly
// and increments the live downloadCount.
export const downloadComplianceChecklist = async (req, res) => {
  try {
    const checklist = await ComplianceChecklist.findOne({
      where: { id: req.params.id, isPublished: true },
    });
    if (!checklist)
      return res
        .status(404)
        .json({ success: false, message: "Checklist not found" });

    await checklist.increment("downloadCount");
    await logAudit({
      req,
      action: "download",
      module: "resource_center",
      targetType: "ComplianceChecklist",
      targetId: checklist.id,
      description: `Downloaded checklist: ${checklist.title}`,
    });

    const lines = [
      checklist.title.toUpperCase(),
      checklist.description || "",
      "=".repeat(60),
      "",
      ...(checklist.items || []).map(
        (item, i) =>
          `${i + 1}. [ ] ${item.text}${item.description ? `\n     ${item.description}` : ""}`,
      ),
      "",
      "— Generated by Recruweb Free Hiring Resource Center",
    ];

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${checklist.title.replace(/[^a-z0-9]+/gi, "-")}.txt"`,
    );
    res.send(lines.join("\n"));
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Download failed",
        error: error.message,
      });
  }
};

// =========================================================
// Payroll Calculator — live calculation, not stored content
// =========================================================

export const runPayrollCalculator = async (req, res) => {
  try {
    const result = calculateSalaryBreakup(req.body);

    // Fire-and-forget usage log — doesn't block the response.
    logAudit({
      req,
      action: "payroll_calculate",
      module: "resource_center",
      description: `Payroll calculator used (CTC ₹${req.body.annualCTC})`,
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// =========================================================
// Resource Center — public stats (live counts for the landing section)
// =========================================================

export const getResourceCenterStats = async (req, res) => {
  try {
    const [salaryGuides, interviewQuestions, templates, checklists] =
      await Promise.all([
        SalaryGuide.count({ where: { isPublished: true } }),
        InterviewQuestion.count({ where: { isPublished: true } }),
        HrTemplate.count({ where: { isPublished: true } }),
        ComplianceChecklist.count({ where: { isPublished: true } }),
      ]);

    const totalDownloads = await HrTemplate.sum("downloadCount");

    res.status(200).json({
      success: true,
      data: {
        salaryGuides,
        interviewQuestions,
        templates,
        checklists,
        totalDownloads: totalDownloads || 0,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch stats",
        error: error.message,
      });
  }
};
