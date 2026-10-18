import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Stores every password hash a user has ever set (via register, forgot
// password, or reset password). Used to block a user from re-using a
// password they've already had — the plaintext is never stored, only the
// bcrypt hash, so comparisons are done with bcrypt.compare().
const PasswordHistory = sequelize.define(
  "PasswordHistory",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
  },
  {
    indexes: [{ fields: ["userId"] }],
  },
);

export default PasswordHistory;
