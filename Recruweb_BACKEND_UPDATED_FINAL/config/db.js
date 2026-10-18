import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// MySQL connection using Sequelize ORM
export const sequelize = new Sequelize(
  process.env.DB_NAME || "recruweb",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: process.env.DB_LOGGING === "true" ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: false,
    },
  },
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();

    console.log(
      `MySQL Connected: ${process.env.DB_HOST || "localhost"}/${process.env.DB_NAME || "recruweb"}`,
    );

    // IMPORTANT:
    // Do not call sequelize.sync() here.
    // Database synchronization is handled once in index.js.
    return true;
  } catch (error) {
    console.error(`Error connecting to MySQL: ${error.message}`);
    return false;
  }
};

export default connectDB;