import express from "express";
import {
  createClient,
  getClients,
  getClientStats,
  getClient,
  updateClient,
  deleteClient,
} from "../controllers/crmClientController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";

const router = express.Router();

router.use(protect, authorize(ROLE_GROUPS.CLIENT_MGMT));

router.get("/stats", getClientStats);
router.route("/").get(getClients).post(createClient);
router.route("/:id").get(getClient).put(updateClient).delete(deleteClient);

export default router;
