import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// HR Partner profile — merged in from D RTPN. An external recruiting
// partner/vendor (role: "hr_partner") who sources candidates and earns
// commission on successful joinings. One row per User with that role —
// same single User/auth account as everything else in Recruweb, this is
// just the extra profile data D's HrPartnerProfile model tracked.
const HrPartnerProfile = sequelize.define(
  "HrPartnerProfile",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },

    // e.g. RW-HR-IN-2026-00001 — generated at creation time (see
    // hrPartnerController.registerHrPartnerProfile).
    hrCode: { type: DataTypes.STRING, allowNull: false, unique: true },

    specialization: { type: DataTypes.STRING, allowNull: true },
    languages: { type: DataTypes.STRING, allowNull: true }, // comma-separated

    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "suspended"),
      defaultValue: "pending",
      allowNull: false,
    },
    level: {
      type: DataTypes.ENUM("silver", "gold", "platinum"),
      defaultValue: "silver",
      allowNull: false,
    },

    approvedBy: { type: DataTypes.INTEGER, allowNull: true },
    approvedAt: { type: DataTypes.DATE, allowNull: true },

    performanceScore: { type: DataTypes.DECIMAL(5, 2), allowNull: true },

    // Separate from `status` above — `status` is the overall approval
    // decision, `kycStatus` tracks the document-verification step (see
    // KycDocument) that must be "approved" before an admin can approve
    // the partner overall. Mirrors D's roadmap §15 compliance rule.
    kycStatus: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
      allowNull: false,
    },
  },
  {
    tableName: "hr_partner_profiles",
    timestamps: true,
    indexes: [{ fields: ["hrCode"] }, { fields: ["status"] }],
  },
);

export default HrPartnerProfile;
