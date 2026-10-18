import express from "express";
import {
  createTicket,
  listMyTickets,
  listAllTickets,
  getTicketDetail,
  addReply,
  updateTicket,
} from "../controllers/supportTicketController.js";
import { protect } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";

// Support ticket routes — merged in from D RTPN. Mounted at
// /api/support-tickets, protected by the SAME auth used everywhere else.
const router = express.Router();

router.use(protect);

router.post("/", createTicket);
router.get("/mine", listMyTickets);
router.get("/:id", getTicketDetail);
router.post("/:id/replies", addReply);

// Staff-only
router.get("/", authorizeRole(ROLE_GROUPS.STAFF), listAllTickets);
router.patch("/:id", authorizeRole(ROLE_GROUPS.STAFF), updateTicket);

export default router;
