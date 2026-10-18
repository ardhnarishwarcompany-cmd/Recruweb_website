import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Wallet — merged in from D RTPN. Holds an HR Partner's running commission
// balance. `balance` is a cached total; it's recalculated from the sum of
// WalletTransaction rows any time a transaction is created/updated, the
// same "never fabricate a total" pattern Recruweb's Invoice/Payment models
// already use (see models/Payment.js).
const Wallet = sequelize.define(
  "Wallet",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    hrPartnerProfileId: { type: DataTypes.INTEGER, allowNull: false, unique: true },

    balance: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  },
  {
    tableName: "wallets",
    timestamps: true,
  },
);

export default Wallet;
