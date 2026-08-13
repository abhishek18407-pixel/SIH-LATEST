import { Routes, Route, useLocation } from "react-router-dom";
import Welcome from "./components/Welcome.jsx";
import LanguageSelect from "./components/LanguageSelect.jsx";
import ReportIssue from "./components/ReportIssue.jsx";
import AIReview from "./components/AIReview.jsx";
import ComplaintRegistered from "./components/ComplaintRegistered.jsx";
import ComplaintTracking from "./components/ComplaintTracking.jsx";
import ConversationalStatus from "./components/ConversationalStatus.jsx";

export default function App() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <div key={location.pathname} className="page-shell">
        <Routes location={location}>
          <Route path="/" element={<Welcome />} />
          <Route path="/language" element={<LanguageSelect />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/review" element={<AIReview />} />
          <Route path="/registered" element={<ComplaintRegistered />} />
          <Route path="/track" element={<ComplaintTracking />} />
          <Route path="/ask" element={<ConversationalStatus />} />
        </Routes>
      </div>
    </div>
  );
}