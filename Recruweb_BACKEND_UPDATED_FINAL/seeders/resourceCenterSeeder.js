import {
  SalaryGuide,
  InterviewQuestion,
  ComplianceChecklist,
} from "../models/index.js";

// Free Hiring Resource Center — runs once on boot (findOrCreate is
// idempotent, so re-running on every restart is safe and never duplicates
// rows). Gives the public page real, live database-backed content from
// day one; Admins can edit/add more from the admin panel afterwards.

const SALARY_GUIDES = [
  {
    roleTitle: "Telecaller",
    category: "BPO",
    experienceLevel: "fresher",
    minSalary: 14000,
    maxSalary: 20000,
    avgSalary: 17000,
  },
  {
    roleTitle: "Customer Support Executive",
    category: "BPO",
    experienceLevel: "entry",
    minSalary: 16000,
    maxSalary: 25000,
    avgSalary: 20000,
  },
  {
    roleTitle: "Team Leader - BPO",
    category: "BPO",
    experienceLevel: "mid",
    minSalary: 28000,
    maxSalary: 40000,
    avgSalary: 34000,
  },
  {
    roleTitle: "Business Development Executive",
    category: "Sales",
    experienceLevel: "entry",
    minSalary: 18000,
    maxSalary: 28000,
    avgSalary: 23000,
  },
  {
    roleTitle: "Sales Manager",
    category: "Sales",
    experienceLevel: "mid",
    minSalary: 45000,
    maxSalary: 75000,
    avgSalary: 60000,
  },
  {
    roleTitle: "Regional Sales Head",
    category: "Sales",
    experienceLevel: "senior",
    minSalary: 90000,
    maxSalary: 150000,
    avgSalary: 120000,
  },
  {
    roleTitle: "React / Frontend Developer",
    category: "IT",
    experienceLevel: "entry",
    minSalary: 30000,
    maxSalary: 50000,
    avgSalary: 40000,
  },
  {
    roleTitle: "Node.js Backend Developer",
    category: "IT",
    experienceLevel: "mid",
    minSalary: 55000,
    maxSalary: 90000,
    avgSalary: 72000,
  },
  {
    roleTitle: "Software Engineering Manager",
    category: "IT",
    experienceLevel: "senior",
    minSalary: 130000,
    maxSalary: 220000,
    avgSalary: 175000,
  },
  {
    roleTitle: "HR Executive",
    category: "Noida",
    experienceLevel: "entry",
    minSalary: 20000,
    maxSalary: 32000,
    avgSalary: 26000,
  },
  {
    roleTitle: "Recruiter",
    category: "Noida",
    experienceLevel: "mid",
    minSalary: 30000,
    maxSalary: 50000,
    avgSalary: 40000,
  },
  {
    roleTitle: "Office Administrator",
    category: "Delhi NCR",
    experienceLevel: "entry",
    minSalary: 18000,
    maxSalary: 28000,
    avgSalary: 23000,
  },
  {
    roleTitle: "Operations Manager",
    category: "Delhi NCR",
    experienceLevel: "senior",
    minSalary: 80000,
    maxSalary: 140000,
    avgSalary: 110000,
  },
];

const INTERVIEW_QUESTIONS = [
  {
    category: "HR Round",
    difficulty: "easy",
    question: "Tell me about yourself.",
    answerTips:
      "Keep it to 60–90 seconds: current role, key achievements, why you're looking for a change.",
  },
  {
    category: "HR Round",
    difficulty: "easy",
    question: "Why do you want to leave your current job?",
    answerTips:
      "Stay positive — focus on growth/opportunity, never badmouth a past employer.",
  },
  {
    category: "HR Round",
    difficulty: "medium",
    question: "Where do you see yourself in 5 years?",
    answerTips: "Show ambition aligned with the role you're applying for.",
  },
  {
    category: "Sales",
    difficulty: "medium",
    question: "How do you handle rejection from a prospect?",
    answerTips:
      "Give a concrete example showing resilience and a follow-up strategy.",
  },
  {
    category: "Sales",
    difficulty: "hard",
    question: "Walk me through how you'd pitch our product to a cold lead.",
    answerTips:
      "Look for structure: research, opening hook, needs discovery, value prop, close.",
  },
  {
    category: "BPO",
    difficulty: "easy",
    question: "How would you handle an angry customer on a call?",
    answerTips:
      "Look for empathy, active listening, and staying calm under pressure.",
  },
  {
    category: "IT / Technical",
    difficulty: "medium",
    question: "Explain the difference between SQL and NoSQL databases.",
    answerTips:
      "Look for understanding of structured vs flexible schemas and use-case tradeoffs.",
  },
  {
    category: "IT / Technical",
    difficulty: "hard",
    question: "How would you design a rate limiter for a public API?",
    answerTips:
      "Look for token bucket/sliding window concepts and awareness of distributed-system edge cases.",
  },
];

const COMPLIANCE_CHECKLISTS = [
  {
    title: "New Employee Onboarding Checklist",
    category: "Onboarding",
    description:
      "Documents & steps to complete before a new joiner's first day.",
    items: [
      { text: "Signed offer letter & appointment letter" },
      { text: "PAN card & Aadhaar card copies collected" },
      { text: "Educational certificates verified" },
      { text: "Bank account details for salary processing" },
      { text: "PF (UAN) & ESI enrolment initiated" },
      { text: "IT assets / email ID / access cards provisioned" },
      { text: "Induction & policy briefing scheduled" },
    ],
  },
  {
    title: "PF & ESI Statutory Compliance Checklist",
    category: "Statutory",
    description: "Monthly recurring compliance items for PF/ESI.",
    items: [
      { text: "PF challan generated & payment made before the 15th" },
      { text: "ESI contribution deposited before the 15th" },
      { text: "PF ECR filed for the month" },
      { text: "New joiners added to PF/ESI portal" },
      { text: "Exited employees marked as relieved" },
    ],
  },
  {
    title: "POSH (Prevention of Sexual Harassment) Compliance Checklist",
    category: "POSH",
    description: "Annual/ongoing POSH Act compliance items.",
    items: [
      { text: "Internal Complaints Committee (ICC) constituted" },
      { text: "POSH policy circulated to all employees" },
      { text: "Annual POSH awareness training conducted" },
      { text: "Annual POSH report filed with the District Officer" },
    ],
  },
  {
    title: "Employee Exit / Full & Final Settlement Checklist",
    category: "Exit",
    description: "Steps to complete when an employee resigns or is relieved.",
    items: [
      { text: "Resignation letter & notice period confirmed" },
      { text: "Knowledge transfer / handover completed" },
      { text: "IT assets, ID card & access revoked" },
      {
        text: "Full & final settlement calculated (salary, leave encashment, dues)",
      },
      { text: "Relieving letter & experience letter issued" },
      { text: "PF/ESI exit updated" },
    ],
  },
];

export const seedResourceCenter = async () => {
  try {
    for (const guide of SALARY_GUIDES) {
      await SalaryGuide.findOrCreate({
        where: { roleTitle: guide.roleTitle, category: guide.category },
        defaults: guide,
      });
    }

    for (const q of INTERVIEW_QUESTIONS) {
      await InterviewQuestion.findOrCreate({
        where: { question: q.question },
        defaults: q,
      });
    }

    for (const checklist of COMPLIANCE_CHECKLISTS) {
      await ComplianceChecklist.findOrCreate({
        where: { title: checklist.title },
        defaults: checklist,
      });
    }

    console.log("Resource Center seed complete");
  } catch (err) {
    console.error("Failed to seed Resource Center:", err.message);
  }
};
