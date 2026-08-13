import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

const BACKEND_URL = typeof window !== "undefined" && window.location.origin.includes("http")
  ? window.location.origin
  : "http://localhost:8000";

export default function ReportIssue() {
  const navigate = useNavigate();
  const { setComplaintDraft, speakKey } = useApp();
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [text, setText] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoName, setPhotoName] = useState(null);
  const [location, setLocation] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  async function toggleRecording() {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
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
      setRecording(true);
    } catch (err) {
      alert("Could not access microphone. Please check browser permissions.");
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
      const formData = new FormData();
      if (text.trim()) formData.append("text", text.trim());
      if (audioBlob) formData.append("audio", audioBlob, "grievance_voice.mp3");
      if (photoFile) formData.append("photo", photoFile);
      formData.append("citizen_phone", "+919876543210");
      if (location) {
        formData.append("lat", location.lat.toString());
        formData.append("long", location.lng.toString());
      }

      const res = await fetch(`${BACKEND_URL}/api/complaints`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to process grievance via AI engine.");
      }

      const createdRecord = await res.json();
      setComplaintDraft({
        transcript: createdRecord.raw_text || text,
        photo: photoName,
        location: location,
        createdRecord: createdRecord,
        aiResult: {
          issue: createdRecord.translated_text || createdRecord.raw_text,
          department: createdRecord.department_name || "Roads & Infrastructure",
          severity: createdRecord.urgency || "Medium",
          tracking_id: createdRecord.tracking_id,
          photo_url: createdRecord.photo_url,
          audio_url: createdRecord.audio_url
        }
      });
      navigate("/review");
    } catch (err) {
      alert("Grievance processing error: " + (err.message || "Could not connect to backend gateway."));
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
        {recording ? "Listening, tap again to stop" : processing ? "🤖 Gemini AI processing speech..." : audioBlob ? "✓ Voice Recorded (.mp3 format ready)" : "Tap to speak voice complaint"}
      </div>

      <textarea
        rows={4}
        placeholder="Or type your complaint details here..."
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
          {processing ? "⌛ Gemini AI Processing..." : "Continue →"}
        </button>
        <span style={{ fontSize: 20, cursor: "pointer" }} onClick={() => speakKey("continue")}>🔊</span>
      </div>
    </div>
  );
}