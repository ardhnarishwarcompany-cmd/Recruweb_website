import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const PIPELINE_STAGES = [
  "New Lead",
  "CV Received",
  "AI Screened",
  "Recruiter Reviewed",
  "Submitted To Client",
  "Interview Scheduled",
  "Interview Cleared",
  "Offer Released",
  "Joined",
  "Retained 90 Days",
];

const Candidate = sequelize.define(
  "Candidate",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    candidateCode: {
      type: DataTypes.STRING,
      unique: true,
    },

    // Links this ATS profile to the candidate's own login (Users table,
    // role = "candidate"). Nullable because most existing candidates were
    // created by recruiters and have never logged into the portal. Set the
    // first time a logged-in candidate opens the Candidate Portal (see
    // candidatePortalController.getMyProfile), or when a recruiter links an
    // ATS record to a portal account manually.
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true,
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    lastName: {
      type: DataTypes.STRING,
    },

    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },

    phone: {
      // Was allowNull: false. Relaxed so the Candidate Portal can
      // auto-create a bare profile the first time a candidate logs in,
      // before they've filled in their phone number on the Profile tab.
      // Recruiter-created candidates (candidateController.createCandidate)
      // still expect the frontend admin form to collect it.
      type: DataTypes.STRING,
      allowNull: true,
    },

    alternatePhone: {
      type: DataTypes.STRING,
    },

    source: {
      type: DataTypes.ENUM(
        "LinkedIn",
        "Naukri",
        "Indeed",
        "Referral",
        "Website",
        "Walk-In",
        "Other",
      ),
      defaultValue: "Other",
    },

    experience: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    currentCompany: {
      type: DataTypes.STRING,
    },

    currentCTC: {
      type: DataTypes.FLOAT,
    },

    expectedCTC: {
      type: DataTypes.FLOAT,
    },

    noticePeriod: {
      type: DataTypes.INTEGER,
    },

    skills: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    education: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    resume: {
      type: DataTypes.STRING,
    },

    resumeText: {
      type: DataTypes.TEXT("long"),
    },

    profilePhoto: {
      type: DataTypes.STRING,
    },

    aiScore: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    aiSummary: {
      type: DataTypes.TEXT("long"),
    },

    pipelineStage: {
      type: DataTypes.ENUM(...PIPELINE_STAGES),
      defaultValue: "New Lead",
    },

    // Kept separate from pipelineStage (not inserted into the linear
    // PIPELINE_STAGES array) so existing index-based progress logic
    // (joiningTracker.js, etc.) never breaks. A candidate can be rejected
    // at any stage of the pipeline.
    isRejected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    rating: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
      },
    },

    remarks: {
      type: DataTypes.TEXT,
    },

    timeline: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    notes: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    documents: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    // Set by staff (candidateController.uploadOfferLetter) once an offer is
    // released. The Candidate Portal's "Download Offer Letter" button reads
    // this — no dummy/placeholder file is ever generated on the fly.
    offerLetterUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "candidates",
    timestamps: true,
    paranoid: true,
  },
);

export default Candidate;
