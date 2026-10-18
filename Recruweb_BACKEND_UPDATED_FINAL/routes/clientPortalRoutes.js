import express from "express";

import {
  getMyProfile,
  updateMyProfile,
  getDashboard,
  createRequirement,
  getMyRequirements,
  getRequirementById,
  getMySubmissions,
  approveCandidate,
  rejectCandidate,
  approveOffer,
  rejectOffer,
  getMyInterviews,
  getMyMessages,
  sendMyMessage,
  startCallFromClient,
  askAIInClientThread,
  getMyInvoices,
  downloadMyInvoice,
  createInvoicePaymentOrder,
  verifyInvoicePayment,
  getClientAnalytics,
} from "../controllers/clientPortalController.js";

import { protect } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { ROLES } from "../config/roles.js";
import {
  getMyHrmsSubscriptions,
  createHrmsPurchaseOrder,
  verifyHrmsPayment,
} from "../controllers/hrmsController.js";

const router = express.Router();

// Every route below is the logged-in client acting on their own account —
// never another client's, and never accessible to staff/candidate roles.
router.use(protect, authorizeRole(ROLES.CLIENT));

// Profile
router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);

// Client Dashboard (Open Positions / Candidate Submissions / Interview Schedule)
router.get("/dashboard", getDashboard);

// Merged in from D RTPN
router.get("/analytics", getClientAnalytics);

// Requirements — Create Requirement / Track Jobs
router.post("/requirements", createRequirement);
router.get("/requirements", getMyRequirements);
router.get("/requirements/:id", getRequirementById);

// Candidate Submissions — Approve Candidates / Approve Offers
router.get("/submissions", getMySubmissions);
router.put("/submissions/:id/approve-candidate", approveCandidate);
router.put("/submissions/:id/reject-candidate", rejectCandidate);
router.put("/submissions/:id/approve-offer", approveOffer);
router.put("/submissions/:id/reject-offer", rejectOffer);

// Interview Schedule
router.get("/interviews", getMyInterviews);

// Chat With Recruiter
router.get("/messages", getMyMessages);
router.post("/messages", sendMyMessage);
router.post("/messages/call", startCallFromClient);
router.post("/messages/ask-ai", askAIInClientThread);

// Download Invoices
router.get("/invoices", getMyInvoices);
router.get("/invoices/:id/download", downloadMyInvoice);
// HRMS / SaaS plans and client-owned subscription purchases.
router.get("/hrms/subscriptions", getMyHrmsSubscriptions);
router.post("/hrms/purchase/order", createHrmsPurchaseOrder);
router.post("/hrms/purchase/verify", verifyHrmsPayment);


// Pay Invoice — real, LIVE Razorpay Checkout
router.post("/invoices/:id/pay/order", createInvoicePaymentOrder);
router.post("/invoices/:id/pay/verify", verifyInvoicePayment);

export default router;
