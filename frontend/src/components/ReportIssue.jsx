import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { LANGUAGES } from "../data/mockData.js";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

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
  ur: "ur-IN",
};

export default function ReportIssue() {
  const navigate = useNavigate();
  const { setComplaintDraft, speakKey, language, setLanguage } = useApp();
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [text, setText] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoName, setPhotoName] = useState(null);
  const [location, setLocation] = useState(null);
  const [speechStatus, setSpeechStatus] = useState("");

  const isRecordingRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const finalTextRef = useRef("");

  // Determine current active language code
  const currentLangCode = language?.code || "hi";
  const currentLangObj = LANGUAGES.find((l) => l.code === currentLangCode) || LANGUAGES[1];

  useEffect(() => {
    finalTextRef.current = text;
  }, [text]);

  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
    };
  }, []);

  async function startRecording() {
    isRecordingRef.current = true;
    setRecording(true);
    setSpeechStatus(`🎙️ Listening in ${currentLangObj.native} (${currentLangObj.label})... speak now`);
    finalTextRef.current = text ? text.trim() + " " : "";

    // 1. Start MediaRecorder (Audio capture for Whisper AI fallback)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);

        // If browser Speech Recognition didn't produce text, transcribe with Whisper backend
        if (!finalTextRef.current.trim() && blob.size > 1000) {
          setSpeechStatus("🤖 Transcribing audio via AI Whisper...");
          try {
            const formData = new FormData();
            formData.append("file", blob, "speech.webm");
            formData.append("language", currentLangCode);

            const transcribeEndpoint = BACKEND_URL ? `${BACKEND_URL}/transcribe` : "/api/transcribe";
            const res = await fetch(transcribeEndpoint, {
              method: "POST",
              body: formData,
            });

            if (res.ok) {
              const data = await res.json();
              const transcribed = data.text || data.original_text || data.english_text;
              if (transcribed) {
                setText(transcribed);
                finalTextRef.current = transcribed;
                setSpeechStatus("✓ Voice converted to text via AI Whisper");
                return;
              }
            }
          } catch (e) {
            console.warn("Server transcribe fallback note:", e);
          }
          setSpeechStatus("✓ Voice recording saved");
        }
      };

      mediaRecorder.start();
    } catch (err) {
      console.warn("Microphone stream error:", err);
      alert("Please allow microphone permissions in your browser to speak your complaint.");
      isRecordingRef.current = false;
      setRecording(false);
      return;
    }

    // 2. Native Web Speech API (Real-time live speech-to-text)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        const locale = LOCALE_MAP[currentLangCode] || "hi-IN";
        recognition.lang = locale;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          let interim = "";
          let final = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }

          if (final) {
            finalTextRef.current = (finalTextRef.current + " " + final).trim();
          }

          const currentCombined = (finalTextRef.current + (interim ? " " + interim : "")).trim();
          if (currentCombined) {
            setText(currentCombined);
            setSpeechStatus(`🎙️ Listening in ${currentLangObj.native}...`);
          }
        };

        recognition.onerror = (event) => {
          console.warn("Web Speech Recognition event:", event.error);
          if (event.error === "not-allowed") {
            setSpeechStatus("⚠️ Microphone permission required");
          }
        };

        recognition.onend = () => {
          // Restart if user is still in recording mode
          if (isRecordingRef.current) {
            try {
              recognition.start();
            } catch {}
          }
        };

        recognition.start();
      } catch (e) {
        console.warn("Speech recognition initialization note:", e);
      }
    }
  }

  function stopRecording() {
    isRecordingRef.current = false;
    setRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    setSpeechStatus(text.trim() ? "✓ Voice converted to text" : "✓ Audio captured");
  }

  function toggleRecording() {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  function handlePhoto(e) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoName(file.name);
    }
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      alert("Location not supported on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert("Could not detect location. Please allow location access.")
    );
  }

  async function handleSubmit() {
    if (!text.trim() && !audioBlob && !photoFile) {
      alert("Please describe the issue by speaking voice, taking a photo, or typing text.");
      return;
    }

    setProcessing(true);
    try {
      let finalTranscript = text.trim();
      let aiResult = null;

      // 1. If we have text transcribed or typed, get AI summary and classification
      if (finalTranscript) {
        try {
          const analyzeForm = new FormData();
          analyzeForm.append("text", finalTranscript);
          analyzeForm.append("language", currentLangCode);

          const analyzeEndpoint = BACKEND_URL ? `${BACKEND_URL}/analyze` : "/api/analyze";
          const res = await fetch(analyzeEndpoint, {
            method: "POST",
            body: analyzeForm,
          });

          if (res.ok) {
            const data = await res.json();
            if (data.summary && data.department && data.department !== "General Administration") {
              aiResult = {
                issue: data.summary,
                department: data.department,
                severity: data.severity || "Medium",
                confidence: 0.95,
                unclassified: false,
              };
            }
          }
        } catch {}
      }

      if (!finalTranscript) {
        finalTranscript = photoName
          ? `Grievance with photo attachment: ${photoName}`
          : "Issue reported by citizen";
      }

      // 2. Multilingual smart analyzer fallback (translates to English & auto-routes)
      if (!aiResult) {
        const { mockAIAnalyze } = await import("../data/mockData.js");
        aiResult = await mockAIAnalyze(finalTranscript);
      }

      setComplaintDraft({
        transcript: finalTranscript,
        photo: photoName,
        photoFile: photoFile,
        location: location,
        aiResult: aiResult,
      });

      navigate("/review");
    } catch (err) {
      alert("Error processing complaint: " + (err.message || "Please try again."));
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="screen">
      <div className="back-link" onClick={() => navigate(-1)}>&larr; Back</div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div className="title">Report your issue</div>
        <span style={{ fontSize: 20, cursor: "pointer" }} onClick={() => speakKey("report_title")}>🔊</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div className="subtitle">Tap mic to speak in your language, or type below</div>
        <span style={{ fontSize: 18, cursor: "pointer", marginBottom: 20 }} onClick={() => speakKey("report_subtitle")}>🔊</span>
      </div>

      {/* Quick Language Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
        <span style={{ fontSize: 13, color: "#666", whiteSpace: "nowrap" }}>Speaking in:</span>
        <select
          value={currentLangCode}
          onChange={(e) => {
            const selected = LANGUAGES.find((l) => l.code === e.target.value);
            if (selected) setLanguage(selected);
          }}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 13,
            fontWeight: "600",
            background: "#fff",
            cursor: "pointer"
          }}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.native} ({l.label})
            </option>
          ))}
        </select>
      </div>

      {/* Pulsing Mic Button */}
      <button
        type="button"
        className={`mic-btn ${recording ? "recording" : ""}`}
        onClick={toggleRecording}
        disabled={processing}
        aria-label="Toggle voice recording"
      >
        {recording ? "⏹️" : "🎤"}
      </button>

      <div style={{ textAlign: "center", fontSize: 13, color: recording ? "#d93025" : "#666", fontWeight: recording ? "600" : "400", marginBottom: 12 }}>
        {recording
          ? speechStatus || "🎙️ Recording... speak clearly into microphone"
          : processing
          ? "🤖 Generating English AI summary & auto-routing..."
          : speechStatus || (text ? "✓ Text ready" : `Tap mic to speak in ${currentLangObj.native}`)}
      </div>

      <textarea
        rows={4}
        placeholder={`Your speech in ${currentLangObj.native} (${currentLangObj.label}) will appear here automatically, or type here...`}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
        <label className="btn btn-outline" style={{ flex: 1, textAlign: "center", cursor: "pointer", marginTop: 0 }}>
          📷 {photoName ? `Photo: ${photoName}` : "Upload / Take Photo"}
          <input type="file" accept="image/*" capture="environment" hidden onChange={handlePhoto} />
        </label>
        <span style={{ fontSize: 20, cursor: "pointer" }} onClick={() => speakKey("upload_photo")}>🔊</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={detectLocation}>
          📍 {location ? `Location Captured (${location.lat.toFixed(3)}, ${location.lng.toFixed(3)})` : "Detect My Location"}
        </button>
        <span style={{ fontSize: 20, cursor: "pointer" }} onClick={() => speakKey("detect_location")}>🔊</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={processing || recording}>
          {processing ? "⌛ Processing AI Summary..." : "Continue →"}
        </button>
        <span style={{ fontSize: 20, cursor: "pointer" }} onClick={() => speakKey("continue")}>🔊</span>
      </div>
    </div>
  );
}