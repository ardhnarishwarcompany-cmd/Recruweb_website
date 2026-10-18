import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Free Hiring Resource Center — downloadable HR document templates:
// Offer Letter Templates & Notice Period Policy Templates.
const HrTemplate = sequelize.define(
  "HrTemplate",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    type: {
      type: DataTypes.ENUM("offer_letter", "notice_period_policy"),
      allowNull: false,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },

    fileName: { type: DataTypes.STRING, allowNull: false }, // stored filename on disk
    originalName: { type: DataTypes.STRING, allowNull: true },
    fileType: { type: DataTypes.STRING, allowNull: true }, // "docx" | "pdf"

    downloadCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    isPublished: { type: DataTypes.BOOLEAN, defaultValue: true },
    displayOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    indexes: [{ fields: ["type"] }, { fields: ["isPublished"] }],
  },
);

export default HrTemplate;
