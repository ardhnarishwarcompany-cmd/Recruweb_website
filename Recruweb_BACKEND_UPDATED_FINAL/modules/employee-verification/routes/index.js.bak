import express from "express";
import authRoutes from "./auth.routes.js";
import employeeRoutes from "./employee.routes.js";
import documentRoutes from "./document.routes.js";
import backgroundRoutes from "./background.routes.js";

// All Employee Verification module endpoints, combined and mounted at
// /api/employee-verification in the main backend/index.js, e.g.
//   GET  /api/employee-verification/employees
//   POST /api/employee-verification/add-employee
//   GET  /api/employee-verification/dashboard
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Employee Verification module running" });
});

router.use(authRoutes);
router.use(employeeRoutes);
router.use(documentRoutes);
router.use(backgroundRoutes);

export default router;
