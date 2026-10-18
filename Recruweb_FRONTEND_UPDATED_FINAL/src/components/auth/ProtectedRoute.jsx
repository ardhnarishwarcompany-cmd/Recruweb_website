import { Navigate, Outlet } from "react-router-dom";

// Any of the 7 internal staff roles (everything except Client/Candidate) may
// enter the /admin section. This mirrors ROLE_GROUPS.STAFF on the backend —
// it's a UX-level guard only; the backend's own RBAC middleware is the real
// authorization boundary, so this just avoids flashing staff-only screens to
// a logged-in candidate/client before their API calls start failing.
const STAFF_ROLES = [
  "superadmin",
  "admin",
  "recruiter",
  "hr",
  "hr_manager",
  "recruitment_manager",
  "finance_manager",
];

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!STAFF_ROLES.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
