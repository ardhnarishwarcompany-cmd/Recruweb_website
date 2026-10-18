import express from "express";
import { getHrmsPlans } from "../controllers/hrmsController.js";

const router = express.Router();

// Public catalogue endpoint used by the public pricing page.
router.get("/plans", getHrmsPlans);

export default router;
