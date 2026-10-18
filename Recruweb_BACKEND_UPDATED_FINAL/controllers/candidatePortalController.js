import { Op } from "sequelize";
import {
  Candidate,
  Application,
  Job,
  EmployeeJoining,
  CalendarEvent,
  User,
  CandidateMessage,
  CandidateSubmission,
  Task,
  NewJoinerForm,
} from "../models/index.js";
import { parseResume } from "../utils/resumeParser.js";
import { logAudit } from "../utils/auditLogger.js";
import { buildJoiningTracker } from "../utils/joiningTracker.js";
import { generateMeetingRoom, sendInterviewEmail } from "../utils/meetingRoom.js";
import { emitToRoom } from "../socket.js";
import { draftChatReply } from "../utils/chatAI.js";

// ==========================================================================
// Candidate Portal (Phase 6)
// Every endpoint here is scoped to req.user (the logged-in candidate, role
// = "candidate"). There is no mock/sample data anywhere in this file — every
// response is read from, or written to, the real MySQL tables (candidates,
// applications, employee_joinings, calendar_events) via Sequelize.
// ==========================================================================

// Finds this candidate's ATS profile (candidates.userId), auto-creating a
// bare one on first visit so the portal always has a real row to read/write
// instead of falling back to placeholder data.
const getOrCreateProfile = async (req) => {
  let candidate = await Candidate.findOne({ where: { userId: req.user.id } });
  if (candidate) return candidate;

  // First-time portal visit: try to adopt an existing ATS record created by
  // a recruiter for this same email (e.g. from a public job application)
  // before creating a brand-new blank one, so history isn't lost.
  candidate = await Candidate.findOne({
    where: { email: req.user.email, userId: null },
  });

  if (candidate) {
    candidate.userId = req.user.id;
    await candidate.save();
    return candidate;
  }

  const [firstName, ...rest] = (req.user.name || "Candidate").split(" ");
  candidate = await Candidate.create({
    userId: req.user.id,
    firstName: firstName || "Candidate",
    lastName: rest.join(" ") || "",
    email: req.user.email,
    source: "Website",
  });
  return candidate;
};


// ==========================================================================
// INTERVIEW PROJECT / TASKS
// Candidates only see tasks assigned to their own portal account. They can
// update their candidate-facing status and submit a link/notes; staff-owned
// fields such as assignee and reviewer feedback remain protected.
// ==========================================================================
export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { assignedToId: req.user.id, taskType: "interview_task" },
      order: [["dueDate", "ASC"], ["createdAt", "DESC"]],
    });
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load interview tasks", error: error.message });
  }
};

export const updateMyTask = async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, assignedToId: req.user.id, taskType: "interview_task" } });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const allowed = {};
    if (req.body.candidateStatus) allowed.candidateStatus = String(req.body.candidateStatus);
    if (req.body.submissionUrl !== undefined) allowed.submissionUrl = String(req.body.submissionUrl || "").slice(0, 1000);
    if (req.body.submissionNotes !== undefined) allowed.submissionNotes = String(req.body.submissionNotes || "");
    if (allowed.candidateStatus === "submitted") {
      allowed.submittedAt = new Date();
      allowed.status = "in-progress";
    }
    await task.update(allowed);
    res.json({ success: true, message: "Task updated successfully", data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update interview task", error: error.message });
  }
};

//
// ==========================================
// PROFILE
// ==========================================
//
export const getMyProfile = async (req, res) => {
  try {
    const candidate = await getOrCreateProfile(req);
    res.status(200).json({ success: true, data: candidate });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load profile",
      error: error.message,
    });
  }
};

// Fields the candidate is allowed to edit on their own profile. Recruiter-
// only fields (assignedRecruiterId, pipelineStage, aiScore, rating,
// offerLetterUrl, ...) are deliberately excluded.
const EDITABLE_FIELDS = [
  "firstName",
  "lastName",
  "phone",
  "alternatePhone",
  "source",
  "experience",
  "currentCompany",
  "currentCTC",
  "expectedCTC",
  "noticePeriod",
  "skills",
  "education",
  "profilePhoto",
];

export const updateMyProfile = async (req, res) => {
  try {
    const candidate = await getOrCreateProfile(req);
    const updates = {};
    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    await candidate.update(updates);

    await logAudit({
      req,
      action: "update",
      module: "candidate_portal",
      targetType: "Candidate",
      targetId: candidate.id,
      description: "Candidate updated their own profile",
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: candidate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

//
// ==========================================
// RESUME
// ==========================================
//
export const uploadMyResume = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Resume file is required" });
    }
    const candidate = await getOrCreateProfile(req);

    const parsed = await parseResume(req.file.path).catch(() => null);

    candidate.resume = `/uploads/resumes/${req.file.filename}`;
    if (parsed) {
      // Auto-fill the profile from the parsed resume — same fields the
      // staff-side upload (candidateController.uploadResume) fills in, so a
      // candidate uploading their own resume gets the same benefit.
      if (parsed.resumeText) candidate.resumeText = parsed.resumeText;
      if (parsed.skills?.length) candidate.skills = parsed.skills;
      if (parsed.education?.length) candidate.education = parsed.education;
      if (parsed.experience) candidate.experience = parsed.experience;
      if (typeof parsed.aiScore === "number")
        candidate.aiScore = parsed.aiScore;
      if (parsed.aiSummary) candidate.aiSummary = parsed.aiSummary;
      // Never overwrite fields the candidate already filled in themselves —
      // only use the parsed value to fill a gap.
      if (!candidate.phone && parsed.phone) candidate.phone = parsed.phone;
    }

    const timeline = candidate.timeline || [];
    if (candidate.pipelineStage === "New Lead") {
      candidate.pipelineStage = "CV Received";
      timeline.push({
        stage: "CV Received",
        changedBy: req.user.id,
        changedAt: new Date(),
      });
      candidate.timeline = timeline;
      candidate.changed("timeline", true);
    }
    await candidate.save();

    await logAudit({
      req,
      action: "update",
      module: "candidate_portal",
      targetType: "Candidate",
      targetId: candidate.id,
      description: "Candidate uploaded their resume",
    });

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      data: { resume: candidate.resume },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to upload resume",
      error: error.message,
    });
  }
};

export const getMyResume = async (req, res) => {
  try {
    const candidate = await getOrCreateProfile(req);
    if (!candidate.resume) {
      return res
        .status(404)
        .json({ success: false, message: "No resume uploaded yet" });
    }
    res.status(200).json({
      success: true,
      resume: candidate.resume,
      downloadUrl: `${req.protocol}://${req.get("host")}${candidate.resume}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch resume",
      error: error.message,
    });
  }
};

//
// ==========================================
// DOCUMENTS
// ==========================================
//
export const getMyDocuments = async (req, res) => {
  try {
    const candidate = await getOrCreateProfile(req);
    res.status(200).json({ success: true, data: candidate.documents || [] });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
      error: error.message,
    });
  }
};

export const uploadMyDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Document file is required" });
    }
    const candidate = await getOrCreateProfile(req);
    const documents = candidate.documents || [];
    documents.push({
      name: req.body.label || req.file.originalname,
      path: `/uploads/documents/${req.file.filename}`,
      uploadedAt: new Date(),
      uploadedByCandidate: true,
      // Verification module — starts pending until HR/Admin reviews it.
      status: "pending",
      verifiedBy: null,
      verifiedAt: null,
      remarks: null,
    });
    candidate.documents = documents;
    candidate.changed("documents", true);
    await candidate.save();

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: candidate.documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to upload document",
      error: error.message,
    });
  }
};

//
// ==========================================
// APPLICATIONS — Applied Jobs / Interview / Offer / Joining status
// ==========================================
//
export const getMyApplications = async (req, res) => {
  try {
    const candidate = await getOrCreateProfile(req);

    // Applied Jobs: every public job application submitted with this
    // candidate's email (Jobs.jsx apply form -> applications table).
    const applications = await Application.findAll({
      where: { email: req.user.email },
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "title", "company", "location"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Joining Status: matched by email against employee_joinings.
    const joining = await EmployeeJoining.findOne({
      where: { email: req.user.email },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: {
        appliedJobs: applications,
        // Interview / Offer status comes straight off the candidate's real
        // ATS pipeline stage — no separate mock field.
        pipelineStage: candidate.pipelineStage,
        interviewStatus: [
          "Interview Scheduled",
          "Interview Cleared",
          "Offer Released",
          "Joined",
          "Retained 90 Days",
        ].includes(candidate.pipelineStage)
          ? candidate.pipelineStage
          : "Not Scheduled",
        offerStatus: ["Offer Released", "Joined", "Retained 90 Days"].includes(
          candidate.pipelineStage,
        )
          ? "Offer Released"
          : "Not Released",
        joiningStatus: joining ? joining.status : "Not Started",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};

//
// ==========================================
// BOOK INTERVIEW — creates a real CalendarEvent on the assigned recruiter's
// calendar (visible in their Recruiter Workspace), status starts "scheduled"
// pending recruiter confirmation.
// ==========================================
//
export const bookInterview = async (req, res) => {
  try {
    const candidate = await getOrCreateProfile(req);
    const { startAt, notes, jobId, interviewMode } = req.body;

    if (!startAt) {
      return res
        .status(400)
        .json({
          success: false,
          message: "startAt (preferred date/time) is required",
        });
    }

    if (!candidate.assignedRecruiterId) {
      return res.status(400).json({
        success: false,
        message:
          "No recruiter is assigned to your profile yet, so an interview can't be booked. Please wait until a recruiter picks up your application.",
      });
    }

    const mode = ["video", "phone", "onsite"].includes(interviewMode) ? interviewMode : "video";
    let meetingRoomId = null;
    let meetingLink = null;
    if (mode === "video") {
      const room = generateMeetingRoom();
      meetingRoomId = room.roomId;
      meetingLink = room.meetingLink;
    }

    const event = await CalendarEvent.create({
      title: `Interview - ${candidate.firstName} ${candidate.lastName}`.trim(),
      description: notes || "Requested by candidate via Candidate Portal",
      eventType: "interview",
      startAt,
      interviewMode: mode,
      meetingRoomId,
      meetingLink,
      relatedType: "candidate",
      relatedId: candidate.id,
      status: "scheduled",
      ownerId: candidate.assignedRecruiterId,
      createdBy: req.user.id,
    });

    if (candidate.email) {
      sendInterviewEmail({
        to: candidate.email,
        name: `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim(),
        scheduledAt: event.startAt,
        mode: event.interviewMode,
        meetingLink: event.meetingLink,
      }).catch((err) => console.error("Interview booking email failed:", err.message));
    }

    if (
      candidate.pipelineStage === "New Lead" ||
      candidate.pipelineStage === "CV Received" ||
      candidate.pipelineStage === "AI Screened" ||
      candidate.pipelineStage === "Recruiter Reviewed" ||
      candidate.pipelineStage === "Submitted To Client"
    ) {
      candidate.pipelineStage = "Interview Scheduled";
      await candidate.save();
    }

    res.status(201).json({
      success: true,
      message: "Interview request sent to your recruiter",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to book interview",
      error: error.message,
    });
  }
};

export const getMyInterviews = async (req, res) => {
  try {
    const candidate = await getOrCreateProfile(req);
    const events = await CalendarEvent.findAll({
      where: {
        relatedType: "candidate",
        relatedId: candidate.id,
        eventType: "interview",
      },
      order: [["startAt", "DESC"]],
    });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch interviews",
      error: error.message,
    });
  }
};

//
// ==========================================
// OFFER LETTER — reads the real file staff uploaded via
// candidateController.uploadOfferLetter. No file = nothing to download.
// ==========================================
//
export const getMyOfferLetter = async (req, res) => {
  try {
    const candidate = await getOrCreateProfile(req);
    if (!candidate.offerLetterUrl) {
      return res.status(404).json({
        success: false,
        message: "Offer letter has not been uploaded by your recruiter yet",
      });
    }
    res.status(200).json({
      success: true,
      offerLetterUrl: candidate.offerLetterUrl,
      downloadUrl: `${req.protocol}://${req.get("host")}${candidate.offerLetterUrl}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch offer letter",
      error: error.message,
    });
  }
};


//
// ==========================================
// NEW JOINER FORM — deliberately separate from Candidate Onboarding.
// A logged-in candidate can open and submit this form directly; there is
// intentionally NO offer-release/approval gate here.
// ==========================================
//
export const getMyJoiningForm = async (req, res) => {
  try {
    const candidate = await getOrCreateProfile(req);
    const record = await NewJoinerForm.findOne({
      where: { email: req.user.email },
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ success: true, data: record || {
      firstName: candidate.firstName || "",
      lastName: candidate.lastName || "",
      email: req.user.email,
      phone: candidate.phone || "",
      officialEmail: req.user.email,
      employeeId: `RW-${new Date().getFullYear()}-${String(candidate.id).padStart(5, "0")}`,
    }});
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load joining form", error: error.message });
  }
};

const normalizeJoiningDate = (value) => {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const raw = String(value).trim();
  if (["invalid date", "undefined", "null", "nan"].includes(raw.toLowerCase())) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split("-").map(Number);
    const check = new Date(Date.UTC(y, m - 1, d));
    return check.getUTCFullYear() === y && check.getUTCMonth() === m - 1 && check.getUTCDate() === d ? raw : null;
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  const y = parsed.getUTCFullYear();
  if (y < 1000 || y > 9999) return null;
  return `${y}-${String(parsed.getUTCMonth() + 1).padStart(2, "0")}-${String(parsed.getUTCDate()).padStart(2, "0")}`;
};

export const submitMyJoiningForm = async (req, res) => {
  try {
    const candidate = await getOrCreateProfile(req);
    const payload = { ...req.body };

    // DATEONLY safety: never send an empty/invalid date to MySQL.
    payload.joiningDate = normalizeJoiningDate(payload.joiningDate);
    payload.dateOfBirth = normalizeJoiningDate(payload.dateOfBirth);
    payload.passportExpiry = normalizeJoiningDate(payload.passportExpiry);

    console.log("[Candidate Joining Form] Normalized dates:", {
      joiningDate: payload.joiningDate,
      dateOfBirth: payload.dateOfBirth,
      passportExpiry: payload.passportExpiry,
    });

    const jsonFields = [
      "currentAddress", "permanentAddress", "coreStrengths", "educationDetails",
      "certifications", "technicalSkills", "functionalSkills", "skillLevels",
      "languagesKnown", "workExperience", "familyInformation", "nomineeInformation",
      "socialProfiles", "assetRequirements", "mandatoryDocuments", "identityDocuments",
      "education", "experience", "references", "bankDetails", "emergencyContact", "previousEmployer",
    ];
    for (const field of jsonFields) {
      if (typeof payload[field] === "string") {
        try { payload[field] = JSON.parse(payload[field]); } catch {}
      }
    }
    for (const field of ["declaration", "verificationConsent", "declarationConfirmed"]) {
      if (payload[field] !== undefined) payload[field] = String(payload[field]) === "true";
    }

    if (Array.isArray(req.files)) {
      const fileMap = {};
      for (const file of req.files) {
        const url = `/uploads/joining-forms/${file.filename}`;
        fileMap[file.fieldname] = {
          name: file.originalname,
          path: url,
          type: file.mimetype,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };
      }
      if (fileMap.profilePhoto) payload.profilePhotoUrl = fileMap.profilePhoto.path;
      if (fileMap.signature) payload.signatureUrl = fileMap.signature.path;
      if (fileMap.signatureUpload) payload.signatureUrl = fileMap.signatureUpload.path;
      payload.mandatoryDocuments = {
        ...(payload.mandatoryDocuments && typeof payload.mandatoryDocuments === "object" ? payload.mandatoryDocuments : {}),
        files: fileMap,
      };
      payload.identityDocuments = {
        ...(payload.identityDocuments && typeof payload.identityDocuments === "object" ? payload.identityDocuments : {}),
        files: fileMap,
      };
    }

    // Candidate identity is always server-owned, but all joining-form fields
    // remain editable by the logged-in candidate. No onboarding approval gate.
    payload.firstName = candidate.firstName || payload.firstName || "";
    payload.lastName = candidate.lastName || payload.lastName || "";
    payload.email = req.user.email;
    payload.officialEmail = req.user.email;
    payload.phone = payload.phone || candidate.phone || "";
    payload.employeeId = payload.employeeId || `RW-${new Date().getFullYear()}-${String(candidate.id).padStart(5, "0")}`;
    delete payload.id;
    delete payload.status;
    delete payload.billingAmount;
    delete payload.reminderSentAt;
    delete payload.createdAt;
    delete payload.updatedAt;

    const existing = await NewJoinerForm.findOne({
      where: { email: req.user.email },
      order: [["createdAt", "DESC"]],
    });

    let joining;
    if (existing) {
      await existing.update({ ...payload, status: "submitted" });
      joining = existing;
    } else {
      joining = await NewJoinerForm.create({ ...payload, status: "submitted" });
    }

    await logAudit({
      req,
      action: "submit",
      module: "employee_joining",
      targetType: "EmployeeJoining",
      targetId: joining.id,
      description: "Candidate submitted/updated their New Joiner Joining Form",
    });

    // Tracker is generated by the dedicated tracker endpoint.
    // Do not call the removed/non-existent emitTrackerForEmail helper here.
    return res.status(200).json({ success: true, message: "Joining form submitted successfully.", data: joining });
  } catch (error) {
    console.error("[Candidate Joining Form] Submit failed:", error);
    const dbCode = error?.original?.code || error?.parent?.code;
    if (dbCode === "ER_TRUNCATED_WRONG_VALUE") {
      return res.status(400).json({
        success: false,
        message: "Invalid date value in joining form.",
        error: error.message,
      });
    }
    return res.status(500).json({ success: false, message: "Failed to submit joining form", error: error.message });
  }
};

//
// ==========================================
// ONBOARDING FORM — submits into the real employee_joinings table (same
// table the admin's "New Joiner" module reads from).
// ==========================================
//
export const submitOnboarding = async (req, res) => {
  try {
    const candidate = await getOrCreateProfile(req);

    const offerReleased =
      candidate.pipelineStage === "Offer Released" ||
      candidate.pipelineStage === "Joined" ||
      candidate.pipelineStage === "Retained 90 Days" ||
      Boolean(candidate.offerLetterUrl);

    if (!offerReleased) {
      return res.status(400).json({
        success: false,
        message:
          "Onboarding form is locked until your offer has been released.",
      });
    }

    const existing = await EmployeeJoining.findOne({
      where: { email: req.user.email },
      order: [["createdAt", "DESC"]],
    });

    // A rejected form can be corrected and submitted again. A submitted,
    // under-review, or approved form cannot be overwritten by the candidate.
    if (
      existing &&
      ["submitted", "under-review", "documents-pending", "approved"].includes(
        existing.status,
      )
    ) {
      return res.status(409).json({
        success: false,
        message:
          existing.status === "approved"
            ? "Your onboarding form has already been approved."
            : "Your onboarding form is already under review. Please wait for Admin.",
        data: existing,
      });
    }

    const payload = {
      ...req.body,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: req.user.email,
      phone: req.body.phone || candidate.phone,
      status: "submitted",
    };

    // Never allow the browser to change the candidate identity or approval
    // status. These values always come from the authenticated profile/server.
    delete payload.id;
    delete payload.status;

    let joining;
    if (existing && existing.status === "rejected") {
      await existing.update({
        ...payload,
        status: "submitted",
      });
      joining = existing;
    } else {
      joining = await EmployeeJoining.create({
        ...payload,
        status: "submitted",
      });
    }

    await logAudit({
      req,
      action: existing ? "resubmit" : "create",
      module: "candidate_portal",
      targetType: "EmployeeJoining",
      targetId: joining.id,
      description: existing
        ? "Candidate resubmitted rejected onboarding form"
        : "Candidate submitted onboarding form",
    });

    // Refresh Admin/HR/Client/candidate trackers immediately.
    emitToRoom("staff", "tracker:joining_status", {
      joiningId: joining.id,
      candidateId: candidate.id,
      status: joining.status,
      updatedAt: new Date().toISOString(),
    });
    if (candidate.userId) {
      emitToRoom(`user:${candidate.userId}`, "tracker:joining_status", {
        joiningId: joining.id,
        candidateId: candidate.id,
        status: joining.status,
        updatedAt: new Date().toISOString(),
      });
    }

    const submissions = await CandidateSubmission.findAll({
      where: { candidateId: candidate.id },
      attributes: ["clientId"],
    });
    for (const submission of submissions) {
      if (submission.clientId) {
        emitToRoom(`client:${submission.clientId}`, "tracker:joining_status", {
          joiningId: joining.id,
          candidateId: candidate.id,
          status: joining.status,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    res.status(existing ? 200 : 201).json({
      success: true,
      message: "Onboarding form submitted successfully. Admin review is now pending.",
      data: joining,
    });
  } catch (error) {
    console.error("[Candidate Onboarding] Submit failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit onboarding form",
      error: error.message,
    });
  }
};

export const getMyOnboarding = async (req, res) => {
  try {
    const candidate = await getOrCreateProfile(req);
    const joining = await EmployeeJoining.findOne({
      where: { email: req.user.email },
      order: [["createdAt", "DESC"]],
    });

    const offerReleased =
      candidate.pipelineStage === "Offer Released" ||
      candidate.pipelineStage === "Joined" ||
      candidate.pipelineStage === "Retained 90 Days" ||
      Boolean(candidate.offerLetterUrl);

    const canEdit =
      offerReleased &&
      (!joining || joining.status === "rejected");

    res.status(200).json({
      success: true,
      data: {
        ...(joining ? joining.toJSON() : {}),
        joining: joining ? joining.toJSON() : null,
        eligible: offerReleased,
        canEdit,
        lockedReason: !offerReleased
          ? "Onboarding form unlocks once your offer has been released."
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch onboarding status",
      error: error.message,
    });
  }
};

//
// ==========================================
// JOINING TRACKER (New Joiner Module) — end-to-end progress timeline for
// the logged-in candidate: Applied -> Interview -> Offer -> Document
// Collection -> Verification -> Joining Form -> Joined.
// ==========================================
//
export const getMyTracker = async (req, res) => {
  try {
    const candidate = await getOrCreateProfile(req);
    const joining = await EmployeeJoining.findOne({
      where: { email: req.user.email },
      order: [["createdAt", "DESC"]],
    });
    const submission = await CandidateSubmission.findOne({
      where: { candidateId: candidate.id },
      order: [["updatedAt", "DESC"]],
    });
    res.status(200).json({
      success: true,
      data: buildJoiningTracker(candidate, joining, submission),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch joining tracker",
      error: error.message,
    });
  }
};

//
// ==========================================
// CHAT WITH RECRUITER (Phase 4 — real-time)
// ==========================================
//
export const getMyCandidateMessages = async (req, res) => {
  try {
    const candidate = await getOrCreateProfile(req);
    const messages = await CandidateMessage.findAll({
      where: { candidateId: candidate.id },
      include: [{ model: User, as: "sender", attributes: ["id", "name", "role"] }],
      order: [["createdAt", "ASC"]],
    });
    await CandidateMessage.update(
      { isRead: true },
      { where: { candidateId: candidate.id, senderRole: "staff", isRead: false } },
    );
    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch messages", error: error.message });
  }
};

export const sendMyCandidateMessage = async (req, res) => {
  try {
    const candidate = await getOrCreateProfile(req);
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: "Message text is required" });

    const created = await CandidateMessage.create({
      candidateId: candidate.id,
      senderId: req.user.id,
      senderRole: "candidate",
      message: message.trim(),
    });
    const full = await CandidateMessage.findByPk(created.id, {
      include: [{ model: User, as: "sender", attributes: ["id", "name", "role"] }],
    });

    emitToRoom(`candidate:${candidate.id}`, "chat:new_message", full);
    emitToRoom("staff", "chat:new_message", { ...full.toJSON(), thread: "candidate", threadId: candidate.id });
    if (candidate.assignedRecruiterId) emitToRoom(`user:${candidate.assignedRecruiterId}`, "chat:new_message", { ...full.toJSON(), thread: "candidate", threadId: candidate.id });
    if (candidate.createdBy && candidate.createdBy !== candidate.assignedRecruiterId) emitToRoom(`user:${candidate.createdBy}`, "chat:new_message", { ...full.toJSON(), thread: "candidate", threadId: candidate.id });

    res.status(201).json({ success: true, data: full });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send message", error: error.message });
  }
};

// POST /api/candidate-portal/messages/call — candidate starts a real video
// call with their recruiter, ringing staff instantly over the socket.
export const startCallFromCandidate = async (req, res) => {
  try {
    const candidate = await getOrCreateProfile(req);
    const { roomId, meetingLink } = generateMeetingRoom("recruweb-candidate-call");

    const created = await CandidateMessage.create({
      candidateId: candidate.id,
      senderId: req.user.id,
      senderRole: "candidate",
      type: "call_invite",
      meetingLink,
      message: "📹 Started a video call — tap Join to connect.",
    });
    const full = await CandidateMessage.findByPk(created.id, {
      include: [{ model: User, as: "sender", attributes: ["id", "name", "role"] }],
    });

    emitToRoom(`candidate:${candidate.id}`, "chat:new_message", full);
    emitToRoom("staff", "call:incoming", {
      thread: "candidate",
      threadId: candidate.id,
      from: `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() || req.user.name,
      meetingLink,
      roomId,
    });
    if (candidate.assignedRecruiterId) emitToRoom(`user:${candidate.assignedRecruiterId}`, "call:incoming", { thread: "candidate", threadId: candidate.id, from: `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() || req.user.name, meetingLink, roomId });
    if (candidate.createdBy && candidate.createdBy !== candidate.assignedRecruiterId) emitToRoom(`user:${candidate.createdBy}`, "call:incoming", { thread: "candidate", threadId: candidate.id, from: `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() || req.user.name, meetingLink, roomId });
    emitToRoom("staff", "chat:new_message", { ...full.toJSON(), thread: "candidate", threadId: candidate.id });
    if (candidate.assignedRecruiterId) emitToRoom(`user:${candidate.assignedRecruiterId}`, "chat:new_message", { ...full.toJSON(), thread: "candidate", threadId: candidate.id });
    if (candidate.createdBy && candidate.createdBy !== candidate.assignedRecruiterId) emitToRoom(`user:${candidate.createdBy}`, "chat:new_message", { ...full.toJSON(), thread: "candidate", threadId: candidate.id });

    res.status(201).json({ success: true, data: full });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to start call", error: error.message });
  }
};

// POST /api/candidate-portal/messages/ask-ai
export const askAIInCandidateThread = async (req, res) => {
  try {
    const candidate = await getOrCreateProfile(req);
    const { question } = req.body;
    if (!question?.trim()) return res.status(400).json({ success: false, message: "question is required" });

    const history = await CandidateMessage.findAll({ where: { candidateId: candidate.id }, order: [["createdAt", "ASC"]], limit: 50 });
    const answer = await draftChatReply({ history, askedBy: "the candidate", question });

    const created = await CandidateMessage.create({
      candidateId: candidate.id,
      senderId: req.user.id,
      senderRole: "ai",
      type: "ai",
      message: answer,
    });
    const full = await CandidateMessage.findByPk(created.id, {
      include: [{ model: User, as: "sender", attributes: ["id", "name", "role"] }],
    });

    emitToRoom(`candidate:${candidate.id}`, "chat:new_message", full);
    emitToRoom("staff", "chat:new_message", { ...full.toJSON(), thread: "candidate", threadId: candidate.id });
    if (candidate.assignedRecruiterId) emitToRoom(`user:${candidate.assignedRecruiterId}`, "chat:new_message", { ...full.toJSON(), thread: "candidate", threadId: candidate.id });
    if (candidate.createdBy && candidate.createdBy !== candidate.assignedRecruiterId) emitToRoom(`user:${candidate.createdBy}`, "chat:new_message", { ...full.toJSON(), thread: "candidate", threadId: candidate.id });

    res.status(201).json({ success: true, data: full });
  } catch (error) {
    res.status(500).json({ success: false, message: "AI assistant failed to respond", error: error.message });
  }
};
