import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import {
  User,
  RefreshToken,
  Role,
  UserRole,
  Permission,
  PasswordHistory,
} from "../models/index.js";
import { ROLES, PUBLIC_SELF_REGISTER_ROLES } from "../config/roles.js";
import {
  signAccessToken,
  generateRefreshToken,
  hashToken,
  refreshTokenExpiryDate,
  generateRawToken,
  hashedTokenExpiry,
} from "../utils/tokens.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOtpEmail,
} from "../utils/email.js";
import { logAudit } from "../utils/auditLogger.js";

// ---- helpers ----

// Eager-loads a user's RBAC roles together with each role's permissions, so
// every auth response (login/register/me) can return a real, populated
// `permissions` list instead of silently coming back empty.
const withRoles = {
  include: [
    {
      model: Role,
      as: "roles",
      include: [{ model: Permission, as: "permissions" }],
    },
  ],
};

const issueTokenPair = async (user, req) => {
  const accessToken = signAccessToken(user);

  const rawRefreshToken = generateRefreshToken();
  await RefreshToken.create({
    userId: user.id,
    tokenHash: hashToken(rawRefreshToken),
    expiresAt: refreshTokenExpiryDate(),
    createdByIp: req.ip,
    userAgent: req.headers["user-agent"] || null,
  });

  return { accessToken, refreshToken: rawRefreshToken };
};

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,

  // Legacy support
  role: user.role,

  // New RBAC
  roles: user.roles?.map((r) => r.name) ?? (user.role ? [user.role] : []),

  permissions: user.roles
    ? [
        ...new Set(
          user.roles.flatMap(
            (role) => role.permissions?.map((p) => p.name) || [],
          ),
        ),
      ]
    : [],

  isEmailVerified: user.isEmailVerified,
});

// Checks a candidate new password against the user's *current* password and
// every password they've previously used (forgot/reset password history).
// Returns true if the plaintext password matches any of those old hashes —
// i.e. the user is trying to re-use a password they've already had.
const isPasswordReused = async (user, plainPassword) => {
  const hashesToCheck = [user.password];

  const history = await PasswordHistory.findAll({
    where: { userId: user.id },
  });
  hashesToCheck.push(...history.map((h) => h.passwordHash));

  for (const hash of hashesToCheck) {
    if (hash && (await bcrypt.compare(plainPassword, hash))) {
      return true;
    }
  }
  return false;
};

// Saves the user's *current* password hash into history right before it's
// overwritten with a new one, so it can be blocked from re-use in future.
const recordPasswordHistory = async (user) => {
  if (!user.password) return;
  await PasswordHistory.create({
    userId: user.id,
    passwordHash: user.password,
  });
};

// ---- controllers ----

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Public self-registration is restricted to candidate/client — any other
    // role must be provisioned by an admin via POST /api/auth/staff.
    const assignedRole = PUBLIC_SELF_REGISTER_ROLES.includes(role)
      ? role
      : ROLES.CANDIDATE;

    const rawVerifyToken = generateRawToken();
    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      emailVerificationToken: hashToken(rawVerifyToken),
      emailVerificationExpire: hashedTokenExpiry(24 * 60),
    });

    // Keep the new RBAC (Role/UserRole) tables in sync with the legacy
    // `role` column so every permission check — whichever system a given
    // route uses — sees the same, correct role for this user.
    const roleRecord = await Role.findOne({ where: { name: assignedRole } });
    if (roleRecord) {
      await user.addRole(roleRecord);
    }

    sendVerificationEmail(user, rawVerifyToken).catch((err) =>
      console.error("Failed to send verification email:", err.message),
    );

    const { accessToken, refreshToken } = await issueTokenPair(user, req);
    const userWithRoles = await User.findByPk(user.id, withRoles);

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
      data: {
        user: publicUser(userWithRoles),
        token: accessToken,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// Direct Password Reset without email link (Database match based)
export const directResetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email does not match our records.",
      });
    }

    if (await isPasswordReused(user, newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "This password has already been used by this account. Please choose a new password.",
      });
    }

    await recordPasswordHistory(user);

    user.password = newPassword; // Model hook automatically hash kar dega
    await user.save();

    // Invalidate sessions
    await RefreshToken.update(
      { revokedAt: new Date() },
      { where: { userId: user.id, revokedAt: null } },
    );

    res.status(200).json({
      success: true,
      message: "Password has been successfully reset.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};

// Admin/Super Admin only — provisions internal staff accounts with any role
// (Recruiter, HR, HR Manager, Recruitment Manager, Finance Manager, Admin...).
export const createStaffUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!role || !Object.values(ROLES).includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "A valid role is required" });
    }
    // Only a Super Admin can create another Admin/Super Admin.
    if (
      [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(role) &&
      req.user.role !== ROLES.SUPER_ADMIN
    ) {
      return res.status(403).json({
        success: false,
        message: "Only a Super Admin can create Admin accounts",
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      isEmailVerified: true,
    });

    const roleRecord = await Role.findOne({
      where: {
        name: role,
      },
    });
    if (roleRecord) {
      await user.addRole(roleRecord);
    }
    const userWithRoles = await User.findByPk(user.id, withRoles);
    res.status(201).json({
      success: true,
      message: "Staff account created successfully",
      data: { user: publicUser(userWithRoles) },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create staff account",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role: requestedRole } = req.body;

    const user = await User.findOne({ where: { email }, ...withRoles });
    if (!user) {
      await logAudit({
        req,
        actor: { email },
        action: "login_failed",
        module: "auth",
        description: `Failed login attempt for ${email} (no such account)`,
        status: "failed",
      });
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    // The portal selector is an authorization boundary, not just UI state.
    // A selected role must match the stored account role. "Admin" also accepts
    // the Super Admin account because it uses the same administrative portal.
    if (requestedRole) {
      const roleMatches =
        requestedRole === "admin"
          ? ["admin", "superadmin"].includes(user.role)
          : user.role === requestedRole;

      if (!roleMatches) {
        await logAudit({
          req,
          actor: user,
          action: "login_failed",
          module: "auth",
          description: `Login blocked — selected role ${requestedRole} does not match account role ${user.role}`,
          status: "failed",
        });
        return res.status(403).json({
          success: false,
          message: `This account is registered as ${user.role}. Please select the correct portal role.`,
          code: "ROLE_MISMATCH",
        });
      }
    }

    if (!user.isActive) {
      await logAudit({
        req,
        actor: user,
        action: "login_failed",
        module: "auth",
        description: `Login blocked — account deactivated`,
        status: "failed",
      });
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Contact an administrator.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await logAudit({
        req,
        actor: user,
        action: "login_failed",
        module: "auth",
        description: `Failed login attempt — wrong password`,
        status: "failed",
      });
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = await issueTokenPair(user, req);

    await logAudit({
      req,
      actor: user,
      action: "login_success",
      module: "auth",
      description: `${user.email} logged in`,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      // `token` kept for backward compatibility with existing frontend clients.
      data: {
        user: publicUser(user),
        token: accessToken,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Login failed", error: error.message });
  }
};

// Rotates a refresh token: the old one is revoked and a brand new
// access/refresh pair is issued. Reusing an already-revoked or expired
// refresh token is rejected outright (protects against token theft/replay).
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken: rawToken } = req.body;
    if (!rawToken) {
      return res
        .status(400)
        .json({ success: false, message: "refreshToken is required" });
    }

    const tokenHash = hashToken(rawToken);
    const stored = await RefreshToken.findOne({ where: { tokenHash } });

    if (!stored || !stored.isActive()) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is invalid or expired",
      });
    }

    const user = await User.findByPk(stored.userId);
    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "Account is no longer active" });
    }

    const { accessToken, refreshToken: newRawToken } = await issueTokenPair(
      user,
      req,
    );

    stored.revokedAt = new Date();
    stored.replacedByTokenHash = hashToken(newRawToken);
    await stored.save();

    res.status(200).json({
      success: true,
      message: "Token refreshed",
      data: { token: accessToken, accessToken, refreshToken: newRawToken },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to refresh token",
      error: error.message,
    });
  }
};

// Revokes the refresh token so the current session can no longer be renewed.
// The already-issued (short-lived) access token simply expires on its own.
export const logout = async (req, res) => {
  try {
    const { refreshToken: rawToken } = req.body;
    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      await RefreshToken.update(
        { revokedAt: new Date() },
        { where: { tokenHash, revokedAt: null } },
      );
    }
    if (req.user) {
      await logAudit({
        req,
        actor: req.user,
        action: "logout",
        module: "auth",
        description: `${req.user.email} logged out`,
      });
    }
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Logout failed", error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, withRoles);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: publicUser(user) });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    // Always respond with the same generic message whether or not the
    // account exists, so the endpoint can't be used to enumerate emails.
    const genericResponse = {
      success: true,
      message:
        "If an account exists for that email, a password reset link has been sent.",
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const rawToken = generateRawToken();
    user.resetPasswordToken = hashToken(rawToken);
    user.resetPasswordExpire = hashedTokenExpiry(30);
    await user.save();

    try {
      // Await delivery so SMTP failures are not hidden behind a false success response.
      await sendPasswordResetEmail(user, rawToken);
      console.log(`[password-reset] reset email accepted for delivery to ${user.email}`);
    } catch (mailError) {
      // Do not leave a usable token behind when delivery failed.
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();
      console.error("[password-reset] delivery failed", { code: mailError?.code, reason: mailError?.smtpReason, message: mailError?.message, attempts: mailError?.smtpAttempts });
      return res.status(502).json({
        success: false,
        message: "Unable to send password reset email. Please try again later.",
      });
    }

    res.status(200).json(genericResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to process request",
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      where: {
        resetPasswordToken: hashToken(token),
        resetPasswordExpire: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired",
      });
    }

    if (await isPasswordReused(user, password)) {
      return res.status(400).json({
        success: false,
        message:
          "This password has already been used by this account. Please try a new password.",
      });
    }

    await recordPasswordHistory(user);

    user.password = password; // hashed by the beforeSave hook
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    // Invalidate every existing session — a password reset should force
    // re-login everywhere, including on a device an attacker may control.
    await RefreshToken.update(
      { revokedAt: new Date() },
      { where: { userId: user.id, revokedAt: null } },
    );

    res.status(200).json({
      success: true,
      message: "Password has been reset. Please log in again.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: {
        emailVerificationToken: hashToken(token),
        emailVerificationExpire: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Verification link is invalid or has expired",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpire = null;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to verify email",
      error: error.message,
    });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    const genericResponse = {
      success: true,
      message:
        "If an account exists for that email and is unverified, a new verification link has been sent.",
    };

    if (!user || user.isEmailVerified) {
      return res.status(200).json(genericResponse);
    }

    const rawToken = generateRawToken();
    user.emailVerificationToken = hashToken(rawToken);
    user.emailVerificationExpire = hashedTokenExpiry(24 * 60);
    await user.save();

    sendVerificationEmail(user, rawToken).catch((err) =>
      console.error("Failed to send verification email:", err.message),
    );

    res.status(200).json(genericResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to resend verification email",
      error: error.message,
    });
  }
};

// ---- OTP verification (merged in from D RTPN) ----
// An alternative to the link-token flow above, reaching the exact same
// result (User.isEmailVerified = true) via a 6-digit code instead of a
// clicked link. Same User table, same auth session — not a second
// verification system.

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    const genericResponse = {
      success: true,
      message: "If an account exists for that email and is unverified, a verification code has been sent.",
    };

    if (!user || user.isEmailVerified) {
      return res.status(200).json(genericResponse);
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.otpCodeHash = hashToken(otp);
    user.otpExpire = hashedTokenExpiry(10); // 10 minutes
    await user.save();

    sendOtpEmail(user, otp).catch((err) =>
      console.error("Failed to send OTP email:", err.message),
    );

    res.status(200).json(genericResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send verification code",
      error: error.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "email and otp are required" });
    }

    const user = await User.findOne({
      where: {
        email,
        otpCodeHash: hashToken(otp),
        otpExpire: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Verification code is invalid or has expired" });
    }

    user.isEmailVerified = true;
    user.otpCodeHash = null;
    user.otpExpire = null;
    await user.save();

    res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to verify code",
      error: error.message,
    });
  }
};

export const initializeAdmin = async () => {
  try {
    const adminExists = await User.findOne({
      where: { email: process.env.ADMIN_EMAIL },
    });

    if (!adminExists) {
      const admin = await User.create({
        name: "Super Admin",
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: ROLES.SUPER_ADMIN,
        isEmailVerified: true,
      });

      const role = await Role.findOne({
        where: { name: ROLES.SUPER_ADMIN },
      });

      if (role) {
        await admin.addRole(role);
      }

      console.log("✅ Super Admin created");
    }
  } catch (error) {
    console.error("Failed to initialize admin:", error.message);
  }
};
