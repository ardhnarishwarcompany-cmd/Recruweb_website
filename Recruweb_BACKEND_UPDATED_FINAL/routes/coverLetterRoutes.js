import express from "express";
import { generateCoverLetter } from "../controllers/coverLetterController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.post("/generate", generateCoverLetter);

export default router;
