import express from "express";
import {
  getClientThreads,
  getClientThreadMessages,
  replyToClient,
  updateClientMessage,
  deleteClientMessage,
  startCallWithClient,
} from "../controllers/clientChatController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";

const router = express.Router();

router.use(protect, authorize(ROLE_GROUPS.CHAT));

router.get("/threads", getClientThreads);
router.get("/threads/:clientId", getClientThreadMessages);
router.post("/threads/:clientId", replyToClient);
router.put("/messages/:messageId", updateClientMessage);
router.delete("/messages/:messageId", deleteClientMessage);
router.post("/threads/:clientId/call", startCallWithClient);

export default router;
