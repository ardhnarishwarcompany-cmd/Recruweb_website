import { useState, useRef, useEffect } from "react";
import ContactChat from "./ContactChat";
import chatAssistantAvatar from "../assets/chat-assistant-avatar.jpg";

// Live chat with the HR team (Sri teams available here)

const FAQ_RESPONSES = {
  hello: [
    "Hello! Welcome to Recruweb. How can I assist you today?",
    "Hi there! I'm here to help with any questions about our HR solutions.",
  ],
  hi: [
    "Hello! Welcome to Recruweb. How can I assist you today?",
    "Hi there! I'm here to help with any questions about our HR solutions.",
  ],
  services: `At Recruweb, we offer comprehensive HR solutions including:

• Talent Acquisition & Recruitment
• Payroll Management  
• HRMS Solutions
• Training & Development
• HR Outsourcing
• Industry Manpower
• Facility Management

Would you like more details about any specific service?`,
  recruitment: `Our Recruitment Services include:

• End-to-end hiring solutions
• Executive search
• Bulk hiring
• Contract staffing
• Permanent placement

Contact us at info@recruweb.com or call +91 9336532636 for immediate assistance.`,
  payroll: `Our Payroll Management services cover:

• Salary processing
• Compliance management
• Statutory filings
• Employee benefits administration
• Leave management

We ensure accurate and timely payroll processing for your organization.`,
  hrms: `Our HRMS Solutions include:

• Employee database management
• Attendance tracking
• Performance management
• Leave management
• Self-service portal

Streamline your HR operations with our integrated solutions.`,
  training: `Our Training & Development programs offer:

• Leadership training
• Skill development
• Corporate training programs
• Employee onboarding
• Compliance training

Invest in your team's growth with Recruweb.`,
  outsourcing: `Our HR Outsourcing services help you:

• Reduce operational costs
• Focus on core business
• Access expert HR professionals
• Ensure compliance
• Improve efficiency

Outsource your HR functions to us and save time and resources.`,
  pricing: `Our pricing is flexible and based on your specific needs. We offer:

• Custom plans for startups
• Scalable solutions for growing businesses
• Enterprise packages for large organizations

Contact us for a customized quote!`,
  contact: `You can reach us at:

📧 Email: info@recruweb.com
📞 Phone: +91 9336532636
📍 Address: H-112, Sector 63, Noida, Uttar Pradesh

We're available Mon-Sat, 9:30 AM - 6:30 PM\n\n💬 Prefer to chat? Open the Contact tab above.`,
  address: `Our office is located at:

📍 H-112, Sector 63, Noida
Nearby Electronic City Metro Station
Uttar Pradesh, India

Visit us during business hours (Mon-Sat, 9:30 AM - 6:30 PM)`,
  hours: `Business Hours:

📅 Monday - Friday: 9:30 AM - 6:30 PM
📅 Saturday: 9:30 AM - 6:30 PM
📅 Sunday: Closed

We're here to help during these hours!`,
  phone: `You can call us at: +91 9336532636

Our team is ready to assist you!\n\n💬 Prefer chat? Open the Contact tab above.`,
  email: `Email us at: info@recruweb.com

We respond to emails within 24 hours.`,
  about: `Recruweb Resources Pvt. Ltd. is a leading HR solutions provider. We specialize in:

• Innovative HR solutions
• Recruitment services
• Payroll management
• HR outsourcing

Transforming businesses through people since 2015.`,
  job: `Looking for a job? We can help!

• Browse open positions at /jobs
• Upload your resume for consideration
• Use our AI CV screening tool at /cv-screen
• Schedule an interview at /schedule-interview

What kind of role are you looking for?`,
  industry: `Our Industry Manpower services cover:

• Manufacturing workforce
• Construction labor
• Industrial staffing
• Pan-India coverage
• Workforce within 1 week

We provide skilled and unskilled workers across all sectors in India.`,
  default: `Thank you for your question! Here's how I can help:

For immediate assistance:
📞 Call: +91 9336532636
📧 Email: info@recruweb.com

Or open the Contact tab above to chat with our HR team.`,
};

const HR_CHAT_RESPONSE = `Sure! Open the Contact tab above, fill in your details and choose an HR to chat with live. You can also reach us at +91 9336532636 or info@recruweb.com (Mon-Sat, 9:30 AM - 6:30 PM).`;

// Words meaning "reach / talk to" (English + Hinglish) and "who" (HR / team / a person)
const CONTACT_VERBS =
  "contact|talk|speak|chat|connect|reach|call|meet|message|baat|bat|baatcheet|sampark|milna|mil";
const CONTACT_TARGETS =
  "hr|team|human|person|people|someone|somebody|executive|agent|representative|recruiter|manager|support|staff|expert|advisor|consultant|kisi|insaan|banda|bande";

const CONTACT_TEAM_REGEXES = [
  // "contact hr", "talk to your team", "connect me with someone"
  new RegExp(`\\b(${CONTACT_VERBS})\\b(\\s+\\w+){0,3}\\s+(${CONTACT_TARGETS})\\b`),
  // "hr se baat", "team se contact", "someone to talk"
  new RegExp(`\\b(${CONTACT_TARGETS})\\b(\\s+\\w+){0,3}\\s+(${CONTACT_VERBS})\\b`),
  /\b(real|live)\s+(person|human|agent|chat|support)\b/,
  /\bcustomer\s+(care|support|service)\b/,
  /\bhuman\s+(help|support|assistance)\b/,
];

const wantsToContactTeam = (userMessage) => {
  const text = userMessage
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\b(talk|speak|chat)\s+about\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return CONTACT_TEAM_REGEXES.some((re) => re.test(text));
};

const getResponse = (userMessage) => {
  const msg = userMessage.toLowerCase();

  // Must run first: otherwise greeting/keyword matches below swallow the request
  if (wantsToContactTeam(userMessage)) {
    return HR_CHAT_RESPONSE;
  }

  if (
    msg.includes("hello") ||
    msg.includes("hi") ||
    msg.includes("hey") ||
    msg.includes("good morning") ||
    msg.includes("good evening")
  ) {
    return FAQ_RESPONSES.hello[
      Math.floor(Math.random() * FAQ_RESPONSES.hello.length)
    ];
  }
  if (
    msg.includes("service") ||
    msg.includes("what do you offer") ||
    msg.includes("solutions")
  ) {
    return FAQ_RESPONSES.services;
  }
  if (
    msg.includes("recruit") ||
    msg.includes("hire") ||
    msg.includes("hiring") ||
    msg.includes("job") ||
    msg.includes("jobs")
  ) {
    return FAQ_RESPONSES.recruitment;
  }
  if (msg.includes("payroll") || msg.includes("salary")) {
    return FAQ_RESPONSES.payroll;
  }
  if (
    msg.includes("hrms") ||
    msg.includes("human resource") ||
    msg.includes("software")
  ) {
    return FAQ_RESPONSES.hrms;
  }
  if (
    msg.includes("training") ||
    msg.includes("develop") ||
    msg.includes("learn")
  ) {
    return FAQ_RESPONSES.training;
  }
  if (
    msg.includes("outsource") ||
    msg.includes("outsourcing") ||
    msg.includes("bpo")
  ) {
    return FAQ_RESPONSES.outsourcing;
  }
  if (
    msg.includes("pric") ||
    msg.includes("cost") ||
    msg.includes("quote") ||
    msg.includes("budget")
  ) {
    return FAQ_RESPONSES.pricing;
  }
  if (
    msg.includes("contact") ||
    msg.includes("reach") ||
    msg.includes("talk")
  ) {
    return FAQ_RESPONSES.contact;
  }
  if (
    msg.includes("address") ||
    msg.includes("location") ||
    msg.includes("where") ||
    msg.includes("office")
  ) {
    return FAQ_RESPONSES.address;
  }
  if (
    msg.includes("hour") ||
    msg.includes("time") ||
    msg.includes("open") ||
    msg.includes("available")
  ) {
    return FAQ_RESPONSES.hours;
  }
  if (msg.includes("phone") || msg.includes("call") || msg.includes("mobile")) {
    return FAQ_RESPONSES.phone;
  }
  if (msg.includes("email") || msg.includes("mail")) {
    return FAQ_RESPONSES.email;
  }
  if (
    msg.includes("about") ||
    msg.includes("company") ||
    msg.includes("who are you")
  ) {
    return FAQ_RESPONSES.about;
  }
  if (
    msg.includes("industry") ||
    msg.includes("manufacturing") ||
    msg.includes("industrial")
  ) {
    return FAQ_RESPONSES.industry;
  }

  return FAQ_RESPONSES.default;
};

const QUICK_QUESTIONS = [
  "What services do you offer?",
  "Tell me about recruitment",
  "What is your contact info?",
  "What is your pricing?",
];

// Turns plain https:// links in a message into clickable links (open in a new tab)
const renderMessageContent = (text) =>
  text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="chat-link"
      >
        {part}
      </a>
    ) : (
      part
    )
  );

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState("assistant");
  const [contactUnread, setContactUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const processUserQuery = (queryText) => {
    if (!queryText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: queryText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    setTimeout(
      () => {
        const response = getResponse(queryText);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: response,
          },
        ]);
        setIsLoading(false);
      },
      800 + Math.random() * 400,
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    processUserQuery(input);
    setInput("");
  };

  const clearChat = () => {
    setMessages([]);
  };

  const closeWidget = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <>
      <div className="chat-assistant-container">
        {isOpen && !isMinimized && (
          <div className="chat-popup-widget">
            {/* Header */}
            <div className="chat-widget-header">
              <div className="header-avatar">
                <div className="ca-avatar-ring">
                  <img src={chatAssistantAvatar} alt="Recruweb AI" className="ca-avatar-img" width="36" height="36" />
                </div>
              </div>

              <div className="header-info">
                <div className="header-title-row">
                  <h3>Recruweb AI</h3>
                  <span className="ai-badge">AI</span>
                </div>
                <span className="status-indicator">
                  <span className="status-dot"></span>
                  Online & Ready
                </span>
              </div>

              <div className="header-actions">
                {messages.length > 0 && (
                  <button
                    className="header-action-btn"
                    onClick={clearChat}
                    title="Clear Chat"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
                <button
                  className="header-action-btn"
                  onClick={() => setIsMinimized(true)}
                  title="Minimize"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <button
                  className="close-btn"
                  onClick={closeWidget}
                  title="Close"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="ca-tabs">
              <button type="button" className={`ca-tab ${tab === "assistant" ? "active" : ""}`} onClick={() => setTab("assistant")}>
                Assistant
              </button>
              <button type="button" className={`ca-tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>
                Contact
                {contactUnread > 0 && <span className="ca-tab-badge">{contactUnread}</span>}
              </button>
            </div>

            {/* Contact tab (stays mounted so the live chat keeps receiving messages) */}
            <div className="ca-contact-host" style={{ display: tab === "contact" ? "flex" : "none" }}>
              <ContactChat active={isOpen && !isMinimized && tab === "contact"} onUnread={setContactUnread} />
            </div>

            {tab === "assistant" && (
              <>
            {/* Messages Area */}
            <div className="chat-widget-messages">
              {messages.length === 0 && (
                <div className="welcome-screen">
                  <div className="welcome-avatar">
                    <img src={chatAssistantAvatar} alt="Recruweb AI" className="ca-welcome-avatar-img" />
                  </div>
                  <h4>Hello! I'm Recruweb AI</h4>
                  <p>
                    Ask me about our HR services, recruitment, pricing, or job
                    applications!
                  </p>

                  <div className="quick-suggestions">
                    <span className="suggestions-label">
                      Suggested Questions:
                    </span>
                    <div className="suggestions-list">
                      {QUICK_QUESTIONS.map((q, idx) => (
                        <button
                          key={idx}
                          className="suggestion-chip"
                          onClick={() => processUserQuery(q)}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`chat-message ${msg.role}`}>
                  {msg.role === "assistant" && (
                    <div className="msg-avatar">
                      <img src={chatAssistantAvatar} alt="Recruweb AI" width="32" height="32" style={{ borderRadius: '50%', display: 'block', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div className="chat-bubble">
                    <p>{renderMessageContent(msg.content)}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="chat-message assistant">
                  <div className="msg-avatar">
                    <img src={chatAssistantAvatar} alt="Recruweb AI" width="32" height="32" style={{ borderRadius: '50%', display: 'block', objectFit: 'cover' }} />
                  </div>
                  <div className="chat-bubble typing">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chat-widget-footer">
              <form onSubmit={handleSubmit} className="chat-input-form">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="send-btn"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
              <div className="input-hint">Press Enter to send</div>
            </div>
              </>
            )}
          </div>
        )}

        {/* Floating Toggle Button (Bottom-Right) */}
        <button
          className={`chat-toggle-btn ${isOpen && !isMinimized ? "hidden" : ""}`}
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          title="Open AI Chat Assistant"
        >
          <div className="toggle-btn-glow"></div>
          <div className="toggle-btn-inner chat-avatar-toggle-inner">
            <img src={chatAssistantAvatar} alt="Recruweb AI chat assistant" className="chat-toggle-avatar" />
            <span className="badge">AI</span>
          </div>
        </button>
      </div>

      <style>{`
        .chat-assistant-container {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .chat-popup-widget {
          width: 380px;
          height: 520px;
          background: #ffffff;
          border-radius: 28px;
          box-shadow: 
            0 30px 60px -15px rgba(102, 126, 234, 0.3),
            0 0 0 1px rgba(102, 126, 234, 0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: chat-pop-slide 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes chat-pop-slide {
          from { opacity: 0; transform: scale(0.85) translateY(30px) translateX(30px); }
          to { opacity: 1; transform: scale(1) translateY(0) translateX(0); }
        }

        .chat-widget-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          position: relative;
        }

        .ca-avatar-ring {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
        }

        .ca-avatar-img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .header-info {
          flex: 1;
        }

        .header-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-title-row h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }

        .ai-badge {
          background: rgba(255,255,255,0.25);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .status-indicator {
          font-size: 12px;
          opacity: 0.9;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #34d399;
          border-radius: 50%;
          box-shadow: 0 0 6px #34d399;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .header-action-btn, .close-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .header-action-btn:hover, .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .ca-tabs { display: flex; background: #fff; border-bottom: 1px solid #eef2f7; }
        .ca-tab { flex: 1; padding: 10px; background: none; border: 0; border-bottom: 2px solid transparent; font: inherit; font-size: 14px; font-weight: 600; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .ca-tab.active { color: #667eea; border-bottom-color: #667eea; }
        .ca-tab-badge { background: #ef4444; color: #fff; border-radius: 999px; font-size: 11px; min-width: 18px; padding: 1px 5px; line-height: 16px; }
        .ca-contact-host { flex: 1; min-height: 0; flex-direction: column; }
        .chat-widget-messages {
          flex: 1;
          padding: 16px 18px;
          overflow-y: auto;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chat-widget-messages::-webkit-scrollbar {
          width: 6px;
        }
        .chat-widget-messages::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .welcome-screen {
          text-align: center;
          padding: 20px 10px;
          color: #64748b;
        }

        .welcome-avatar {
          display: inline-block;
          margin-bottom: 12px;
          will-change: transform;
          animation: ca-welcome-avatar-bounce 2.4s ease-in-out infinite;
          transform-origin: center bottom;
        }

        .ca-welcome-avatar-img {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
        }

        /* Smooth continuous floating bounce for the welcome AI avatar */
        @keyframes ca-welcome-avatar-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.025); }
        }

        @media (prefers-reduced-motion: reduce) {
          .welcome-avatar { animation: none; }
        }

        .welcome-screen h4 {
          margin: 0 0 6px;
          font-size: 18px;
          color: #1e293b;
          font-weight: 700;
        }

        .welcome-screen p {
          margin: 0 0 20px;
          font-size: 13.5px;
          line-height: 1.5;
        }

        .quick-suggestions {
          text-align: left;
        }

        .suggestions-label {
          font-size: 12px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 10px;
        }

        .suggestions-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .suggestion-chip {
          padding: 10px 14px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          color: #334155;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }

        .suggestion-chip:hover {
          background: #667eea;
          color: white;
          border-color: #667eea;
          transform: translateX(4px);
        }

        .chat-message {
          display: flex;
          gap: 10px;
          animation: msg-in 0.3s ease;
        }

        @keyframes msg-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .chat-message.user {
          justify-content: flex-end;
        }

        .msg-avatar {
          flex-shrink: 0;
        }

        .chat-bubble {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .chat-message.assistant .chat-bubble {
          background: white;
          color: #1e293b;
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
        }

        .chat-message.user .chat-bubble {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .chat-link {
          color: #4f46e5;
          font-weight: 600;
          text-decoration: underline;
          word-break: break-all;
        }

        .chat-message.user .chat-link {
          color: #ffffff;
        }

        .chat-bubble.typing {
          padding: 14px 20px;
        }

        .typing-dots {
          display: flex;
          gap: 5px;
          align-items: center;
        }

        .typing-dots span {
          width: 7px;
          height: 7px;
          background: #667eea;
          border-radius: 50%;
          animation: typing-bounce 1.4s infinite ease-in-out;
        }

        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }

        .chat-widget-footer {
          padding: 14px 16px;
          background: white;
          border-top: 1px solid #f1f5f9;
        }

        .chat-input-form {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .chat-input-form input {
          flex: 1;
          padding: 12px 18px;
          border: 1.5px solid #e2e8f0;
          border-radius: 24px;
          font-size: 14px;
          outline: none;
          background: #f8fafc;
          transition: all 0.2s;
        }

        .chat-input-form input:focus {
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
        }

        .send-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
          flex-shrink: 0;
        }

        .send-btn:hover:not(:disabled) {
          transform: scale(1.08);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.45);
        }

        .send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          box-shadow: none;
        }

        .input-hint {
          font-size: 11px;
          color: #94a3b8;
          text-align: center;
          margin-top: 6px;
        }

        .chat-toggle-btn {
          position: relative;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.45);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .chat-toggle-btn:hover {
          transform: scale(1.12);
          box-shadow: 0 14px 40px rgba(102, 126, 234, 0.55);
        }

        .chat-toggle-btn.hidden {
          opacity: 0;
          pointer-events: none;
          transform: scale(0.8);
        }

        .toggle-btn-inner {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-avatar-toggle-inner {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          overflow: visible;
        }

        .chat-toggle-avatar {
          width: 54px;
          height: 54px;
          display: block;
          object-fit: cover;
          object-position: center top;
          border-radius: 50%;
          border: 3px solid rgba(255,255,255,.95);
          box-sizing: border-box;
          box-shadow: 0 4px 14px rgba(20,20,60,.25);
        }

        .toggle-btn-inner .badge {
          position: absolute;
          top: -14px;
          right: -18px;
          background: #10b981;
          color: white;
          font-size: 9px;
          font-weight: 800;
          padding: 2px 5px;
          border-radius: 8px;
        }

        @media (max-width: 480px) {
          .chat-assistant-container {
            bottom: 16px;
            right: 16px;
            left: 16px;
          }

          .chat-popup-widget {
            width: 100%;
            height: 480px;
          }
        }
      `}</style>
    </>
  );
};

export default ChatAssistant;