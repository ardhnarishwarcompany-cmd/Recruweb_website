import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// New Joiner / Employee Joining Form submissions
const NewJoinerForm = sequelize.define(
  "NewJoinerForm",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // Employment details
    employeeId: { type: DataTypes.STRING, allowNull: true },
    joiningDate: { type: DataTypes.DATEONLY, allowNull: true },
    // Phase 8 — Automation: set once an automated joining-day reminder has
    // actually been sent, so the cron job never re-sends it.
    reminderSentAt: { type: DataTypes.DATE, allowNull: true },
    department: { type: DataTypes.STRING, allowNull: true },
    designation: { type: DataTypes.STRING, allowNull: true },
    reportingManager: { type: DataTypes.STRING, allowNull: true },

    // Personal details
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true },
    gender: { type: DataTypes.STRING, allowNull: true },
    maritalStatus: { type: DataTypes.STRING, allowNull: true },
    bloodGroup: { type: DataTypes.STRING, allowNull: true },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("email", value ? value.toLowerCase().trim() : value);
      },
    },
    personalEmail: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: false },
    alternatePhone: { type: DataTypes.STRING, allowNull: true },

    // Addresses (stored as JSON objects: {street, city, state, pincode, country})
    currentAddress: { type: DataTypes.JSON, defaultValue: {} },
    permanentAddress: { type: DataTypes.JSON, defaultValue: {} },

    // Education / experience / references (arrays of objects)
    education: { type: DataTypes.JSON, defaultValue: [] },
    experience: { type: DataTypes.JSON, defaultValue: [] },
    references: { type: DataTypes.JSON, defaultValue: [] },

    // Bank details
    bankDetails: { type: DataTypes.JSON, defaultValue: {} },

    // ID proofs
    aadharNumber: { type: DataTypes.STRING, allowNull: true },
    panNumber: { type: DataTypes.STRING, allowNull: true },
    passportNumber: { type: DataTypes.STRING, allowNull: true },
    passportExpiry: { type: DataTypes.DATEONLY, allowNull: true },

    // Emergency contact
    emergencyContact: { type: DataTypes.JSON, defaultValue: {} },

    // Previous employer
    previousEmployer: { type: DataTypes.JSON, defaultValue: {} },

    declaration: { type: DataTypes.BOOLEAN, defaultValue: false },

    // Extended enterprise joining form fields. Kept in JSON so the existing
    // deployment can add the complete form without changing the rest of HRMS.
    middleName: { type: DataTypes.STRING, allowNull: true },
    nationality: { type: DataTypes.STRING, allowNull: true },
    religion: { type: DataTypes.STRING, allowNull: true },
    category: { type: DataTypes.STRING, allowNull: true },
    fatherName: { type: DataTypes.STRING, allowNull: true },
    motherName: { type: DataTypes.STRING, allowNull: true },
    spouseName: { type: DataTypes.STRING, allowNull: true },
    emergencyContactPerson: { type: DataTypes.STRING, allowNull: true },
    emergencyContactRelationship: { type: DataTypes.STRING, allowNull: true },
    officialEmail: { type: DataTypes.STRING, allowNull: true },
    employeeType: { type: DataTypes.STRING, allowNull: true },
    gradeBand: { type: DataTypes.STRING, allowNull: true },
    workLocation: { type: DataTypes.STRING, allowNull: true },
    shiftTiming: { type: DataTypes.STRING, allowNull: true },
    probationPeriod: { type: DataTypes.STRING, allowNull: true },
    noticePeriod: { type: DataTypes.STRING, allowNull: true },
    professionalSummary: { type: DataTypes.TEXT, allowNull: true },
    careerObjective: { type: DataTypes.TEXT, allowNull: true },
    coreStrengths: { type: DataTypes.JSON, defaultValue: [] },
    educationDetails: { type: DataTypes.JSON, defaultValue: [] },
    certifications: { type: DataTypes.JSON, defaultValue: [] },
    technicalSkills: { type: DataTypes.JSON, defaultValue: [] },
    functionalSkills: { type: DataTypes.JSON, defaultValue: [] },
    skillLevels: { type: DataTypes.JSON, defaultValue: {} },
    languagesKnown: { type: DataTypes.JSON, defaultValue: [] },
    workExperience: { type: DataTypes.JSON, defaultValue: [] },
    familyInformation: { type: DataTypes.JSON, defaultValue: {} },
    nomineeInformation: { type: DataTypes.JSON, defaultValue: {} },
    socialProfiles: { type: DataTypes.JSON, defaultValue: {} },
    assetRequirements: { type: DataTypes.JSON, defaultValue: [] },
    mandatoryDocuments: { type: DataTypes.JSON, defaultValue: {} },
    identityDocuments: { type: DataTypes.JSON, defaultValue: {} },
    verificationConsent: { type: DataTypes.BOOLEAN, defaultValue: false },
    declarationConfirmed: { type: DataTypes.BOOLEAN, defaultValue: false },
    aadhaarVerificationStatus: { type: DataTypes.STRING, defaultValue: "not-started" },
    panVerificationStatus: { type: DataTypes.STRING, defaultValue: "not-started" },
    profilePhotoUrl: { type: DataTypes.STRING, allowNull: true },
    signatureUrl: { type: DataTypes.STRING, allowNull: true },

    // Placement fee billed to the client for this joining, once approved.
    // Feeds the Super Admin dashboard's Revenue stat.
    billingAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0,
    },

    status: {
      type: DataTypes.ENUM(
        "submitted",
        "under-review",
        "documents-pending",
        "approved",
        "rejected",
      ),
      defaultValue: "submitted",
    },
  },
  {
    tableName: "NewJoinerForms",
    indexes: [
      { fields: ["status"] },
      { fields: ["email"] },
      { fields: ["department"] },
    ],
  },
);

export default NewJoinerForm;
