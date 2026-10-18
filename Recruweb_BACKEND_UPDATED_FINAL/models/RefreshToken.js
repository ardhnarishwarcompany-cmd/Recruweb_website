import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Refresh tokens are stored hashed (SHA-256) — never in plaintext — and are
// rotated on every use. This lets us support multi-device sessions and
// instantly revoke a single device (or all devices) on logout / password
// reset / suspicious activity, without invalidating short-lived access
// tokens everywhere (they simply expire naturally within minutes).
const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    createdByIp: { type: DataTypes.STRING, allowNull: true },
    userAgent: { type: DataTypes.STRING, allowNull: true },
    revokedAt: { type: DataTypes.DATE, allowNull: true },
    replacedByTokenHash: { type: DataTypes.STRING(64), allowNull: true },
  },
  {
    indexes: [
      { unique: true, fields: ["tokenHash"] },
      { fields: ["userId"] },
      { fields: ["expiresAt"] },
    ],
  },
);

RefreshToken.prototype.isActive = function () {
  return !this.revokedAt && new Date(this.expiresAt) > new Date();
};

export default RefreshToken;
