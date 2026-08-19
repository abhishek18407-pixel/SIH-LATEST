import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ForgotPassword() {
  const { resetPasswordWithCode } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]         = useState("verify"); // "verify" | "newpass"
  const [email, setEmail]       = useState("");
  const [code, setCode]         = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [busy, setBusy]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim())       { setError("Email is required."); return; }
    if (code.length < 6)     { setError("Enter your 6-character recovery code."); return; }
    if (password.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setBusy(true);
    try {
      await resetPasswordWithCode(email.trim(), code.trim(), password);
      navigate("/login", { state: { message: "✅ Password updated! Please sign in with your new password." } });
    } catch (err) {
      setError(err.message || "Invalid email or recovery code.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen auth-screen">
      <div className="auth-card">
        <div style={{ textAlign: "center", fontSize: 44, marginBottom: 8 }}>🔑</div>
        <div className="eyebrow" style={{ alignSelf: "center", marginBottom: 16 }}>
          Reset Password
        </div>
        <p className="subtitle" style={{ textAlign: "center", marginBottom: 28, maxWidth: "100%" }}>
          Enter your email and the <strong>6-digit recovery code</strong> you saved at sign-up.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email" autoFocus />
          </div>

          <div className="form-group">
            <label className="form-label">Recovery Code</label>
            <input
              type="text"
              className="form-input otp-input"
              placeholder="_ _ _ _ _ _"
              maxLength={6}
              value={code}
              onChange={(e) =>
                setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))
              }
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="auth-divider" />

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-input"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password" />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input type="password" className="form-input"
              placeholder="Re-enter new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password" />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ marginTop: 24 }} disabled={busy}>
            {busy ? "Updating password…" : "Reset Password"}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login" className="auth-link">← Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
