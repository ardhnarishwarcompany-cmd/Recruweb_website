import Job from "./Job.js";
import Application from "./Application.js";
import Company from "./Company.js";
import Contact from "./Contact.js";
import GetStarted from "./GetStarted.js";
import Message from "./Message.js";
import Subscriber from "./Subscriber.js";
import User from "./User.js";
import EmployeeJoining from "./EmployeeJoining.js";
import NewJoinerForm from "./NewJoinerForm.js";
import Task from "./Task.js";
import RefreshToken from "./RefreshToken.js";
import Branch from "./Branch.js";
import Setting from "./Setting.js";
import AuditLog from "./AuditLog.js";
import Role from "./Role.js";
import Permission from "./Permission.js";
import UserRole from "./UserRole.js";
import RolePermission from "./RolePermission.js";
import Candidate from "./Candidate.js";
import CrmCompany from "./CrmCompany.js";
import CrmClient from "./CrmClient.js";
import CrmContact from "./CrmContact.js";
import CrmRequirement from "./CrmRequirement.js";
import CrmNote from "./CrmNote.js";
import CrmContract from "./CrmContract.js";

import Lead from "./Lead.js";
import LeadFollowUp from "./LeadFollowUp.js";
import CandidateActivity from "./CandidateActivity.js";
import CalendarEvent from "./CalendarEvent.js";
import CandidateSubmission from "./CandidateSubmission.js";
import Invoice from "./Invoice.js";
import ClientMessage from "./ClientMessage.js";
import CandidateMessage from "./CandidateMessage.js";
import Payment from "./Payment.js";
import AutomationLog from "./AutomationLog.js";
import BackupLog from "./BackupLog.js";
import SalaryGuide from "./SalaryGuide.js";
import InterviewQuestion from "./InterviewQuestion.js";
import HrTemplate from "./HrTemplate.js";
import ComplianceChecklist from "./ComplianceChecklist.js";
import PasswordHistory from "./PasswordHistory.js";
import Resume from "./Resume.js";
import AutomationDraft from "./AutomationDraft.js";
import ExchangeRate from "./ExchangeRate.js";
import KycDocument from "./KycDocument.js";
import HrPartnerProfile from "./HrPartnerProfile.js";
import Wallet from "./Wallet.js";
import WalletTransaction from "./WalletTransaction.js";
import SupportTicket from "./SupportTicket.js";
import SupportTicketReply from "./SupportTicketReply.js";
import SupportChatMessage from "./SupportChatMessage.js";
import Sop from "./Sop.js";
import SopInbox from "./SopInbox.js";
import HrmsSubscription from "./HrmsSubscription.js";

//
// =======================================================
// RBAC ASSOCIATIONS
// =======================================================
//

// User ↔ Role (Many-to-Many)
User.hasMany(AutomationLog, {
  foreignKey: "senderUserId",
  as: "automationLogs",
});

AutomationLog.belongsTo(User, {
  foreignKey: "senderUserId",
  as: "sender",
});
AutomationDraft.hasMany(AutomationLog, {
  foreignKey: "draftId",
  as: "logs",
});

AutomationLog.belongsTo(AutomationDraft, {
  foreignKey: "draftId",
  as: "draft",
});
Candidate.belongsTo(Job, {
  foreignKey: "jobId",
  as: "job",
});

Job.hasMany(Candidate, {
  foreignKey: "jobId",
  as: "candidates",
});

Candidate.belongsTo(Branch, {
  foreignKey: "branchId",
  as: "branch",
});

Branch.hasMany(Candidate, {
  foreignKey: "branchId",
  as: "candidates",
});

Candidate.belongsTo(User, {
  foreignKey: {
    name: "assignedRecruiterId",
    allowNull: true,
  },
  as: "recruiter",
});

User.hasMany(Candidate, {
  foreignKey: {
    name: "assignedRecruiterId",
    allowNull: true,
  },
  as: "assignedCandidates",
});

Candidate.belongsTo(User, {
  foreignKey: "createdBy",
  as: "creator",
});
User.hasMany(Candidate, {
  foreignKey: "createdBy",
  as: "createdCandidates",
});

// Candidate Portal — links a candidate's own login (User, role="candidate")
// to their single ATS profile record.
Candidate.belongsTo(User, {
  foreignKey: { name: "userId", allowNull: true },
  as: "portalUser",
});
User.hasOne(Candidate, {
  foreignKey: { name: "userId", allowNull: true },
  as: "candidateProfile",
});
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: "userId",
  otherKey: "roleId",
  as: "roles",
});

Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: "roleId",
  otherKey: "userId",
  as: "users",
});

// Legacy support (User.role ENUM column)

Role.hasMany(User, {
  foreignKey: "role",
  sourceKey: "name",
  constraints: false,
});

User.belongsTo(Role, {
  foreignKey: "role",
  targetKey: "name",
  constraints: false,
  as: "primaryRole",
});

// Role ↔ Permission

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: "roleId",
  otherKey: "permissionId",
  as: "permissions",
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: "permissionId",
  otherKey: "roleId",
  as: "roles",
});

//
// =======================================================
// JOBS
// =======================================================
//

Job.hasMany(Application, {
  foreignKey: {
    name: "jobId",
    allowNull: false,
  },
  as: "applications",
  onDelete: "CASCADE",
});

Application.belongsTo(Job, {
  foreignKey: "jobId",
  as: "job",
});

//
// =======================================================
// REFRESH TOKENS
// =======================================================
//

// User (Candidate) ↔ Resume (Resume Builder) — One-to-Many
User.hasMany(Resume, {
  foreignKey: "userId",
  as: "resumes",
  onDelete: "CASCADE",
});
Resume.belongsTo(User, {
  foreignKey: "userId",
  as: "owner",
});

User.hasMany(RefreshToken, {
  foreignKey: {
    name: "userId",
    allowNull: false,
  },
  as: "refreshTokens",
  onDelete: "CASCADE",
});

RefreshToken.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

//
// =======================================================
// TASKS
// =======================================================
//

User.hasMany(Task, {
  foreignKey: {
    name: "assignedToId",
    allowNull: true,
  },
  as: "tasks",
  onDelete: "SET NULL",
});

Task.belongsTo(User, {
  foreignKey: "assignedToId",
  as: "assignee",
});

//
// =======================================================
// APPLICATION REVIEWER
// =======================================================
//

User.hasMany(Application, {
  foreignKey: {
    name: "reviewedById",
    allowNull: true,
  },
  as: "reviewedApplications",
  onDelete: "SET NULL",
});

Application.belongsTo(User, {
  foreignKey: "reviewedById",
  as: "reviewedBy",
});

// Applied Candidate Module — Candidate Assignment (assign an applied
// candidate to a recruiter/HR for follow-up; distinct from reviewedById
// which only tracks who last touched the status).
User.hasMany(Application, {
  foreignKey: {
    name: "assignedToId",
    allowNull: true,
  },
  as: "assignedApplications",
  onDelete: "SET NULL",
});

Application.belongsTo(User, {
  foreignKey: "assignedToId",
  as: "assignedTo",
});

//
// =======================================================
// BRANCHES
// =======================================================
//

Branch.hasMany(User, {
  foreignKey: {
    name: "branchId",
    allowNull: true,
  },
  as: "staff",
  onDelete: "SET NULL",
});

User.belongsTo(Branch, {
  foreignKey: "branchId",
  as: "branch",
});

//
// =======================================================
// CLIENT CRM
// =======================================================
//

// CrmCompany -> CrmClient (a company can have several client accounts,
// though in practice it is usually 1:1)
CrmCompany.hasMany(CrmClient, { foreignKey: "companyId", as: "clients" });
CrmClient.belongsTo(CrmCompany, { foreignKey: "companyId", as: "company" });

// CrmClient <-> User (account manager)
User.hasMany(CrmClient, {
  foreignKey: { name: "accountManagerId", allowNull: true },
  as: "managedClients",
  onDelete: "SET NULL",
});
CrmClient.belongsTo(User, {
  foreignKey: "accountManagerId",
  as: "accountManager",
});

// CrmClient -> Branch
Branch.hasMany(CrmClient, {
  foreignKey: { name: "branchId", allowNull: true },
  as: "clients",
  onDelete: "SET NULL",
});
CrmClient.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });

// CrmClient -> CrmContact
CrmClient.hasMany(CrmContact, {
  foreignKey: { name: "clientId", allowNull: true },
  as: "contacts",
  onDelete: "CASCADE",
});
CrmContact.belongsTo(CrmClient, { foreignKey: "clientId", as: "client" });

// CrmCompany -> CrmContact
CrmCompany.hasMany(CrmContact, {
  foreignKey: { name: "companyId", allowNull: true },
  as: "contacts",
  onDelete: "CASCADE",
});
CrmContact.belongsTo(CrmCompany, { foreignKey: "companyId", as: "company" });

// CrmClient -> CrmRequirement
CrmClient.hasMany(CrmRequirement, {
  foreignKey: { name: "clientId", allowNull: false },
  as: "requirements",
  onDelete: "CASCADE",
});
CrmRequirement.belongsTo(CrmClient, {
  foreignKey: "clientId",
  as: "client",
});

// CrmRequirement -> User (assigned recruiter)
User.hasMany(CrmRequirement, {
  foreignKey: { name: "assignedRecruiterId", allowNull: true },
  as: "assignedRequirements",
  onDelete: "SET NULL",
});
CrmRequirement.belongsTo(User, {
  foreignKey: "assignedRecruiterId",
  as: "assignedRecruiter",
});

// CrmClient -> CrmContract
CrmClient.hasMany(CrmContract, {
  foreignKey: { name: "clientId", allowNull: false },
  as: "contracts",
  onDelete: "CASCADE",
});
CrmContract.belongsTo(CrmClient, { foreignKey: "clientId", as: "client" });

// CrmNote -> User (author)
User.hasMany(CrmNote, {
  foreignKey: { name: "createdBy", allowNull: true },
  as: "crmNotes",
  onDelete: "SET NULL",
});
CrmNote.belongsTo(User, { foreignKey: "createdBy", as: "author" });

//
// =======================================================
// LEAD CRM
// =======================================================
//

// Lead <-> User (assigned owner)
User.hasMany(Lead, {
  foreignKey: { name: "assignedToId", allowNull: true },
  as: "assignedLeads",
  onDelete: "SET NULL",
});
Lead.belongsTo(User, { foreignKey: "assignedToId", as: "assignedTo" });

// Lead -> CrmClient (conversion)
Lead.belongsTo(CrmClient, {
  foreignKey: "convertedClientId",
  as: "convertedClient",
});
CrmClient.hasOne(Lead, {
  foreignKey: "convertedClientId",
  as: "sourceLead",
});

// Lead -> LeadFollowUp
Lead.hasMany(LeadFollowUp, {
  foreignKey: { name: "leadId", allowNull: false },
  as: "followUps",
  onDelete: "CASCADE",
});
LeadFollowUp.belongsTo(Lead, { foreignKey: "leadId", as: "lead" });

// LeadFollowUp -> User (creator)
User.hasMany(LeadFollowUp, {
  foreignKey: { name: "createdBy", allowNull: true },
  as: "leadFollowUps",
  onDelete: "SET NULL",
});
LeadFollowUp.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

//
// =======================================================
// RECRUITER WORKSPACE (Phase 5)
// =======================================================
//

// CandidateActivity — recruiter's logged calls / interviews / joins against
// a candidate. Source of truth for the Performance panel.
User.hasMany(CandidateActivity, {
  foreignKey: { name: "recruiterId", allowNull: false },
  as: "candidateActivities",
  onDelete: "CASCADE",
});
CandidateActivity.belongsTo(User, {
  foreignKey: "recruiterId",
  as: "recruiter",
});

Candidate.hasMany(CandidateActivity, {
  foreignKey: { name: "candidateId", allowNull: false },
  as: "activities",
  onDelete: "CASCADE",
});
CandidateActivity.belongsTo(Candidate, {
  foreignKey: "candidateId",
  as: "candidate",
});

CrmRequirement.hasMany(CandidateActivity, {
  foreignKey: { name: "requirementId", allowNull: true },
  as: "activities",
  onDelete: "SET NULL",
});
CandidateActivity.belongsTo(CrmRequirement, {
  foreignKey: "requirementId",
  as: "requirement",
});

// CalendarEvent — recruiter's calendar entries & reminders.
User.hasMany(CalendarEvent, {
  foreignKey: { name: "ownerId", allowNull: false },
  as: "calendarEvents",
  onDelete: "CASCADE",
});
CalendarEvent.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

User.hasMany(CalendarEvent, {
  foreignKey: { name: "createdBy", allowNull: true },
  as: "createdCalendarEvents",
  onDelete: "SET NULL",
});
CalendarEvent.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

//
// =======================================================
// CLIENT PORTAL (Phase 7)
// =======================================================
//

// Client Portal — links a client's own login (User, role="client") to their
// single CRM client record, mirroring Candidate.userId <-> User.
CrmClient.belongsTo(User, {
  foreignKey: { name: "userId", allowNull: true },
  as: "portalUser",
});
User.hasOne(CrmClient, {
  foreignKey: { name: "userId", allowNull: true },
  as: "clientProfile",
});

// CandidateSubmission — a candidate submitted to a client against one of
// their requirements, awaiting Approve Candidate / Approve Offer decisions.
Candidate.hasMany(CandidateSubmission, {
  foreignKey: { name: "candidateId", allowNull: false },
  as: "submissions",
  onDelete: "CASCADE",
});
CandidateSubmission.belongsTo(Candidate, {
  foreignKey: "candidateId",
  as: "candidate",
});

CrmRequirement.hasMany(CandidateSubmission, {
  foreignKey: { name: "requirementId", allowNull: false },
  as: "submissions",
  onDelete: "CASCADE",
});
CandidateSubmission.belongsTo(CrmRequirement, {
  foreignKey: "requirementId",
  as: "requirement",
});

CrmClient.hasMany(CandidateSubmission, {
  foreignKey: { name: "clientId", allowNull: false },
  as: "submissions",
  onDelete: "CASCADE",
});
CandidateSubmission.belongsTo(CrmClient, {
  foreignKey: "clientId",
  as: "client",
});

User.hasMany(CandidateSubmission, {
  foreignKey: { name: "submittedById", allowNull: true },
  as: "submittedCandidates",
  onDelete: "SET NULL",
});
CandidateSubmission.belongsTo(User, {
  foreignKey: "submittedById",
  as: "submittedBy",
});

// Invoice — Finance/Admin-issued invoice a client can download.
CrmClient.hasMany(Invoice, {
  foreignKey: { name: "clientId", allowNull: false },
  as: "invoices",
  onDelete: "CASCADE",
});
Invoice.belongsTo(CrmClient, { foreignKey: "clientId", as: "client" });

User.hasMany(Invoice, {
  foreignKey: { name: "createdBy", allowNull: true },
  as: "createdInvoices",
  onDelete: "SET NULL",
});
Invoice.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

// ClientMessage — Chat With Recruiter thread.
CrmClient.hasMany(ClientMessage, {
  foreignKey: { name: "clientId", allowNull: false },
  as: "messages",
  onDelete: "CASCADE",
});
ClientMessage.belongsTo(CrmClient, { foreignKey: "clientId", as: "client" });

User.hasMany(ClientMessage, {
  foreignKey: { name: "senderId", allowNull: false },
  as: "sentClientMessages",
  onDelete: "CASCADE",
});
ClientMessage.belongsTo(User, { foreignKey: "senderId", as: "sender" });

// CandidateMessage — Candidate Portal "Chat With Recruiter" thread.
Candidate.hasMany(CandidateMessage, {
  foreignKey: { name: "candidateId", allowNull: false },
  as: "messages",
  onDelete: "CASCADE",
});
CandidateMessage.belongsTo(Candidate, {
  foreignKey: "candidateId",
  as: "candidate",
});

User.hasMany(CandidateMessage, {
  foreignKey: { name: "senderId", allowNull: false },
  as: "sentCandidateMessages",
  onDelete: "CASCADE",
});
CandidateMessage.belongsTo(User, { foreignKey: "senderId", as: "sender" });

// =======================================================
// Phase 8 — Finance & Automation associations
// =======================================================

Invoice.hasMany(Payment, {
  foreignKey: { name: "invoiceId", allowNull: false },
  as: "payments",
  onDelete: "CASCADE",
});
Payment.belongsTo(Invoice, { foreignKey: "invoiceId", as: "invoice" });

// Extra Module — Security: Backup System.
User.hasMany(BackupLog, {
  foreignKey: { name: "triggeredById", allowNull: true },
  as: "backups",
  onDelete: "SET NULL",
});
BackupLog.belongsTo(User, { foreignKey: "triggeredById", as: "triggeredBy" });

// Free Hiring Resource Center — track which staff member created each item.
User.hasMany(HrTemplate, {
  foreignKey: { name: "createdById", allowNull: true },
  as: "hrTemplates",
  onDelete: "SET NULL",
});
HrTemplate.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });

User.hasMany(ComplianceChecklist, {
  foreignKey: { name: "createdById", allowNull: true },
  as: "complianceChecklists",
  onDelete: "SET NULL",
});
ComplianceChecklist.belongsTo(User, {
  foreignKey: "createdById",
  as: "createdBy",
});

CrmClient.hasMany(Payment, {
  foreignKey: { name: "clientId", allowNull: false },
  as: "payments",
});
Payment.belongsTo(CrmClient, { foreignKey: "clientId", as: "client" });

// User ↔ PasswordHistory (One-to-Many) — used to block password re-use.
User.hasMany(PasswordHistory, {
  foreignKey: { name: "userId", allowNull: false },
  as: "passwordHistory",
  onDelete: "CASCADE",
});
PasswordHistory.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Payment, {
  foreignKey: { name: "recordedBy", allowNull: true },
  as: "recordedPayments",
  onDelete: "SET NULL",
});
Payment.belongsTo(User, { foreignKey: "recordedBy", as: "recorder" });

// User ↔ KycDocument (One-to-Many) — merged in from D RTPN.
User.hasMany(KycDocument, {
  foreignKey: { name: "userId", allowNull: false },
  as: "kycDocuments",
  onDelete: "CASCADE",
});
KycDocument.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(KycDocument, {
  foreignKey: { name: "reviewedBy", allowNull: true },
  as: "reviewedKycDocuments",
  onDelete: "SET NULL",
});
KycDocument.belongsTo(User, { foreignKey: "reviewedBy", as: "reviewer" });

// User ↔ HrPartnerProfile (One-to-One) — merged in from D RTPN.
User.hasOne(HrPartnerProfile, {
  foreignKey: { name: "userId", allowNull: false },
  as: "hrPartnerProfile",
  onDelete: "CASCADE",
});
HrPartnerProfile.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(HrPartnerProfile, {
  foreignKey: { name: "approvedBy", allowNull: true },
  as: "approvedHrPartners",
  onDelete: "SET NULL",
});
HrPartnerProfile.belongsTo(User, { foreignKey: "approvedBy", as: "approver" });

// HrPartnerProfile ↔ Wallet (One-to-One)
HrPartnerProfile.hasOne(Wallet, {
  foreignKey: { name: "hrPartnerProfileId", allowNull: false },
  as: "wallet",
  onDelete: "CASCADE",
});
Wallet.belongsTo(HrPartnerProfile, { foreignKey: "hrPartnerProfileId", as: "hrPartnerProfile" });

// Wallet ↔ WalletTransaction (One-to-Many)
Wallet.hasMany(WalletTransaction, {
  foreignKey: { name: "walletId", allowNull: false },
  as: "transactions",
  onDelete: "CASCADE",
});
WalletTransaction.belongsTo(Wallet, { foreignKey: "walletId", as: "wallet" });
User.hasMany(WalletTransaction, {
  foreignKey: { name: "releasedBy", allowNull: true },
  as: "releasedPayouts",
  onDelete: "SET NULL",
});
WalletTransaction.belongsTo(User, { foreignKey: "releasedBy", as: "releaser" });

// User ↔ SupportTicket / SupportTicketReply (merged in from D RTPN)
User.hasMany(SupportTicket, {
  foreignKey: { name: "raisedByUserId", allowNull: false },
  as: "raisedTickets",
  onDelete: "CASCADE",
});
SupportTicket.belongsTo(User, { foreignKey: "raisedByUserId", as: "raisedBy" });
User.hasMany(SupportTicket, {
  foreignKey: { name: "assignedToUserId", allowNull: true },
  as: "assignedTickets",
  onDelete: "SET NULL",
});
SupportTicket.belongsTo(User, { foreignKey: "assignedToUserId", as: "assignedTo" });

SupportTicket.hasMany(SupportTicketReply, {
  foreignKey: { name: "ticketId", allowNull: false },
  as: "replies",
  onDelete: "CASCADE",
});
SupportTicketReply.belongsTo(SupportTicket, { foreignKey: "ticketId", as: "ticket" });
User.hasMany(SupportTicketReply, {
  foreignKey: { name: "authorUserId", allowNull: false },
  as: "ticketReplies",
  onDelete: "CASCADE",
});
SupportTicketReply.belongsTo(User, { foreignKey: "authorUserId", as: "author" });

// User ↔ SupportChatMessage — direct "Chat with Support" conversation.
User.hasMany(SupportChatMessage, {
  foreignKey: { name: "participantUserId", allowNull: false },
  as: "supportChatMessages",
  onDelete: "CASCADE",
});
SupportChatMessage.belongsTo(User, {
  foreignKey: "participantUserId",
  as: "supportParticipant",
});
User.hasMany(SupportChatMessage, {
  foreignKey: { name: "senderId", allowNull: false },
  as: "sentSupportChatMessages",
  onDelete: "CASCADE",
});
SupportChatMessage.belongsTo(User, {
  foreignKey: "senderId",
  as: "supportSender",
});


// SOP Center — policy documents and approval inbox.
User.hasMany(Sop, { foreignKey: { name: "createdBy", allowNull: true }, as: "createdSops", onDelete: "SET NULL" });
Sop.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Sop.hasMany(SopInbox, { foreignKey: { name: "sopId", allowNull: false }, as: "approvalInbox", onDelete: "CASCADE" });
SopInbox.belongsTo(Sop, { foreignKey: "sopId", as: "sop" });
User.hasMany(SopInbox, { foreignKey: { name: "recipientUserId", allowNull: false }, as: "sopInbox", onDelete: "CASCADE" });
SopInbox.belongsTo(User, { foreignKey: "recipientUserId", as: "recipient" });
// HRMS / SaaS subscriptions — client-owned commercial purchases.
CrmClient.hasMany(HrmsSubscription, {
  foreignKey: { name: "clientId", allowNull: false },
  as: "hrmsSubscriptions",
  onDelete: "CASCADE",
});
HrmsSubscription.belongsTo(CrmClient, {
  foreignKey: "clientId",
  as: "client",
});
Invoice.hasOne(HrmsSubscription, {
  foreignKey: { name: "invoiceId", allowNull: true },
  as: "hrmsSubscription",
  onDelete: "SET NULL",
});
HrmsSubscription.belongsTo(Invoice, {
  foreignKey: "invoiceId",
  as: "invoice",
});


//
// =======================================================
// EXPORTS
// =======================================================
//

export {
  CrmCompany,
  CrmClient,
  CrmContact,
  CrmRequirement,
  CrmNote,
  CrmContract,
  Lead,
  LeadFollowUp,
  Job,
  Application,
  Company,
  Contact,
  GetStarted,
  Message,
  Subscriber,
  User,
  EmployeeJoining,
  NewJoinerForm,
  Task,
  RefreshToken,
  Branch,
  Setting,
  AuditLog,
  Role,
  Permission,
  UserRole,
  RolePermission,
  Candidate,
  CandidateActivity,
  CalendarEvent,
  CandidateSubmission,
  Invoice,
  ClientMessage,
  Payment,
  AutomationLog,
  BackupLog,
  SalaryGuide,
  InterviewQuestion,
  HrTemplate,
  ComplianceChecklist,
  PasswordHistory,
  Resume,
  CandidateMessage,
  ExchangeRate,
  KycDocument,
  HrPartnerProfile,
  Wallet,
  WalletTransaction,
  SupportTicket,
  SupportTicketReply,
  SupportChatMessage,
  AutomationDraft,
  Sop,
  SopInbox,
  HrmsSubscription,
};
