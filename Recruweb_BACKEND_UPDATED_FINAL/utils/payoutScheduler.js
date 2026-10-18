import cron from "node-cron";
import { Op } from "sequelize";
import { WalletTransaction, Wallet } from "../models/index.js";
import { logAudit } from "./auditLogger.js";

// Merged in from D RTPN's payoutRelease.job.js, adapted to Recruweb's
// existing node-cron + Sequelize setup (see utils/reminders.js /
// utils/backupScheduler.js for the same start-from-index.js pattern).
//
// Runs once a day. Any "credit" WalletTransaction that's been pending for
// at least WALLET_HOLD_PERIOD_DAYS (mirrors D's compliance hold window,
// e.g. to allow a placement to be reversed/disputed) is auto-released —
// same effect as a Finance user manually clicking "release" in
// hrPartnerController.releaseWalletTransaction.
const WALLET_HOLD_PERIOD_DAYS = 45;

export const releaseDuePayouts = async () => {
  const cutoff = new Date(Date.now() - WALLET_HOLD_PERIOD_DAYS * 24 * 60 * 60 * 1000);

  const dueTxns = await WalletTransaction.findAll({
    where: {
      type: "credit",
      status: "pending",
      createdAt: { [Op.lte]: cutoff },
    },
    include: [{ model: Wallet, as: "wallet" }],
  });

  let released = 0;
  for (const txn of dueTxns) {
    txn.status = "released";
    txn.releasedAt = new Date();
    // releasedBy stays null — released automatically by the scheduler,
    // not by a specific staff user.
    await txn.save();

    await logAudit({
      action: "update",
      module: "hr_partner",
      targetType: "WalletTransaction",
      targetId: txn.id,
      description: `Auto-released payout transaction #${txn.id} after ${WALLET_HOLD_PERIOD_DAYS}-day hold period`,
    });

    released += 1;
  }

  return { released, skipped: 0 };
};

export const startPayoutScheduler = () => {
  // Daily at 02:00 server time — same schedule D used.
  cron.schedule("0 2 * * *", async () => {
    try {
      const result = await releaseDuePayouts();
      console.log(`[payoutScheduler] released=${result.released}`);
    } catch (error) {
      console.error("[payoutScheduler] failed:", error);
    }
  });

  console.log("[payoutScheduler] scheduled — daily at 02:00");
};
