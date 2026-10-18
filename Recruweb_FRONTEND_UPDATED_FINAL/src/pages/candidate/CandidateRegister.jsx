import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_URL, setToken, setRefreshToken } from "../../utils/api";

export default function CandidateRegister() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const changeHandler = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    if (!agreeTerms) {
      setError(
        "You must agree to the Terms & Conditions and Privacy Policy to continue.",
      );
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/register`, {
        ...form,
        role: "candidate",
      });

      if (!res.data.success) {
        setError(res.data.message || "Registration failed");
        return;
      }

      const user = res.data.data.user;
      const token = res.data.data.accessToken || res.data.data.token;

      login(user, token);
      setToken(token);
      setRefreshToken(res.data.data.refreshToken);
      navigate("/candidate/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Create Candidate Account
        </h2>

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
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={changeHandler}
          required
          style={inputStyle}
        />
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
          minLength={8}
          style={inputStyle}
        />

        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            marginBottom: "16px",
            fontSize: "13px",
            color: "#444",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            required
            style={{ marginTop: "3px" }}
          />
          <span>
            I agree to the{" "}
            <Link
              to="/terms-and-conditions"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms &amp; Conditions and Privacy Policy
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading || !agreeTerms}
          style={{
            ...buttonStyle,
            opacity: loading || !agreeTerms ? 0.6 : 1,
            cursor: loading || !agreeTerms ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "14px" }}>
          Already have an account? <Link to="/candidate/login">Login</Link>
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