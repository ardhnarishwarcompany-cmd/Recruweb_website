import { useState, useEffect } from "react";
import ScrollIndicator from "../components/ScrollIndicator";
import ContactChat from "../components/ContactChat";

const serviceSubjectMap = {
  industry: { subject: "services", label: "Industry Manpower" },
  facility: { subject: "services", label: "Facility Management" },
  hro: { subject: "services", label: "HR Outsourcing" },
  recruitment: { subject: "services", label: "Only Recruitment" },
  hospitality: { subject: "services", label: "Hospitality" },
  contractual: { subject: "services", label: "Contractual Hiring" },
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState("form");
  const [chatPrefill, setChatPrefill] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const service = params.get("service");
    if (service && serviceSubjectMap[service]) {
      const { subject, label } = serviceSubjectMap[service];
      setFormData((prev) => ({
        ...prev,
        subject,
        message: `I'm interested in ${label} services. Please provide more information.`,
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Send Message -> HR selection popup -> live chat with the chosen HR (HRMS)
  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setChatPrefill({ ...formData });
  };

  const handleChatStarted = () => {
    setSuccessMessage("Message sent! You're now connected with our HR team.");
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const contactCards = [
    {
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      title: "Phone",
      primary: "+91 9336532636",
      secondary: "Mon-Sat, 9:30 AM - 6:30 PM",
      color: "#10b981",
    },
    {
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      title: "Email",
      primary: "info@recruweb.com",
      secondary: "We reply within 24 hours",
      color: "#3b82f6",
    },
    {
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      title: "Office",
      primary: "H-112, Sector 63, Noida",
      secondary: "Nearby Electronic City Metro Station, UP",
      color: "#f59e0b",
    },
  ];

  const quickActions = [
    {
      icon: "💼",
      title: "Post a Job",
      desc: "Find your next hire",
      link: "/post-job",
    },
    {
      icon: "📄",
      title: "Apply for Jobs",
      desc: "Browse opportunities",
      link: "/jobs",
    },
    {
      icon: "📅",
      title: "Schedule Interview",
      desc: "Book a slot",
      link: "/schedule-interview",
    },
    {
      icon: "🤝",
      title: "Partner With Us",
      desc: "Business inquiries",
      link: "/contact",
    },
  ];

  const faqs = [
    {
      q: "What services does Recruweb offer?",
      a: "We offer end-to-end recruitment solutions including staffing, executive search, HR consulting, and interview scheduling services.",
    },
    {
      q: "How quickly can you fill a position?",
      a: "Most positions are filled within 2-4 weeks, depending on the seniority and specialization required.",
    },
    {
      q: "Do you charge for job postings?",
      a: "Basic job postings are free. Premium features like featured listings are available with our paid plans.",
    },
    {
      q: "Can I schedule an interview online?",
      a: "Yes! Use our Schedule Interview feature to book a convenient time slot with our team.",
    },
  ];

  return (
    <div className="contact-page-wrapper-light">
      {/* Live Particles Background */}
      <div className="contact-particles-container">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="contact-particle"
            style={{
              left: `${(i * 7.5) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${12 + (i % 6)}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Hero Section */}
      <section className="contact-hero-section-light">
        <div className="container">
          <div className="contact-hero-header">
            <div className="contact-badge">
              <span className="badge-dot"></span>
              <span>Get In Touch</span>
            </div>
            <h1 className="contact-hero-title">
              Let's Start a <span className="gradient-text">Conversation</span>
            </h1>
            <p className="contact-hero-subtitle">
              Have questions? We'd love to hear from you. Reach out and our team
              will get back to you promptly.
            </p>
          </div>
        </div>
        <ScrollIndicator />
      </section>

      {/* Quick Actions Grid */}
      <section className="quick-actions-section">
        <div className="container">
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <a href={action.link} key={index} className="quick-action-card-3d">
                <div className="card-bg-light-glow"></div>
                <span className="quick-action-icon">{action.icon}</span>
                <div className="action-text-info">
                  <h4>{action.title}</h4>
                  <p>{action.desc}</p>
                </div>
                <div className="card-glow-bar"></div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="contact-cards-section">
        <div className="container">
          <div className="contact-cards-grid">
            {contactCards.map((card, index) => (
              <div key={index} className="contact-card-box-3d">
                <div className="card-bg-light-glow"></div>
                <div
                  className="contact-card-icon"
                  style={{ background: `${card.color}15`, color: card.color }}
                >
                  {card.icon}
                </div>
                <div className="contact-card-content">
                  <h3>{card.title}</h3>
                  <p className="contact-card-primary">{card.primary}</p>
                  <p className="contact-card-secondary">{card.secondary}</p>
                </div>
                <div className="card-glow-bar"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Form & Interactive Content Section */}
      <section className="contact-main-section">
        <div className="container">
          <div className="contact-main-grid">
            {/* Left Column - Form & FAQ Tabs */}
            <div className="contact-left-col">
              <div className="contact-tabs-bar">
                <button
                  className={`tab-btn ${activeTab === "form" ? "active" : ""}`}
                  onClick={() => setActiveTab("form")}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Send Message</span>
                </button>
                <button
                  className={`tab-btn ${activeTab === "faq" ? "active" : ""}`}
                  onClick={() => setActiveTab("faq")}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>FAQs</span>
                </button>
              </div>

              {activeTab === "form" ? (
                <form className="contact-form-card-3d" onSubmit={handleSubmit}>
                  <div className="card-bg-light-glow"></div>
                  <h3>Send Us a Message</h3>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div className="form-group">
                      <label>Subject *</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="services">Services</option>
                        <option value="industry-manpower">Industry Manpower</option>
                        <option value="facility-management">Facility Management</option>
                        <option value="hr-outsourcing">HR Outsourcing</option>
                        <option value="only-recruitment">Only Recruitment</option>
                        <option value="hospitality">Hospitality</option>
                        <option value="contractual-hiring">Contractual Hiring</option>
                        <option value="pricing">Pricing</option>
                        <option value="support">Support</option>
                        <option value="careers">Careers</option>
                        <option value="partnership">Partnership</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                      rows="4"
                      required
                    ></textarea>
                  </div>

                  {successMessage && (
                    <div className="form-status-alert success">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="form-status-alert error">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner"></span>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        Send Message
                      </>
                    )}
                  </button>
                  <div className="card-glow-bar"></div>
                </form>
              ) : (
                <div className="faq-container-card-3d">
                  <div className="card-bg-light-glow"></div>
                  <h3>Frequently Asked Questions</h3>
                  <div className="faq-items-list">
                    {faqs.map((faq, index) => (
                      <div key={index} className="faq-item-box">
                        <h4>{faq.q}</h4>
                        <p>{faq.a}</p>
                      </div>
                    ))}
                  </div>
                  <div className="card-glow-bar"></div>
                </div>
              )}
            </div>

            {/* Right Column - Map & Extra Info */}
            <div className="contact-right-col">
              {/* Map Box */}
              <div className="map-card-wrapper-3d">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.5478!2d77.3815!3d28.6272!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5456e8c2555%3A0x5a5c7c8b9f3e4d!2sH-112%2C%20Sector%2063%2C%20Noida%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="240"
                  style={{ border: 0, borderRadius: "16px" }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Recruweb Office Location - H-112, Sector 63, Noida"
                ></iframe>
              </div>

              {/* Response Card */}
              <div className="info-glass-card-3d response">
                <div className="card-bg-light-glow"></div>
                <div className="info-icon-glow">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <h4>Quick Response Time</h4>
                  <p>
                    We typically respond within <strong>2-4 hours</strong>{" "}
                    during working hours.
                  </p>
                </div>
                <div className="card-glow-bar"></div>
              </div>

              {/* Social Channels */}
              <div className="info-glass-card-3d social">
                <div className="card-bg-light-glow"></div>
                <h4>Follow Our Journey</h4>
                <div className="social-icons-row">
                  <a
                    href="#"
                    className="social-badge linkedin"
                    title="LinkedIn"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a href="#" className="social-badge twitter" title="Twitter">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="social-badge facebook"
                    title="Facebook"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="social-badge instagram"
                    title="Instagram"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="https://wa.me/919336532636"
                    className="social-badge whatsapp"
                    title="WhatsApp"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </a>
                </div>
                <div className="card-glow-bar"></div>
              </div>

              {/* Call Direct Box */}
              <div className="urgent-call-box-3d">
                <div className="card-bg-light-glow"></div>
                <h4>Need Immediate Assistance?</h4>
                <p>Call us directly for urgent hiring or staffing inquiries.</p>
                <a href="tel:+919336532636" className="call-now-btn">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Call Now (+91 9336532636)
                </a>
                <div className="card-glow-bar"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {chatPrefill && (
        <div className="rw-chat-modal" role="dialog" aria-label="Live chat with HR">
          <div className="rw-chat-modal-card">
            <button
              type="button"
              className="rw-chat-modal-close"
              onClick={() => setChatPrefill(null)}
              aria-label="Close chat"
            >
              ×
            </button>
            <ContactChat
              active
              prefill={chatPrefill}
              onStarted={handleChatStarted}
              onCancel={() => setChatPrefill(null)}
            />
          </div>
        </div>
      )}
      <style>{`
        .rw-chat-modal{position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:2000;display:flex;align-items:center;justify-content:center;padding:16px}
        .rw-chat-modal-card{position:relative;width:min(440px,100%);height:min(600px,92vh);background:#fff;border-radius:24px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 30px 60px -15px rgba(102,126,234,.45)}
        .rw-chat-modal-card .cc-chat-head{padding-right:44px}
        .rw-chat-modal-close{position:absolute;top:8px;right:12px;z-index:10;background:none;border:0;font-size:26px;line-height:1;color:#64748b;cursor:pointer}

        .contact-page-wrapper-light {
          background: #f8fafc;
          color: #0f172a;
          min-height: 100vh;
          font-family: var(--font-body);
          position: relative;
          overflow: hidden;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Live Particles Background */
        .contact-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .contact-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          opacity: 0.6;
          animation: floatContactParticle linear infinite;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        @keyframes floatContactParticle {
          0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }

        /* Hero Styling */
        .contact-hero-section-light {
          position: relative;
          padding: 110px 0 60px;
          background: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
                      #f8fafc;
          color: #0f172a;
          text-align: center;
          overflow: hidden;
          z-index: 1;
        }

        .contact-hero-header {
          max-width: 700px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .contact-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.25);
          padding: 7px 18px;
          border-radius: 50px;
          font-size: 12.5px;
          font-weight: 800;
          color: #4f46e5;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
        }

        .badge-dot {
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.8);
        }

        .contact-hero-title {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 14px;
          letter-spacing: -1px;
          color: #0f172a;
        }

        .gradient-text {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .contact-hero-subtitle {
          font-size: 16.5px;
          color: #64748b;
          line-height: 1.6;
        }

        /* Quick Actions Grid */
        .quick-actions-section {
          padding: 30px 0 15px;
          position: relative;
          z-index: 1;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .quick-action-card-3d {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          padding: 18px 20px;
          border-radius: 18px;
          border: 1.5px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 14px;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.02);
        }

        .quick-action-card-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-6px);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 18px 40px rgba(99, 102, 241, 0.12);
        }

        .card-bg-light-glow {
          position: absolute;
          top: -25px;
          right: -25px;
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .quick-action-icon {
          font-size: 24px;
        }

        .action-text-info h4 {
          margin: 0 0 2px;
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
        }

        .action-text-info p {
          margin: 0;
          font-size: 12px;
          color: #64748b;
        }

        /* Contact Information Cards */
        .contact-cards-section {
          padding: 20px 0 40px;
          position: relative;
          z-index: 1;
        }

        .contact-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }

        .contact-card-box-3d {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          padding: 24px;
          border-radius: 20px;
          border: 1.5px solid #e2e8f0;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.02);
        }

        .contact-card-box-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-8px);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 20px 45px rgba(99, 102, 241, 0.15);
        }

        .contact-card-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .contact-card-content h3 {
          font-size: 17px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .contact-card-primary {
          font-size: 14px;
          font-weight: 700;
          color: #334155;
          margin: 0 0 2px;
        }

        .contact-card-secondary {
          font-size: 12.5px;
          color: #64748b;
          margin: 0;
        }

        /* Main Section Grid */
        .contact-main-section {
          padding-bottom: 80px;
          position: relative;
          z-index: 1;
        }

        .contact-main-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 28px;
          align-items: start;
        }

        /* Left Form & Tabs */
        .contact-tabs-bar {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          background: #e2e8f0;
          padding: 5px;
          border-radius: 14px;
        }

        .tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          border: none;
          background: none;
          font-size: 14px;
          font-weight: 700;
          color: #64748b;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-btn.active {
          background: #ffffff;
          color: #4f46e5;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .contact-form-card-3d, .faq-container-card-3d {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          padding: 32px;
          border-radius: 24px;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.03);
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }

        .contact-form-card-3d h3, .faq-container-card-3d h3 {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 20px;
          position: relative;
          z-index: 2;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          position: relative;
          z-index: 2;
        }

        .form-group {
          margin-bottom: 16px;
          position: relative;
          z-index: 2;
        }

        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 6px;
        }

        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1.5px solid #cbd5e1;
          outline: none;
          font-size: 14px;
          background: #f8fafc;
          transition: border-color 0.2s;
        }

        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          border-color: #6366f1;
          background: #ffffff;
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
          position: relative;
          z-index: 2;
          transition: transform 0.2s;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
        }

        .form-status-alert {
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 600;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 2;
        }

        .form-status-alert.success {
          background: #ecfdf5;
          color: #065f46;
          border: 1.5px solid #a7f3d0;
        }

        .form-status-alert.error {
          background: #fef2f2;
          color: #991b1b;
          border: 1.5px solid #fecaca;
        }

        /* FAQ Items List */
        .faq-items-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
          z-index: 2;
        }

        .faq-item-box {
          background: #f8fafc;
          padding: 16px 18px;
          border-radius: 14px;
          border: 1.5px solid #e2e8f0;
        }

        .faq-item-box h4 {
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .faq-item-box p {
          font-size: 13.5px;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
        }

        /* Right Column Cards */
        .map-card-wrapper-3d {
          background: #ffffff;
          padding: 8px;
          border-radius: 20px;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.02);
          margin-bottom: 20px;
        }

        .info-glass-card-3d {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          padding: 20px 22px;
          border-radius: 20px;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.02);
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }

        .info-glass-card-3d:hover {
          transform: translateY(-4px);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 15px 35px rgba(99, 102, 241, 0.1);
        }

        .info-glass-card-3d.response {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .info-icon-glow {
          width: 44px;
          height: 44px;
          background: #ede9fe;
          color: #4f46e5;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
          position: relative;
          z-index: 2;
        }

        .info-glass-card-3d h4 {
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 2px;
          position: relative;
          z-index: 2;
        }

        .info-glass-card-3d p {
          font-size: 13px;
          color: #64748b;
          margin: 0;
          position: relative;
          z-index: 2;
        }

        .social-icons-row {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          position: relative;
          z-index: 2;
        }

        .social-badge {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #f1f5f9;
          color: #334155;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, color 0.2s, transform 0.2s;
        }

        .social-badge:hover {
          transform: translateY(-2px);
        }

        .social-badge.linkedin:hover { background: #0077b5; color: white; }
        .social-badge.twitter:hover { background: #000000; color: white; }
        .social-badge.facebook:hover { background: #1877f2; color: white; }
        .social-badge.instagram:hover { background: #e4405f; color: white; }
        .social-badge.whatsapp:hover { background: #25d366; color: white; }

        .urgent-call-box-3d {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 24px;
          border-radius: 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(79, 70, 229, 0.25);
        }

        .urgent-call-box-3d h4 {
          font-size: 17px;
          font-weight: 800;
          margin: 0 0 4px;
          position: relative;
          z-index: 2;
        }

        .urgent-call-box-3d p {
          font-size: 12.5px;
          color: #e0e7ff;
          margin: 0 0 16px;
          position: relative;
          z-index: 2;
        }

        .call-now-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 11px;
          background: #ffffff;
          color: #4f46e5;
          border-radius: 10px;
          font-weight: 800;
          font-size: 13.5px;
          text-decoration: none;
          position: relative;
          z-index: 2;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }

        .call-now-btn:hover {
          transform: translateY(-2px);
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

        .quick-action-card-3d:hover .card-glow-bar,
        .contact-card-box-3d:hover .card-glow-bar,
        .contact-form-card-3d:hover .card-glow-bar,
        .faq-container-card-3d:hover .card-glow-bar,
        .info-glass-card-3d:hover .card-glow-bar,
        .urgent-call-box-3d:hover .card-glow-bar {
          transform: scaleX(1);
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .contact-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .contact-main-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .quick-actions-grid, .contact-cards-grid, .form-row-2 {
            grid-template-columns: 1fr;
          }
          .contact-hero-title {
            font-size: 34px;
          }
        }
      `}</style>
    </div>
  );
};

export default Contact;