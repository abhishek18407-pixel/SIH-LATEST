import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../lib/supabaseClient.js";
import { DEPARTMENTS, generateComplaintId } from "../data/mockData.js";

export default function AIReview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { complaintDraft, setSubmittedComplaints, submittedComplaints, speakKey, language } = useApp();
  const [editing, setEditing] = useState(false);
  const [department, setDepartment] = useState(complaintDraft.aiResult?.department);
  const [severity, setSeverity] = useState(complaintDraft.aiResult?.severity);
  const [submitting, setSubmitting] = useState(false);

  if (!complaintDraft.aiResult) {
    navigate("/report");
    return null;
  }

  const badgeClass =
    severity === "High" ? "badge-high" : severity === "Low" ? "badge-low" : "badge-medium";

  async function confirmSubmit() {
    setSubmitting(true);
    const trackingId = generateComplaintId();

    try {
      if (user) {
        let photoUrl = null;
        if (complaintDraft.photoFile) {
          try {
            const fileExt = complaintDraft.photoFile.name.split('.').pop();
            const filePath = `${user.id}/${Date.now()}.${fileExt}`;
            const { data: uploadData } = await supabase.storage
              .from('complaint-photos')
              .upload(filePath, complaintDraft.photoFile);
            if (uploadData) {
              const { data: urlData } = supabase.storage
                .from('complaint-photos')
                .getPublicUrl(filePath);
              photoUrl = urlData?.publicUrl;
            }
          } catch {}
        }

        // Insert into Supabase complaints table
        const { data: complaintRow } = await supabase
          .from("complaints")
          .insert({
            complaint_id: trackingId,
            user_id: user.id,
            original_text: complaintDraft.transcript,
            english_text: complaintDraft.transcript,
            language_code: language || "en",
            photo_url: photoUrl,
            location_lat: complaintDraft.location?.lat || null,
            location_lng: complaintDraft.location?.lng || null,
            ai_issue: complaintDraft.aiResult?.issue || "Civic Grievance",
            ai_department: department || "Roads & Infrastructure (PWD)",
            ai_severity: severity || "Medium",
            status: "Open",
          })
          .select()
          .single();

        if (complaintRow) {
          await supabase.from("complaint_timeline").insert({
            complaint_id: complaintRow.id,
            status: "Complaint Registered",
            note: `Grievance registered and assigned to ${department || "Department"}`,
            created_by: user.id,
          });
        }
      }
    } catch (e) {
      console.warn("Cloud save note:", e);
    }

    const record = {
      id: trackingId,
      issue: complaintDraft.aiResult?.issue || complaintDraft.transcript,
      department: department || "Roads & Infrastructure (PWD)",
      severity: severity || "Medium",
      transcript: complaintDraft.transcript,
      location: complaintDraft.location,
      photo: complaintDraft.photo,
      createdAt: new Date().toLocaleString(),
    };
    setSubmittedComplaints([...submittedComplaints, record]);
    setSubmitting(false);
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