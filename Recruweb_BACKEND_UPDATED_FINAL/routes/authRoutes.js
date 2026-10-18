import express from "express";
import {
  register,
  login,
  getMe,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  createStaffUser,
  directResetPassword, // <--- Import this
  sendOtp,
  verifyOtp,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLES } from "../config/roles.js";
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  refreshTokenValidator,
} from "../middleware/validators.js";
import { sensitiveActionLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// ---- Public ----
router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.post("/refresh-token", refreshTokenValidator, refreshAccessToken);
router.post("/logout", logout);
router.post(
  "/forgot-password",
  sensitiveActionLimiter,
  forgotPasswordValidator,
  forgotPassword,
);
// Direct reset route for database-matched email password update
router.post(
  "/direct-reset-password",
  sensitiveActionLimiter,
  resetPasswordValidator,
  directResetPassword,
);
router.put("/reset-password/:token", resetPasswordValidator, resetPassword);
router.get("/verify-email/:token", verifyEmail);
router.post(
  "/resend-verification",
  sensitiveActionLimiter,
  resendVerificationEmail,
);
// Merged in from D RTPN — OTP-code alternative to the /verify-email/:token
// link flow above; same result, same public "unauthenticated" access level.
router.post("/send-otp", sensitiveActionLimiter, sendOtp);
router.post("/verify-otp", sensitiveActionLimiter, verifyOtp);

// ---- Authenticated ----
router.get("/me", protect, getMe);

// ---- Super Admin / Admin only ----
router.post(
  "/staff",
  protect,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  createStaffUser,
);

export default router;
