import rateLimit from "express-rate-limit";
import { logAudit } from "../utils/auditLogger.js";

// Extra Module — Security: Rate Limiting.
// Every blocked request is written to the AuditLog (module: "security") so
// it shows up alongside Login History / Activity Logs / Changes Tracking on
// the Super Admin panel, and feeds the Security Center's "blocked requests"
// counter.
const onLimitReached = (moduleTag) => async (req, res) => {
  await logAudit({
    req,
    action: "rate_limit_exceeded",
    module: "security",
    description: `Rate limit exceeded on ${req.method} ${req.originalUrl} (${moduleTag})`,
    status: "failed",
  });

  res.status(429).json({
    success: false,
    message: "Too many requests, please try again later.",
  });
};

// General ceiling applied to every /api/* route — a safety net against
// scraping/DoS-style abuse that isn't targeted at auth or public forms.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: onLimitReached("general-api"),
});

// Tighter limit on public, unauthenticated write endpoints that are prone
// to spam/abuse (contact form, get-started/inquiry, newsletter signup).
export const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: onLimitReached("public-form"),
});

// Brute-force protection on authentication endpoints (login, register,
// password reset, etc). Same limiter that already existed in index.js,
// moved here so all rate limiting lives in one place.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: onLimitReached("auth"),
});

// Stricter still for the handful of endpoints that can send real emails/
// SMS/WhatsApp messages (password reset, OTP, automation "send now"),
// which are the classic target for abuse/cost-attacks.
export const sensitiveActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: onLimitReached("sensitive-action"),
});
