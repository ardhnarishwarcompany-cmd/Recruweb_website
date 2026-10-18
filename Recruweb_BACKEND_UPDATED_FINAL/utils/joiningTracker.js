import { PIPELINE_STAGES } from "../models/Candidate.js";

// Single source of truth for the live candidate lifecycle. Every status/date
// is derived from the real Candidate timeline, documents, submissions and
// EmployeeJoining record. Nothing in this builder is seeded or fabricated.
export const buildJoiningTracker = (candidate, joining, submission = null) => {
  const stage = candidate?.pipelineStage || "New Lead";
  const idx = PIPELINE_STAGES.indexOf(stage);
  const at = (name) => PIPELINE_STAGES.indexOf(name);

  const timeline = Array.isArray(candidate?.timeline) ? candidate.timeline : [];
  const documents = Array.isArray(candidate?.documents)
    ? candidate.documents
    : [];

  const lastTimeline = (...names) => {
    const rows = timeline
      .filter((row) => names.includes(row?.stage))
      .sort(
        (a, b) =>
          new Date(b?.changedAt || b?.createdAt || 0) -
          new Date(a?.changedAt || a?.createdAt || 0),
      );
    return rows[0] || null;
  };

  const docsSubmitted = documents.length > 0;
  const docsVerified =
    docsSubmitted && documents.every((d) => d?.status === "verified");
  const docsRejected = documents.some((d) => d?.status === "rejected");
  const docsPendingReview = docsSubmitted && !docsVerified && !docsRejected;

  const offerReleased = idx >= at("Offer Released") || Boolean(candidate?.offerLetterUrl);
  const joined = idx >= at("Joined");

  const interviewScheduled = idx >= at("Interview Scheduled");
  const interviewCleared = idx >= at("Interview Cleared");

  const step = (key, label, status, date = null, note = null) => ({
    key,
    label,
    status,
    date,
    note,
  });

  const steps = [
    step(
      "applied",
      "Applied",
      "complete",
      candidate?.createdAt || lastTimeline("New Lead")?.changedAt || null,
    ),
    step(
      "interview",
      "Interview",
      interviewCleared
        ? "complete"
        : interviewScheduled
          ? "pending"
          : "upcoming",
      lastTimeline("Interview Cleared", "Interview Scheduled")?.changedAt || null,
      submission?.status === "interview-completed"
        ? "Interview completed"
        : submission?.status === "interview-scheduled"
          ? "Interview scheduled"
          : null,
    ),
    step(
      "offer",
      "Offer Released",
      offerReleased ? "complete" : "upcoming",
      lastTimeline("Offer Released")?.changedAt ||
        (offerReleased ? candidate?.updatedAt : null),
      candidate?.offerLetterUrl ? "Offer letter available" : null,
    ),
    step(
      "documents",
      "Document Collection",
      docsSubmitted ? "complete" : offerReleased ? "pending" : "upcoming",
      docsSubmitted
        ? documents
            .map((d) => d?.uploadedAt)
            .filter(Boolean)
            .sort((a, b) => new Date(b) - new Date(a))[0] || null
        : null,
      `${documents.length} document(s) uploaded`,
    ),
    step(
      "verification",
      "Verification",
      docsRejected
        ? "rejected"
        : docsVerified
          ? "complete"
          : docsPendingReview
            ? "pending"
            : "upcoming",
      docsVerified
        ? documents
            .map((d) => d?.verifiedAt)
            .filter(Boolean)
            .sort((a, b) => new Date(b) - new Date(a))[0] || null
        : null,
      docsRejected
        ? "One or more documents were rejected — please re-upload"
        : null,
    ),
    step(
      "joining-form",
      "Joining Form",
      joining
        ? joining.status === "approved"
          ? "complete"
          : joining.status === "rejected"
            ? "rejected"
            : "pending"
        : offerReleased
          ? "pending"
          : "upcoming",
      joining?.updatedAt || joining?.createdAt || null,
      joining ? `Status: ${joining.status}` : null,
    ),
    step(
      "joined",
      "Joined",
      joined ? "complete" : "upcoming",
      joined ? lastTimeline("Joined")?.changedAt || candidate?.updatedAt : null,
    ),
  ];

  const completedCount = steps.filter((s) => s.status === "complete").length;
  const activeIndex = steps.findIndex(
    (s) => s.status === "pending" || s.status === "rejected",
  );

  return {
    pipelineStage: stage,
    joiningStatus: joining ? joining.status : null,
    submissionStatus: submission?.status || null,
    isRejected: Boolean(candidate?.isRejected),
    rejectionReason: candidate?.rejectionReason || null,
    progress: {
      completed: completedCount,
      total: steps.length,
      percent: Math.round((completedCount / steps.length) * 100),
      activeIndex: activeIndex >= 0 ? activeIndex : steps.length - 1,
    },
    documentsSummary: {
      total: documents.length,
      verified: documents.filter((d) => d?.status === "verified").length,
      rejected: documents.filter((d) => d?.status === "rejected").length,
      pending: documents.filter(
        (d) => !d?.status || d?.status === "pending",
      ).length,
    },
    steps,
  };
};
