import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const INITIAL_USER = { name: "", phone: "", email: "", password: "", confirm: "" };
const INITIAL_DEPT = { deptName: "", deptCode: "", email: "", password: "", confirm: "" };

// ── Step 2: Recovery Code Display ────────────────────────────────────────────
function RecoveryCodeScreen({ code, onDone }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="auth-card">
      <div style={{ textAlign: "center", fontSize: 48, marginBottom: 8 }}>🔐</div>
      <div className="eyebrow" style={{ alignSelf: "center", marginBottom: 16 }}>
        Save Your Recovery Code
      </div>

      <p className="subtitle" style={{ textAlign: "center", maxWidth: "100%", marginBottom: 24 }}>
        This <strong>6-digit code</strong> is the <strong>only way</strong> to reset your password.
        Store it somewhere safe — it will <strong>not</strong> be shown again.
      </p>

      {/* Big code display */}
      <div className="recovery-code-box">
        <span className="recovery-code-digits">{code}</span>
        <button type="button" className="copy-btn" onClick={handleCopy} title="Copy code">
          {copied ? "✅ Copied!" : "📋 Copy"}
        </button>
      </div>

      <div className="auth-error" style={{ marginTop: 20, marginBottom: 4 }}>
        ⚠️ Screenshot or write this down. You cannot recover it later.
      </div>

      <button
        type="button"
        className="btn btn-primary"
        style={{ marginTop: 24 }}
        onClick={onDone}
      >
        I've saved my code — Go to Login
      </button>
    </div>
  );
}

// ── Step 1: Sign-Up Form ──────────────────────────────────────────────────────
export default function SignUp() {
  const { signUp }   = useAuth();
  const navigate     = useNavigate();

  const [activeTab, setActiveTab] = useState("user");
  const [userForm, setUserForm]   = useState(INITIAL_USER);
  const [deptForm, setDeptForm]   = useState(INITIAL_DEPT);
  const [error, setError]         = useState("");
  const [busy, setBusy]           = useState(false);
  const [recoveryCode, setRecoveryCode] = useState(null); // null = form, string = code screen

  const handleUser = (e) => setUserForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleDept = (e) => setDeptForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    const form = activeTab === "user" ? userForm : deptForm;
    if (activeTab === "user") {
      if (!form.name.trim())  return "Full name is required.";
      if (!form.email.trim()) return "Email is required.";
    } else {
      if (!form.deptName.trim()) return "Department name is required.";
      if (!form.deptCode.trim()) return "Department code is required.";
      if (!form.email.trim())    return "Official email is required.";
    }
    if (form.password.length < 8)       return "Password must be at least 8 characters.";
    if (form.password !== form.confirm) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const err = validate();
    if (err) { setError(err); return; }

    setBusy(true);
    try {
      const form = activeTab === "user" ? userForm : deptForm;
      const { recoveryCode: code } = await signUp(form, activeTab);
      setRecoveryCode(code); // show recovery code screen
    } catch (err) {
      setError(err.message || "Sign-up failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // Show recovery code screen after successful signup
  if (recoveryCode) {
    return (
      <div className="screen auth-screen">
        <RecoveryCodeScreen
          code={recoveryCode}
          onDone={() => navigate("/login", { state: { message: "Account created! Please sign in." } })}
        />
      </div>
    );
  }

  return (
    <div className="screen auth-screen">
      <div className="auth-card">
        <div className="eyebrow" style={{ alignSelf: "center", marginBottom: 24 }}>
          Civic Voice — Create Account
        </div>

        <div className="auth-tabs">
          <button type="button"
            className={activeTab === "user" ? "auth-tab auth-tab-active" : "auth-tab"}
            onClick={() => { setActiveTab("user"); setError(""); }}>
            🧑 Citizen
          </button>
          <button type="button"
            className={activeTab === "department" ? "auth-tab auth-tab-active" : "auth-tab"}
            onClick={() => { setActiveTab("department"); setError(""); }}>
            🏛️ Department
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {activeTab === "user" ? (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" name="name" className="form-input"
                  placeholder="Ravi Kumar" value={userForm.name} onChange={handleUser} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone (optional)</label>
                <input type="tel" name="phone" className="form-input"
                  placeholder="+91 98765 43210" value={userForm.phone} onChange={handleUser} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-input"
                  placeholder="you@example.com" value={userForm.email} onChange={handleUser} autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" name="password" className="form-input"
                  placeholder="Min. 8 characters" value={userForm.password} onChange={handleUser} autoComplete="new-password" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" name="confirm" className="form-input"
                  placeholder="Re-enter password" value={userForm.confirm} onChange={handleUser} autoComplete="new-password" />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Department Name</label>
                <input type="text" name="deptName" className="form-input"
                  placeholder="Municipal Corporation" value={deptForm.deptName} onChange={handleDept} />
              </div>
              <div className="form-group">
                <label className="form-label">Department Code</label>
                <input type="text" name="deptCode" className="form-input"
                  placeholder="MCD-001" value={deptForm.deptCode} onChange={handleDept} />
              </div>
              <div className="form-group">
                <label className="form-label">Official Email</label>
                <input type="email" name="email" className="form-input"
                  placeholder="dept@gov.in" value={deptForm.email} onChange={handleDept} autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" name="password" className="form-input"
                  placeholder="Min. 8 characters" value={deptForm.password} onChange={handleDept} autoComplete="new-password" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" name="confirm" className="form-input"
                  placeholder="Re-enter password" value={deptForm.confirm} onChange={handleDept} autoComplete="new-password" />
              </div>
            </>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ marginTop: 24 }} disabled={busy}>
            {busy ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
