import crypto from "crypto";
import jwt from "jsonwebtoken";

// ---- JWT access token (short-lived) ----
export const signAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, tokenType: "access" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "15m" },
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// ---- Opaque refresh token (random, stored hashed in DB, rotated on use) ----
export const generateRefreshToken = () =>
  crypto.randomBytes(48).toString("hex");

export const hashToken = (rawToken) =>
  crypto.createHash("sha256").update(rawToken).digest("hex");

export const refreshTokenExpiryDate = () => {
  const days = parseInt(process.env.JWT_REFRESH_EXPIRE_DAYS || "30", 10);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

// ---- Random tokens for email verification / password reset ----
// We store only the SHA-256 hash in the DB and email the raw token, the same
// pattern used for the refresh token so a DB leak never exposes usable tokens.
export const generateRawToken = () => crypto.randomBytes(32).toString("hex");

export const hashedTokenExpiry = (minutes) =>
  new Date(Date.now() + minutes * 60 * 1000);
