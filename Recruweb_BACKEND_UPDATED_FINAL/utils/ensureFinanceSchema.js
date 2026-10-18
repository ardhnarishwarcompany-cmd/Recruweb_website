import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

/**
 * Fast, idempotent compatibility migration for Finance/Invoice fields.
 * sequelize.sync() in fast mode creates missing tables but does not ALTER
 * existing tables, so older databases can miss newer Finance/Razorpay fields.
 */
const addMissingColumns = async (tableName, columns) => {
  const queryInterface = sequelize.getQueryInterface();
  const description = await queryInterface.describeTable(tableName);

  for (const [name, definition] of Object.entries(columns)) {
    if (description[name]) continue;
    try {
      await queryInterface.addColumn(tableName, name, definition);
      console.log(`[finance schema] added ${tableName}.${name}`);
    } catch (error) {
      const fresh = await queryInterface.describeTable(tableName).catch(() => ({}));
      if (!fresh[name]) throw error;
    }
  }
};

export const ensureFinanceSchema = async () => {
  if (!sequelize) return;

  await addMissingColumns("invoices", {
    gstin: { type: DataTypes.STRING, allowNull: true },
    hsnSac: { type: DataTypes.STRING, allowNull: true },
    placeOfSupply: { type: DataTypes.STRING, allowNull: true },
    gstRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 18 },
    cgstAmount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    sgstAmount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    igstAmount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    gstAmount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    tdsApplicable: { type: DataTypes.BOOLEAN, defaultValue: false },
    tdsSection: { type: DataTypes.STRING, allowNull: true },
    tdsRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    tdsAmount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    totalAmount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    amountPaid: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    balanceDue: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    paidDate: { type: DataTypes.DATE, allowNull: true },
  });

  await addMissingColumns("payments", {
    currency: { type: DataTypes.STRING, defaultValue: "INR" },
    gateway: { type: DataTypes.ENUM("razorpay"), allowNull: true },
    gatewayOrderId: { type: DataTypes.STRING, allowNull: true },
    gatewayPaymentId: { type: DataTypes.STRING, allowNull: true },
    gatewaySignature: { type: DataTypes.STRING, allowNull: true },
    gatewayRaw: { type: DataTypes.TEXT, allowNull: true },
  });



  // Backfill finance totals for invoices created before the Finance module
  // existed. These values are derived only from the stored invoice/payment
  // rows; no synthetic payment is created.
  try {
    await sequelize.query(`
      UPDATE invoices
      SET totalAmount = ROUND(
        COALESCE(NULLIF(totalAmount, 0), COALESCE(amount, 0) + COALESCE(gstAmount, 0) - COALESCE(tdsAmount, 0)), 2
      )
      WHERE COALESCE(totalAmount, 0) = 0 AND COALESCE(amount, 0) > 0
    `);
    await sequelize.query(`
      UPDATE invoices i
      SET amountPaid = COALESCE(
        (SELECT SUM(p.amount) FROM payments p WHERE p.invoiceId = i.id AND p.status = 'received'),
        0
      ),
      balanceDue = GREATEST(
        COALESCE(i.totalAmount, i.amount, 0) - COALESCE(
          (SELECT SUM(p2.amount) FROM payments p2 WHERE p2.invoiceId = i.id AND p2.status = 'received'),
          0
        ),
        0
      )
    `);
    await sequelize.query(`
      UPDATE invoices
      SET status = CASE
        WHEN status IN ('draft','cancelled') THEN status
        WHEN COALESCE(balanceDue,0) <= 0 AND COALESCE(totalAmount,0) > 0 THEN 'paid'
        WHEN COALESCE(amountPaid,0) > 0 THEN 'partially_paid'
        WHEN dueDate IS NOT NULL AND dueDate < NOW() THEN 'overdue'
        ELSE 'sent'
      END
    `);
  } catch (backfillError) {
    console.warn("[finance schema] legacy totals backfill skipped:", backfillError.message);
  }

  console.log("[finance schema] compatibility check complete");
};
