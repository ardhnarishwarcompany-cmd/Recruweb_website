import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// KYC / identity document verification — merged in from the D RTPN project.
// Generalized beyond D's HR-partner-only scope: any authenticated user
// (candidate, client, or staff) can submit a document for review, since
// Recruweb doesn't have a separate "HR Partner" account type — see
// config/roles.js for how D's hrPartner role maps onto existing roles.
const KycDocument = sequelize.define(
  "KycDocument",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    userId: { type: DataTypes.INTEGER, allowNull: false },

    documentType: {
      type: DataTypes.ENUM(
        "government_id",
        "pan_card",
        "address_proof",
        "educational_certificate",
        "experience_letter",
        "offer_letter",
        "company_registration",
        "other",
      ),
      allowNull: false,
    },

    fileUrl: { type: DataTypes.STRING, allowNull: false },
    fileName: { type: DataTypes.STRING, allowNull: true },

    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
      allowNull: false,
    },

    reviewedBy: { type: DataTypes.INTEGER, allowNull: true },
    reviewedAt: { type: DataTypes.DATE, allowNull: true },
    rejectionReason: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "kyc_documents",
    timestamps: true,
    indexes: [{ fields: ["userId"] }, { fields: ["status"] }],
  },
);

export default KycDocument;
