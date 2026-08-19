import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";

import Welcome             from "./components/Welcome.jsx";
import LanguageSelect      from "./components/LanguageSelect.jsx";
import ReportIssue         from "./components/ReportIssue.jsx";
import AIReview            from "./components/AIReview.jsx";
import ComplaintRegistered from "./components/ComplaintRegistered.jsx";
import ComplaintTracking   from "./components/ComplaintTracking.jsx";
import ConversationalStatus from "./components/ConversationalStatus.jsx";

import Login          from "./components/auth/Login.jsx";
import SignUp         from "./components/auth/SignUp.jsx";
import ForgotPassword from "./components/auth/ForgotPassword.jsx";
import DeptDashboard  from "./components/auth/DeptDashboard.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

export default function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <div className="app-shell">
        <div key={location.pathname} className="page-shell">
          <Routes location={location}>
            {/* Public auth routes */}
            <Route path="/"                element={<Login />} />
            <Route path="/login"           element={<Login />} />
            <Route path="/signup"          element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Citizen-only protected routes */}
            <Route path="/home"       element={<ProtectedRoute allowedRole="user"><Welcome /></ProtectedRoute>} />
            <Route path="/language"   element={<ProtectedRoute allowedRole="user"><LanguageSelect /></ProtectedRoute>} />
            <Route path="/report"     element={<ProtectedRoute allowedRole="user"><ReportIssue /></ProtectedRoute>} />
            <Route path="/review"     element={<ProtectedRoute allowedRole="user"><AIReview /></ProtectedRoute>} />
            <Route path="/registered" element={<ProtectedRoute allowedRole="user"><ComplaintRegistered /></ProtectedRoute>} />
            <Route path="/track"      element={<ProtectedRoute allowedRole="user"><ComplaintTracking /></ProtectedRoute>} />
            <Route path="/ask"        element={<ProtectedRoute allowedRole="user"><ConversationalStatus /></ProtectedRoute>} />

            {/* Department-only protected route */}
            <Route path="/dept-dashboard" element={<ProtectedRoute allowedRole="department"><DeptDashboard /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
}