import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
// Merged in from D RTPN (OTP) + fills a pre-existing gap (link-token had no frontend page)
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import TermsAndConditions from "./pages/auth/TermsAndConditions";

// Public Pages
import Home from "./pages/Home";
import AICareerUniverse from "./pages/AICareerUniverse";
import About from "./pages/About";
import Recruitment from "./pages/Recruitment";
import Services from "./pages/Services";
import HowItWorks from "./pages/HowItWorks";
import Testimonials from "./pages/Testimonials";
import ResourceCenter from "./pages/ResourceCenter"; // Free Hiring Resource Center
import GetStarted from "./pages/GetStarted";
import Inquiry from "./pages/Inquiry";
import Contact from "./pages/Contact";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Companies from "./pages/Companies";
import PostJob from "./pages/PostJob";
import ScheduleInterview from "./pages/ScheduleInterview";
import EmployeeJoiningForm from "./pages/EmployeeJoiningForm";
import Industry from "./pages/Industry";
import JDMaker from "./pages/JDMaker";
import CVScreen from "./pages/CVScreen";
import CVMaker from "./pages/CVMaker";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeChecker from "./pages/ResumeChecker";
import CoverLetterBuilder from "./pages/CoverLetterBuilder";
import Pricing from "./pages/Pricing";
import ProposalBuilder from "./pages/ProposalBuilder";
import SopCenter from "./pages/SopCenter";
import SopInbox from "./pages/SopInbox";

// Components
import ChatAssistant from "./components/ChatAssistant";
import IncomingCallListener from "./components/IncomingCallListener";
import VoiceAssistant from "./components/VoiceAssistant";
import PageIntro from "./components/PageIntro";
import ScrollToTop from "./components/ScrollToTop";
import ScrollMotion from "./components/ScrollMotion";

// Admin
import AdminLayout from "./components/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CEODashboard from "./pages/admin/CEODashboard";
import AdminCandidates from "./pages/admin/AdminCandidates";
import AdminATSPipeline from "./pages/admin/AdminATSPipeline";
import AdminJoiningForms from "./pages/admin/AdminJoiningForms";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminClients from "./pages/admin/AdminClients";
import AdminCandidateSubmissions from "./pages/admin/AdminCandidateSubmissions";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminCollections from "./pages/admin/AdminCollections";
import AdminAI from "./pages/admin/AdminAI";
import AdminAutomation from "./pages/admin/AdminAutomation";
import AdminResourceCenter from "./pages/admin/AdminResourceCenter"; // Free Hiring Resource Center
import AdminClientChat from "./pages/admin/AdminClientChat";
import AdminCandidateChat from "./pages/admin/AdminCandidateChat";
import AdminCrmCompanies from "./pages/admin/AdminCrmCompanies";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminContacts from "./pages/admin/AdminContacts";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminTasks from "./pages/admin/AdminTasks";
import ProjectTaskAssignment from "./pages/admin/ProjectTaskAssignment";
import RecruiterWorkspace from "./pages/admin/RecruiterWorkspace";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminBranches from "./pages/admin/AdminBranches";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminBackup from "./pages/admin/AdminBackup"; // Extra Module — Security: Backup System
import AdminEmployeeVerification from "./pages/admin/AdminEmployeeVerification"; // Employee Verification module (merged)
// Merged in from D RTPN
import AdminHrPartners from "./pages/admin/AdminHrPartners";
import AdminKyc from "./pages/admin/AdminKyc";
import AdminSupportTickets from "./pages/admin/AdminSupportTickets";
import AdminSupportChat from "./pages/admin/AdminSupportChat";
import AdminHiringTracker from "./pages/admin/AdminHiringTracker";

// Auth Components
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleRoute from "./components/auth/RoleRoute";

// Candidate Portal
import CandidatePortalLayout from "./components/candidate/CandidatePortalLayout";
import CandidateLogin from "./pages/candidate/CandidateLogin";
import CandidateRegister from "./pages/candidate/CandidateRegister";
import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import CandidateProfile from "./pages/candidate/CandidateProfile";
// Merged in from D RTPN — shared KYC screen (also used by HR Partner portal below)
import KycDocuments from "./pages/candidate/KycDocuments";
import SupportTickets from "./pages/candidate/SupportTickets";
// HR Partner Portal — merged in from D RTPN
import HrPartnerPortalLayout from "./components/hrpartner/HrPartnerPortalLayout";
import HrPartnerDashboard from "./pages/hrpartner/HrPartnerDashboard";
import HrPartnerChat from "./pages/hrpartner/HrPartnerChat";
import HrPartnerSupportChat from "./pages/hrpartner/HrPartnerSupportChat";
import HrPartnerWallet from "./pages/hrpartner/HrPartnerWallet";
import HrPartnerHiringTracker from "./pages/hrpartner/HrPartnerHiringTracker";
import HrPartnerProfile from "./pages/hrpartner/HrPartnerProfile";
import HrPartnerVacancies from "./pages/hrpartner/HrPartnerVacancies";
import HrPartnerSubmissions from "./pages/hrpartner/HrPartnerSubmissions";
import CandidateApplications from "./pages/candidate/CandidateApplications";
import CandidateInterviews from "./pages/candidate/CandidateInterviews";
import InterviewTasks from "./pages/candidate/InterviewTasks";
import CandidateChat from "./pages/candidate/CandidateChat";
import CandidateOnboarding from "./pages/candidate/CandidateOnboarding";
import CandidateJoiningTracker from "./pages/candidate/CandidateJoiningTracker";

// Client Portal
import ClientPortalLayout from "./components/client/ClientPortalLayout";
import ClientLogin from "./pages/client/ClientLogin";
import ClientRegister from "./pages/client/ClientRegister";
import ClientDashboard from "./pages/client/ClientDashboard";
// Merged in from D RTPN
import ClientAnalytics from "./pages/client/ClientAnalytics";
import ClientRequirements from "./pages/client/ClientRequirements";
import ClientSubmissions from "./pages/client/ClientSubmissions";
import ClientInterviews from "./pages/client/ClientInterviews";
import ClientChat from "./pages/client/ClientChat";
import ClientInvoices from "./pages/client/ClientInvoices";
import ClientHrmsPlans from "./pages/client/ClientHrmsPlans";
import ClientProfile from "./pages/client/ClientProfile";
import ClientHiringTracker from "./pages/client/ClientHiringTracker";

function AppShell() {
  const location = useLocation();

  const isPortal =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/candidate") ||
    location.pathname.startsWith("/client") ||
    location.pathname.startsWith("/hr-partner");

  const isAuthPage =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/forgot-password") ||
    location.pathname.startsWith("/reset-password");

  return (
    <div className={isPortal ? "app app--portal" : "app"}>
      {!isPortal && !isAuthPage && <Navbar />}
      {isAuthPage && <Navbar />}
      <main>
        <Routes>
          {/* =============== PUBLIC AUTH PAGES =============== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/terms-and-conditions"
            element={<TermsAndConditions />}
          />

          {/* Dedicated Auth Route for Pages/Auth/Login */}
          <Route path="/auth/login" element={<Login />} />

          {/* =============== PUBLIC PAGES =============== */}
          <Route path="/" element={<Home />} />
          <Route path="/ai-career" element={<AICareerUniverse />} />
          <Route path="/about" element={<About />} />
          <Route path="/recruitment" element={<Recruitment />} />
          <Route path="/services" element={<Services />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/resource-center" element={<ResourceCenter />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/proposal" element={<ProposalBuilder />} />
          <Route path="/proposal-pdf" element={<ProposalBuilder pdfMode />} />

          {/* =============== PUBLIC SOP CENTER =============== */}
          {/* Navbar links to /sops, so the public SOP library must be registered
              at the top level as well as inside authenticated portals. */}
          <Route path="/sops" element={<SopCenter />} />
          <Route path="/sops/:id" element={<SopCenter />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/inquiry" element={<Inquiry />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/schedule-interview" element={<ScheduleInterview />} />
          <Route path="/joining-form" element={<CandidateLogin />} />
          <Route path="/industry" element={<Industry />} />
          <Route path="/jd-maker" element={<JDMaker />} />
          <Route path="/cv-screen" element={<CVScreen />} />
          <Route path="/cv-maker" element={<CVMaker />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/resume-checker" element={<ResumeChecker />} />
          <Route
            path="/cover-letter-builder"
            element={<CoverLetterBuilder />}
          />

          {/* =============== ADMIN PORTAL =============== */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="hiring-tracker" element={<AdminHiringTracker />} />
              <Route path="ceo-dashboard" element={<CEODashboard />} />
              <Route path="candidates" element={<AdminCandidates />} />
              <Route path="ats" element={<AdminATSPipeline />} />
              <Route path="joining-forms" element={<AdminJoiningForms />} />
              <Route path="client-inquiries" element={<AdminInquiries />} />
              <Route path="crm/clients" element={<AdminClients />} />
              <Route path="crm/companies" element={<AdminCrmCompanies />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="contacts" element={<AdminContacts />} />
              <Route path="jobs" element={<AdminJobs />} />
              <Route path="tasks" element={<AdminTasks />} />
              <Route path="interview-tasks" element={<ProjectTaskAssignment />} />
              <Route
                path="recruiter-workspace"
                element={<RecruiterWorkspace />}
              />
              <Route
                path="employee-verification"
                element={<AdminEmployeeVerification />}
              />
              {/* Merged in from D RTPN */}
              <Route path="hr-partners" element={<AdminHrPartners />} />
              <Route path="kyc" element={<AdminKyc />} />
              <Route path="support-tickets" element={<AdminSupportTickets />} />
              <Route path="hr-support-chat" element={<AdminSupportChat />} />
              <Route
                path="candidate-submissions"
                element={<AdminCandidateSubmissions />}
              />
              <Route path="invoices" element={<AdminInvoices />} />
              <Route path="finance" element={<AdminFinance />} />
              <Route
                path="finance/collections"
                element={<AdminCollections />}
              />
              <Route path="ai-tools" element={<AdminAI />} />
              <Route path="automation" element={<AdminAutomation />} />
              <Route path="proposals" element={<ProposalBuilder pdfMode={false} />} />
              <Route path="resource-center" element={<AdminResourceCenter />} />
              <Route path="sops" element={<SopCenter />} />
              <Route path="sops/:id" element={<SopCenter />} />
              <Route path="sop-inbox" element={<SopInbox />} />
              <Route path="client-chat" element={<AdminClientChat />} />
              <Route path="candidate-chat" element={<AdminCandidateChat />} />

              <Route element={<RoleRoute allowedRoles={["superadmin"]} />}>
                <Route path="users" element={<AdminUsers />} />
                <Route path="branches" element={<AdminBranches />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="audit-logs" element={<AdminAuditLogs />} />
                <Route path="backups" element={<AdminBackup />} />
              </Route>
            </Route>
          </Route>

          {/* =============== CANDIDATE PORTAL =============== */}
          <Route path="/candidate/login" element={<CandidateLogin />} />
          <Route path="/candidate/register" element={<CandidateRegister />} />
          <Route path="/candidate" element={<CandidatePortalLayout />}>
            <Route index element={<CandidateDashboard />} />
            <Route path="dashboard" element={<CandidateDashboard />} />
            <Route path="profile" element={<CandidateProfile />} />
            {/* Merged in from D RTPN */}
            <Route path="kyc" element={<KycDocuments />} />
            <Route path="support-tickets" element={<SupportTickets />} />
            <Route path="applications" element={<CandidateApplications />} />
            <Route path="interviews" element={<CandidateInterviews />} />
            <Route path="interview-tasks" element={<InterviewTasks />} />
            <Route path="chat" element={<CandidateChat />} />
            <Route path="onboarding" element={<CandidateOnboarding />} />
            <Route path="joining-form" element={<EmployeeJoiningForm />} />
            <Route
              path="joining-tracker"
              element={<CandidateJoiningTracker />}
            />
            {/* AI Resume Builder & Resource Center now render inside the
                candidate dashboard shell (sidebar/header stay visible)
                instead of navigating away to a standalone page. */}
            <Route path="resume-builder" element={<ResumeBuilder />} />
            <Route path="resource-center" element={<ResourceCenter />} />
            <Route path="sops" element={<SopCenter />} />
            <Route path="sops/:id" element={<SopCenter />} />
            <Route path="sop-inbox" element={<SopInbox />} />
            <Route
              path="cover-letter-builder"
              element={<CoverLetterBuilder />}
            />
            <Route path="resume-checker" element={<ResumeChecker />} />
          </Route>

          {/* =============== HR PARTNER PORTAL (merged in from D RTPN) ===============
              Login goes through the SAME /login page (see dashboardPathForRole in
              Login.jsx) — no second login screen, no second auth session. */}
          <Route
            path="/hr-partner/login"
            element={<Navigate to="/login" replace />}
          />
          <Route element={<RoleRoute allowedRoles={["hr_partner"]} />}>
            <Route path="/hr-partner" element={<HrPartnerPortalLayout />}>
              <Route index element={<HrPartnerDashboard />} />
              <Route path="dashboard" element={<HrPartnerDashboard />} />
              <Route path="profile" element={<HrPartnerProfile />} />
              <Route path="vacancies" element={<HrPartnerVacancies />} />
              <Route path="submissions" element={<HrPartnerSubmissions />} />
              <Route path="hiring-tracker" element={<HrPartnerHiringTracker />} />
              <Route path="chat" element={<HrPartnerSupportChat />} />
              <Route path="chat/admin" element={<HrPartnerSupportChat />} />
              <Route path="chat/candidates" element={<HrPartnerChat defaultTab="candidate" />} />
              <Route path="chat/clients" element={<HrPartnerChat defaultTab="client" />} />
              <Route path="chat/support" element={<HrPartnerSupportChat />} />
              <Route path="kyc" element={<KycDocuments />} />
              <Route path="wallet" element={<HrPartnerWallet />} />
              <Route path="support-tickets" element={<SupportTickets />} />
              <Route path="sops" element={<SopCenter />} />
              <Route path="sops/:id" element={<SopCenter />} />
              <Route path="sop-inbox" element={<SopInbox />} />
            </Route>
          </Route>

          {/* =============== CLIENT PORTAL =============== */}
          {/* If you want /client/login to redirect directly to Main Auth Login */}
          <Route
            path="/client/login"
            element={<Navigate to="/login" replace />}
          />
          <Route path="/client/register" element={<ClientRegister />} />
          <Route path="/client" element={<ClientPortalLayout />}>
            <Route index element={<ClientDashboard />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="hiring-tracker" element={<ClientHiringTracker />} />
            <Route path="requirements" element={<ClientRequirements />} />
            <Route path="submissions" element={<ClientSubmissions />} />
            <Route path="interviews" element={<ClientInterviews />} />
            <Route path="chat" element={<ClientChat />} />
            <Route path="invoices" element={<ClientInvoices />} />
            <Route path="hrms-plans" element={<ClientHrmsPlans />} />
            <Route path="profile" element={<ClientProfile />} />
            {/* Merged in from D RTPN */}
            <Route path="analytics" element={<ClientAnalytics />} />
            <Route path="proposal" element={<ProposalBuilder />} />
            <Route path="proposal-pdf" element={<ProposalBuilder pdfMode />} />
            <Route path="sops" element={<SopCenter />} />
            <Route path="sops/:id" element={<SopCenter />} />
            <Route path="sop-inbox" element={<SopInbox />} />
            <Route path="support-tickets" element={<SupportTickets />} />
            <Route path="kyc" element={<KycDocuments />} />
          </Route>
        </Routes>
      </main>
      {!isPortal && !isAuthPage && <Footer />}
      {/* AI assistants are global — public pages and every authenticated
          portal use the exact same widgets and behavior as the landing page. */}
      {!isAuthPage && <VoiceAssistant />}
      {!isAuthPage && <ChatAssistant />}
      <IncomingCallListener />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <PageIntro />
      <ScrollMotion />
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </Router>
  );
}

export default App;
