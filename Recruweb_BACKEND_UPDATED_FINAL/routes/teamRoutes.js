import express from "express";
import { getAssignableUsers } from "../controllers/teamController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";

const router = express.Router();

router.use(protect, authorize(ROLE_GROUPS.STAFF));

router.get("/assignable-users", getAssignableUsers);

export default router;
