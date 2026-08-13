import { createContext, useContext, useState, useCallback } from "react";
import { t as translate } from "../data/translations.js";

const AppContext = createContext(null);

const LOCALE_MAP = {
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
};

export function AppProvider({ children }) {
  const [language, setLanguage] = useState(null);
  const [complaintDraft, setComplaintDraft] = useState({
    transcript: "",
    photo: null,
    location: null,
    aiResult: null,
  });
  const [submittedComplaints, setSubmittedComplaints] = useState([]);

  const t = useCallback(
    (key) => translate(language?.code || "en", key),
    [language]
  );

  const speak = useCallback(
    (text) => {
      if (!window.speechSynthesis || !text) return;

      const locale = LOCALE_MAP[language?.code] || "en-IN";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale;

      const speakNow = () => {
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (voice) =>
            voice.lang?.toLowerCase() === locale.toLowerCase() ||
            voice.lang?.toLowerCase().startsWith(locale.split("-")[0].toLowerCase())
        );

        if (preferredVoice) utterance.voice = preferredVoice;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        speakNow();
        return;
      }

      const handleVoicesReady = () => {
        window.speechSynthesis.onvoiceschanged = null;
        speakNow();
      };

      window.speechSynthesis.onvoiceschanged = handleVoicesReady;
    },
    [language]
  );

  const speakKey = useCallback((key) => speak(t(key)), [speak, t]);

  const value = {
    language,
    setLanguage,
    complaintDraft,
    setComplaintDraft,
    submittedComplaints,
    setSubmittedComplaints,
    t,
    speak,
    speakKey,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
