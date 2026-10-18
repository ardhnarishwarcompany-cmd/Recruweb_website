import express from "express";
import {
  createContact,
  getContacts,
  getContact,
  updateContactStatus,
  deleteContact,
} from "../controllers/contactController.js";

import { protect } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";
import { publicFormLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/", publicFormLimiter, createContact);

router.get("/", protect, authorizeRole(...ROLE_GROUPS.STAFF), getContacts);

router.get("/:id", protect, authorizeRole(...ROLE_GROUPS.STAFF), getContact);

router.put(
  "/:id",
  protect,
  authorizeRole(...ROLE_GROUPS.STAFF),
  updateContactStatus,
);

router.delete(
  "/:id",
  protect,
  authorizeRole(...ROLE_GROUPS.ADMIN_ONLY),
  deleteContact,
);

export default router;
