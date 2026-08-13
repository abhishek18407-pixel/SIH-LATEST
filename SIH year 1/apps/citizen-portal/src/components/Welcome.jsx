import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="screen welcome-screen">
      <div className="welcome-panel">
        <div className="welcome-copy">
          <div className="eyebrow">Civic infrastructure made simpler</div>
          <h1 className="title">Civic Voice</h1>
          <p className="subtitle">Speak in your language, report local issues quickly, and keep track of every step.</p>

          <div className="welcome-actions">
            <button className="btn btn-primary" onClick={() => navigate("/language")}>Get Started</button>
            <button className="btn btn-outline" onClick={() => navigate("/track")}>Track Existing Complaint</button>
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