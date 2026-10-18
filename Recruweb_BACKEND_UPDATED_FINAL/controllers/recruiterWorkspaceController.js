import { Op } from "sequelize";
import {
  User,
  Candidate,
  CrmRequirement,
  CrmClient,
  Task,
  CalendarEvent,
  CandidateActivity,
} from "../models/index.js";
import { logAudit } from "../utils/auditLogger.js";
import { generateMeetingRoom, sendInterviewEmail } from "../utils/meetingRoom.js";

// Resolve which recruiter's data to work with.
// - Recruiters/HR always see their own data.
// - Managers/Admins may look at a specific recruiter's workspace by passing
//   ?recruiterId=<id>; otherwise they see their own.
const resolveRecruiterId = (req) => {
  const canViewOthers = [
    "superadmin",
    "admin",
    "recruitment_manager",
    "hr_manager",
  ].some((r) => req.user.roles?.includes(r) || req.user.role === r);

  if (canViewOthers && req.query.recruiterId) {
    return Number(req.query.recruiterId);
  }
  return req.user.id;
};

const dateRangeWhere = (field, from, to) => {
  if (!from && !to) return {};
  const range = {};
  if (from) range[Op.gte] = new Date(from);
  if (to) range[Op.lte] = new Date(`${to}T23:59:59.999`);
  return { [field]: range };
};

//
// ==========================================
// DASHBOARD — assigned jobs, candidates, tasks, calendar, reminders summary
// ==========================================
//
export const getDashboard = async (req, res) => {
  try {
    const recruiterId = resolveRecruiterId(req);
    const now = new Date();
    const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      assignedJobsCount,
      assignedCandidatesCount,
      pendingTasksCount,
      overdueTasksCount,
      upcomingRemindersCount,
      upcomingEvents,
      recentCandidates,
      recentTasks,
    ] = await Promise.all([
      CrmRequirement.count({
        where: {
          assignedRecruiterId: recruiterId,
          status: { [Op.ne]: "closed" },
        },
      }),
      Candidate.count({
        where: { assignedRecruiterId: recruiterId, isActive: true },
      }),
      Task.count({
        where: { assignedToId: recruiterId, status: { [Op.ne]: "done" } },
      }),
      Task.count({
        where: {
          assignedToId: recruiterId,
          status: { [Op.ne]: "done" },
          dueDate: { [Op.lt]: now },
        },
      }),
      CalendarEvent.count({
        where: {
          ownerId: recruiterId,
          isReminder: true,
          status: "scheduled",
          startAt: { [Op.between]: [now, weekAhead] },
        },
      }),
      CalendarEvent.findAll({
        where: {
          ownerId: recruiterId,
          status: "scheduled",
          startAt: { [Op.between]: [now, weekAhead] },
        },
        order: [["startAt", "ASC"]],
        limit: 8,
      }),
      Candidate.findAll({
        where: { assignedRecruiterId: recruiterId, isActive: true },
        order: [["updatedAt", "DESC"]],
        limit: 6,
      }),
      Task.findAll({
        where: { assignedToId: recruiterId, status: { [Op.ne]: "done" } },
        order: [["dueDate", "ASC"]],
        limit: 6,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        recruiterId,
        assignedJobsCount,
        assignedCandidatesCount,
        pendingTasksCount,
        overdueTasksCount,
        upcomingRemindersCount,
        upcomingEvents,
        recentCandidates,
        recentTasks,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load recruiter dashboard",
      error: error.message,
    });
  }
};

//
// ==========================================
// ASSIGNED JOBS (open client requirements assigned to this recruiter)
// ==========================================
//
export const getAssignedJobs = async (req, res) => {
  try {
    const recruiterId = resolveRecruiterId(req);
    const { status, priority } = req.query;
    const where = { assignedRecruiterId: recruiterId };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const jobs = await CrmRequirement.findAll({
      where,
      include: [
        {
          model: CrmClient,
          as: "client",
          attributes: ["id", "name", "clientCode"],
        },
      ],
      order: [
        ["priority", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned jobs",
      error: error.message,
    });
  }
};

//
// ==========================================
// ASSIGNED CANDIDATES
// ==========================================
//
export const getAssignedCandidates = async (req, res) => {
  try {
    const recruiterId = resolveRecruiterId(req);
    const { stage, search } = req.query;
    const where = { assignedRecruiterId: recruiterId, isActive: true };
    if (stage) where.pipelineStage = stage;
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const candidates = await Candidate.findAll({
      where,
      order: [["updatedAt", "DESC"]],
    });

    res
      .status(200)
      .json({ success: true, count: candidates.length, data: candidates });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned candidates",
      error: error.message,
    });
  }
};

//
// ==========================================
// TASKS (scoped to this recruiter)
// ==========================================
//
export const getMyTasks = async (req, res) => {
  try {
    const recruiterId = resolveRecruiterId(req);
    const { status, priority } = req.query;
    const where = { assignedToId: recruiterId };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const tasks = await Task.findAll({
      where,
      order: [
        ["dueDate", "ASC"],
        ["createdAt", "DESC"],
      ],
    });
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
};

export const createMyTask = async (req, res) => {
  try {
    const recruiterId = resolveRecruiterId(req);
    const task = await Task.create({ ...req.body, assignedToId: recruiterId });
    res
      .status(201)
      .json({
        success: true,
        message: "Task created successfully",
        data: task,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
};

export const updateMyTask = async (req, res) => {
  try {
    const recruiterId = resolveRecruiterId(req);
    const task = await Task.findOne({
      where: { id: req.params.id, assignedToId: recruiterId },
    });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    await task.update(req.body);
    res
      .status(200)
      .json({
        success: true,
        message: "Task updated successfully",
        data: task,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    });
  }
};

export const deleteMyTask = async (req, res) => {
  try {
    const recruiterId = resolveRecruiterId(req);
    const task = await Task.findOne({
      where: { id: req.params.id, assignedToId: recruiterId },
    });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    await task.destroy();
    res
      .status(200)
      .json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: error.message,
    });
  }
};

//
// ==========================================
// CALENDAR EVENTS
// ==========================================
//
export const getCalendarEvents = async (req, res) => {
  try {
    const recruiterId = resolveRecruiterId(req);
    const { from, to, eventType } = req.query;
    const where = {
      ownerId: recruiterId,
      isReminder: false,
      ...dateRangeWhere("startAt", from, to),
    };
    if (eventType) where.eventType = eventType;

    const events = await CalendarEvent.findAll({
      where,
      order: [["startAt", "ASC"]],
    });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch calendar events",
      error: error.message,
    });
  }
};

export const createCalendarEvent = async (req, res) => {
  try {
    const recruiterId = resolveRecruiterId(req);
    const payload = { ...req.body };

    // Interview scheduling — auto-generate a real, working video meeting
    // room (no external account needed) and email the candidate a
    // confirmation with the join link. Applies whenever a recruiter/admin
    // schedules an "interview" event in video mode without already
    // supplying a meetingLink (e.g. a manually arranged one).
    let candidateForEmail = null;
    if (payload.eventType === "interview" && payload.interviewMode === "video" && !payload.meetingLink) {
      const { roomId, meetingLink } = generateMeetingRoom();
      payload.meetingRoomId = roomId;
      payload.meetingLink = meetingLink;
    }

    const event = await CalendarEvent.create({
      ...payload,
      isReminder: false,
      ownerId: recruiterId,
      createdBy: req.user.id,
    });

    if (event.eventType === "interview" && event.relatedType === "candidate" && event.relatedId) {
      candidateForEmail = await Candidate.findByPk(event.relatedId);
      if (candidateForEmail?.email) {
        sendInterviewEmail({
          to: candidateForEmail.email,
          name: `${candidateForEmail.firstName || ""} ${candidateForEmail.lastName || ""}`.trim(),
          roundName: event.interviewRound,
          scheduledAt: event.startAt,
          mode: event.interviewMode,
          meetingLink: event.meetingLink,
          location: event.location,
        }).catch((err) => console.error("Interview email failed:", err.message));
      }
    }

    res
      .status(201)
      .json({
        success: true,
        message: "Event created successfully",
        data: event,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create event",
      error: error.message,
    });
  }
};

export const updateCalendarEvent = async (req, res) => {
  try {
    const recruiterId = resolveRecruiterId(req);
    const event = await CalendarEvent.findOne({
      where: { id: req.params.id, ownerId: recruiterId },
    });
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const payload = { ...req.body };
    const timeChanged = payload.startAt && new Date(payload.startAt).getTime() !== new Date(event.startAt).getTime();
    const becomingVideo = (payload.interviewMode || event.interviewMode) === "video" && !event.meetingLink && !payload.meetingLink;
    if (becomingVideo) {
      const { roomId, meetingLink } = generateMeetingRoom();
      payload.meetingRoomId = roomId;
      payload.meetingLink = meetingLink;
    }

    await event.update(payload);

    if (event.eventType === "interview" && event.relatedType === "candidate" && event.relatedId && (timeChanged || becomingVideo)) {
      const candidate = await Candidate.findByPk(event.relatedId);
      if (candidate?.email) {
        sendInterviewEmail({
          to: candidate.email,
          name: `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim(),
          roundName: event.interviewRound,
          scheduledAt: event.startAt,
          mode: event.interviewMode,
          meetingLink: event.meetingLink,
          location: event.location,
        }).catch((err) => console.error("Interview reschedule email failed:", err.message));
      }
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Event updated successfully",
        data: event,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update event",
      error: error.message,
    });
  }
};

export const deleteCalendarEvent = async (req, res) => {
  try {
    const recruiterId = resolveRecruiterId(req);
    const event = await CalendarEvent.findOne({
      where: { id: req.params.id, ownerId: recruiterId },
    });
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    await event.destroy();
    res
      .status(200)
      .json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
      error: error.message,
    });
  }
};

//
// ==========================================
// REMINDERS (CalendarEvent rows with isReminder = true)
// ==========================================
//
export const getReminders = async (req, res) => {
  try {
    const recruiterId = resolveRecruiterId(req);
    const { status } = req.query;
    const where = { ownerId: recruiterId, isReminder: true };
    if (status) where.status = status;

    const reminders = await CalendarEvent.findAll({
      where,
      order: [["startAt", "ASC"]],
    });
    res
      .status(200)
      .json({ success: true, count: reminders.length, data: reminders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reminders",
      error: error.message,
    });
  }
};

export const createReminder = async (req, res) => {
  try {
    const recruiterId = resolveRecruiterId(req);
    const reminder = await CalendarEvent.create({
      ...req.body,
      eventType: "reminder",
      isReminder: true,
      ownerId: recruiterId,
      createdBy: req.user.id,
    });
    res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      data: reminder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create reminder",
      error: error.message,
    });
  }
};

export const updateReminder = async (req, res) => {
  try {
    const recruiterId = resolveRecruiterId(req);
    const reminder = await CalendarEvent.findOne({
      where: { id: req.params.id, ownerId: recruiterId, isReminder: true },
    });
    if (!reminder) {
      return res
        .status(404)
        .json({ success: false, message: "Reminder not found" });
    }
    await reminder.update(req.body);
    res.status(200).json({
      success: true,
      message: "Reminder updated successfully",
      data: reminder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update reminder",
      error: error.message,
    });
  }
};

export const deleteReminder = async (req, res) => {
  try {
    const recruiterId = resolveRecruiterId(req);
    const reminder = await CalendarEvent.findOne({
      where: { id: req.params.id, ownerId: recruiterId, isReminder: true },
    });
    if (!reminder) {
      return res
        .status(404)
        .json({ success: false, message: "Reminder not found" });
    }
    await reminder.destroy();
    res
      .status(200)
      .json({ success: true, message: "Reminder deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete reminder",
      error: error.message,
    });
  }
};

//
// ==========================================
// CANDIDATE ACTIVITY LOG (calls / interviews / joins)
// ==========================================
//
export const logCandidateActivity = async (req, res) => {
  try {
    const recruiterId = resolveRecruiterId(req);
    const {
      candidateId,
      type,
      outcome,
      notes,
      durationMinutes,
      requirementId,
      activityDate,
    } = req.body;

    if (!candidateId || !type) {
      return res.status(400).json({
        success: false,
        message: "candidateId and type are required",
      });
    }

    const candidate = await Candidate.findByPk(candidateId);
    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found" });
    }

    const activity = await CandidateActivity.create({
      candidateId,
      recruiterId,
      requirementId: requirementId || null,
      type,
      outcome: outcome || null,
      notes: notes || null,
      durationMinutes: durationMinutes || null,
      activityDate: activityDate || new Date(),
    });

    // Keep the candidate's own timeline in sync so it shows up alongside
    // the rest of their ATS history.
    const timeline = candidate.timeline || [];
    timeline.push({
      stage: candidate.pipelineStage,
      action: `${type} logged by recruiter`,
      note: notes || outcome || "",
      date: new Date(),
    });
    candidate.timeline = timeline;
    candidate.changed("timeline", true);
    await candidate.save();

    await logAudit({
      req,
      action: "create",
      module: "candidate_activity",
      targetType: "CandidateActivity",
      targetId: activity.id,
      description: `Logged ${type} for candidate #${candidateId}`,
    });

    res.status(201).json({
      success: true,
      message: "Activity logged successfully",
      data: activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to log activity",
      error: error.message,
    });
  }
};

export const getCandidateActivities = async (req, res) => {
  try {
    const recruiterId = resolveRecruiterId(req);
    const { candidateId, type, from, to } = req.query;
    const where = {
      recruiterId,
      ...dateRangeWhere("activityDate", from, to),
    };
    if (candidateId) where.candidateId = candidateId;
    if (type) where.type = type;

    const activities = await CandidateActivity.findAll({
      where,
      include: [
        {
          model: Candidate,
          as: "candidate",
          attributes: ["id", "firstName", "lastName", "phone", "email"],
        },
      ],
      order: [["activityDate", "DESC"]],
      limit: 200,
    });

    res
      .status(200)
      .json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch activities",
      error: error.message,
    });
  }
};

//
// ==========================================
// PERFORMANCE — Calls, Interviews, Joins, Conversion Ratio
// ==========================================
//
export const getPerformance = async (req, res) => {
  try {
    const recruiterId = resolveRecruiterId(req);
    const { from, to } = req.query;
    const activityWhere = {
      recruiterId,
      ...dateRangeWhere("activityDate", from, to),
    };

    const [
      calls,
      interviewsLogged,
      joinsLogged,
      assignedCandidatesCount,
      joinedCandidatesCount,
    ] = await Promise.all([
      CandidateActivity.count({ where: { ...activityWhere, type: "call" } }),
      CandidateActivity.count({
        where: { ...activityWhere, type: "interview" },
      }),
      CandidateActivity.count({ where: { ...activityWhere, type: "join" } }),
      Candidate.count({
        where: { assignedRecruiterId: recruiterId, isActive: true },
      }),
      Candidate.count({
        where: {
          assignedRecruiterId: recruiterId,
          isActive: true,
          pipelineStage: { [Op.in]: ["Joined", "Retained 90 Days"] },
        },
      }),
    ]);

    // Joins = actual candidates who reached the Joined stage under this
    // recruiter (falls back to logged "join" activities if none recorded
    // via the pipeline yet, so the number is never silently zero when
    // activity has been logged manually).
    const joins = joinedCandidatesCount || joinsLogged;
    const interviews = interviewsLogged;

    const conversionRatio =
      assignedCandidatesCount > 0
        ? Number(((joins / assignedCandidatesCount) * 100).toFixed(1))
        : 0;

    res.status(200).json({
      success: true,
      data: {
        recruiterId,
        calls,
        interviews,
        joins,
        assignedCandidatesCount,
        conversionRatio, // % of assigned candidates who joined
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to compute performance stats",
      error: error.message,
    });
  }
};

// Lightweight lookup used by the "log activity" dropdown/autocomplete.
export const getRecruiterOptions = async (req, res) => {
  try {
    const recruiters = await User.findAll({
      where: {
        role: {
          [Op.in]: ["recruiter", "hr", "recruitment_manager", "hr_manager", "hr_partner"],
        },
        isActive: true,
      },
      attributes: ["id", "name", "email", "role"],
      order: [["name", "ASC"]],
    });
    res
      .status(200)
      .json({ success: true, count: recruiters.length, data: recruiters });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch recruiters",
      error: error.message,
    });
  }
};
