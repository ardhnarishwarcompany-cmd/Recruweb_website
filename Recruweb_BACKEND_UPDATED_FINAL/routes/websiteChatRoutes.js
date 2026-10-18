import express from "express";
import { listHrs, submitContact, getChat, sendChat } from "../controllers/websiteChatController.js";
import { publicFormLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.get("/hrs", listHrs);
router.post("/contact", publicFormLimiter, submitContact);
router.get("/chat/:token", getChat);
router.post("/chat/:token", sendChat);

export default router;
