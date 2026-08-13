import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function ComplaintRegistered() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { submittedComplaints, speakKey, speak } = useApp();
  const record = submittedComplaints.find((c) => c.id === state?.id) || submittedComplaints.at(-1);

  if (!record) {
    navigate("/");
    return null;
  }

  return (
    <div className="screen" style={{ textAlign: "center" }}>
      <div style={{ fontSize: 50, marginTop: 20 }}>✅</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <div className="title">Complaint Registered</div>
        <span style={{ fontSize: 20, cursor: "pointer" }} onClick={() => speakKey("complaint_registered")}>🔊</span>
      </div>
      <div className="subtitle">Your issue has been routed to {record.department}</div>

      <div className="id-box">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <div className="card-label">Your Tracking ID</div>
          <span style={{ fontSize: 16, cursor: "pointer" }} onClick={() => speakKey("tracking_id")}>🔊</span>
        </div>
        <div className="id-value">{record.id}</div>
      </div>

      <div className="card" style={{ textAlign: "left" }}>
        <div className="card-row"><span className="card-label">Issue</span><span className="card-value">{record.issue}</span></div>
        <div className="card-row"><span className="card-label">Priority</span><span className="card-value">{record.severity}</span></div>
        <div className="card-row"><span className="card-label">Est. Resolution</span><span className="card-value">3–5 days</span></div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate("/track", { state: { id: record.id } })}>
          Track My Complaint
        </button>
        <span style={{ fontSize: 20, cursor: "pointer" }} onClick={() => speakKey("track_my_complaint")}>🔊</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate("/")}>Back to Home</button>
        <span style={{ fontSize: 20, cursor: "pointer" }} onClick={() => speakKey("back_home")}>🔊</span>
      </div>
    </div>
  );
}