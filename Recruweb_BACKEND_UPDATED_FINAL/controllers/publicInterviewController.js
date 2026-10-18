import { Op } from "sequelize";
import { CalendarEvent, Candidate, Job, User } from "../models/index.js";
import { ROLE_GROUPS } from "../config/roles.js";
import { generateMeetingRoom, sendInterviewEmail } from "../utils/meetingRoom.js";

const BOOKING_DURATION_MINUTES = 30;
const SLOT_HOURS = [9, 10, 11, 14, 15, 16];

const startOfNow = () => new Date();

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const getRecruiterOwner = async () => {
  // Public bookings still belong to a real staff member so they immediately
  // appear in the existing Recruiter Workspace calendar.
  return User.findOne({
    where: {
      isActive: true,
      role: { [Op.in]: ROLE_GROUPS.RECRUITMENT },
    },
    order: [
      ["role", "ASC"],
      ["id", "ASC"],
    ],
  });
};

const parseStart = (value) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return null;
  return date;
};

const isPast = (date) => date.getTime() <= Date.now() + 60 * 1000;

const buildEnd = (startAt) =>
  new Date(startAt.getTime() + BOOKING_DURATION_MINUTES * 60 * 1000);

const findConflictingInterview = async (startAt, endAt) => {
  return CalendarEvent.findOne({
    where: {
      eventType: "interview",
      status: "scheduled",
      startAt: { [Op.lt]: endAt },
      [Op.and]: [
        {
          [Op.or]: [
            { endAt: { [Op.gt]: startAt } },
            { endAt: null },
          ],
        },
      ],
    },
  });
};

export const getPublicInterviewAvailability = async (req, res) => {
  try {
    const from = new Date();
    const to = new Date(from.getTime() + 31 * 24 * 60 * 60 * 1000);

    const events = await CalendarEvent.findAll({
      where: {
        eventType: "interview",
        status: "scheduled",
        startAt: { [Op.between]: [from, to] },
      },
      attributes: ["startAt", "endAt"],
      order: [["startAt", "ASC"]],
    });

    res.status(200).json({
      success: true,
      timezone: req.query.timezone || "UTC",
      durationMinutes: BOOKING_DURATION_MINUTES,
      slotHours: SLOT_HOURS,
      busy: events.map((event) => ({
        startAt: event.startAt,
        endAt: event.endAt,
      })),
    });
  } catch (error) {
    console.error("[Public Interview Availability]", error);
    res.status(500).json({
      success: false,
      message: "Failed to load interview availability",
      error: error.message,
    });
  }
};

export const schedulePublicInterview = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      jobTitle,
      company,
      notes,
      experience,
      timezone,
      startAt: rawStartAt,
      interviewMode,
      jobId,
    } = req.body || {};

    const cleanName = String(fullName || "").trim();
    const cleanEmail = normalizeEmail(email);
    const cleanPhone = String(phone || "").trim();
    const cleanJobTitle = String(jobTitle || "").trim();
    const cleanCompany = String(company || "").trim();

    if (!cleanName || !cleanEmail || !cleanPhone || !cleanJobTitle) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, phone and job title are required.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const startAt = parseStart(rawStartAt);
    if (!startAt || isPast(startAt)) {
      return res.status(400).json({
        success: false,
        message: "Please select a future interview date and time.",
      });
    }

    const endAt = buildEnd(startAt);

    // The public UI only exposes hourly slots. Validate the hour/minute in
    // the candidate's actual timezone (not UTC), so half-hour-offset
    // timezones such as Asia/Kolkata are handled correctly.
    let localParts;
    try {
      const localFormatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone || "UTC",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      localParts = localFormatter.formatToParts(startAt);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid timezone supplied.",
      });
    }

    const localHour = Number(
      localParts.find((part) => part.type === "hour")?.value,
    );
    const localMinute = Number(
      localParts.find((part) => part.type === "minute")?.value,
    );

    if (!SLOT_HOURS.includes(localHour) || localMinute !== 0) {
      return res.status(400).json({
        success: false,
        message: "Please choose one of the available hourly interview slots.",
      });
    }

    const owner = await getRecruiterOwner();
    if (!owner) {
      return res.status(503).json({
        success: false,
        message:
          "Interview scheduling is temporarily unavailable because no active recruiter is configured.",
      });
    }

    const conflict = await findConflictingInterview(startAt, endAt);
    if (conflict) {
      return res.status(409).json({
        success: false,
        message:
          "That interview slot was just booked. Please choose another available time.",
      });
    }

    let job = null;
    if (jobId && Number.isInteger(Number(jobId))) {
      job = await Job.findByPk(Number(jobId));
    }

    const [firstName, ...lastParts] = cleanName.split(/\s+/);
    const lastName = lastParts.join(" ");

    let candidate = await Candidate.findOne({
      where: { email: cleanEmail },
      order: [["createdAt", "ASC"]],
    });

    if (!candidate) {
      candidate = await Candidate.create({
        firstName: firstName || "Candidate",
        lastName: lastName || "",
        email: cleanEmail,
        phone: cleanPhone,
        source: "Website",
        experience: Number.parseFloat(String(experience || "").match(/\d+(\.\d+)?/)?.[0] || 0) || 0,
        pipelineStage: "Interview Scheduled",
        timeline: [
          {
            stage: "Interview Scheduled",
            changedBy: owner.id,
            changedAt: new Date(),
          },
        ],
      });
    } else {
      const updates = {};
      if (!candidate.phone && cleanPhone) updates.phone = cleanPhone;
      if (candidate.pipelineStage !== "Offer Released" && candidate.pipelineStage !== "Joined") {
        updates.pipelineStage = "Interview Scheduled";
      }
      if (Object.keys(updates).length) await candidate.update(updates);
    }

    const mode = ["video", "phone", "onsite"].includes(interviewMode)
      ? interviewMode
      : "video";

    let meetingRoomId = null;
    let meetingLink = null;
    if (mode === "video") {
      const room = generateMeetingRoom();
      meetingRoomId = room.roomId;
      meetingLink = room.meetingLink;
    }

    const title = `Interview — ${cleanName}${cleanJobTitle ? ` — ${cleanJobTitle}` : ""}`;
    const description = [
      "Public interview booking",
      cleanCompany ? `Company: ${cleanCompany}` : "",
      cleanJobTitle ? `Position: ${cleanJobTitle}` : "",
      timezone ? `Candidate timezone: ${timezone}` : "",
      notes ? `Notes: ${notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const event = await CalendarEvent.create({
      title,
      description,
      eventType: "interview",
      isReminder: false,
      startAt,
      endAt,
      relatedType: "candidate",
      relatedId: candidate.id,
      location: mode === "onsite" ? cleanCompany || null : null,
      interviewMode: mode,
      interviewRound: "Initial Interview",
      durationMinutes: BOOKING_DURATION_MINUTES,
      meetingRoomId,
      meetingLink,
      interviewerIds: [owner.id],
      status: "scheduled",
      ownerId: owner.id,
      createdBy: owner.id,
    });

    // Email failure must never turn a successfully stored booking into a
    // false error response.
    sendInterviewEmail({
      to: cleanEmail,
      name: cleanName,
      roundName: "Initial Interview",
      scheduledAt: event.startAt,
      mode,
      meetingLink,
      location: event.location,
      jobTitle: cleanJobTitle,
    }).catch((err) =>
      console.error("[Public Interview Email]", err.message),
    );

    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully.",
      data: {
        id: event.id,
        title: event.title,
        startAt: event.startAt,
        endAt: event.endAt,
        timezone: timezone || "UTC",
        interviewMode: mode,
        meetingLink,
        candidateId: candidate.id,
        jobTitle: cleanJobTitle,
        company: cleanCompany,
        ownerId: owner.id,
      },
    });
  } catch (error) {
    console.error("[Public Interview Schedule]", error);
    res.status(500).json({
      success: false,
      message: "Failed to schedule interview",
      error: error.message,
    });
  }
};
