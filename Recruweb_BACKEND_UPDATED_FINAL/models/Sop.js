import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Sop = sequelize.define('Sop', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  title: {
    type: DataTypes.STRING(220),
    allowNull: false,
  },

  slug: {
    type: DataTypes.STRING(220),
    allowNull: false,
    unique: true,
  },

  department: {
    type: DataTypes.STRING(160),
    allowNull: false,
    defaultValue: 'General',
  },

  summary: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  applicableRoles: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },

  version: {
    type: DataTypes.STRING(40),
    allowNull: false,
    defaultValue: '1.0',
  },

  effectiveDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  status: {
    type: DataTypes.ENUM('draft', 'pending_approval', 'published', 'archived', 'rejected'),
    allowNull: false,
    defaultValue: 'draft',
  },

  targetRoles: {
    type: DataTypes.JSON,
    allowNull: true,
  },

  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },

  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  rejectedReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});
export default Sop;
