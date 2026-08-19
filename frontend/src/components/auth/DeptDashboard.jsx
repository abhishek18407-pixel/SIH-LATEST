import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { DEPARTMENTS } from "../../data/mockData";
import ComplaintMap from "../ComplaintMap";

const STATUS_BADGE = {
  "Open":        "badge-high",
  "In Progress": "badge-medium",
  "Resolved":    "badge-low",
  "Rejected":    "badge-high",
};

export default function DeptDashboard() {
  const { profile, user, logout } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [updatingId, setUpdatingId]         = useState(null);
  const [statusNote, setStatusNote]         = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery]       = useState("");
  const [selectedDept, setSelectedDept]     = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [showMap, setShowMap]               = useState(true);

  // Fetch all grievances from Supabase
  const loadComplaints = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          *,
          complaint_timeline (*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComplaints(data || []);

      // If a complaint was currently open in detail modal, update its state
      if (selectedComplaint) {
        const fresh = (data || []).find((c) => c.id === selectedComplaint.id);
        if (fresh) setSelectedComplaint(fresh);
      }
    } catch (err) {
      console.error("Failed to load grievances:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [user]);

  // Update status of a grievance in Supabase
  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      setUpdatingId(complaintId);
      const { error } = await supabase
        .from("complaints")
        .update({ status: newStatus })
        .eq("id", complaintId);

      if (error) throw error;

      // Add timeline entry
      const noteText = statusNote.trim()
        ? statusNote.trim()
        : `Status changed to "${newStatus}" by ${profile?.dept_name || "Department Official"}`;

      await supabase.from("complaint_timeline").insert({
        complaint_id: complaintId,
        status: newStatus,
        note: noteText,
        created_by: user?.id,
      });

      setStatusNote("");
      await loadComplaints();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: complaints.length,
      open: complaints.filter((c) => c.status === "Open").length,
      inProgress: complaints.filter((c) => c.status === "In Progress").length,
      resolved: complaints.filter((c) => c.status === "Resolved").length,
    };
  }, [complaints]);

  // Filtered grievances list
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Status filter
      if (selectedStatus !== "ALL" && c.status !== selectedStatus) return false;

      // Department filter
      if (selectedDept !== "ALL" && c.ai_department !== selectedDept) return false;

      // Search filter (id or text or issue)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = c.complaint_id?.toLowerCase().includes(q);
        const matchesIssue = c.ai_issue?.toLowerCase().includes(q);
        const matchesText = c.original_text?.toLowerCase().includes(q);
        const matchesDept = c.ai_department?.toLowerCase().includes(q);
        if (!matchesId && !matchesIssue && !matchesText && !matchesDept) return false;
      }

      return true;
    });
  }, [complaints, selectedStatus, selectedDept, searchQuery]);

  return (
    <div className="screen">
      {/* ── Top Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="eyebrow" style={{ display: "inline-block", marginBottom: 8 }}>Department Officer Portal</div>
          <h1 className="title" style={{ fontSize: "clamp(32px, 3.5vw, 54px)", margin: 0 }}>
            {profile?.dept_name || "Grievance Management"}
          </h1>
          <p className="subtitle" style={{ marginTop: 6, marginBottom: 0 }}>
            Official Code: <strong style={{ color: "var(--text)" }}>{profile?.dept_code || "OFFICIAL"}</strong>
            &nbsp;·&nbsp; Click any complaint to view full details, photos, and update resolution status.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            className="btn btn-outline"
            style={{ width: "auto", padding: "8px 16px", fontSize: 13, margin: 0 }}
            onClick={loadComplaints}
            disabled={loading}
          >
            {loading ? "⌛ Loading…" : "🔄 Refresh"}
          </button>
          <button
            className="btn btn-outline"
            style={{ width: "auto", padding: "8px 18px", fontSize: 13, margin: 0 }}
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* ── Stat Counters ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 24 }}>
        <div
          className="card"
          style={{
            margin: 0, padding: "18px 14px", textAlign: "center", cursor: "pointer",
            border: selectedStatus === "ALL" ? "2px solid var(--sage-strong)" : "1px solid var(--line)"
          }}
          onClick={() => setSelectedStatus("ALL")}
        >
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Total Grievances</div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>{stats.total}</div>
        </div>

        <div
          className="card"
          style={{
            margin: 0, padding: "18px 14px", textAlign: "center", cursor: "pointer",
            border: selectedStatus === "Open" ? "2px solid var(--danger)" : "1px solid var(--line)"
          }}
          onClick={() => setSelectedStatus("Open")}
        >
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>🔴 Open</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "var(--danger)" }}>{stats.open}</div>
        </div>

        <div
          className="card"
          style={{
            margin: 0, padding: "18px 14px", textAlign: "center", cursor: "pointer",
            border: selectedStatus === "In Progress" ? "2px solid var(--sage-strong)" : "1px solid var(--line)"
          }}
          onClick={() => setSelectedStatus("In Progress")}
        >
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>🟡 In Progress</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "var(--sage-strong)" }}>{stats.inProgress}</div>
        </div>

        <div
          className="card"
          style={{
            margin: 0, padding: "18px 14px", textAlign: "center", cursor: "pointer",
            border: selectedStatus === "Resolved" ? "2px solid var(--success)" : "1px solid var(--line)"
          }}
          onClick={() => setSelectedStatus("Resolved")}
        >
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>🟢 Resolved</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "var(--success)" }}>{stats.resolved}</div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="card" style={{ padding: "16px 20px", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {/* Search Input */}
          <input
            type="text"
            className="form-input"
            style={{ flex: "2 1 220px", margin: 0, padding: "10px 14px" }}
            placeholder="🔍 Search Tracking ID, citizen issue, keyword…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Department Filter Dropdown */}
          <select
            className="form-input"
            style={{ flex: "1 1 200px", margin: 0, padding: "10px 14px", cursor: "pointer" }}
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="ALL">🏛️ All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Status Filter Dropdown */}
          <select
            className="form-input"
            style={{ flex: "1 1 140px", margin: 0, padding: "10px 14px", cursor: "pointer" }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">Status: All</option>
            <option value="Open">🔴 Open</option>
            <option value="In Progress">🟡 In Progress</option>
            <option value="Resolved">🟢 Resolved</option>
            <option value="Rejected">⚪ Rejected</option>
          </select>

          {/* Toggle Map Button */}
          <button
            className="btn btn-outline"
            style={{ width: "auto", margin: 0, padding: "10px 16px", fontSize: 13 }}
            onClick={() => setShowMap(!showMap)}
          >
            {showMap ? "🗺️ Hide Map" : "🗺️ Show Live Map"}
          </button>
        </div>
      </div>

      {/* ── Interactive Map View Section ── */}
      {showMap && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--sage-strong)" }}>
              📍 Live City Grievance Heatmap & Pins ({filteredComplaints.filter(c => c.location_lat && c.location_lng).length} geotagged)
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              Click any pin on the map to inspect details
            </div>
          </div>
          <ComplaintMap complaints={filteredComplaints} onSelectComplaint={(c) => setSelectedComplaint(c)} />
        </div>
      )}

      {/* ── Complaints Section Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>
          Grievance Records ({filteredComplaints.length})
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          👉 Click any row to view full details
        </div>
      </div>

      {/* ── Complaints List (Compact, Clickable Table/Cards) ── */}
      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ fontSize: 15, color: "var(--muted)" }}>⌛ Loading assigned grievances from database…</div>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "54px 20px" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No grievances found</div>
          <div className="subtitle" style={{ margin: "0 auto", maxWidth: 360 }}>
            {searchQuery || selectedDept !== "ALL" || selectedStatus !== "ALL"
              ? "Try changing your search keywords or filter options above."
              : "When citizens submit complaints, they will appear here in real-time."}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredComplaints.map((c) => (
            <div
              key={c.id}
              className="card"
              style={{
                margin: 0,
                padding: "16px 20px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                border: selectedComplaint?.id === c.id ? "2px solid var(--sage-strong)" : "1px solid var(--line)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
              onClick={() => setSelectedComplaint(c)}
            >
              {/* Left col: ID + Title + Department */}
              <div style={{ flex: "2 1 260px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 800, color: "var(--primary)" }}>
                    {c.complaint_id}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    {c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}
                  </span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>
                  {c.ai_issue || "Citizen Grievance"}
                </div>
                <div style={{ fontSize: 12, color: "var(--sage-strong)" }}>
                  🏛️ {c.ai_department || "General Administration"}
                </div>
              </div>

              {/* Middle col: Text excerpt */}
              <div style={{ flex: "3 1 280px", fontSize: 13, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                &ldquo;{c.original_text || "No description"}&rdquo;
              </div>

              {/* Right col: Badges + Action button */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span className={`badge ${c.ai_severity === "High" ? "badge-high" : c.ai_severity === "Low" ? "badge-low" : "badge-medium"}`}>
                  {c.ai_severity || "Medium"}
                </span>
                <span className={`badge ${STATUS_BADGE[c.status] || "badge-medium"}`}>
                  {c.status}
                </span>
                <button
                  className="btn btn-outline"
                  style={{ width: "auto", margin: 0, padding: "6px 12px", fontSize: 12 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedComplaint(c);
                  }}
                >
                  View Details &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Detail View Modal (Full Details on Click) ── */}
      {selectedComplaint && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            maxWidth: "none",
            height: "100vh",
            background: "rgba(10, 10, 10, 0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
            padding: "20px",
            boxSizing: "border-box",
          }}
          onClick={() => setSelectedComplaint(null)}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "760px",
              maxHeight: "88vh",
              overflowY: "auto",
              margin: "0 auto",
              padding: "28px clamp(20px, 3vw, 36px)",
              background: "#333331",
              border: "1px solid var(--sage-strong)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
              borderRadius: "20px",
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, borderBottom: "1px solid rgba(138, 143, 128, 0.2)", paddingBottom: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 900, color: "var(--primary)" }}>
                    {selectedComplaint.complaint_id}
                  </span>
                  <span className={`badge ${STATUS_BADGE[selectedComplaint.status] || "badge-medium"}`}>
                    {selectedComplaint.status}
                  </span>
                  <span className={`badge ${selectedComplaint.ai_severity === "High" ? "badge-high" : selectedComplaint.ai_severity === "Low" ? "badge-low" : "badge-medium"}`}>
                    {selectedComplaint.ai_severity || "Medium"} Priority
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                  Filed on: {selectedComplaint.created_at ? new Date(selectedComplaint.created_at).toLocaleString("en-IN") : "—"}
                </div>
              </div>

              <button
                style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 24, cursor: "pointer", padding: "4px 8px" }}
                onClick={() => setSelectedComplaint(null)}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Department info */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                Assigned Department
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--sage-strong)" }}>
                🏛️ {selectedComplaint.ai_department || "General Administration"}
              </div>
            </div>

            {/* Issue Title */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                Issue Category
              </div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>
                {selectedComplaint.ai_issue || "Citizen Grievance"}
              </div>
            </div>

            {/* Citizen Voice / Text Transcript */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Citizen Description / Voice Transcript
              </div>
              <div style={{
                background: "rgba(0, 0, 0, 0.25)",
                padding: "16px",
                borderRadius: "12px",
                fontSize: "14px",
                lineHeight: "1.6",
                color: "var(--text)",
                fontStyle: "italic",
                border: "1px solid rgba(138, 143, 128, 0.15)"
              }}>
                &ldquo;{selectedComplaint.original_text || "No description available."}&rdquo;
              </div>
            </div>

            {/* Photo Evidence & Location Details */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
              {/* Photo */}
              <div style={{ background: "rgba(0,0,0,0.15)", padding: "14px", borderRadius: "12px", border: "1px solid var(--line)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 8 }}>
                  📷 Photo Evidence
                </div>
                {selectedComplaint.photo_url ? (
                  <div>
                    <img
                      src={selectedComplaint.photo_url}
                      alt="Grievance Evidence"
                      style={{ width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "8px", marginBottom: 8 }}
                    />
                    <a
                      href={selectedComplaint.photo_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "var(--sage-strong)", fontSize: 12, fontWeight: 700, textDecoration: "none" }}
                    >
                      Open Full Resolution ↗
                    </a>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>No photo attached</div>
                )}
              </div>

              {/* Location */}
              <div style={{ background: "rgba(0,0,0,0.15)", padding: "14px", borderRadius: "12px", border: "1px solid var(--line)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 8 }}>
                  📍 Geolocation Data
                </div>
                {selectedComplaint.location_lat && selectedComplaint.location_lng ? (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                      {selectedComplaint.location_lat.toFixed(4)}, {selectedComplaint.location_lng.toFixed(4)}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
                      Coordinates captured via citizen device GPS
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${selectedComplaint.location_lat},${selectedComplaint.location_lng}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "var(--sage-strong)", fontSize: 12, fontWeight: 700, textDecoration: "none" }}
                    >
                      View on Google Maps ↗
                    </a>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>No GPS coordinates detected</div>
                )}
              </div>
            </div>

            {/* Status Timeline History */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                📜 Activity & Status Timeline
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(selectedComplaint.complaint_timeline && selectedComplaint.complaint_timeline.length > 0
                  ? selectedComplaint.complaint_timeline
                  : [
                      {
                        status: selectedComplaint.status,
                        note: "Grievance registered in system",
                        created_at: selectedComplaint.created_at,
                      },
                    ]
                ).map((t, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 13 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--sage-strong)", marginTop: 5 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{t.status}</div>
                      <div style={{ color: "var(--muted)", fontSize: 12 }}>{t.note || "Status logged"}</div>
                      <div style={{ color: "#777", fontSize: 11 }}>
                        {t.created_at ? new Date(t.created_at).toLocaleString("en-IN") : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resolution Form / Action Box */}
            <div style={{
              background: "rgba(213, 224, 206, 0.06)",
              border: "1px solid rgba(213, 224, 206, 0.25)",
              padding: "20px",
              borderRadius: "14px",
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--sage-strong)", marginBottom: 12 }}>
                ⚡ Take Action: Update Grievance Status
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                <div style={{ flex: "1 1 180px" }}>
                  <label className="form-label" style={{ fontSize: 12 }}>Change Status To:</label>
                  <select
                    id="new-status-select"
                    className="form-input"
                    defaultValue={selectedComplaint.status}
                    style={{ margin: 0, padding: "10px" }}
                  >
                    <option value="Open">🔴 Open</option>
                    <option value="In Progress">🟡 In Progress</option>
                    <option value="Resolved">🟢 Resolved</option>
                    <option value="Rejected">⚪ Rejected</option>
                  </select>
                </div>

                <div style={{ flex: "2 1 240px" }}>
                  <label className="form-label" style={{ fontSize: 12 }}>Official Action / Resolution Note:</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ margin: 0, padding: "10px" }}
                    placeholder="e.g. Dispatched repair team to location…"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                  />
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: "100%", margin: 0, padding: "12px", fontSize: 14 }}
                disabled={updatingId === selectedComplaint.id}
                onClick={() => {
                  const selectEl = document.getElementById("new-status-select");
                  const newStatus = selectEl ? selectEl.value : selectedComplaint.status;
                  handleStatusChange(selectedComplaint.id, newStatus);
                }}
              >
                {updatingId === selectedComplaint.id ? "Updating Status…" : "Save & Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
