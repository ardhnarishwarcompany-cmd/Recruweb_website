import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// CRM — a free-form note attached to any CRM entity (client, contact,
// company, requirement, contract, or lead) via a lightweight polymorphic
// relation (entityType + entityId), so we don't need a note table per entity.
const CrmNote = sequelize.define(
  "CrmNote",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    entityType: {
      type: DataTypes.ENUM(
        "client",
        "contact",
        "company",
        "requirement",
        "contract",
        "lead",
      ),
      allowNull: false,
    },
    entityId: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    pinned: { type: DataTypes.BOOLEAN, defaultValue: false },
    createdBy: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "crm_notes",
    indexes: [{ fields: ["entityType", "entityId"] }],
  },
);

export default CrmNote;
