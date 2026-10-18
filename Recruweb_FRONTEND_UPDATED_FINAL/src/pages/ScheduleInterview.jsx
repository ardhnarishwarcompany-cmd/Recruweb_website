import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ScrollIndicator from "../components/ScrollIndicator";
import { api } from "../utils/api";

const SLOT_HOURS = [9, 10, 11, 14, 15, 16];
const SLOT_LABELS = {
  9: "09:00 AM",
  10: "10:00 AM",
  11: "11:00 AM",
  14: "02:00 PM",
  15: "03:00 PM",
  16: "04:00 PM",
};

const aiRecommendations = {
  9: { label: "Excellent", reason: "Morning focus is usually strongest.", icon: "🌟" },
  10: { label: "Recommended", reason: "A balanced morning slot for both sides.", icon: "☕" },
  11: { label: "Good", reason: "Good energy before lunch.", icon: "👍" },
  14: { label: "Good", reason: "A practical post-lunch option.", icon: "💪" },
  15: { label: "Fair", reason: "Good afternoon option.", icon: "⚡" },
  16: { label: "Fair", reason: "Useful for end-of-day availability.", icon: "⏰" },
};

const interviewQuestionsByRole = {
  software: [
    "Tell me about a challenging technical problem you solved.",
    "How do you approach code reviews and testing?",
    "Describe your experience with version control.",
    "How do you debug a production issue?",
    "Which recent project are you most proud of?",
  ],
  management: [
    "How do you handle an underperforming team member?",
    "Describe your leadership style.",
    "How do you prioritize competing projects?",
    "Tell me about a conflict you resolved.",
    "How do you measure team success?",
  ],
  marketing: [
    "Describe a successful campaign you led.",
    "How do you measure marketing ROI?",
    "Which marketing tools do you use?",
    "How do you research your target audience?",
    "How do you keep up with market trends?",
  ],
  sales: [
    "What is your sales methodology?",
    "Describe your biggest sales achievement.",
    "How do you handle objections?",
    "Which CRM tools have you used?",
    "How do you prospect new clients?",
  ],
  design: [
    "Walk me through your design process.",
    "Which design tools are you proficient in?",
    "Describe a project you are proud of.",
    "How do you handle design feedback?",
    "How do you approach user experience?",
  ],
  hr: [
    "Describe your recruitment experience.",
    "How do you handle sensitive employee information?",
    "How do you stay updated with employment practices?",
    "Tell me about a difficult employee situation you resolved.",
    "Which HR software have you used?",
  ],
  default: [
    "Tell me about yourself.",
    "What are your greatest strengths?",
    "Why are you interested in this role?",
    "What is your most relevant achievement?",
    "What questions do you have for us?",
  ],
};

const pad = (n) => String(n).padStart(2, "0");

const dateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const localSlotKey = (date, hour) =>
  `${dateKey(date)} ${pad(hour)}:00`;

const toLocalDate = (dateKeyValue) => {
  const [y, m, d] = dateKeyValue.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const buildLocalDateTime = (dateKeyValue, hour) => {
  const [y, m, d] = dateKeyValue.split("-").map(Number);
  return new Date(y, m - 1, d, hour, 0, 0, 0);
};

const formatDate = (value) =>
  toLocalDate(value).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const formatShortDate = (value) =>
  toLocalDate(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const getQuestionSet = (title) => {
  const lower = title.toLowerCase();
  for (const [key, questions] of Object.entries(interviewQuestionsByRole)) {
    if (key !== "default" && lower.includes(key)) return questions;
  }
  if (lower.includes("developer") || lower.includes("engineer")) {
    return interviewQuestionsByRole.software;
  }
  return interviewQuestionsByRole.default;
};

const generateDateOptions = () => {
  const now = new Date();
  const dates = [];
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (let i = 0; i < 31 && dates.length < 15; i += 1) {
    const date = new Date(cursor);
    date.setDate(cursor.getDate() + i);
    const day = date.getDay();
    if (day === 0 || day === 6) continue;

    const hours = SLOT_HOURS.filter((hour) => {
      if (i !== 0) return true;
      const slotTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hour,
        0,
        0,
        0,
      );
      return slotTime.getTime() > now.getTime();
    });

    if (hours.length) {
      dates.push({ date: dateKey(date), hours });
    }
  }

  return dates;
};

const Scheduler = () => {
  const [searchParams] = useSearchParams();
  const browserTimezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedType, setSelectedType] = useState("video");
  const [dateOptions, setDateOptions] = useState(() => generateDateOptions());
  const [busyKeys, setBusyKeys] = useState(new Set());
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    jobTitle: searchParams.get("jobTitle") || "",
    company: searchParams.get("company") || "",
    notes: "",
    experience: "",
    timezone: browserTimezone,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const refreshDates = () => setDateOptions(generateDateOptions());
    refreshDates();
    const timer = window.setInterval(refreshDates, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadAvailability = async () => {
      setAvailabilityLoading(true);
      setAvailabilityError("");

      const res = await api.publicInterviews.getAvailability(browserTimezone);
      if (cancelled) return;

      if (res?.success) {
        const keys = new Set(
          (res.busy || []).map((event) => {
            const d = new Date(event.startAt);
            return `${dateKey(d)} ${pad(d.getHours())}:00`;
          }),
        );
        setBusyKeys(keys);
      } else {
        setAvailabilityError(
          res?.message || "Could not load live interview availability.",
        );
      }

      setAvailabilityLoading(false);
    };

    loadAvailability();
    return () => {
      cancelled = true;
    };
  }, [browserTimezone]);

  const selectedDateOption = dateOptions.find((item) => item.date === selectedDate);

  const availableHours = useMemo(() => {
    if (!selectedDateOption) return [];
    return selectedDateOption.hours.filter(
      (hour) => !busyKeys.has(localSlotKey(toLocalDate(selectedDate), hour)),
    );
  }, [selectedDate, selectedDateOption, busyKeys]);

  const questions = useMemo(
    () => getQuestionSet(formData.jobTitle),
    [formData.jobTitle],
  );

  const recommendations = useMemo(() => {
    const picks = [];
    for (const item of dateOptions) {
      for (const hour of item.hours) {
        if (busyKeys.has(localSlotKey(toLocalDate(item.date), hour))) continue;
        picks.push({
          date: item.date,
          hour,
          ...aiRecommendations[hour],
        });
      }
      if (picks.length >= 5) break;
    }
    return picks.slice(0, 5);
  }, [dateOptions, busyKeys]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectDate = (value) => {
    setSelectedDate(value);
    const option = dateOptions.find((item) => item.date === value);
    const firstAvailable = option?.hours.find(
      (hour) => !busyKeys.has(localSlotKey(toLocalDate(value), hour)),
    );
    setSelectedHour(firstAvailable ?? null);
    setMessage("");
  };

  const continueToTimes = () => {
    if (!selectedDate) return;
    setStep(3);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!selectedDate || selectedHour == null) {
      setMessage("Please choose an available date and time.");
      return;
    }

    const localStart = buildLocalDateTime(selectedDate, selectedHour);
    if (localStart.getTime() <= Date.now()) {
      setMessage("That slot has already passed. Please choose a future slot.");
      setDateOptions(generateDateOptions());
      return;
    }

    setIsSubmitting(true);

    const res = await api.publicInterviews.schedule({
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      jobTitle: formData.jobTitle.trim(),
      company: formData.company.trim(),
      notes: formData.notes.trim(),
      experience: formData.experience,
      timezone: browserTimezone,
      startAt: localStart.toISOString(),
      interviewMode: selectedType,
      jobId: searchParams.get("jobId") || null,
    });

    if (res?.success) {
      setBooking(res.data);
      setStep(4);
    } else {
      setMessage(
        res?.message ||
          "This slot could not be booked. Please choose another available time.",
      );
      // Refresh live availability after a race/double-booking.
      const availability = await api.publicInterviews.getAvailability(
        browserTimezone,
      );
      if (availability?.success) {
        setBusyKeys(
          new Set(
            (availability.busy || []).map((event) => {
              const d = new Date(event.startAt);
              return `${dateKey(d)} ${pad(d.getHours())}:00`;
            }),
          ),
        );
      }
    }

    setIsSubmitting(false);
  };

  const reset = () => {
    setStep(1);
    setSelectedDate("");
    setSelectedHour(null);
    setSelectedType("video");
    setMessage("");
    setBooking(null);
  };

  return (
    <div className="schedule-interview-wrapper-light">
      <div className="si-particles-container">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="si-particle"
            style={{
              left: `${(i * 7.5) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${12 + (i % 6)}s`,
            }}
          />
        ))}
      </div>

      <section className="si-hero-section-light">
        <div className="container">
          <div className="si-badge">
            <span className="si-badge-dot" />
            <span>LIVE INTERVIEW SCHEDULER</span>
          </div>
          <h1 className="si-hero-title">
            Schedule Your <span className="gradient-text">Interview</span>
          </h1>
          <p className="si-hero-subtitle">
            Choose a real available slot in your local timezone. Bookings are
            checked again on the server before confirmation.
          </p>
          <div className="timezone-pill">
            🌍 Your timezone: <strong>{browserTimezone}</strong>
          </div>
        </div>
        <ScrollIndicator />
      </section>

      <section className="section" style={{ paddingTop: 30, paddingBottom: 80 }}>
        <div className="container">
          <div className="schedule-progress">
            {["Your Details", "Date", "Time", "Confirmation"].map((label, index) => {
              const number = index + 1;
              return (
                <div
                  key={label}
                  className={`progress-step ${step >= number ? "active" : ""}`}
                >
                  <span className="step-number">{number}</span>
                  <span className="step-label">{label}</span>
                </div>
              );
            })}
          </div>

          {availabilityError && (
            <div className="si-alert error">
              ⚠️ {availabilityError}
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="si-inline-button"
              >
                Refresh
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="si-card-3d schedule-card">
              <div className="card-bg-light-glow" />
              <h2>Tell us about your interview</h2>
              <p className="si-muted">
                These details are used for the calendar event and confirmation.
              </p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setStep(2);
                }}
                className="si-form"
              >
                <div className="si-grid-2">
                  <label>
                    Full Name *
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={updateField}
                      required
                      placeholder="Your full name"
                    />
                  </label>
                  <label>
                    Email Address *
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={updateField}
                      required
                      placeholder="you@example.com"
                    />
                  </label>
                  <label>
                    Phone Number *
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={updateField}
                      required
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </label>
                  <label>
                    Job Title / Position *
                    <input
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={updateField}
                      required
                      placeholder="e.g. Full Stack Developer"
                    />
                  </label>
                  <label>
                    Company
                    <input
                      name="company"
                      value={formData.company}
                      onChange={updateField}
                      placeholder="Company name"
                    />
                  </label>
                  <label>
                    Experience
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={updateField}
                    >
                      <option value="">Select experience</option>
                      <option value="0-1">0-1 years</option>
                      <option value="1-3">1-3 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </label>
                </div>
                <label>
                  Notes
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={updateField}
                    rows={4}
                    placeholder="Anything the recruiter should know?"
                  />
                </label>
                <button className="si-button primary" type="submit">
                  Continue to Available Dates →
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="si-card-3d schedule-card">
              <div className="card-bg-light-glow" />
              <div className="si-section-head">
                <div>
                  <h2>Choose an available date</h2>
                  <p className="si-muted">
                    Dates are generated from today, not hard-coded. Past dates
                    disappear automatically.
                  </p>
                </div>
                <button type="button" className="si-button secondary" onClick={() => setStep(1)}>
                  ← Details
                </button>
              </div>

              {availabilityLoading ? (
                <div className="si-loading">Loading live availability…</div>
              ) : (
                <>
                  <div className="date-grid">
                    {dateOptions.map((item) => {
                      const freeCount = item.hours.filter(
                        (hour) =>
                          !busyKeys.has(
                            localSlotKey(toLocalDate(item.date), hour),
                          ),
                      ).length;
                      return (
                        <button
                          type="button"
                          key={item.date}
                          className={`date-card ${selectedDate === item.date ? "selected" : ""}`}
                          onClick={() => selectDate(item.date)}
                          disabled={freeCount === 0}
                        >
                          <span>{formatShortDate(item.date)}</span>
                          <strong>{freeCount}</strong>
                          <small>{freeCount === 1 ? "slot" : "slots"} free</small>
                        </button>
                      );
                    })}
                  </div>

                  {recommendations.length > 0 && (
                    <div className="recommendations">
                      <h3>✨ Best available picks</h3>
                      <div className="recommendation-list">
                        {recommendations.slice(0, 3).map((rec) => (
                          <button
                            type="button"
                            key={`${rec.date}-${rec.hour}`}
                            className="recommendation-item"
                            onClick={() => {
                              setSelectedDate(rec.date);
                              setSelectedHour(rec.hour);
                              setStep(3);
                            }}
                          >
                            <span className="rec-icon">{rec.icon}</span>
                            <span>
                              <strong>{rec.label}</strong>
                              <small>
                                {formatShortDate(rec.date)} · {SLOT_LABELS[rec.hour]}
                              </small>
                              <em>{rec.reason}</em>
                            </span>
                            <span>→</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="si-button primary"
                      disabled={!selectedDate || availableHours.length === 0}
                      onClick={continueToTimes}
                    >
                      Continue to Time Selection →
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="si-card-3d schedule-card">
              <div className="card-bg-light-glow" />
              <div className="si-section-head">
                <div>
                  <h2>Select time & interview type</h2>
                  <p className="si-muted">
                    {selectedDate ? formatDate(selectedDate) : "Choose a date"}
                  </p>
                </div>
                <button type="button" className="si-button secondary" onClick={() => setStep(2)}>
                  ← Dates
                </button>
              </div>

              <div className="time-grid">
                {availableHours.map((hour) => (
                  <button
                    type="button"
                    key={hour}
                    className={`time-slot ${selectedHour === hour ? "selected" : ""}`}
                    onClick={() => setSelectedHour(hour)}
                  >
                    <strong>{SLOT_LABELS[hour]}</strong>
                    <small>{aiRecommendations[hour]?.icon} {aiRecommendations[hour]?.label}</small>
                  </button>
                ))}
              </div>

              {!availableHours.length && !availabilityLoading && (
                <div className="si-alert error">
                  All slots on this date are booked. Please go back and choose another date.
                </div>
              )}

              <div className="mode-grid">
                {[
                  ["video", "🎥", "Video Call", "Instant browser meeting link"],
                  ["phone", "📞", "Phone Call", "Keep your phone available"],
                  ["onsite", "🏢", "Onsite", "Recruiter will confirm location"],
                ].map(([value, icon, label, description]) => (
                  <button
                    type="button"
                    key={value}
                    className={`mode-card ${selectedType === value ? "selected" : ""}`}
                    onClick={() => setSelectedType(value)}
                  >
                    <span>{icon}</span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </button>
                ))}
              </div>

              <div className="summary-box">
                <strong>Booking Summary</strong>
                <div>
                  {formData.fullName} · {formData.jobTitle}
                </div>
                <div>
                  {selectedDate && formatDate(selectedDate)} ·{" "}
                  {selectedHour != null ? SLOT_LABELS[selectedHour] : "No time selected"}
                </div>
                <div>Timezone: {browserTimezone}</div>
              </div>

              {message && <div className="si-alert error">⚠️ {message}</div>}

              <button
                type="button"
                className="si-button primary"
                disabled={!selectedHour && selectedHour !== 0 || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? "Scheduling…" : "Confirm & Schedule Interview ✓"}
              </button>
            </div>
          )}

          {step === 4 && booking && (
            <div className="si-card-3d success-card">
              <div className="success-mark">✓</div>
              <h2>Interview Scheduled Successfully</h2>
              <p>
                Your interview is confirmed for{" "}
                <strong>
                  {new Date(booking.startAt).toLocaleString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </strong>
                .
              </p>
              <p className="si-muted">Timezone: {booking.timezone}</p>

              {booking.meetingLink && (
                <a
                  className="si-button primary meeting-link"
                  href={booking.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  🎥 Open Video Meeting
                </a>
              )}

              <div className="confirmation-details">
                <div><span>Candidate</span><strong>{formData.fullName}</strong></div>
                <div><span>Position</span><strong>{formData.jobTitle}</strong></div>
                <div><span>Mode</span><strong>{selectedType === "video" ? "Video Call" : selectedType === "phone" ? "Phone Call" : "Onsite"}</strong></div>
                <div><span>Confirmation</span><strong>{formData.email}</strong></div>
              </div>

              <button type="button" className="si-button secondary" onClick={reset}>
                Schedule Another Interview
              </button>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .schedule-interview-wrapper-light {
          background: #f8fafc;
          min-height: 100vh;
          color: #0f172a;
          font-family: var(--font-body);
          position: relative;
          overflow: hidden;
        }
        .container { max-width: 1150px; margin: 0 auto; padding: 0 24px; }
        .si-particles-container { position:absolute; inset:0; pointer-events:none; z-index:0; }
        .si-particle { position:absolute; width:6px; height:6px; border-radius:50%; opacity:.5; background:linear-gradient(135deg,#6366f1,#a855f7); animation:siFloat linear infinite; }
        @keyframes siFloat { from { transform:translateY(100vh); opacity:0; } 20% {opacity:.6;} to {transform:translateY(-100px);opacity:0;} }
        .si-hero-section-light { position:relative; z-index:1; padding:90px 0 55px; background:radial-gradient(circle at 15% 20%,rgba(99,102,241,.1),transparent 45%),radial-gradient(circle at 85% 70%,rgba(168,85,247,.1),transparent 45%),#f8fafc; }
        .si-badge { display:inline-flex; align-items:center; gap:9px; padding:8px 15px; border-radius:999px; background:#eef2ff; border:1px solid #c7d2fe; color:#4f46e5; font-weight:800; font-size:12px; letter-spacing:.4px; }
        .si-badge-dot { width:8px; height:8px; border-radius:50%; background:#6366f1; box-shadow:0 0 10px rgba(99,102,241,.6); }
        .si-hero-title { margin:18px 0 8px; font-size:clamp(34px,5vw,54px); line-height:1.05; font-weight:900; }
        .gradient-text { background:linear-gradient(135deg,#6366f1,#a855f7); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .si-hero-subtitle { max-width:760px; margin:0; color:#64748b; font-size:15px; line-height:1.7; font-weight:600; }
        .timezone-pill { display:inline-block; margin-top:18px; padding:9px 13px; border-radius:12px; background:#fff; border:1px solid #cbd5e1; font-size:12px; color:#475569; }
        .schedule-progress { position:relative; z-index:2; display:flex; align-items:center; justify-content:center; gap:12px; padding:15px 18px; margin-bottom:22px; background:#fff; border:1px solid #cbd5e1; border-radius:18px; box-shadow:0 10px 30px rgba(15,23,42,.05); flex-wrap:wrap; }
        .progress-step { display:flex; align-items:center; gap:8px; color:#64748b; font-size:12px; font-weight:800; }
        .progress-step.active { color:#4f46e5; }
        .step-number { width:28px; height:28px; border-radius:50%; display:grid; place-items:center; background:#f1f5f9; border:1px solid #cbd5e1; }
        .progress-step.active .step-number { background:#4f46e5; color:#fff; border-color:#4f46e5; }
        .si-card-3d { position:relative; z-index:2; background:linear-gradient(135deg,#fff,#faf8ff); border:1px solid #cbd5e1; border-radius:22px; padding:30px; box-shadow:0 10px 35px rgba(15,23,42,.05); overflow:hidden; }
        .si-card-3d h2 { margin:0 0 7px; font-size:22px; font-weight:900; }
        .si-muted { color:#64748b; font-size:13px; font-weight:600; line-height:1.6; }
        .si-form { display:flex; flex-direction:column; gap:18px; margin-top:24px; }
        .si-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .si-form label { display:flex; flex-direction:column; gap:7px; color:#334155; font-size:12.5px; font-weight:800; }
        .si-form input,.si-form select,.si-form textarea { width:100%; box-sizing:border-box; padding:12px 13px; border:1px solid #cbd5e1; border-radius:12px; background:#f8fafc; color:#0f172a; font-size:14px; outline:none; font-weight:600; }
        .si-form input:focus,.si-form select:focus,.si-form textarea:focus { border-color:#6366f1; background:#fff; box-shadow:0 0 0 3px rgba(99,102,241,.08); }
        .si-section-head { display:flex; align-items:center; justify-content:space-between; gap:18px; margin-bottom:22px; }
        .si-button { border:0; border-radius:12px; padding:12px 18px; font-weight:900; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; text-decoration:none; font-size:13px; }
        .si-button.primary { background:linear-gradient(135deg,#6366f1,#4f46e5); color:#fff; box-shadow:0 8px 22px rgba(79,70,229,.24); }
        .si-button.secondary { background:#fff; color:#334155; border:1px solid #cbd5e1; }
        .si-button:disabled { opacity:.55; cursor:not-allowed; }
        .si-loading { padding:35px; text-align:center; color:#64748b; font-weight:700; }
        .date-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(135px,1fr)); gap:12px; }
        .date-card { border:1px solid #cbd5e1; border-radius:15px; padding:15px 10px; background:#fff; cursor:pointer; display:flex; flex-direction:column; gap:4px; align-items:center; color:#334155; }
        .date-card strong { font-size:20px; color:#4f46e5; }
        .date-card small { color:#64748b; font-weight:700; }
        .date-card.selected { background:#4f46e5; color:#fff; border-color:#4f46e5; }
        .date-card.selected strong,.date-card.selected small { color:#fff; }
        .date-card:disabled { opacity:.45; cursor:not-allowed; }
        .recommendations { margin-top:22px; padding:18px; border-radius:16px; background:#f1f5f9; border:1px solid #e2e8f0; }
        .recommendations h3 { margin:0 0 12px; font-size:15px; }
        .recommendation-list { display:grid; gap:8px; }
        .recommendation-item { width:100%; border:1px solid #e2e8f0; background:#fff; border-radius:13px; padding:12px; display:grid; grid-template-columns:auto 1fr auto; gap:10px; align-items:center; text-align:left; cursor:pointer; }
        .recommendation-item strong,.recommendation-item small,.recommendation-item em { display:block; }
        .recommendation-item small { margin-top:3px; color:#475569; font-weight:700; }
        .recommendation-item em { margin-top:2px; color:#94a3b8; font-size:11px; font-style:normal; }
        .rec-icon { font-size:22px; }
        .time-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(145px,1fr)); gap:12px; margin-bottom:22px; }
        .time-slot { border:1px solid #cbd5e1; border-radius:14px; padding:14px; background:#fff; cursor:pointer; text-align:left; }
        .time-slot strong,.time-slot small { display:block; }
        .time-slot small { margin-top:4px; color:#64748b; font-weight:700; }
        .time-slot.selected { background:#4f46e5; border-color:#4f46e5; color:#fff; }
        .time-slot.selected small { color:#e0e7ff; }
        .mode-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin:22px 0; }
        .mode-card { padding:16px; border-radius:14px; border:1px solid #cbd5e1; background:#fff; text-align:left; cursor:pointer; }
        .mode-card span,.mode-card strong,.mode-card small { display:block; }
        .mode-card span { font-size:22px; margin-bottom:7px; }
        .mode-card strong { font-size:14px; }
        .mode-card small { margin-top:5px; color:#64748b; font-weight:600; line-height:1.4; }
        .mode-card.selected { border:2px solid #6366f1; background:#eef2ff; }
        .summary-box,.confirmation-details { margin:18px 0; padding:16px; border-radius:14px; background:#f8fafc; border:1px solid #e2e8f0; display:grid; gap:7px; color:#475569; font-size:13px; font-weight:650; }
        .si-alert { margin:16px 0; padding:12px 14px; border-radius:12px; font-size:13px; font-weight:750; }
        .si-alert.error { background:#fef2f2; border:1px solid #fecaca; color:#991b1b; }
        .si-inline-button { border:0; background:transparent; color:#4f46e5; font-weight:900; margin-left:8px; cursor:pointer; }
        .success-card { text-align:center; padding:45px 30px; }
        .success-mark { width:70px; height:70px; border-radius:50%; display:grid; place-items:center; margin:0 auto 15px; background:#dcfce7; color:#16a34a; font-size:40px; font-weight:900; }
        .meeting-link { margin:12px auto 4px; }
        .confirmation-details { max-width:650px; margin:22px auto; text-align:left; grid-template-columns:1fr 1fr; }
        .confirmation-details span { display:block; color:#94a3b8; font-size:11px; text-transform:uppercase; font-weight:900; }
        .confirmation-details strong { display:block; margin-top:3px; color:#334155; }
        @media (max-width:760px) {
          .si-grid-2,.mode-grid,.confirmation-details { grid-template-columns:1fr; }
          .si-card-3d { padding:20px; }
          .si-section-head { align-items:flex-start; flex-direction:column; }
        }
      `}</style>
    </div>
  );
};

export default Scheduler;
