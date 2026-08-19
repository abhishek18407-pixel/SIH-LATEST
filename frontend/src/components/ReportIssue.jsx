import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

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
  const { setComplaintDraft, speakKey, language } = useApp();
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [text, setText] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoName, setPhotoName] = useState(null);
  const [location, setLocation] = useState(null);
  const [speechStatus, setSpeechStatus] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      // Clean up recognition on unmount
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  async function toggleRecording() {
    if (recording) {
      // Stop speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      // Stop media recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setRecording(false);
      setSpeechStatus("✓ Voice converted to text");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
      };
      mediaRecorder.start();

      // Native Browser Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        const locale = LOCALE_MAP[language?.code] || "hi-IN";
        recognition.lang = locale;
        recognition.continuous = true;
        recognition.interimResults = true;

        let initialText = text ? text + " " : "";

        recognition.onresult = (event) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setText(initialText + currentTranscript);
        };

        recognition.onerror = (event) => {
          console.warn("Browser Speech Recognition event:", event.error);
        };

        recognition.onend = () => {
          if (recording) {
            try {
              recognition.start();
            } catch {}
          }
        };

        try {
          recognition.start();
        } catch (e) {
          console.warn("Speech recognition start note:", e);
        }
      }

      setRecording(true);
      setSpeechStatus(`Listening in ${language?.native || language?.label || "your language"}... speak now`);
    } catch (err) {
      alert("Could not access microphone. Please allow microphone permissions in your browser.");
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
          const analyzeEndpoint = BACKEND_URL ? `${BACKEND_URL}/analyze` : "/api/analyze";
          const res = await fetch(analyzeEndpoint, {
            method: "POST",
            body: analyzeForm,
          });
          if (res.ok) {
            const data = await res.json();
            aiResult = {
              issue: data.summary || finalTranscript,
              department: data.department || "Roads & Infrastructure (PWD)",
              severity: data.severity || "Medium",
              confidence: 0.95,
              unclassified: false,
            };
          }
        } catch {
          // Backend offline - use local AI rules
        }
      }

      if (!finalTranscript) {
        finalTranscript = photoName
          ? `Grievance with photo attachment: ${photoName}`
          : "Issue reported by citizen";
      }

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
        <div className="subtitle">Tap mic to speak voice complaint, or type below</div>
        <span style={{ fontSize: 18, cursor: "pointer", marginBottom: 20 }} onClick={() => speakKey("report_subtitle")}>🔊</span>
      </div>

      <button className={`mic-btn ${recording ? "recording" : ""}`} onClick={toggleRecording} disabled={processing}>
        🎤
      </button>
      <div style={{ textAlign: "center", fontSize: 13, color: "#888", marginBottom: 8 }}>
        {recording
          ? speechStatus || "Listening... speak now"
          : processing
          ? "🤖 Generating AI summary & routing..."
          : speechStatus || (text ? "✓ Text ready" : "Tap mic to speak in your language")}
      </div>

      <textarea
        rows={4}
        placeholder="Your speech will appear here automatically, or you can type here..."
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
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={processing}>
          {processing ? "⌛ Processing AI Summary..." : "Continue →"}
        </button>
        <span style={{ fontSize: 20, cursor: "pointer" }} onClick={() => speakKey("continue")}>🔊</span>
      </div>
    </div>
  );
}