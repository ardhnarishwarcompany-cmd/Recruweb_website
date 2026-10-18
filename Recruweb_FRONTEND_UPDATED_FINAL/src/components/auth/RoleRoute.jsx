import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RoleRoute({ allowedRoles }) {
  const { user, isAuthenticated, getDashboardPath } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = String(user.role || user.roles?.[0] || "").toLowerCase();
  if (!allowedRoles.includes(role)) {
    return <Navigate to={getDashboardPath()} replace />;
  }

  return <Outlet />;
}
