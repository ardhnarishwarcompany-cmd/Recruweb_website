import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../../utils/api";

// Email verification page. Recruweb's backend already had a link-token
// verify endpoint (GET /api/auth/verify-email/:token) but no frontend page
// consumed it — this page does both that AND the OTP-code alternative
// merged in from D RTPN (POST /api/auth/send-otp + /verify-otp), so users
// land on one screen either way they arrive (clicked link, or typing a code).
export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [linkStatus, setLinkStatus] = useState(token ? "checking" : "idle");
  const [linkMessage, setLinkMessage] = useState("");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/verify-email/${token}`);
        const data = await res.json();
        if (data.success) {
          setLinkStatus("success");
          setLinkMessage(data.message);
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setLinkStatus("error");
          setLinkMessage(data.message || "Verification link is invalid or has expired.");
        }
      } catch {
        setLinkStatus("error");
        setLinkMessage("Something went wrong verifying your email.");
      }
    })();
  }, [token, navigate]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setBusy(true);
    setOtpMessage("");
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setOtpMessage(data.message);
      setOtpSent(true);
    } catch {
      setOtpMessage("Failed to send verification code.");
    }
    setBusy(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setBusy(true);
    setOtpMessage("");
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      setOtpMessage(data.message);
      if (data.success) {
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch {
      setOtpMessage("Failed to verify code.");
    }
    setBusy(false);
  };

  if (token) {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>
          {linkStatus === "checking" && <p>Verifying your email…</p>}
          {linkStatus === "success" && <p style={{ color: "#4ade80" }}>{linkMessage}</p>}
          {linkStatus === "error" && <p style={{ color: "#f87171" }}>{linkMessage}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Verify your email</h1>
        <p style={styles.sub}>
          Check your inbox for a verification link, or enter your email below
          to get a 6-digit code instead.
        </p>

        {!otpSent ? (
          <form onSubmit={handleSendOtp} style={styles.form}>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
            <button type="submit" disabled={busy} style={styles.btn}>
              {busy ? "Sending…" : "Send verification code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={styles.form}>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={styles.input}
            />
            <button type="submit" disabled={busy} style={styles.btn}>
              {busy ? "Verifying…" : "Verify code"}
            </button>
          </form>
        )}

        {otpMessage && <p style={{ color: "#a5b4fc", marginTop: 12 }}>{otpMessage}</p>}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "#0b0f19", color: "#f8fafc", padding: 24,
  },
  card: {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16, padding: "32px 36px", maxWidth: 420, width: "100%",
  },
  h1: { fontSize: 22, fontWeight: 800, marginBottom: 8 },
  sub: { color: "#94a3b8", fontSize: 13.5, marginBottom: 20 },
  form: { display: "flex", gap: 10 },
  input: {
    flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 10, padding: "10px 12px", color: "#f8fafc",
  },
  btn: {
    background: "linear-gradient(135deg,#6366f1,#a855f7)", border: "none",
    borderRadius: 10, padding: "10px 18px", color: "#fff", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
  },
};
