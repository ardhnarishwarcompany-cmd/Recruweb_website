import { Op } from "sequelize";
import { Application, Job, User } from "../models/index.js";
import { screenApplication } from "../utils/resumeScreening.js";
import { logAudit } from "../utils/auditLogger.js";

const APPLICANT_INCLUDE = [
  { model: Job, as: "job", attributes: ["id", "title", "company"] },
  { model: User, as: "assignedTo", attributes: ["id", "name", "email"] },
  { model: User, as: "reviewedBy", attributes: ["id", "name", "email"] },
];

// =====================================================================
// CANDIDATE INBOX
// GET /api/applications  — searchable, filterable list of every applied
// candidate across every job, with resume score, assignment and stage.
// =====================================================================
export const getInbox = async (req, res) => {
  try {
    const {
      status,
      jobId,
      assignedToId,
      search,
      minScore,
      page = 1,
      limit = 25,
    } = req.query;

    const where = {};
    if (status) where.status = status;
    if (jobId) where.jobId = jobId;
    if (assignedToId)
      where.assignedToId = assignedToId === "unassigned" ? null : assignedToId;
    if (minScore) where.resumeScore = { [Op.gte]: Number(minScore) };
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { currentCompany: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await Application.findAndCountAll({
      where,
      include: APPLICANT_INCLUDE,
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset,
    });

    res.status(200).json({
      success: true,
      count,
      page: Number(page),
      totalPages: Math.ceil(count / Number(limit)),
      data: rows,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch candidate inbox",
        error: error.message,
      });
  }
};

// Update the ATS pipeline stage (status) and/or recruiter notes for a single
// applied candidate. Powers the admin "Applied Candidates" Kanban view.
// Every change is appended to statusHistory (Status Tracking) and written
// to the audit trail (Security Module).
export const updateApplicationStatus = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }
    const { status, notes } = req.body;
    const previousStatus = application.status;

    if (status) application.status = status;
    if (notes !== undefined) application.notes = notes;
    if (req.user) application.reviewedById = req.user.id;

    if (status && status !== previousStatus) {
      const history = Array.isArray(application.statusHistory)
        ? application.statusHistory
        : [];
      application.statusHistory = [
        ...history,
        {
          status,
          notes: notes || null,
          changedById: req.user?.id ?? null,
          changedByName: req.user?.name ?? "System",
          changedAt: new Date(),
        },
      ];
    }

    await application.save();

    await logAudit({
      req,
      action: "update",
      module: "application",
      targetType: "Application",
      targetId: application.id,
      description: `Moved ${application.firstName} ${application.lastName} from "${previousStatus}" to "${application.status}"`,
      changes: {
        before: { status: previousStatus },
        after: { status: application.status },
      },
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Application updated successfully",
        data: application,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update application",
        error: error.message,
      });
  }
};

// =====================================================================
// CANDIDATE ASSIGNMENT
// PUT /api/applications/:id/assign  { userId }  (null/‘unassign’ clears it)
// =====================================================================
export const assignApplication = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    const { userId } = req.body;
    let assignee = null;
    if (userId) {
      assignee = await User.findByPk(userId);
      if (!assignee) {
        return res
          .status(404)
          .json({ success: false, message: "Assignee user not found" });
      }
    }

    const previousAssigneeId = application.assignedToId;
    application.assignedToId = userId || null;

    const history = Array.isArray(application.statusHistory)
      ? application.statusHistory
      : [];
    application.statusHistory = [
      ...history,
      {
        status: application.status,
        notes: assignee ? `Assigned to ${assignee.name}` : "Unassigned",
        changedById: req.user?.id ?? null,
        changedByName: req.user?.name ?? "System",
        changedAt: new Date(),
      },
    ];

    await application.save();

    await logAudit({
      req,
      action: "update",
      module: "application",
      targetType: "Application",
      targetId: application.id,
      description: assignee
        ? `Assigned application #${application.id} (${application.firstName} ${application.lastName}) to ${assignee.name}`
        : `Unassigned application #${application.id}`,
      changes: {
        before: { assignedToId: previousAssigneeId },
        after: { assignedToId: application.assignedToId },
      },
    });

    const updated = await Application.findByPk(application.id, {
      include: APPLICANT_INCLUDE,
    });
    res
      .status(200)
      .json({
        success: true,
        message: "Application assigned successfully",
        data: updated,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to assign application",
        error: error.message,
      });
  }
};

// =====================================================================
// RESUME SCREENING
// POST /api/applications/:id/screen  — (re)runs keyword + AI screening
// against the applicant's uploaded resume and the job it was submitted for.
// =====================================================================
export const screenResume = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [{ model: Job, as: "job" }],
    });
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }
    if (!application.resume) {
      return res
        .status(400)
        .json({
          success: false,
          message: "This application has no uploaded resume to screen",
        });
    }

    const result = await screenApplication(application, application.job);

    await application.update({
      resumeScore: result.score,
      resumeSkills: result.skills,
      resumeSummary: result.summary,
      screeningMethod: result.method,
      screenedAt: new Date(),
    });

    await logAudit({
      req,
      action: "update",
      module: "application",
      targetType: "Application",
      targetId: application.id,
      description: `Screened resume for ${application.firstName} ${application.lastName} — score ${result.score}/100 (${result.method})`,
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Resume screened successfully",
        data: result,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to screen resume",
        error: error.message,
      });
  }
};

export const getApplication = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, {
      include: APPLICANT_INCLUDE,
    });
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch application",
        error: error.message,
      });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }
    await application.destroy();
    await logAudit({
      req,
      action: "delete",
      module: "application",
      targetType: "Application",
      targetId: req.params.id,
      description: `Deleted application #${req.params.id}`,
    });
    res
      .status(200)
      .json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete application",
        error: error.message,
      });
  }
};
