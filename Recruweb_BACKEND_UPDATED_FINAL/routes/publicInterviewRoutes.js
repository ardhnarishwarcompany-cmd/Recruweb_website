import express from "express";
import {
  getPublicInterviewAvailability,
  schedulePublicInterview,
} from "../controllers/publicInterviewController.js";

const router = express.Router();

// Public candidate-facing scheduler. Availability is read-only; booking is
// validated again server-side to prevent stale slots/double-booking.
// Canonical endpoints used by the current public scheduler.
router.get("/", getPublicInterviewAvailability);
router.post("/", schedulePublicInterview);

// Backward-compatible endpoint aliases so older frontend builds keep working.
router.get("/availability", getPublicInterviewAvailability);
router.post("/schedule", schedulePublicInterview);

// Compatibility with the earlier "/public/..." API shape.
router.get("/public/availability", getPublicInterviewAvailability);
router.post("/public/schedule", schedulePublicInterview);

export default router;
