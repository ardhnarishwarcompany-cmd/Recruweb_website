import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Phase 8 — Finance Module: a real payment/collection received against an
// Invoice. Invoice.amountPaid / balanceDue / status are recalculated from
// the sum of this table's rows every time a payment is created, updated or
// removed (see paymentController) — nothing here is ever fabricated.
const Payment = sequelize.define(
  "Payment",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    paymentNumber: { type: DataTypes.STRING, allowNull: false, unique: true },

    invoiceId: { type: DataTypes.INTEGER, allowNull: false },
    clientId: { type: DataTypes.INTEGER, allowNull: false },

    amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    currency: { type: DataTypes.STRING, defaultValue: "INR" },

    mode: {
      type: DataTypes.ENUM(
        "bank_transfer",
        "upi",
        "cheque",
        "cash",
        "card",
        "online", // paid live via Razorpay Checkout (card/UPI/netbanking/wallet)
        "other",
      ),
      defaultValue: "bank_transfer",
    },

    referenceNo: { type: DataTypes.STRING, allowNull: true },

    status: {
      type: DataTypes.ENUM("received", "pending", "failed", "refunded"),
      defaultValue: "received",
    },

    // ==========================================================
    // Razorpay LIVE online payments (client pays through Razorpay
    // Checkout on the Client Portal invoice screen). These columns are
    // only populated for mode: "online" rows created by the real Razorpay
    // API/webhook — nothing here is ever fabricated or test-mode.
    // ==========================================================
    gateway: {
      type: DataTypes.ENUM("razorpay"),
      allowNull: true,
    },
    gatewayOrderId: { type: DataTypes.STRING, allowNull: true }, // Razorpay order_id
    gatewayPaymentId: { type: DataTypes.STRING, allowNull: true }, // Razorpay payment_id
    gatewaySignature: { type: DataTypes.STRING, allowNull: true },
    gatewayRaw: { type: DataTypes.TEXT, allowNull: true }, // last raw webhook/verify payload, for audit

    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    notes: { type: DataTypes.TEXT, allowNull: true },
    recordedBy: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "payments",
    indexes: [
      { fields: ["invoiceId"] },
      { fields: ["clientId"] },
      { fields: ["status"] },
    ],
  },
);

export default Payment;
