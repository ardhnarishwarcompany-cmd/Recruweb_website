import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const emptyForm = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
  relatedType: "general",
  assignedTo: "",
  status: "pending",
};

const priorityMeta = (priority) => {
  switch (priority) {
    case "high":
      return {
        bg: "#fef2f2",
        text: "#dc2626",
        border: "#fecaca",
      };
    case "medium":
      return {
        bg: "#fef3c7",
        text: "#d97706",
        border: "#fde68a",
      };
    default:
      return {
        bg: "#e0f2fe",
        text: "#0284c7",
        border: "#bae6fd",
      };
  }
};

const statusMeta = (status) => {
  switch (status) {
    case "done":
      return {
        bg: "#ecfdf5",
        text: "#059669",
        border: "#a7f3d0",
      };
    case "in-progress":
      return {
        bg: "#e0f2fe",
        text: "#0284c7",
        border: "#bae6fd",
      };
    default:
      return {
        bg: "#fef3c7",
        text: "#d97706",
        border: "#fde68a",
      };
  }
};

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [savingTask, setSavingTask] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = () => {
    setLoading(true);
    api.tasks.getAll().then((res) => {
      if (res?.success) setTasks(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const openCreateModal = () => {
    setEditingTaskId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditModal = (task) => {
    setEditingTaskId(task.id);
    setForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      relatedType: task.relatedType || "general",
      assignedTo: task.assignedTo || "",
      status: task.status || "pending",
    });
    setShowForm(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Task title is required");
      return;
    }

    try {
      setSavingTask(true);
      let res;

      if (editingTaskId) {
        res = await api.tasks.update(editingTaskId, form);
      } else {
        res = await api.tasks.create(form);
      }

      if (!res?.success) {
        throw new Error(
          res?.message ||
            (editingTaskId ? "Failed to update task" : "Failed to create task"),
        );
      }

      if (editingTaskId) {
        setTasks((prev) =>
          prev.map((t) => (t.id === editingTaskId ? { ...t, ...res.data } : t)),
        );
      } else {
        setTasks((prev) => [res.data, ...prev]);
      }

      setShowForm(false);
      setEditingTaskId(null);
      setForm(emptyForm);
      load();
    } catch (error) {
      console.error("Save task error:", error);
      alert(error?.message || "Operation failed");
    } finally {
      setSavingTask(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    await api.tasks.update(id, { status });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await api.tasks.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      (t.title && t.title.toLowerCase().includes(searchLower)) ||
      (t.assignedTo && t.assignedTo.toLowerCase().includes(searchLower)) ||
      (t.relatedType && t.relatedType.toLowerCase().includes(searchLower));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="light-tasks-container">
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

      {/* Marquee Banner */}
      <div className="task-marquee-banner">
        <div className="task-marquee-track">
          <span>✨ Recruweb Enterprise Tasks &amp; Reminders Recruiter Workspace</span>
          <span>•</span>
          <span>⏳ Recruiter Follow-ups for Candidates, Clients, and Jobs</span>
          <span>•</span>
          <span>⭐ Action Items Queue &amp; Status Tracking</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="cand-title">
              Tasks &amp; Reminders{" "}
              <span className="gradient-text">— Recruiter Workspace</span>
            </h1>
            <p className="cand-subtitle">
              Recruiter follow-ups for candidates, clients, and jobs ({tasks.length} Total Tasks)
            </p>
          </div>
          <button
            className="cv-action-btn primary glow-btn"
            onClick={() => (showForm ? setShowForm(false) : openCreateModal())}
          >
            <span>{showForm ? "Cancel Form" : "+ New Task ✨"}</span>
          </button>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Glass Task Creation/Editing Form Modal */}
      {showForm && (
        <div className="modal-overlay-light" onClick={() => setShowForm(false)}>
          <div
            className="modal-card-light animate-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "750px", maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}
          >
            <div className="drawer-header-3d">
              <div>
                <h2>
                  {editingTaskId
                    ? "✨ Edit Task or Reminder"
                    : "✨ Create New Task or Reminder"}
                </h2>
                <p className="drawer-subtext">
                  {editingTaskId
                    ? "Update existing details."
                    : "Add a new action item to your queue."}
                </p>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="drawer-scroll-body">
              <div className="task-form-grid">
                <div className="input-group-3d full-width">
                  <label>Task Title *</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Call Rahul Sharma about interview schedule"
                    required
                    className="cand-input"
                  />
                </div>
                <div className="input-group-3d full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="cand-input"
                    style={{ resize: "vertical" }}
                    placeholder="Add additional context or notes..."
                  />
                </div>
                <div className="input-group-3d">
                  <label>Priority</label>
                  <select
                    name="priority"
                    className="cand-input"
                    value={form.priority}
                    onChange={handleChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="input-group-3d">
                  <label>Related Entity Type</label>
                  <select
                    name="relatedType"
                    className="cand-input"
                    value={form.relatedType}
                    onChange={handleChange}
                  >
                    <option value="general">General</option>
                    <option value="candidate">Candidate</option>
                    <option value="client">Client</option>
                    <option value="job">Job</option>
                  </select>
                </div>
                <div className="input-group-3d">
                  <label>Status</label>
                  <select
                    name="status"
                    className="cand-input"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div className="input-group-3d">
                  <label>Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    className="cand-input"
                    value={form.dueDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group-3d full-width">
                  <label>Assigned Recruiter</label>
                  <input
                    name="assignedTo"
                    value={form.assignedTo}
                    onChange={handleChange}
                    placeholder="Recruiter name"
                    className="cand-input"
                  />
                </div>
              </div>

              <div className="full-width task-form-actions" style={{ marginTop: "10px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  className="cv-action-btn secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cv-action-btn primary glow-btn"
                  disabled={savingTask}
                >
                  {savingTask
                    ? "Saving..."
                    : editingTaskId
                      ? "Save Changes ✨"
                      : "🚀 Create Task ✨"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toolbar & Filter Bar */}
      <div className="cand-card-3d" style={{ padding: "20px 24px", marginBottom: "24px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div className="card-bg-light-glow"></div>
        <div className="search-input-wrap" style={{ position: 'relative', zIndex: 2, flex: 1, display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: "12px", padding: "8px 14px", minWidth: "280px" }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="task-search-input"
            placeholder="Search by task title, assigned recruiter, or related type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-select-wrap" style={{ position: 'relative', zIndex: 2, display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "0 16px", borderRadius: "12px" }}>
          <span className="filter-icon">📌</span>
          <select
            className="task-select-dark"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Glass Panel Table Area */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Fetching tasks &amp;
              reminders...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="cand-empty-state">
              📝 No tasks found matching your active filter.
            </div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Task Title &amp; Description</th>
                    <th>Related Type</th>
                    <th>Assigned Recruiter</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((t) => {
                    const pMeta = priorityMeta(t.priority);
                    const sMeta = statusMeta(t.status);
                    return (
                      <tr key={t.id} className="table-row-hover">
                        <td>
                          <div className="task-title-cell">
                            <strong>{t.title}</strong>
                            {t.description && (
                              <span className="task-desc-sub">
                                {t.description}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="related-type-pill">
                            {t.relatedType}
                          </span>
                        </td>
                        <td style={{ color: "#334155", fontWeight: "700" }}>{t.assignedTo || "—"}</td>
                        <td>
                          <span
                            className="priority-pill"
                            style={{
                              background: pMeta.bg,
                              color: pMeta.text,
                              borderColor: pMeta.border,
                            }}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td className="date-text">
                          {t.dueDate
                            ? new Date(t.dueDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td>
                          <select
                            className="task-table-select"
                            style={{
                              background: sMeta.bg,
                              color: sMeta.text,
                              borderColor: sMeta.border,
                            }}
                            value={t.status}
                            onChange={(e) =>
                              handleStatusChange(t.id, e.target.value)
                            }
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        </td>
                        <td>
                          <div className="action-buttons-group">
                            <button
                              className="cv-action-btn secondary"
                              style={{ padding: "6px 12px", fontSize: "12px" }}
                              onClick={() => openEditModal(t)}
                            >
                              Edit
                            </button>
                            <button
                              className="cv-action-btn"
                              style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                              onClick={() => handleDelete(t.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card-glow-bar"></div>
      </div>

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-tasks-container {
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
          background: linear-gradient(135deg, #0284c7, #6366f1);
          border-radius: 50%;
          opacity: 0.4;
          animation: floatCandParticle linear infinite;
          box-shadow: 0 0 8px rgba(2, 132, 199, 0.4);
        }

        @keyframes floatCandParticle {
          0% { transform: translateY(0px) scale(0.8); opacity: 0.2; }
          50% { transform: translateY(-25px) scale(1.2); opacity: 0.6; }
          100% { transform: translateY(0px) scale(0.8); opacity: 0.2; }
        }

        /* Marquee Ribbon */
        .task-marquee-banner {
          background: linear-gradient(90deg, #0284c7, #6366f1);
          color: #ffffff;
          padding: 10px 0;
          overflow: hidden;
          white-space: nowrap;
          position: relative;
          z-index: 2;
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.2);
          margin-bottom: 24px;
        }

        .task-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .task-marquee-track span {
          margin: 0 20px;
        }

        @keyframes marqueeScroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        .cand-header-3d {
          position: relative;
          z-index: 2;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 22px;
          padding: 28px 32px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .cand-header-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-5px);
          box-shadow: 0 20px 50px rgba(2, 132, 199, 0.14);
          border-color: rgba(2, 132, 199, 0.4);
        }

        .card-bg-light-glow {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 90px;
          height: 90px;
          background: radial-gradient(circle, rgba(2, 132, 199, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .card-glow-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3.5px;
          background: linear-gradient(90deg, #0284c7, #6366f1);
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
          background: linear-gradient(135deg, #0284c7 0%, #6366f1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cand-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          font-weight: 600;
        }

        .cv-action-btn {
          padding: 10px 18px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
        }

        .cv-action-btn.primary {
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: #fff;
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.25);
        }

        .cv-action-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(2, 132, 199, 0.4);
        }

        .cv-action-btn.secondary {
          background: #f1f5f9;
          color: #334155;
          border: 1.5px solid #cbd5e1;
        }

        .cv-action-btn.secondary:hover {
          background: #e2e8f0;
          border-color: #94a3b8;
        }

        /* Modal styling */
        .modal-overlay-light {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-card-light {
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 24px;
          box-shadow: 0 25px 60px rgba(15, 23, 42, 0.2);
          width: 100%;
        }

        .animate-modal {
          animation: modalAppear 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes modalAppear {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .drawer-header-3d {
          padding: 24px;
          border-bottom: 1.5px solid #e2e8f0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          background: #f8fafc;
        }

        .drawer-header-3d h2, .form-heading {
          font-size: 22px;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .drawer-subtext, .job-modal-header p {
          font-size: 13px;
          color: #64748b;
          margin: 0;
          font-weight: 700;
        }

        .close-drawer-btn, .job-modal-close {
          background: none;
          border: none;
          color: #64748b;
          font-size: 28px;
          cursor: pointer;
          font-weight: 900;
        }
        .close-drawer-btn:hover, .job-modal-close:hover {
          color: #0f172a;
        }

        .drawer-scroll-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          background: #ffffff;
        }

        .task-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .full-width {
          grid-column: 1 / -1;
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

        .cand-input, .task-select-input {
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
        }

        .cand-input:focus, .task-select-input:focus {
          border-color: #0284c7;
          background: #ffffff;
          box-shadow: 0 0 12px rgba(2, 132, 199, 0.15);
        }

        .task-search-input {
          width: 100%;
          background: none;
          border: none;
          outline: none;
          color: #0f172a;
          font-size: 14px;
          font-weight: 600;
        }

        .task-select-dark {
          background: none;
          border: none;
          outline: none;
          color: #0f172a;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          padding: 10px 0;
        }

        .cand-card-3d {
          position: relative;
          z-index: 2;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 22px;
          padding: 28px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .cand-card-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-5px);
          box-shadow: 0 20px 50px rgba(2, 132, 199, 0.14);
          border-color: rgba(2, 132, 199, 0.4);
        }

        .cand-table-wrap {
          overflow-x: auto;
        }

        .cand-light-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .cand-light-table th {
          padding: 14px 16px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          color: #64748b;
          border-bottom: 1.5px solid #cbd5e1;
          letter-spacing: 0.5px;
          background: #f8fafc;
        }

        .cand-light-table td {
          padding: 16px;
          font-size: 13.5px;
          color: #334155;
          font-weight: 700;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: middle;
        }

        .table-row-hover:hover {
          background: #f8fafc;
        }

        .task-title-cell strong {
          color: #0f172a;
          font-size: 14.5px;
          font-weight: 900;
        }

        .task-desc-sub {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
        }

        .related-type-pill {
          background: #e0f2fe;
          color: #0284c7;
          font-size: 11.5px;
          font-weight: 900;
          padding: 4px 11px;
          border-radius: 12px;
          border: 1.5px solid #bae6fd;
          text-transform: capitalize;
        }

        .priority-pill {
          font-size: 11.5px;
          font-weight: 900;
          padding: 4px 11px;
          border-radius: 12px;
          border: 1.5px solid;
          text-transform: uppercase;
        }

        .date-text {
          font-size: 12.5px;
          color: #64748b;
          font-weight: 700;
        }

        .task-table-select {
          border: 1.5px solid;
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 800;
          outline: none;
          cursor: pointer;
          text-transform: capitalize;
        }

        .action-buttons-group {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }

        .cand-loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 60px;
          color: #0284c7;
          font-weight: 900;
        }

        .cand-loader {
          width: 22px;
          height: 22px;
          border: 3px solid #0284c7;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .cand-empty-state {
          text-align: center;
          padding: 60px;
          color: #64748b;
          font-size: 14px;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .task-form-grid {
            grid-template-columns: 1fr;
          }
          .full-width {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminTasks;