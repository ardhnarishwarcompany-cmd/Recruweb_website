import { sequelize } from "../config/db.js";

export const ensureCandidateSubmissionSchema = async () => {
  if (!sequelize) return;
  try {
    await sequelize.query(`
      ALTER TABLE candidate_submissions
      MODIFY COLUMN status ENUM(
        'pending-admin-approval',
        'admin-approved',
        'admin-rejected',
        'submitted',
        'client-approved',
        'client-rejected',
        'interview-scheduled',
        'interview-completed',
        'offer-extended',
        'offer-approved',
        'offer-rejected',
        'withdrawn'
      ) NOT NULL DEFAULT 'submitted'
    `);
  } catch (error) {
    console.warn("[candidate submissions schema] status enum update skipped:", error.message);
  }
};
