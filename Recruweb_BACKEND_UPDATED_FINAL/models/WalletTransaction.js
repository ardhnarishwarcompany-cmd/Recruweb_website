import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Wallet transaction (payout ledger entry) — merged in from D RTPN.
// One row per commission credit/debit for an HR Partner's Wallet, e.g. a
// "credit" when a sourced candidate joins, or a "payout" once Finance
// releases it via the cron job in utils/payoutScheduler.js.
const WalletTransaction = sequelize.define(
  "WalletTransaction",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    walletId: { type: DataTypes.INTEGER, allowNull: false },

    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },

    type: {
      type: DataTypes.ENUM("credit", "payout", "adjustment"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "released", "failed"),
      defaultValue: "pending",
      allowNull: false,
    },

    // Links a "credit" transaction back to the EmployeeJoining that earned
    // it, so payouts stay traceable to a real placement — never fabricated.
    referenceJoiningId: { type: DataTypes.INTEGER, allowNull: true },
    description: { type: DataTypes.STRING, allowNull: true },

    releasedBy: { type: DataTypes.INTEGER, allowNull: true },
    releasedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "wallet_transactions",
    timestamps: true,
    indexes: [{ fields: ["walletId"] }, { fields: ["status"] }],
  },
);

export default WalletTransaction;
