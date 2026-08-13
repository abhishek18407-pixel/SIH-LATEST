import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { DEPARTMENTS, generateComplaintId } from "../data/mockData.js";

export default function AIReview() {
  const navigate = useNavigate();
  const { complaintDraft, setSubmittedComplaints, submittedComplaints, speakKey } = useApp();
  const [editing, setEditing] = useState(false);
  const [department, setDepartment] = useState(complaintDraft.aiResult?.department);
  const [severity, setSeverity] = useState(complaintDraft.aiResult?.severity);

  if (!complaintDraft.aiResult) {
    navigate("/report");
    return null;
  }

  const badgeClass =
    severity === "High" ? "badge-high" : severity === "Low" ? "badge-low" : "badge-medium";

  function confirmSubmit() {
    const trackingId = complaintDraft.aiResult?.tracking_id || complaintDraft.createdRecord?.tracking_id || generateComplaintId();
    const record = {
      id: trackingId,
      issue: complaintDraft.aiResult?.issue || complaintDraft.transcript,
      department: department || "Roads & Infrastructure",
      severity: severity || "Medium",
      transcript: complaintDraft.transcript,
      location: complaintDraft.location,
      photo: complaintDraft.photo,
      createdAt: new Date().toLocaleString(),
    };
    setSubmittedComplaints([...submittedComplaints, record]);
    navigate("/registered", { state: { id: trackingId } });
  }

  return (
    <div className="screen">
      <div className="back-link" onClick={() => navigate(-1)}>&larr; Back</div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div className="title">AI Understanding</div>
        <span style={{ fontSize: 20, cursor: "pointer" }} onClick={() => speakKey("ai_understanding")}>🔊</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div className="subtitle">Please review before submitting</div>
        <span style={{ fontSize: 18, cursor: "pointer", marginBottom: 20 }} onClick={() => speakKey("review_subtitle")}>🔊</span>
      </div>

      {complaintDraft.aiResult.unclassified && (
        <div style={{
          background: "#fef7e0", border: "1px solid #f9ab00", borderRadius: 10,
          padding: 12, marginBottom: 4, fontSize: 13, color: "#8a6100"
        }}>
          ⚠️ We couldn't clearly understand your complaint. Please add more detail or select the correct department below.
        </div>
      )}

      <div className="card">
        <div className="card-row">
          <span className="card-label">You said</span>
        </div>
        <div style={{ fontStyle: "italic", marginBottom: 10 }}>"{complaintDraft.transcript}"</div>

        <div className="card-row">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="card-label">Issue</span>
            <span style={{ fontSize: 16, cursor: "pointer" }} onClick={() => speakKey("issue")}>🔊</span>
          </div>
          <span className="card-value">{complaintDraft.aiResult.issue}</span>
        </div>

        <div className="card-row">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="card-label">Department</span>
            <span style={{ fontSize: 16, cursor: "pointer" }} onClick={() => speakKey("department")}>🔊</span>
          </div>
          {editing ? (
            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          ) : (
            <span className="card-value">{department}</span>
          )}
        </div>

        <div className="card-row">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="card-label">Severity</span>
            <span style={{ fontSize: 16, cursor: "pointer" }} onClick={() => speakKey("severity")}>🔊</span>
          </div>
          {editing ? (
            <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          ) : (
            <span className={`badge ${badgeClass}`}>{severity}</span>
          )}
        </div>

        <div className="card-row">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="card-label">Photo</span>
            <span style={{ fontSize: 16, cursor: "pointer" }} onClick={() => speakKey("photo")}>🔊</span>
          </div>
          <span className="card-value">{complaintDraft.photo || "Not attached"}</span>
        </div>

        <div className="card-row">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="card-label">Location</span>
            <span style={{ fontSize: 16, cursor: "pointer" }} onClick={() => speakKey("location")}>🔊</span>
          </div>
          <span className="card-value">
            {complaintDraft.location ? "Captured" : "Not detected"}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditing(!editing)}>
          ✏️ Edit Details
        </button>
        <span style={{ fontSize: 20, cursor: "pointer" }} onClick={() => speakKey("edit_details")}>🔊</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button className="btn btn-success" style={{ flex: 1 }} onClick={confirmSubmit}>
          Confirm & Submit
        </button>
        <span style={{ fontSize: 20, cursor: "pointer" }} onClick={() => speakKey("confirm_submit")}>🔊</span>
      </div>
    </div>
  );
}