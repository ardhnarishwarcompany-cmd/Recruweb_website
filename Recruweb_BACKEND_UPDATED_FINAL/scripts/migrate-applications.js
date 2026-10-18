// One-off migration for the Applied Candidate Module.
// sequelize.sync() (used at server startup, see config/db.js) creates new
// tables but does NOT add new columns to tables that already exist — so on
// an existing live database we add the new Application columns explicitly.
// Safe to re-run: every addColumn is guarded by an existence check.
//
// Run once with:  node scripts/migrate-applications.js

import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

const TABLE = "Applications";

const COLUMNS = {
  assignedToId: { type: DataTypes.INTEGER, allowNull: true },
  resumeScore: { type: DataTypes.FLOAT, allowNull: true },
  resumeSkills: { type: DataTypes.JSON, allowNull: true },
  resumeSummary: { type: DataTypes.TEXT, allowNull: true },
  screeningMethod: { type: DataTypes.STRING, allowNull: true },
  screenedAt: { type: DataTypes.DATE, allowNull: true },
  statusHistory: { type: DataTypes.JSON, allowNull: true },
};

const run = async () => {
  const qi = sequelize.getQueryInterface();
  try {
    await sequelize.authenticate();
    console.log("Connected to database.");

    const existing = await qi.describeTable(TABLE);

    for (const [name, def] of Object.entries(COLUMNS)) {
      if (existing[name]) {
        console.log(`- ${name}: already exists, skipping`);
        continue;
      }
      await qi.addColumn(TABLE, name, def);
      console.log(`+ ${name}: added`);
    }

    try {
      await qi.addIndex(TABLE, ["assignedToId"]);
    } catch {
      // Index may already exist — ignore.
    }

    console.log("Migration complete.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  }
};

run();
