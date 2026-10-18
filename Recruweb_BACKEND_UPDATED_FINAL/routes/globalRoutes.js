import express from "express";
import {
  listCurrencies,
  listTimezones,
  convertAmount,
  getMyPreferences,
  updateMyPreferences,
  refreshRatesNow,
} from "../controllers/globalController.js";
import { protect } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";

const router = express.Router();

// Public — the currency/timezone picker on public pages (job listings,
// public salary display) needs these before login too.
router.get("/currencies", listCurrencies);
router.get("/timezones", listTimezones);
router.get("/convert", convertAmount);

// Logged-in users only — personal preferences.
router.get("/preferences", protect, getMyPreferences);
router.put("/preferences", protect, updateMyPreferences);

// Admin only — force a live refresh instead of waiting for the 6h cron.
router.post(
  "/refresh-rates",
  protect,
  authorizeRole(ROLE_GROUPS.ADMIN_ONLY),
  refreshRatesNow,
);

export default router;
