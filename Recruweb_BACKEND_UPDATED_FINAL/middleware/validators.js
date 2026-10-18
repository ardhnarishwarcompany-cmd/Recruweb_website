import { body, validationResult } from "express-validator";
import { PUBLIC_SELF_REGISTER_ROLES } from "../config/roles.js";

export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

export const registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
  body("role")
    .optional()
    .isIn(PUBLIC_SELF_REGISTER_ROLES)
    .withMessage(
      `role must be one of: ${PUBLIC_SELF_REGISTER_ROLES.join(", ")}`,
    ),
  handleValidation,
];

export const loginValidator = [
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  body("role")
    .optional()
    .isIn(["candidate", "client", "hr_partner", "admin"])
    .withMessage("Invalid login role"),
  handleValidation,
];

export const forgotPasswordValidator = [
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  handleValidation,
];

export const resetPasswordValidator = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
  handleValidation,
];

export const refreshTokenValidator = [
  body("refreshToken").notEmpty().withMessage("refreshToken is required"),
  handleValidation,
];
