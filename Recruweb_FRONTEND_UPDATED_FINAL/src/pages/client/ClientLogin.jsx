import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_URL, setToken, setRefreshToken } from "../../utils/api";

export default function ClientLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const changeHandler = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/login`, form);

      if (!res.data.success) {
        setError(res.data.message || "Login failed");
        return;
      }

      const user = res.data.data.user;
      const token = res.data.data.accessToken || res.data.data.token;

      const roles = user.roles?.length ? user.roles : [user.role];
      if (!roles.includes("client")) {
        setError(
          "This login is for client companies only. Please use the correct login page for your account type.",
        );
        return;
      }

      login(user, token);
      setToken(token);
      setRefreshToken(res.data.data.refreshToken);
      navigate("/client/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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
        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
          Client Login
        </h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
          Track requirements, candidates, interviews & invoices
        </p>

        {error && (
          <div
            style={{
              background: "#fdecea",
              color: "#b3261e",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "15px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={changeHandler}
          required
          style={inputStyle}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={changeHandler}
          required
          style={inputStyle}
        />

        <p
          style={{
            textAlign: "right",
            marginTop: "-6px",
            marginBottom: "14px",
            fontSize: "13px",
          }}
        >
          <Link to="/forgot-password" style={{ color: "#1d4ed8" }}>
            Forgot password?
          </Link>
        </p>

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "14px" }}>
          New client? <Link to="/client/register">Create a client account</Link>
        </p>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "14px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "11px",
  background: "#1d4ed8",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: 600,
};
