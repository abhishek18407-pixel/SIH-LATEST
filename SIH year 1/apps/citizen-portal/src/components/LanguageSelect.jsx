import { useNavigate } from "react-router-dom";
import { LANGUAGES } from "../data/mockData.js";
import { useApp } from "../context/AppContext.jsx";

export default function LanguageSelect() {
  const navigate = useNavigate();
  const { setLanguage } = useApp();

  function choose(lang) {
    setLanguage(lang);
    navigate("/report");
  }

  function announceLanguage(lang, e) {
    e.preventDefault();
    e.stopPropagation();

    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(lang.native);
    utterance.lang = {
      en: "en-IN",
      hi: "hi-IN",
      te: "te-IN",
      ta: "ta-IN",
      kn: "kn-IN",
      mr: "mr-IN",
      bn: "bn-IN",
      gu: "gu-IN",
      pa: "pa-IN",
      ml: "ml-IN",
      or: "or-IN",
      as: "as-IN",
    }[lang.code] || "en-IN";

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="screen">
      <div className="title">Choose your language</div>
      <div className="subtitle">Tap 🔊 on each option to hear it spoken</div>

      <div className="lang-grid">
        {LANGUAGES.map((l) => (
          <div key={l.code} className="lang-card" onClick={() => choose(l)}>
            <div className="lang-native">{l.native}</div>
            <div className="lang-en">{l.label}</div>
            <button
              type="button"
              className="speaker-btn"
              aria-label={`Hear ${l.native} in ${l.label}`}
              onClick={(e) => announceLanguage(l, e)}
            >
              🔊
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}