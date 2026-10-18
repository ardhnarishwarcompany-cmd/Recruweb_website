import { sequelize } from "../config/db.js";
import EmployeeJoining from "../models/EmployeeJoining.js";

// Adds only columns introduced by the extended Joining Form. This is safe for
// existing production databases because it never uses Sequelize alter:true.
export async function ensureEmployeeJoiningSchema() {
  try {
    const qi = sequelize.getQueryInterface();
    const table = await qi.describeTable("EmployeeJoinings");
    const fields = [
      "middleName","nationality","religion","category","fatherName","motherName","spouseName",
      "emergencyContactPerson","emergencyContactRelationship","emergencyContactNumber",
      "officialEmail","employeeType","gradeBand","workLocation","shiftTiming","probationPeriod",
      "noticePeriod","professionalSummary","careerObjective","coreStrengths","educationDetails",
      "certifications","technicalSkills","functionalSkills","skillLevels","languagesKnown",
      "workExperience","familyInformation","nomineeInformation","socialProfiles","assetRequirements",
      "mandatoryDocuments","identityDocuments","verificationConsent","declarationConfirmed",
      "aadhaarVerificationStatus","panVerificationStatus","profilePhotoUrl","signatureUrl"
    ];
    const definitions = {
      middleName:{type:"VARCHAR(255)"},nationality:{type:"VARCHAR(255)"},religion:{type:"VARCHAR(255)"},category:{type:"VARCHAR(255)"},
      fatherName:{type:"VARCHAR(255)"},motherName:{type:"VARCHAR(255)"},spouseName:{type:"VARCHAR(255)"},
      emergencyContactPerson:{type:"VARCHAR(255)"},emergencyContactRelationship:{type:"VARCHAR(255)"},emergencyContactNumber:{type:"VARCHAR(100)"},
      officialEmail:{type:"VARCHAR(255)"},employeeType:{type:"VARCHAR(100)"},gradeBand:{type:"VARCHAR(100)"},workLocation:{type:"VARCHAR(255)"},
      shiftTiming:{type:"VARCHAR(255)"},probationPeriod:{type:"VARCHAR(100)"},noticePeriod:{type:"VARCHAR(100)"},
      professionalSummary:{type:"TEXT"},careerObjective:{type:"TEXT"},
      coreStrengths:{type:"JSON"},educationDetails:{type:"JSON"},certifications:{type:"JSON"},technicalSkills:{type:"JSON"},
      functionalSkills:{type:"JSON"},skillLevels:{type:"JSON"},languagesKnown:{type:"JSON"},workExperience:{type:"JSON"},
      familyInformation:{type:"JSON"},nomineeInformation:{type:"JSON"},socialProfiles:{type:"JSON"},assetRequirements:{type:"JSON"},
      mandatoryDocuments:{type:"JSON"},identityDocuments:{type:"JSON"},verificationConsent:{type:"TINYINT(1)",allowNull:false,defaultValue:0},
      declarationConfirmed:{type:"TINYINT(1)",allowNull:false,defaultValue:0},
      aadhaarVerificationStatus:{type:"VARCHAR(50)",allowNull:false,defaultValue:"not-started"},
      panVerificationStatus:{type:"VARCHAR(50)",allowNull:false,defaultValue:"not-started"},
      profilePhotoUrl:{type:"VARCHAR(1000)"},signatureUrl:{type:"VARCHAR(1000)"}
    };
    for (const field of fields) {
      if (!table[field]) {
        await qi.addColumn("EmployeeJoinings", field, definitions[field]);
        console.log(`[EmployeeJoining schema] added ${field}`);
      }
    }
  } catch (err) {
    console.warn("[EmployeeJoining schema] check skipped:", err.message);
  }
}
