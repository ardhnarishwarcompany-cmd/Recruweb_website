import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

/**
 * Compatibility guard for the Jobs table.
 *
 * Older Recruweb databases used Sequelize's default `createdAt` column while
 * the current Job model intentionally maps the timestamp attribute to the
 * SQL column `created_at`. `sequelize.sync()` is deliberately non-altering in
 * normal startup, so an old database can otherwise make GET /api/jobs fail
 * with "Unknown column ... created_at".
 *
 * This migration is idempotent and only changes the Jobs schema when the old
 * timestamp/company definitions are actually present.
 */
export const ensureJobSchema = async () => {
  if (!sequelize) return;

  const qi = sequelize.getQueryInterface();
  let columns;
  try {
    columns = await qi.describeTable("Jobs");
  } catch (error) {
    // sequelize.sync() should have created the table already. If it did not,
    // leave the normal startup error path intact rather than masking it here.
    console.warn("[jobs schema] Jobs table check skipped:", error.message);
    return;
  }

  try {
    // Old schema -> current schema. Keep all existing timestamps/data.
    if (!columns.created_at && columns.createdAt) {
      await qi.renameColumn("Jobs", "createdAt", "created_at");
      console.log("[jobs schema] renamed Jobs.createdAt -> Jobs.created_at");
    } else if (!columns.created_at) {
      await qi.addColumn("Jobs", "created_at", {
        type: DataTypes.DATE,
        allowNull: true,
      });
      await sequelize.query(
        "UPDATE `Jobs` SET `created_at` = COALESCE(`created_at`, NOW()) WHERE `created_at` IS NULL",
      );
      await sequelize.query(
        "ALTER TABLE `Jobs` MODIFY COLUMN `created_at` DATETIME NOT NULL",
      );
      console.log("[jobs schema] added missing Jobs.created_at");
    }

    // The current application stores the company name directly in Job.company.
    // Older builds used INTEGER, which breaks real company-name submissions.
    const fresh = await qi.describeTable("Jobs");
    if (fresh.company) {
      const companyType = String(fresh.company.type || "").toLowerCase();
      if (companyType.includes("int") || companyType.includes("bigint")) {
        await sequelize.query(
          "ALTER TABLE `Jobs` MODIFY COLUMN `company` VARCHAR(255) NOT NULL",
        );
        console.log("[jobs schema] converted Jobs.company to VARCHAR(255)");
      }
    }
  } catch (error) {
    // Do not prevent the whole application from booting because a compatibility
    // ALTER is already applied or differs slightly on a customer's MySQL build.
    console.warn("[jobs schema] compatibility update skipped:", error.message);
  }
};
