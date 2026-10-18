import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import { sequelize } from "../config/db.js";
import { ALL_ROLES, ROLES } from "../config/roles.js";

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
      set(value) {
        this.setDataValue("email", value ? value.toLowerCase().trim() : value);
      },
    },
    password: { type: DataTypes.STRING, allowNull: false },

    // RBAC — see config/roles.js for the definitive list & role groupings.
    role: {
      type: DataTypes.ENUM(...ALL_ROLES),
      defaultValue: ROLES.CANDIDATE,
      allowNull: false,
    },

    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    lastLogin: { type: DataTypes.DATE, allowNull: true },

    // Which office/branch this staff member belongs to (null = unassigned / HQ).
    branchId: { type: DataTypes.INTEGER, allowNull: true },

    // Fine-grained permission overrides on top of `role` — see config/roles.js
    // PERMISSIONS / DEFAULT_PERMISSIONS_BY_ROLE.
    permissions: { type: DataTypes.JSON, defaultValue: [] },

    // Email verification
    isEmailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    emailVerificationToken: { type: DataTypes.STRING, allowNull: true },
    emailVerificationExpire: { type: DataTypes.DATE, allowNull: true },

    // Merged in from D RTPN — OTP-code alternative to the link-token flow
    // above. Same isEmailVerified outcome, just reached via a 6-digit code
    // instead of a link, for users who prefer/need that (see
    // authController.sendOtp / verifyOtp).
    otpCodeHash: { type: DataTypes.STRING, allowNull: true },
    otpExpire: { type: DataTypes.DATE, allowNull: true },

    // Forgot / reset password
    resetPasswordToken: { type: DataTypes.STRING, allowNull: true },
    resetPasswordExpire: { type: DataTypes.DATE, allowNull: true },

    // Phase 6 — Global Features (multi-timezone / multi-currency).
    // IANA timezone name (e.g. "Asia/Kolkata", "America/New_York"). Defaults
    // to UTC until the frontend auto-detects the browser's real timezone
    // (Intl.DateTimeFormat().resolvedOptions().timeZone) on first login and
    // saves it — never a guessed/hardcoded region.
    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "UTC",
    },
    // ISO 4217 currency code this user wants amounts displayed in
    // (job salaries, invoices, payments, analytics revenue). Actual
    // conversion is done live via utils/currencyService.js — this column
    // only stores the user's preference.
    preferredCurrency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "USD",
    },
  },
  {
    indexes: [
      { unique: true, fields: ["email"] },
      { fields: ["role"] },
      { fields: ["isActive"] },
    ],
    hooks: {
      beforeSave: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  },
);

User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Never leak sensitive fields in API responses.
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  delete values.emailVerificationToken;
  delete values.emailVerificationExpire;
  delete values.otpCodeHash;
  delete values.otpExpire;
  delete values.resetPasswordToken;
  delete values.resetPasswordExpire;
  return values;
};

export default User;
