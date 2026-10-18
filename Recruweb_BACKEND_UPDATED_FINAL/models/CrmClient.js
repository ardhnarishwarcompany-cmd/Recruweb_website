import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// CRM — a client account (the paying customer of the recruitment agency).
const CrmClient = sequelize.define(
  "CrmClient",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    clientCode: { type: DataTypes.STRING, allowNull: true, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },

    // Client Portal (Phase 7) — links this CRM client account to its own
    // login (Users table, role = "client"). Nullable because most existing
    // client records are created by staff and have never logged into the
    // portal. Set the first time a logged-in client opens the Client
    // Portal (see clientPortalController.getOrCreateProfile), mirroring
    // how Candidate.userId works for the Candidate Portal.
    userId: { type: DataTypes.INTEGER, allowNull: true, unique: true },

    companyId: { type: DataTypes.INTEGER, allowNull: true },
    industry: { type: DataTypes.STRING, allowNull: true },
    website: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    state: { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.ENUM("prospect", "active", "on-hold", "inactive"),
      defaultValue: "prospect",
    },
    source: {
      type: DataTypes.ENUM(
        "website",
        "referral",
        "cold-call",
        "social-media",
        "event",
        "lead-conversion",
        "other",
      ),
      defaultValue: "other",
    },
    accountManagerId: { type: DataTypes.INTEGER, allowNull: true },
    branchId: { type: DataTypes.INTEGER, allowNull: true },
    gstin: { type: DataTypes.STRING, allowNull: true },
    billingCurrency: { type: DataTypes.STRING, defaultValue: "INR" },
    creditTerms: { type: DataTypes.STRING, allowNull: true },
    tags: { type: DataTypes.JSON, defaultValue: [] },
    createdBy: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "crm_clients",
    indexes: [
      { fields: ["status"] },
      { fields: ["accountManagerId"] },
      { fields: ["companyId"] },
    ],
  },
);

export default CrmClient;
