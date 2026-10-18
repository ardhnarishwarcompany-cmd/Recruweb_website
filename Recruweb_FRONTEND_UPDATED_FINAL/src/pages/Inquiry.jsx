import { useState } from "react";
import ScrollIndicator from "../components/ScrollIndicator";
import { api } from "../utils/api";

const Inquiry = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    designation: "",
    industry: "",
    positionsNeeded: "",
    requirement: "",
    source: "website",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await api.leads.submit({
        ...formData,
        positionsNeeded: formData.positionsNeeded || null,
      });
      if (response.success) {
        setSuccessMessage(response.message);
        setFormData({
          name: "",
          email: "",
          phone: "",
          companyName: "",
          designation: "",
          industry: "",
          positionsNeeded: "",
          requirement: "",
          source: "website",
        });
      } else {
        setErrorMessage(response.message || "Failed to submit your inquiry");
      }
    } catch {
      setErrorMessage("Failed to submit your inquiry. Please try again.");
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <section className="hero" style={{ minHeight: "50vh", paddingTop: "140px" }}>
        <div className="hero-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">New Inquiry</span>
            <h1 className="section-title" style={{ fontSize: "48px" }}>
              Tell Us About Your Hiring Needs
            </h1>
            <p className="section-subtitle">
              Share a few details and our team will reach out with a tailored
              recruitment plan.
            </p>
          </div>
        </div>
        <ScrollIndicator />
      </section>

      <section className="section section-alt">
        <div className="container">
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div className="form-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="e.g. HR Manager"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter your company name"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div className="form-group">
                  <label>Industry</label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="e.g. IT Services"
                  />
                </div>
                <div className="form-group">
                  <label>Positions Needed</label>
                  <input
                    type="number"
                    min="1"
                    name="positionsNeeded"
                    value={formData.positionsNeeded}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>How did you hear about us?</label>
                <select name="source" value={formData.source} onChange={handleChange}>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="social-media">Social Media</option>
                  <option value="event">Event</option>
                  <option value="job-portal">Job Portal</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tell us about your requirement</label>
                <textarea
                  name="requirement"
                  value={formData.requirement}
                  onChange={handleChange}
                  placeholder="Roles, skills, timelines, or anything else we should know..."
                ></textarea>
              </div>

              {successMessage && <div className="form-success">{successMessage}</div>}
              {errorMessage && <div className="form-error">{errorMessage}</div>}

              <button type="submit" className="form-submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Inquiry"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Inquiry;
