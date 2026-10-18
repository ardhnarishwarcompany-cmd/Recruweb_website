import express from "express";
import {
  getDashboard,
  getAssignedJobs,
  getAssignedCandidates,
  getMyTasks,
  createMyTask,
  updateMyTask,
  deleteMyTask,
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  logCandidateActivity,
  getCandidateActivities,
  getPerformance,
  getRecruiterOptions,
} from "../controllers/recruiterWorkspaceController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";

const router = express.Router();

// Anyone on staff can open their own Recruiter Workspace; managers/admins
// may additionally view a specific recruiter's workspace via ?recruiterId=.
// NOTE: authorize(...ROLE_GROUPS.STAFF) is spread deliberately — passing the
// array directly (as several other route files do) breaks the role check,
// since authorize() collects its arguments into an array via rest params.
router.use(protect, authorize(...ROLE_GROUPS.STAFF));

// Dashboard summary
router.get("/dashboard", getDashboard);

// Assigned Jobs (open client requirements)
router.get("/jobs", getAssignedJobs);

// Assigned Candidates
router.get("/candidates", getAssignedCandidates);

// Tasks
router.get("/tasks", getMyTasks);
router.post("/tasks", createMyTask);
router.put("/tasks/:id", updateMyTask);
router.delete("/tasks/:id", deleteMyTask);

// Calendar
router.get("/calendar", getCalendarEvents);
router.post("/calendar", createCalendarEvent);
router.put("/calendar/:id", updateCalendarEvent);
router.delete("/calendar/:id", deleteCalendarEvent);

// Reminders
router.get("/reminders", getReminders);
router.post("/reminders", createReminder);
router.put("/reminders/:id", updateReminder);
router.delete("/reminders/:id", deleteReminder);

// Candidate activity log (calls / interviews / joins)
router.get("/activities", getCandidateActivities);
router.post("/activities", logCandidateActivity);

// Performance (Calls, Interviews, Joins, Conversion Ratio)
router.get("/performance", getPerformance);

// Recruiter lookup (for admin/manager views)
router.get("/recruiters", getRecruiterOptions);

export default router;
