import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Client Portal (Phase 7) — a real invoice raised against a client, uploaded
// by Finance/Admin staff. The Client Portal's "Download Invoices" feature
// only ever reads rows from this table — no placeholder/dummy invoice is
// ever generated on the fly.
const Invoice = sequelize.define(
  "Invoice",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    clientId: { type: DataTypes.INTEGER, allowNull: false },

    invoiceNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    title: { type: DataTypes.STRING, allowNull: true },

    amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    currency: { type: DataTypes.STRING, defaultValue: "INR" },

    // ==========================================================
    // Phase 8 — Finance Module: GST / TDS breakup.
    // `amount` above is retained as the taxable subtotal (pre-tax) so
    // existing Phase-7 Client Portal code that reads `amount` keeps working.
    // `totalAmount` is what the client actually owes; `balanceDue` is kept
    // in sync from real Payment rows (see Payment model) — never invented.
    // ==========================================================
    gstin: { type: DataTypes.STRING, allowNull: true },
    hsnSac: { type: DataTypes.STRING, allowNull: true },
    placeOfSupply: { type: DataTypes.STRING, allowNull: true },

    gstRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 18 },
    cgstAmount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    sgstAmount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    igstAmount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    gstAmount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },

    tdsApplicable: { type: DataTypes.BOOLEAN, defaultValue: false },
    tdsSection: { type: DataTypes.STRING, allowNull: true }, // e.g. 194C, 194J
    tdsRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    tdsAmount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },

    totalAmount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    amountPaid: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    balanceDue: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },

    status: {
      type: DataTypes.ENUM(
        "draft",
        "sent",
        "partially_paid",
        "paid",
        "overdue",
        "cancelled",
      ),
      defaultValue: "sent",
    },

    issueDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    dueDate: { type: DataTypes.DATE, allowNull: true },
    paidDate: { type: DataTypes.DATE, allowNull: true },

    // The uploaded PDF (multer disk storage under uploads/invoices).
    fileUrl: { type: DataTypes.STRING, allowNull: true },

    notes: { type: DataTypes.TEXT, allowNull: true },
    createdBy: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "invoices",
    indexes: [{ fields: ["clientId"] }, { fields: ["status"] }],
  },
);

export default Invoice;
