import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function ComplaintTracking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { speakKey, submittedComplaints } = useApp();
  const [searchId, setSearchId] = useState(state?.id || "");
  const [loading, setLoading] = useState(false);
  const [trackData, setTrackData] = useState(null);

  async function search(idToQuery) {
    const q = (idToQuery || searchId).trim();
    if (!q) return;

    setLoading(true);
    try {
      // 1. Try querying Supabase live database
      const { data: dbComplaint, error: dbErr } = await supabase
        .from("complaints")
        .select(`
          *,
          complaint_timeline (*)
        `)
        .eq("complaint_id", q)
        .maybeSingle();

      if (dbComplaint) {
        setTrackData({
          complaint: {
            tracking_id: dbComplaint.complaint_id,
            status: dbComplaint.status,
            department_name: dbComplaint.ai_department,
            urgency: dbComplaint.ai_severity,
            translated_text: dbComplaint.english_text || dbComplaint.original_text,
            raw_text: dbComplaint.original_text,
            photo_url: dbComplaint.photo_url,
            created_at: dbComplaint.created_at,
          },
          status_timeline: dbComplaint.complaint_timeline?.map((t) => ({
            new_status: t.status,
            notes: t.note,
            updated_at: t.created_at,
          })) || [
            {
              new_status: dbComplaint.status,
              notes: `Routed to ${dbComplaint.ai_department}`,
              updated_at: dbComplaint.created_at,
            },
          ],
        });
        return;
      }

      // 2. Fallback to local session complaints
      const local = submittedComplaints.find((c) => c.id === q);
      if (local) {
        setTrackData({
          complaint: {
            tracking_id: local.id,
            status: "Open",
            department_name: local.department,
            urgency: local.severity,
            translated_text: local.issue,
            created_at: local.createdAt,
          },
          status_timeline: [
            {
              new_status: "Complaint Registered",
              notes: "Grievance registered & categorized via AI",
              updated_at: new Date().toISOString(),
            },
            {
              new_status: "Assigned to Department",
              notes: `Assigned to ${local.department}`,
              updated_at: new Date().toISOString(),
            },
          ],
        });
        return;
      }

      throw new Error(`Tracking code '${q}' not found.`);
    } catch (err) {
      alert(err.message || "Tracking lookup error");
      setTrackData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (state?.id) {
      setSearchId(state.id);
      search(state.id);
    }
  }, [state?.id]);

  return (
    <div className="screen">
      <div className="back-link" onClick={() => navigate("/")}>&larr; Home</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div className="title">Track Complaint Live</div>
        <span style={{ fontSize: 20, cursor: "pointer" }} onClick={() => speakKey("track_complaint")}>🔊</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="text"
          style={{ flex: 1 }}
          placeholder="Enter Tracking Code (e.g. #GR-2026-9442)"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <span style={{ fontSize: 20, cursor: "pointer" }} onClick={() => speakKey("enter_id")}>🔊</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => search()} disabled={loading}>
          {loading ? "⌛ Searching..." : "Search Live Status"}
        </button>
        <span style={{ fontSize: 20, cursor: "pointer" }} onClick={() => speakKey("search")}>🔊</span>
      </div>

      {trackData && trackData.complaint && (
        <>
          <div className="card">
            <div className="card-row"><span className="card-label">Tracking Code</span><span className="card-value" style={{ fontFamily: "monospace", color: "var(--primary)", fontWeight: "bold" }}>{trackData.complaint.tracking_id}</span></div>
            <div className="card-row"><span className="card-label">Status</span><span className="badge badge-high">{trackData.complaint.status}</span></div>
            <div className="card-row"><span className="card-label">Department</span><span className="card-value">{trackData.complaint.department_name || "Municipal Dept"}</span></div>
            <div className="card-row"><span className="card-label">Priority</span><span className="card-value">{trackData.complaint.urgency}</span></div>
            <div className="card-row"><span className="card-label">Summary</span><span className="card-value">{trackData.complaint.translated_text || trackData.complaint.raw_text}</span></div>

            {trackData.complaint.photo_url && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #eee" }}>
                <span className="card-label" style={{ display: "block", marginBottom: 6 }}>📷 Filed Photo Evidence</span>
                <img src={trackData.complaint.photo_url} alt="Evidence" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8 }} />
              </div>
            )}

            {trackData.complaint.audio_url && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #eee" }}>
                <span className="card-label" style={{ display: "block", marginBottom: 6 }}>🎙️ Saved Voice Complaint (.mp3)</span>
                <audio src={trackData.complaint.audio_url} controls style={{ width: "100%", height: 36 }} />
              </div>
            )}
          </div>

          <div className="timeline">
            {(trackData.status_timeline && trackData.status_timeline.length > 0 ? trackData.status_timeline : [
              { new_status: "PENDING", notes: "Grievance registered & categorized via Gemini AI", updated_at: trackData.complaint.created_at }
            ]).map((tItem, i) => (
              <div className="timeline-item" key={i}>
                <div className="timeline-dot done" />
                <div>
                  <div className="timeline-status">{tItem.new_status || tItem.status}</div>
                  <div className="timeline-time">{tItem.notes || "Status updated"} ({new Date(tItem.updated_at).toLocaleDateString()})</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate("/ask")}>
              💬 Ask about my complaint
            </button>
            <span style={{ fontSize: 20, cursor: "pointer" }} onClick={() => speakKey("ask_status")}>🔊</span>
          </div>
        </>
      )}
    </div>
  );
}