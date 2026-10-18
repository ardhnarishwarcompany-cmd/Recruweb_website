import { createContext, useContext, useState } from "react";
import {
  setToken,
  setRefreshToken,
  clearToken,
  clearRefreshToken,
} from "../utils/api";

const AuthContext = createContext();

// Every internal staff role lands on the Admin portal. Keeping this list in
// one place means new roles only need to be added here + backend config/roles.js.
const STAFF_ROLES = [
  "superadmin",
  "admin",
  "recruiter",
  "hr",
  "hr_manager",
  "recruitment_manager",
  "finance_manager",
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (!storedUser || !storedToken) return null;

    try {
      // Repair sessions created by older builds where the API token was only
      // stored under `token`. This prevents a visible logged-in UI from
      // sending an unrelated/stale token and receiving 401 from the API.
      setToken(storedToken);
      const storedRefresh = localStorage.getItem("refreshToken");
      if (storedRefresh) setRefreshToken(storedRefresh);
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  });
  const [loading] = useState(false);

  // userData should contain: id, email, role (candidate/client/admin/...), name, etc.
  // Keeps BOTH token stores in sync — AuthContext's own "token"/"user" keys
  // (used by ProtectedRoute/RoleRoute) and utils/api's TOKEN_KEY (used by
  // every actual data call across the Admin/Candidate/Client portals).
  // Without this, a user could appear "logged in" but every portal API call
  // would silently fail with 401 and bounce them back to the login page.
  const login = (userData, token, refreshToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setToken(token);
    if (refreshToken) setRefreshToken(refreshToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    clearToken();
    clearRefreshToken();
    setUser(null);
  };

  // Normalizes a user object's role: prefers the legacy `role` field, falls
  // back to the first entry in `roles` (RBAC array) if present.
  const resolveRole = (u) =>
    (u?.role || u?.roles?.[0] || "").toString().toLowerCase();

  const getDashboardPath = () => {
    if (!user) return "/";

    const role = resolveRole(user);

    if (STAFF_ROLES.includes(role)) return "/admin/dashboard";
    if (role === "candidate") return "/candidate/dashboard";
    if (role === "client") return "/client/dashboard";
    if (role === "hr_partner") return "/hr-partner/dashboard";
    return "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
        getDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
