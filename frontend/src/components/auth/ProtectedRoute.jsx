import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="screen" style={{ justifyContent: "center", alignItems: "center" }}>
        <p className="subtitle">Loading…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // If role does not match the route's allowedRole:
  if (allowedRole && role !== allowedRole) {
    if (role === "department") {
      return <Navigate to="/dept-dashboard" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }

  return children;
}
