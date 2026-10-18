import { useEffect, useState } from "react";
import { api } from "../utils/api";
import "./inquiry-popup.css";

const emptyClient = {
  name: "",
  email: "",
  phone: "",
  companyName: "",
  designation: "",
  industry: "",
  positionsNeeded: "",
  requirement: "",
  source: "website",
};

const emptyCandidate = {
  name: "",
  email: "",
  phone: "",
  currentRole: "",
  preferredIndustry: "",
  experience: "",
  location: "",
  message: "",
};

export default function InquiryPopup({ delay = 1200 }) {
  const [open, setOpen] = useState(false);
  const [userType, setUserType] = useState("client");
  const [client, setClient] = useState(emptyClient);
  const [candidate, setCandidate] = useState(emptyCandidate);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Open shortly after the page loads — on every visit and every refresh.
  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(true), delay);
    return () => window.clearTimeout(timer);
  }, [delay]);

  const close = () => setOpen(false);

  // Esc to close + lock page scroll while the popup is open.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const onClientChange = (e) => setClient({ ...client, [e.target.name]: e.target.value });
  const onCandidateChange = (e) => setCandidate({ ...candidate, [e.target.name]: e.target.value });

  const switchType = (type) => {
    setUserType(type);
    setSuccess("");
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess("");
    setError("");

    // Both audiences go through the same inquiry (lead) endpoint the
    // /inquiry page already uses, so no backend change is needed.
    // Candidate inquiries are tagged in the requirement text so the
    // admin team can tell them apart in Inquiries / Leads.
    let payload;
    if (userType === "client") {
      payload = { ...client, positionsNeeded: client.positionsNeeded || null };
    } else {
      const details = [
        "[CANDIDATE INQUIRY]",
        candidate.experience && `Experience: ${candidate.experience}`,
        candidate.location && `Location: ${candidate.location}`,
        candidate.preferredIndustry && `Looking for: ${candidate.preferredIndustry}`,
        candidate.message && `Message: ${candidate.message}`,
      ]
        .filter(Boolean)
        .join("\n");
      payload = {
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        designation: candidate.currentRole,
        industry: candidate.preferredIndustry,
        requirement: details,
        source: "website",
      };
    }

    try {
      const res = await api.leads.submit(payload);
      if (res.success) {
        setSuccess(res.message || "Thank you! Our team will get back to you shortly.");
        if (userType === "client") setClient(emptyClient);
        else setCandidate(emptyCandidate);
      } else {
        setError(res.message || "Failed to submit your inquiry");
      }
    } catch {
      setError("Failed to submit your inquiry. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="iqp-backdrop" onClick={close} role="presentation">
      <div
        className="iqp-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="iqp-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="iqp-close" onClick={close} aria-label="Close inquiry form">
          ×
        </button>

        <div className="iqp-head">
          <span className="iqp-tag">New Inquiry</span>
          <h2 id="iqp-title">How can we help you today?</h2>
          <p>Share a few details and our team will reach out shortly.</p>
        </div>

        <div className="iqp-switch" role="tablist" aria-label="Inquiry type">
          <button
            type="button"
            role="tab"
            aria-selected={userType === "client"}
            className={userType === "client" ? "active" : ""}
            onClick={() => switchType("client")}
          >
            🏢 I'm Hiring (Client)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={userType === "candidate"}
            className={userType === "candidate" ? "active" : ""}
            onClick={() => switchType("candidate")}
          >
            👤 I'm a Candidate
          </button>
        </div>

        <form className="iqp-form" onSubmit={submit}>
          {userType === "client" ? (
            <>
              <div className="iqp-row">
                <label>
                  Your Name
                  <input name="name" value={client.name} onChange={onClientChange} placeholder="Enter your full name" required />
                </label>
                <label>
                  Designation
                  <input name="designation" value={client.designation} onChange={onClientChange} placeholder="e.g. HR Manager" />
                </label>
              </div>
              <div className="iqp-row">
                <label>
                  Email Address
                  <input type="email" name="email" value={client.email} onChange={onClientChange} placeholder="Enter your email" required />
                </label>
                <label>
                  Phone Number
                  <input type="tel" name="phone" value={client.phone} onChange={onClientChange} placeholder="Enter your phone number" />
                </label>
              </div>
              <label>
                Company Name
                <input name="companyName" value={client.companyName} onChange={onClientChange} placeholder="Enter your company name" />
              </label>
              <div className="iqp-row">
                <label>
                  Industry
                  <input name="industry" value={client.industry} onChange={onClientChange} placeholder="e.g. IT Services" />
                </label>
                <label>
                  Positions Needed
                  <input type="number" min="1" name="positionsNeeded" value={client.positionsNeeded} onChange={onClientChange} placeholder="e.g. 5" />
                </label>
              </div>
              <label>
                Tell us about your requirement
                <textarea name="requirement" value={client.requirement} onChange={onClientChange} rows={3} placeholder="Roles, skills, timelines, or anything else we should know..." />
              </label>
            </>
          ) : (
            <>
              <div className="iqp-row">
                <label>
                  Your Name
                  <input name="name" value={candidate.name} onChange={onCandidateChange} placeholder="Enter your full name" required />
                </label>
                <label>
                  Current / Last Role
                  <input name="currentRole" value={candidate.currentRole} onChange={onCandidateChange} placeholder="e.g. Software Engineer" />
                </label>
              </div>
              <div className="iqp-row">
                <label>
                  Email Address
                  <input type="email" name="email" value={candidate.email} onChange={onCandidateChange} placeholder="Enter your email" required />
                </label>
                <label>
                  Phone Number
                  <input type="tel" name="phone" value={candidate.phone} onChange={onCandidateChange} placeholder="Enter your phone number" />
                </label>
              </div>
              <div className="iqp-row">
                <label>
                  Experience
                  <input name="experience" value={candidate.experience} onChange={onCandidateChange} placeholder="e.g. Fresher / 3 years" />
                </label>
                <label>
                  Preferred Location
                  <input name="location" value={candidate.location} onChange={onCandidateChange} placeholder="e.g. Delhi NCR" />
                </label>
              </div>
              <label>
                Job Field / Industry You Are Looking For
                <input name="preferredIndustry" value={candidate.preferredIndustry} onChange={onCandidateChange} placeholder="e.g. IT, Sales, Hospitality" />
              </label>
              <label>
                Message
                <textarea name="message" value={candidate.message} onChange={onCandidateChange} rows={3} placeholder="Tell us what kind of opportunity you are looking for..." />
              </label>
            </>
          )}

          {success && <div className="iqp-alert iqp-success">{success}</div>}
          {error && <div className="iqp-alert iqp-error">{error}</div>}

          <button type="submit" className="iqp-submit" disabled={submitting}>
            {submitting ? "Submitting..." : userType === "client" ? "Submit Inquiry" : "Submit Details"}
          </button>
        </form>
      </div>
    </div>
  );
}
