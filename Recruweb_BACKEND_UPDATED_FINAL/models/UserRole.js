import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const UserRole = sequelize.define(
  "UserRole",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "roles",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "user_roles",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "roleId"],
      },
    ],
  },
);

export default UserRole;
