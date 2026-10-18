import React from "react";
import resumeTemplates from "../../data/resumeTemplates";

export default function ResumePreview({
  templateId,
  accentColor = "#2563eb",
  data,
}) {
  const tpl =
    resumeTemplates.find((t) => t.id === templateId) || resumeTemplates[0];
  const p = data?.personal || {};
  const summary = data?.summary || "";
  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills || [];
  const projects = data?.projects || [];
  const certifications = data?.certifications || [];
  const languages = data?.languages || [];
  const achievements = data?.achievements || [];

  // --- 1. MODERN SIDEBAR LAYOUT ---
  if (templateId === "modern-sidebar") {
    return (
      <div
        className="resume-sheet"
        style={{
          background: "#fff",
          color: "#1e293b",
          fontFamily: "Inter, sans-serif",
          display: "flex",
          width: "210mm",
          minHeight: "297mm",
          margin: "0 auto",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {/* Left Sidebar */}
        <div
          style={{
            width: "32%",
            background: accentColor,
            color: "#fff",
            padding: "32px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: "800",
                lineHeight: "1.2",
                marginBottom: "6px",
              }}
            >
              {p.fullName || "Your Name"}
            </h1>
            <p style={{ fontSize: "0.85rem", opacity: 0.9, fontWeight: "500" }}>
              {p.headline || "Target Role"}
            </p>
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              opacity: 0.95,
            }}
          >
            {p.email && <div>✉ {p.email}</div>}
            {p.phone && <div>📞 {p.phone}</div>}
            {p.location && <div>📍 {p.location}</div>}
            {p.linkedin && <div>💼 {p.linkedin}</div>}
            {p.website && <div>🌐 {p.website}</div>}
          </div>
          {skills.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  borderBottom: "1px solid rgba(255,255,255,0.3)",
                  paddingBottom: "4px",
                  marginBottom: "10px",
                }}
              >
                Skills
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {skills.map((s, i) => (
                  <span
                    key={i}
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Right Main Content */}
        <div
          style={{
            flex: 1,
            padding: "36px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {summary && (
            <div>
              <h3
                style={{
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  color: accentColor,
                  borderBottom: "2px solid #f1f5f9",
                  paddingBottom: "4px",
                  marginBottom: "8px",
                  fontWeight: "700",
                }}
              >
                Profile
              </h3>
              <p
                style={{
                  fontSize: "0.8rem",
                  lineHeight: "1.5",
                  color: "#475569",
                }}
              >
                {summary}
              </p>
            </div>
          )}
          {experience.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  color: accentColor,
                  borderBottom: "2px solid #f1f5f9",
                  paddingBottom: "4px",
                  marginBottom: "10px",
                  fontWeight: "700",
                }}
              >
                Experience
              </h3>
              {experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "between",
                      fontWeight: "700",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span>{exp.jobTitle}</span>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: accentColor,
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    {exp.company}
                  </div>
                  <ul
                    style={{
                      paddingLeft: "15px",
                      margin: 0,
                      fontSize: "0.75rem",
                      color: "#475569",
                    }}
                  >
                    {exp.bullets?.map(
                      (b, bi) =>
                        b && (
                          <li key={bi} style={{ marginBottom: "2px" }}>
                            {b}
                          </li>
                        ),
                    )}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- 2. BOLD HEADER LAYOUT ---
  if (templateId === "bold-header") {
    return (
      <div
        className="resume-sheet"
        style={{
          background: "#fff",
          color: "#1e293b",
          fontFamily: "Inter, sans-serif",
          width: "210mm",
          minHeight: "297mm",
          margin: "0 auto",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: accentColor,
            color: "#fff",
            padding: "30px 40px",
            textAlign: "center",
          }}
        >
          <h1
            style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "4px" }}
          >
            {p.fullName || "Your Name"}
          </h1>
          <p
            style={{
              fontSize: "1rem",
              fontWeight: "500",
              opacity: 0.9,
              marginBottom: "12px",
            }}
          >
            {p.headline || "Target Role"}
          </p>
          <div
            style={{
              fontSize: "0.75rem",
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              flexWrap: "wrap",
              opacity: 0.95,
            }}
          >
            {p.email && <span>✉ {p.email}</span>}
            {p.phone && <span>📞 {p.phone}</span>}
            {p.location && <span>📍 {p.location}</span>}
            {p.linkedin && <span>💼 {p.linkedin}</span>}
          </div>
        </div>
        <div
          style={{
            padding: "36px 40px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {summary && (
            <div>
              <h3
                style={{
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  color: accentColor,
                  borderBottom: `2px solid ${accentColor}`,
                  paddingBottom: "4px",
                  marginBottom: "8px",
                  fontWeight: "700",
                }}
              >
                Summary
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  lineHeight: "1.6",
                  color: "#475569",
                }}
              >
                {summary}
              </p>
            </div>
          )}
          {experience.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  color: accentColor,
                  borderBottom: `2px solid ${accentColor}`,
                  paddingBottom: "4px",
                  marginBottom: "12px",
                  fontWeight: "700",
                }}
              >
                Professional Experience
              </h3>
              {experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: "14px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontWeight: "700",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span>
                      {exp.jobTitle} —{" "}
                      <span style={{ color: accentColor }}>{exp.company}</span>
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <ul
                    style={{
                      paddingLeft: "16px",
                      margin: "4px 0 0 0",
                      fontSize: "0.8rem",
                      color: "#475569",
                    }}
                  >
                    {exp.bullets?.map(
                      (b, bi) =>
                        b && (
                          <li key={bi} style={{ marginBottom: "3px" }}>
                            {b}
                          </li>
                        ),
                    )}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- 3. MINIMAL CLEAN / EXECUTIVE / DEFAULT LAYOUT ---
  return (
    <div
      className="resume-sheet"
      style={{
        background: "#fff",
        color: "#1e293b",
        fontFamily: "Inter, sans-serif",
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        padding: "44px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          borderBottom: `3px solid ${accentColor}`,
          paddingBottom: "16px",
          marginBottom: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: "800",
            color: "#0f172a",
            marginBottom: "4px",
          }}
        >
          {p.fullName || "Your Name"}
        </h1>
        <p
          style={{
            fontSize: "1rem",
            fontWeight: "600",
            color: accentColor,
            marginBottom: "8px",
          }}
        >
          {p.headline || "Target Role"}
        </p>
        <div
          style={{
            fontSize: "0.75rem",
            display: "flex",
            gap: "14px",
            flexWrap: "wrap",
            color: "#64748b",
          }}
        >
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
        </div>
      </div>

      {summary && (
        <div style={{ marginBottom: "18px" }}>
          <h3
            style={{
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: accentColor,
              fontWeight: "700",
              marginBottom: "6px",
            }}
          >
            Professional Summary
          </h3>
          <p
            style={{ fontSize: "0.8rem", lineHeight: "1.6", color: "#334155" }}
          >
            {summary}
          </p>
        </div>
      )}

      {experience.length > 0 && (
        <div style={{ marginBottom: "18px" }}>
          <h3
            style={{
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: accentColor,
              fontWeight: "700",
              marginBottom: "10px",
            }}
          >
            Experience
          </h3>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                }}
              >
                <span>
                  {exp.jobTitle} at {exp.company}
                </span>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              <ul
                style={{
                  paddingLeft: "15px",
                  margin: "4px 0 0 0",
                  fontSize: "0.78rem",
                  color: "#475569",
                }}
              >
                {exp.bullets?.map(
                  (b, bi) =>
                    b && (
                      <li key={bi} style={{ marginBottom: "2px" }}>
                        {b}
                      </li>
                    ),
                )}
              </ul>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div>
          <h3
            style={{
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: accentColor,
              fontWeight: "700",
              marginBottom: "6px",
            }}
          >
            Skills
          </h3>
          <p style={{ fontSize: "0.8rem", color: "#334155" }}>
            {skills.join(" • ")}
          </p>
        </div>
      )}
    </div>
  );
}
