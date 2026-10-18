import { sequelize } from "../config/db.js";

/**
 * Idempotent schema patch for the interview project/task workflow.
 * Fast sequelize.sync() intentionally does not ALTER existing tables, so the
 * new fields are added here without requiring a destructive migration.
 */
export async function ensureProjectTaskSchema() {
  const columns = [
    ["taskType", "VARCHAR(40) NOT NULL DEFAULT 'recruiter_task'"],
    ["projectName", "VARCHAR(180) NULL"],
    ["instructions", "TEXT NULL"],
    ["estimatedMinutes", "INT NULL"],
    ["interviewId", "INT NULL"],
    ["submissionUrl", "VARCHAR(1000) NULL"],
    ["submissionNotes", "TEXT NULL"],
    ["candidateStatus", "VARCHAR(40) NOT NULL DEFAULT 'assigned'"],
    ["assignedAt", "DATETIME NULL"],
    ["submittedAt", "DATETIME NULL"],
    ["reviewedAt", "DATETIME NULL"],
    ["reviewerFeedback", "TEXT NULL"],
  ];

  for (const [name, definition] of columns) {
    try {
      const [rows] = await sequelize.query(
        `SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Tasks' AND COLUMN_NAME = :name`,
        { replacements: { name } },
      );
      if (!Number(rows?.[0]?.count)) {
        await sequelize.query(`ALTER TABLE \`Tasks\` ADD COLUMN \`${name}\` ${definition}`);
      }
    } catch (error) {
      console.warn(`[Project Tasks] Could not ensure ${name}:`, error.message);
    }
  }

  try {
    await sequelize.query(
      "ALTER TABLE `Tasks` MODIFY COLUMN `relatedType` ENUM('candidate','client','job','general','project') NOT NULL DEFAULT 'general'",
    );
  } catch (error) {
    console.warn("[Project Tasks] relatedType compatibility patch skipped:", error.message);
  }

  try {
    await sequelize.query(
      "CREATE INDEX `tasks_interview_id_idx` ON `Tasks` (`interviewId`)",
    );
  } catch (_error) {
    // Index already exists on repeat boot.
  }
}
