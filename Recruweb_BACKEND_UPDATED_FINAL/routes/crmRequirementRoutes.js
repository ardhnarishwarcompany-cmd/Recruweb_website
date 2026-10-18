import express from "express";
import {
  createRequirement,
  getRequirements,
  getRequirement,
  updateRequirement,
  deleteRequirement,
} from "../controllers/crmRequirementController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";

const router = express.Router();

router.use(protect, authorize(ROLE_GROUPS.RECRUITMENT));

router.route("/").get(getRequirements).post(createRequirement);
router.route("/:id").get(getRequirement).put(updateRequirement).delete(deleteRequirement);

export default router;
