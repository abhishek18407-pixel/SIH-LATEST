import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Welcome() {
  const navigate = useNavigate();
  const { user, profile, role, logout } = useAuth();

  useEffect(() => {
    if (user && role === "department") {
      navigate("/dept-dashboard", { replace: true });
    }
  }, [user, role, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleGetStarted = () => {
    if (!user) return navigate("/login");
    if (role === "department") return navigate("/dept-dashboard");
    navigate("/language");
  };

  const handleTrack = () => {
    if (!user) return navigate("/login");
    navigate("/track");
  };

  return (
    <div className="screen welcome-screen">
      <div className="welcome-panel">
        <div className="welcome-copy">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div className="eyebrow" style={{ margin: 0 }}>Civic infrastructure made simpler</div>
            {user && (
              <button
                className="btn btn-outline"
                style={{ width: "auto", padding: "6px 14px", fontSize: 12, margin: 0 }}
                onClick={handleLogout}
              >
                Sign Out
              </button>
            )}
          </div>
          <h1 className="title">Civic Voice</h1>
          <p className="subtitle">Speak in your language, report local issues quickly, and keep track of every step.</p>

          <div className="welcome-actions">
            <button className="btn btn-primary" onClick={handleGetStarted}>Get Started</button>
            <button className="btn btn-outline" onClick={handleTrack}>Track Existing Complaint</button>
          </div>

          <div className="welcome-highlights">
            <div>
              <strong>AI-assisted</strong>
              <span>smart routing</span>
            </div>
            <div>
              <strong>Multilingual</strong>
              <span>voice-first support</span>
            </div>
            <div>
              <strong>Transparent</strong>
              <span>status tracking</span>
            </div>
          </div>
        </div>

        <div className="welcome-visual" aria-hidden="true">
          <div className="hero-illustration">
            <div className="hero-badge">Public service, simplified</div>
            <img
              className="hero-image"
              src="https://bsmedia.business-standard.com/_media/bs/img/article/2026-06/15/full/1781543974-9497.jpg?im=FitAndFill=(826,465)"
              alt="Civic service and public infrastructure scene"
            />
          </div>
        </div>
      </div>
    </div>
  );
}