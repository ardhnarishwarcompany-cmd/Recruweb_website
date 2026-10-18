import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import { initializeAdmin } from "../controllers/authController.js";

// This script used to also bulk-insert ~50 fake companies (placeholder.com
// logos, *.example.com websites, made-up job counts) and 8 demo accounts
// that all shared the public password "Password123" — both were dummy/fake
// data and a real security risk in a live deployment, so they have been
// removed entirely.
//
// The only thing this script now does is make sure the ONE real admin
// account defined by ADMIN_EMAIL / ADMIN_PASSWORD in your .env exists.
// Everything else (companies, jobs, clients, invoices, users) must be
// created for real through the app itself — Admin > Clients/Companies,
// Admin > Jobs, Register, etc. — and is read from the database as-is,
// with nothing fabricated.
const run = async () => {
  await connectDB();
  await initializeAdmin();
  console.log("Admin account ensured. No dummy data was seeded.");
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
