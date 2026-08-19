import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login, loading, user, role } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [activeTab, setActiveTab] = useState("user");
  const [form, setForm]           = useState({ email: "", password: "" });
  const [error, setError]         = useState("");
  const [busy, setBusy]           = useState(false);

  // Success message passed from SignUp or ForgotPassword via router state
  const successMsg = location.state?.message || "";

  // If already logged in, redirect to appropriate portal
  useEffect(() => {
    if (!loading && user && role) {
      if (role === "department") {
        navigate("/dept-dashboard", { replace: true });
      } else if (role === "user") {
        navigate("/home", { replace: true });
      }
    }
  }, [user, role, loading, navigate]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    setBusy(true);
    try {
      const loggedInRole = await login(form.email, form.password, activeTab);
      if (loggedInRole === "department") {
        navigate("/dept-dashboard", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return null;

  return (
    <div className="screen auth-screen">
      <div className="auth-card">
        <div className="eyebrow" style={{ alignSelf: "center", marginBottom: 24 }}>
          Civic Voice — Sign In
        </div>

        {successMsg && <p className="auth-success" style={{ marginBottom: 20 }}>{successMsg}</p>}

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
          <div className="form-group">
            <label className="form-label">
              {activeTab === "department" ? "Official Email" : "Email"}
            </label>
            <input type="email" name="email" className="form-input"
              placeholder="you@example.com" value={form.email}
              onChange={handleChange} autoComplete="email" />
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" className="auth-link" style={{ fontSize: 12 }}>
                Forgot password?
              </Link>
            </div>
            <input type="password" name="password" className="form-input"
              placeholder="••••••••" value={form.password}
              onChange={handleChange} autoComplete="current-password" />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ marginTop: 24 }} disabled={busy}>
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="auth-link">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

