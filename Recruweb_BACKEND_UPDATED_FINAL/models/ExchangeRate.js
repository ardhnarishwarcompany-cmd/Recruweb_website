import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Phase 6 — Global Features (multi-currency).
//
// A real, persisted cache of the last successful live exchange-rate fetch
// from the configured provider (see utils/currencyService.js). We NEVER
// invent/hardcode rate numbers — this table is either populated by a real
// API response, or left empty until the first successful fetch. Every
// consumer of currencyService.convert() gets `stale: true/false` and the
// real `fetchedAt` timestamp so the UI can be honest about data freshness
// instead of silently presenting cached/fallback numbers as "live".
const ExchangeRate = sequelize.define(
  "ExchangeRate",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // The currency all `rates` values are expressed relative to (e.g. "USD").
    baseCurrency: { type: DataTypes.STRING(3), allowNull: false, unique: true },

    // { "INR": 87.12, "EUR": 0.92, ... } — straight from the provider's
    // response body, stored as-is (no rounding/mutation).
    rates: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },

    // Which provider this came from, for auditability (e.g. "exchangerate-api.com").
    source: { type: DataTypes.STRING, allowNull: true },

    fetchedAt: { type: DataTypes.DATE, allowNull: false },

    // Populated only when the last fetch attempt failed, so admins can see
    // *why* rates might be stale without digging through server logs.
    lastErrorMessage: { type: DataTypes.STRING, allowNull: true },
  },
  {
    indexes: [{ unique: true, fields: ["baseCurrency"] }],
  },
);

export default ExchangeRate;
