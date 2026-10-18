import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_URL, setToken, setRefreshToken } from "../../utils/api";

// Mirrors backend config/roles.js ROLE_GROUPS.STAFF — every internal role
// allowed into the Admin portal.
const STAFF_ROLES = [
  "superadmin",
  "admin",
  "recruiter",
  "hr",
  "hr_manager",
  "recruitment_manager",
  "finance_manager",
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const changeHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/auth/login`, form);

      if (!res.data.success) {
        setError(res.data.message || "Login Failed");
        return;
      }

      const user = res.data.data.user;
      const token = res.data.data.accessToken || res.data.data.token;

      const roles = user.roles?.length ? user.roles : [user.role];
      if (!roles.some((r) => STAFF_ROLES.includes(r))) {
        setError(
          "This login is for staff accounts only. Please use the Client or Candidate login page for your account type.",
        );
        return;
      }

      // Keep both token stores in sync: AuthContext (route guards) and
      // utils/api's TOKEN_KEY (every admin page's actual data calls).
      login(user, token, res.data.data.refreshToken);
      setToken(token);
      setRefreshToken(res.data.data.refreshToken);

      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f6f9",
      }}
    >
      <form
        onSubmit={submitHandler}
        style={{
          width: "380px",
          background: "#fff",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 0 20px rgba(0,0,0,.1)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "25px",
          }}
        >
          Admin Login
        </h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={changeHandler}
          required
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={changeHandler}
          required
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
