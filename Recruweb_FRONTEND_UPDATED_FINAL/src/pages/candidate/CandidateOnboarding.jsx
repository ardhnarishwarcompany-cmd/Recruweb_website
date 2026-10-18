import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const emptyForm = {
  employeeId: "",
  joiningDate: "",
  department: "",
  designation: "",
  reportingManager: "",
  dateOfBirth: "",
  gender: "",
  maritalStatus: "",
  bloodGroup: "",
  personalEmail: "",
  phone: "",
  alternatePhone: "",
  currentAddress: {
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  },
  permanentAddress: {
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  },
  aadharNumber: "",
  panNumber: "",
  bankDetails: {
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
  },
  emergencyContact: { name: "", relationship: "", phone: "" },
  declaration: false,
};

const nested = (form, path, value) => {
  const [group, field] = path.split(".");
  return { ...form, [group]: { ...form[group], [field]: value } };
};

export default function CandidateOnboarding() {
  const [status, setStatus] = useState(null);
  const [eligible, setEligible] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.candidatePortal.getOnboarding().then((res) => {
      if (res?.success && res.data) {
        setStatus(res.data.status || null);
        setEligible(Boolean(res.data.eligible));
        setCanEdit(Boolean(res.data.canEdit));
        if (res.data.status || res.data.joining) {
          setForm({ ...emptyForm, ...res.data });
        }
      } else if (res?.success) {
        setEligible(false);
        setCanEdit(false);
      }
      setLoading(false);
    });
  }, []);

  const handleChange = (name, value) => {
    if (name.includes(".")) {
      setForm((f) => nested(f, name, value));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.declaration) {
      setMessage("Please accept the declaration before submitting.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    const res = await api.candidatePortal.submitOnboarding(form);
    if (res?.success) {
      setStatus(res.data.status);
      setEligible(true);
      setCanEdit(false);
      setMessage("Onboarding form submitted successfully. Admin review is now pending.");
    } else {
      setMessage(res?.message || "Failed to submit onboarding form.");
    }
    setSubmitting(false);
  };

  if (loading)
    return (
      <div className="light-cand-onb-container">
        <div className="cand-loading-state">
          <span className="cand-loader"></span> Loading onboarding status...
        </div>
      </div>
    );

  if (!eligible) {
    return (
      <div className="light-cand-onb-container">
        <div className="cand-particles-container">
          {[...Array(14)].map((_, i) => (
            <div
              key={i}
              className="cand-particle"
              style={{
                left: `${(i * 7.5) % 100}%`,
                animationDelay: `${(i * 0.4) % 5}s`,
                animationDuration: `${12 + (i % 6)}s`,
              }}
            ></div>
          ))}
        </div>
        <div className="cand-header-3d">
          <div className="card-bg-light-glow"></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h1 className="cand-title">
              Onboarding Form <span className="gradient-text">— Locked</span>
            </h1>
          </div>
          <div className="card-glow-bar"></div>
        </div>
        <div className="cand-card-3d" style={{ textAlign: "center", padding: "60px 20px", maxWidth: "600px", margin: "0 auto" }}>
          <div className="card-bg-light-glow"></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
            <h3 style={{ color: "#0f172a", fontSize: "20px", fontWeight: "800", marginBottom: "10px" }}>
              Onboarding is not available yet
            </h3>
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0, fontWeight: "600" }}>
              The onboarding form will appear here after your offer is released.
            </p>
          </div>
          <div className="card-glow-bar"></div>
        </div>
      </div>
    );
  }

  if (status && !canEdit) {
    const approved = status === "approved";
    return (
      <div className="light-cand-onb-container">
        <div className="cand-particles-container">
          {[...Array(14)].map((_, i) => (
            <div
              key={i}
              className="cand-particle"
              style={{
                left: `${(i * 7.5) % 100}%`,
                animationDelay: `${(i * 0.4) % 5}s`,
                animationDuration: `${12 + (i % 6)}s`,
              }}
            ></div>
          ))}
        </div>
        <div className="cand-header-3d">
          <div className="card-bg-light-glow"></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h1 className="cand-title">
              Candidate Onboarding <span className="gradient-text">— Portal</span>
            </h1>
          </div>
          <div className="card-glow-bar"></div>
        </div>
        <div
          className="cand-card-3d"
          style={{ textAlign: "center", padding: "60px 20px", maxWidth: "600px", margin: "0 auto" }}
        >
          <div className="card-bg-light-glow"></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
            <h3
              style={{ color: "#0f172a", fontSize: "20px", fontWeight: "800", marginBottom: "10px" }}
            >
              {approved ? "Onboarding Approved — Welcome to the Team!" : "Onboarding Form Submitted"}
            </h3>
            <p
              style={{ color: "#334155", fontSize: "14px", marginBottom: "8px", fontWeight: "700" }}
            >
              Current submission status:{" "}
              <strong style={{ textTransform: "capitalize", color: "#059669" }}>
                {status.replace(/-/g, " ")}
              </strong>
            </p>
            <p style={{ color: "#64748b", fontSize: "13.5px", margin: 0, fontWeight: "600" }}>
              {approved
                ? "Admin has approved your onboarding. Your candidate profile is now marked as a New Joiner."
                : "Your onboarding form is with Admin for review. You cannot edit it while it is under review."}
            </p>
          </div>
          <div className="card-glow-bar"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="light-cand-onb-container">
      {/* Live Floating Particles Background */}
      <div className="cand-particles-container">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="cand-particle"
            style={{
              left: `${(i * 7.5) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${12 + (i % 6)}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            Onboarding Form{" "}
            <span className="gradient-text">— Career Portal</span>
          </h1>
          <p className="cand-subtitle">
            This form unlocks once your offer letter has been released. Fill in
            your joining and employment details below.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {status === "rejected" && (
        <div
          className="cand-card-3d"
          style={{
            marginBottom: "24px",
            borderColor: "#fca5a5",
            background: "linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)",
            padding: "20px 28px",
          }}
        >
          <div className="card-bg-light-glow"></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <strong style={{ color: "#dc2626", fontWeight: "800" }}>Admin requested changes.</strong>
            <p style={{ color: "#475569", margin: "6px 0 0", fontSize: "13.5px", fontWeight: "600" }}>
              Correct the information below and submit the onboarding form again.
            </p>
          </div>
          <div className="card-glow-bar"></div>
        </div>
      )}

      {/* Glass Form Card */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <form onSubmit={submit} className="cand-form-body" style={{ position: 'relative', zIndex: 2 }}>
          <Section title="💼 Employment Details">
            <Row>
              <Field label="Joining Date *">
                <input
                  type="date"
                  required
                  value={form.joiningDate || ""}
                  onChange={(e) => handleChange("joiningDate", e.target.value)}
                  className="cand-input"
                />
              </Field>
              <Field label="Department">
                <input
                  value={form.department || ""}
                  onChange={(e) => handleChange("department", e.target.value)}
                  className="cand-input"
                  placeholder="e.g. Engineering"
                />
              </Field>
              <Field label="Designation">
                <input
                  value={form.designation || ""}
                  onChange={(e) => handleChange("designation", e.target.value)}
                  className="cand-input"
                  placeholder="e.g. Senior Developer"
                />
              </Field>
              <Field label="Reporting Manager">
                <input
                  value={form.reportingManager || ""}
                  onChange={(e) =>
                    handleChange("reportingManager", e.target.value)
                  }
                  className="cand-input"
                  placeholder="Manager Name"
                />
              </Field>
            </Row>
          </Section>

          <Section title="👤 Personal Details">
            <Row>
              <Field label="Date of Birth">
                <input
                  type="date"
                  value={form.dateOfBirth || ""}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  className="cand-input"
                />
              </Field>
              <Field label="Gender">
                <select
                  value={form.gender || ""}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="cand-input"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Personal Email">
                <input
                  type="email"
                  value={form.personalEmail || ""}
                  onChange={(e) =>
                    handleChange("personalEmail", e.target.value)
                  }
                  className="cand-input"
                  placeholder="john@example.com"
                />
              </Field>
              <Field label="Phone *">
                <input
                  required
                  value={form.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="cand-input"
                  placeholder="+91 9876543210"
                />
              </Field>
            </Row>
          </Section>

          <Section title="📍 Current Address">
            <Row>
              <Field label="Street">
                <input
                  value={form.currentAddress.street}
                  onChange={(e) =>
                    handleChange("currentAddress.street", e.target.value)
                  }
                  className="cand-input"
                  placeholder="House / Street"
                />
              </Field>
              <Field label="City">
                <input
                  value={form.currentAddress.city}
                  onChange={(e) =>
                    handleChange("currentAddress.city", e.target.value)
                  }
                  className="cand-input"
                  placeholder="City"
                />
              </Field>
              <Field label="State">
                <input
                  value={form.currentAddress.state}
                  onChange={(e) =>
                    handleChange("currentAddress.state", e.target.value)
                  }
                  className="cand-input"
                  placeholder="State"
                />
              </Field>
              <Field label="Pincode">
                <input
                  value={form.currentAddress.pincode}
                  onChange={(e) =>
                    handleChange("currentAddress.pincode", e.target.value)
                  }
                  className="cand-input"
                  placeholder="Pin Code"
                />
              </Field>
            </Row>
          </Section>

          <Section title="🪪 ID Proof">
            <Row>
              <Field label="Aadhaar Number">
                <input
                  value={form.aadharNumber || ""}
                  onChange={(e) => handleChange("aadharNumber", e.target.value)}
                  className="cand-input"
                  placeholder="XXXX XXXX XXXX"
                />
              </Field>
              <Field label="PAN Number">
                <input
                  value={form.panNumber || ""}
                  onChange={(e) => handleChange("panNumber", e.target.value)}
                  className="cand-input"
                  placeholder="ABCDE1234F"
                />
              </Field>
            </Row>
          </Section>

          <Section title="🏦 Bank Details">
            <Row>
              <Field label="Bank Name">
                <input
                  value={form.bankDetails.bankName}
                  onChange={(e) =>
                    handleChange("bankDetails.bankName", e.target.value)
                  }
                  className="cand-input"
                  placeholder="Bank Name"
                />
              </Field>
              <Field label="Account Number">
                <input
                  value={form.bankDetails.accountNumber}
                  onChange={(e) =>
                    handleChange("bankDetails.accountNumber", e.target.value)
                  }
                  className="cand-input"
                  placeholder="Account Number"
                />
              </Field>
              <Field label="IFSC Code">
                <input
                  value={form.bankDetails.ifscCode}
                  onChange={(e) =>
                    handleChange("bankDetails.ifscCode", e.target.value)
                  }
                  className="cand-input"
                  placeholder="IFSC Code"
                />
              </Field>
              <Field label="Account Holder Name">
                <input
                  value={form.bankDetails.accountHolderName}
                  onChange={(e) =>
                    handleChange(
                      "bankDetails.accountHolderName",
                      e.target.value,
                    )
                  }
                  className="cand-input"
                  placeholder="Full Name as in Bank"
                />
              </Field>
            </Row>
          </Section>

          <Section title="🚨 Emergency Contact">
            <Row>
              <Field label="Contact Name">
                <input
                  value={form.emergencyContact.name}
                  onChange={(e) =>
                    handleChange("emergencyContact.name", e.target.value)
                  }
                  className="cand-input"
                  placeholder="Relative Name"
                />
              </Field>
              <Field label="Relationship">
                <input
                  value={form.emergencyContact.relationship}
                  onChange={(e) =>
                    handleChange(
                      "emergencyContact.relationship",
                      e.target.value,
                    )
                  }
                  className="cand-input"
                  placeholder="e.g. Father / Spouse"
                />
              </Field>
              <Field label="Emergency Phone">
                <input
                  value={form.emergencyContact.phone}
                  onChange={(e) =>
                    handleChange("emergencyContact.phone", e.target.value)
                  }
                  className="cand-input"
                  placeholder="Phone Number"
                />
              </Field>
            </Row>
          </Section>

          <div className="declaration-box" style={{ background: '#f1f5f9', border: '1.5px solid #cbd5e1', padding: '16px', borderRadius: '14px' }}>
            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#334155', fontWeight: '700', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.declaration}
                onChange={(e) => handleChange("declaration", e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#4f46e5' }}
              />
              <span>
                I declare that the information provided above is true and
                accurate to the best of my knowledge.
              </span>
            </label>
          </div>

          <button className="cv-action-btn primary glow-btn" disabled={submitting} style={{ justifyContent: 'center', width: '100%' }}>
            {submitting
              ? "Submitting Onboarding Form..."
              : "🚀 Submit Onboarding Form ✨"}
          </button>

          {message && <div className="cand-msg-banner">ℹ️ {message}</div>}
        </form>
        <div className="card-glow-bar"></div>
      </div>

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-cand-onb-container {
          position: relative;
          background: #f8fafc;
          min-height: 100vh;
          padding: 40px 3vw 80px;
          color: #0f172a;
          font-family: var(--font-body);
          overflow-x: hidden;
        }

        /* Live Floating Particles Background */
        .cand-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .cand-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          opacity: 0.6;
          animation: floatCandParticle linear infinite;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        @keyframes floatCandParticle {
          0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }

        .cand-header-3d {
          position: relative;
          z-index: 2;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 22px;
          padding: 28px 32px;
          margin-bottom: 24px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .cand-header-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-5px);
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.14);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .card-bg-light-glow {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 90px;
          height: 90px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .card-glow-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3.5px;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .cand-header-3d:hover .card-glow-bar,
        .cand-card-3d:hover .card-glow-bar {
          transform: scaleX(1);
        }

        .cand-title {
          font-size: 30px;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 6px;
          letter-spacing: -0.5px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cand-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          font-weight: 600;
        }

        /* Glass Form Card */
        .cand-card-3d {
          position: relative;
          z-index: 2;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 22px;
          padding: 32px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .cand-card-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-5px);
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.14);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .cand-form-body {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .section-box {
          border-bottom: 1.5px solid #e2e8f0;
          padding-bottom: 20px;
        }

        .section-heading {
          font-size: 17px;
          font-weight: 800;
          color: #4f46e5;
          margin: 0 0 16px;
        }

        .row-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }

        .input-group-3d {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group-3d label {
          font-size: 12.5px;
          font-weight: 800;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .cand-input {
          width: 100%;
          padding: 12px 14px;
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          color: #0f172a;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }

        .cand-input:focus {
          border-color: #6366f1;
          background: #ffffff;
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.15);
        }

        .cv-action-btn {
          padding: 14px 24px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 14.5px;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .cv-action-btn.primary {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
          box-shadow: 0 6px 18px rgba(79, 70, 229, 0.25);
        }

        .cv-action-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(79, 70, 229, 0.4);
        }

        .cv-action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cand-msg-banner {
          background: #e0e7ff;
          border: 1.5px solid #c7d2fe;
          color: #4338ca;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 700;
          text-align: center;
        }

        .cand-loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 80vh;
          color: #4f46e5;
          font-weight: 800;
        }

        .cand-loader {
          width: 24px;
          height: 24px;
          border: 3px solid #4f46e5;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const Section = ({ title, children }) => (
  <div className="section-box">
    <h3 className="section-heading">{title}</h3>
    {children}
  </div>
);

const Row = ({ children }) => <div className="row-grid">{children}</div>;

const Field = ({ label, children }) => (
  <div className="input-group-3d">
    <label>{label}</label>
    {children}
  </div>
);