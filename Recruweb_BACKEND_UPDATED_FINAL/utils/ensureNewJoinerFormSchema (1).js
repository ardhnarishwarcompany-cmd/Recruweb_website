import { sequelize } from "../config/db.js";

// Keeps the NewJoinerForms table compatible with the extended candidate
// joining form without enabling global sequelize alter:true. Idempotent.
export async function ensureNewJoinerFormSchema() {
  try {
    const qi = sequelize.getQueryInterface();
    const table = await qi.describeTable("NewJoinerForms");
    const definitions = {
      reminderSentAt:{type:"DATETIME",allowNull:true}, gradeBand:{type:"VARCHAR(100)",allowNull:true},
      middleName:{type:"VARCHAR(255)",allowNull:true}, nationality:{type:"VARCHAR(255)",allowNull:true}, religion:{type:"VARCHAR(255)",allowNull:true}, category:{type:"VARCHAR(255)",allowNull:true},
      fatherName:{type:"VARCHAR(255)",allowNull:true}, motherName:{type:"VARCHAR(255)",allowNull:true}, spouseName:{type:"VARCHAR(255)",allowNull:true},
      emergencyContactPerson:{type:"VARCHAR(255)",allowNull:true}, emergencyContactRelationship:{type:"VARCHAR(255)",allowNull:true},
      officialEmail:{type:"VARCHAR(255)",allowNull:true}, employeeType:{type:"VARCHAR(100)",allowNull:true}, workLocation:{type:"VARCHAR(255)",allowNull:true}, shiftTiming:{type:"VARCHAR(255)",allowNull:true}, probationPeriod:{type:"VARCHAR(100)",allowNull:true}, noticePeriod:{type:"VARCHAR(100)",allowNull:true},
      professionalSummary:{type:"TEXT",allowNull:true}, careerObjective:{type:"TEXT",allowNull:true},
      coreStrengths:{type:"JSON",allowNull:true}, educationDetails:{type:"JSON",allowNull:true}, certifications:{type:"JSON",allowNull:true}, technicalSkills:{type:"JSON",allowNull:true}, functionalSkills:{type:"JSON",allowNull:true}, skillLevels:{type:"JSON",allowNull:true}, languagesKnown:{type:"JSON",allowNull:true}, workExperience:{type:"JSON",allowNull:true}, familyInformation:{type:"JSON",allowNull:true}, nomineeInformation:{type:"JSON",allowNull:true}, socialProfiles:{type:"JSON",allowNull:true}, assetRequirements:{type:"JSON",allowNull:true}, mandatoryDocuments:{type:"JSON",allowNull:true}, identityDocuments:{type:"JSON",allowNull:true},
      verificationConsent:{type:"TINYINT(1)",allowNull:false,defaultValue:0}, declarationConfirmed:{type:"TINYINT(1)",allowNull:false,defaultValue:0},
      aadhaarVerificationStatus:{type:"VARCHAR(50)",allowNull:true,defaultValue:"not-started"}, panVerificationStatus:{type:"VARCHAR(50)",allowNull:true,defaultValue:"not-started"},
      profilePhotoUrl:{type:"VARCHAR(1000)",allowNull:true}, signatureUrl:{type:"VARCHAR(1000)",allowNull:true}, billingAmount:{type:"DECIMAL(12,2)",allowNull:true,defaultValue:0},
    };
    for (const [field, definition] of Object.entries(definitions)) {
      if (!table[field]) {
        await qi.addColumn("NewJoinerForms", field, definition);
        console.log(`[NewJoiner schema] added ${field}`);
      }
    }
    // Older databases may have an earlier status ENUM without documents-pending.
    // Keep it compatible with the current model; this is idempotent in MySQL.
    try {
      await sequelize.query("ALTER TABLE `NewJoinerForms` MODIFY COLUMN `status` ENUM('submitted','under-review','documents-pending','approved','rejected') NOT NULL DEFAULT 'submitted'");
    } catch (statusErr) {
      console.warn("[NewJoiner schema] status ENUM check skipped:", statusErr.message);
    }
  } catch (err) {
    console.warn("[NewJoiner schema] check skipped:", err.message);
  }
}
