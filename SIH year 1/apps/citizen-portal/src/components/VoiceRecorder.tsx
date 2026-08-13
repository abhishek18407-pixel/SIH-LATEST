import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, MapPin, AlertCircle, RefreshCw, FileText, CheckCircle2, Camera, Image as ImageIcon, Trash2, UploadCloud } from 'lucide-react';
import { ComplaintResult, LanguageCode } from '../types';

interface VoiceRecorderProps {
  currentLanguage: LanguageCode;
  onComplaintCreated: (complaint: ComplaintResult) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  currentLanguage,
  onComplaintCreated
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('+919876543210');
  const [location, setLocation] = useState<{ lat: number; long: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationAddress, setLocationAddress] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-detect Geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    setIsGettingLocation(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: parseFloat(position.coords.latitude.toFixed(6)),
          long: parseFloat(position.coords.longitude.toFixed(6))
        };
        setLocation(coords);
        setLocationAddress(`Lat: ${coords.lat}, Long: ${coords.long}`);
        setIsGettingLocation(false);
      },
      (err) => {
        console.warn('Geolocation warning, using default coords:', err.message);
        // Fallback coordinates (Bangalore City Center)
        const fallback = { lat: 12.9716, long: 77.5946 };
        setLocation(fallback);
        setLocationAddress(`Bangalore City Center (${fallback.lat}, ${fallback.long})`);
        setIsGettingLocation(false);
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => {
    handleGetLocation();
  }, []);

  const startRecording = async () => {
    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('MediaRecorder permission error:', err);
      setErrorMsg('Microphone access denied or unavailable. Please use text input alternative below.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const clearAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const systemInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Start Live In-Browser Camera stream or fallback to device camera
  const startLiveCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        setCameraStream(stream);
        setIsCameraModalOpen(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }, 100);
      } else {
        cameraInputRef.current?.click();
      }
    } catch (err: any) {
      console.warn('Live camera access failed, falling back to native camera input:', err);
      // Fallback directly to native camera file picker
      cameraInputRef.current?.click();
    }
  };

  const captureSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `captured_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            setSelectedPhoto(file);
            setPhotoPreviewUrl(URL.createObjectURL(file));
          }
        }, 'image/jpeg', 0.9);
      }
    }
    stopLiveCamera();
  };

  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraModalOpen(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhoto(file);
      setPhotoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearPhoto = () => {
    setSelectedPhoto(null);
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoPreviewUrl(null);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (systemInputRef.current) systemInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioBlob && (!textInput || !textInput.trim()) && !selectedPhoto) {
      setErrorMsg('Please record audio, upload a problem photo, or enter a text description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      if (textInput && textInput.trim()) {
        formData.append('text', textInput.trim());
      }
      if (audioBlob) {
        formData.append('audio', audioBlob, 'grievance_voice.mp3');
      }
      if (selectedPhoto) {
        formData.append('photo', selectedPhoto);
      }
      formData.append('citizen_phone', citizenPhone);
      if (location) {
        formData.append('lat', location.lat.toString());
        formData.append('long', location.long.toString());
      }

      const apiUrl = typeof window !== 'undefined' && window.location.origin.includes('http') 
        ? `${window.location.origin}/api/complaints` 
        : 'http://127.0.0.1:8000/api/complaints';

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json();
        let detailMsg = 'Failed to submit grievance to gateway.';
        if (errData && errData.detail) {
          if (typeof errData.detail === 'string') detailMsg = errData.detail;
          else if (Array.isArray(errData.detail)) detailMsg = errData.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
          else detailMsg = JSON.stringify(errData.detail);
        }
        throw new Error(detailMsg);
      }

      const complaintResult: ComplaintResult = await response.json();
      onComplaintCreated(complaintResult);
      
      // Reset form
      clearAudio();
      clearPhoto();
      setTextInput('');
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMsg(err.message || 'Network error connecting to http://127.0.0.1:8000. Is the server active?');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            File Civic Grievance
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Speak, attach a photo, or type in Hindi, Kannada, Tamil, Marathi, English — AI will categorize & route automatically.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-300 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Voice Recorder Pulse Button Area */}
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/60 rounded-3xl border border-slate-800/80 mb-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
        
        {isRecording ? (
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={stopRecording}
              className="w-24 h-24 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center pulse-ring text-white shadow-xl shadow-rose-900/50 transition-transform active:scale-95"
              aria-label="Stop recording"
            >
              <Square className="w-8 h-8 fill-current" />
            </button>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span className="text-rose-400 font-mono font-bold text-lg">{formatTime(recordingTime)}</span>
              <span className="text-slate-400 text-xs">Recording...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={startRecording}
              className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 flex items-center justify-center text-white shadow-xl shadow-cyan-950/80 transition-all hover:scale-105 active:scale-95 group-hover:shadow-cyan-500/25"
              aria-label="Start recording audio grievance"
            >
              <Mic className="w-10 h-10 animate-pulse" />
            </button>
            <span className="mt-4 text-sm font-semibold text-slate-300">Tap to Record Voice Complaint</span>
            <span className="text-xs text-slate-500 mt-1">Regional language voice message supported</span>
          </div>
        )}

        {/* Audio Player Preview */}
        {audioUrl && !isRecording && (
          <div className="w-full mt-6 p-3 bg-slate-800/80 rounded-2xl flex items-center justify-between gap-3 border border-slate-700">
            <audio src={audioUrl} controls className="h-8 w-full max-w-xs" />
            <button
              type="button"
              onClick={clearAudio}
              className="text-xs text-slate-400 hover:text-rose-400 underline shrink-0 px-2"
            >
              Retake
            </button>
          </div>
        )}
      </div>

      {/* Live Camera Modal Overlay */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-lg glass-card rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col items-center">
            <button
              type="button"
              onClick={stopLiveCamera}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-cyan-400" />
              <span>Capture Grievance Photo</span>
            </h3>

            <div className="relative w-full h-64 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 mb-6 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Live Camera Active
              </div>
            </div>

            <div className="flex items-center gap-4 w-full">
              <button
                type="button"
                onClick={captureSnapshot}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Take Snapshot Photo</span>
              </button>
              <button
                type="button"
                onClick={stopLiveCamera}
                className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-sm rounded-xl border border-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Section with Dual Options */}
      <div className="mb-6 p-5 bg-slate-900/60 rounded-3xl border border-slate-800/80">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Camera className="w-4 h-4" /> Problem Photo Evidence
          </span>
          <span className="text-slate-500 lowercase font-normal">(camera or system file)</span>
        </label>

        {/* Hidden File Inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
          className="hidden"
          id="camera-file-input"
        />
        <input
          ref={systemInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
          id="system-file-input"
        />

        {photoPreviewUrl ? (
          <div className="relative w-full h-48 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 group">
            <img
              src={photoPreviewUrl}
              alt="Grievance evidence preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4 backdrop-blur-xs">
              <button
                type="button"
                onClick={startLiveCamera}
                className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg"
              >
                <Camera className="w-3.5 h-3.5" /> Retake (Camera)
              </button>
              <button
                type="button"
                onClick={() => systemInputRef.current?.click()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 shadow-lg"
              >
                <UploadCloud className="w-3.5 h-3.5" /> System File
              </button>
              <button
                type="button"
                onClick={clearPhoto}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
            <div className="absolute bottom-3 left-3 bg-slate-900/90 text-slate-200 text-[11px] font-mono px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5 backdrop-blur-md">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[200px]">{selectedPhoto?.name || 'Photo Attached'}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option 1: Click / Take Photo with Camera */}
            <button
              type="button"
              onClick={startLiveCamera}
              className="p-4 border border-slate-800 hover:border-cyan-500/60 rounded-2xl flex flex-col items-center justify-center text-slate-300 hover:text-cyan-400 bg-slate-950/50 hover:bg-slate-900/60 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 group-hover:bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2.5 transition-colors border border-cyan-500/20">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-200">Take Photo (Camera)</span>
              <span className="text-[10px] text-slate-500 mt-1">Capture live picture directly</span>
            </button>

            {/* Option 2: Upload Photo from System */}
            <button
              type="button"
              onClick={() => systemInputRef.current?.click()}
              className="p-4 border border-slate-800 hover:border-cyan-500/60 rounded-2xl flex flex-col items-center justify-center text-slate-300 hover:text-cyan-400 bg-slate-950/50 hover:bg-slate-900/60 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-800 group-hover:bg-cyan-500/20 text-slate-300 group-hover:text-cyan-400 flex items-center justify-center mb-2.5 transition-colors border border-slate-700">
                <UploadCloud className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-200">Upload from System</span>
              <span className="text-[10px] text-slate-500 mt-1">Browse photos on device</span>
            </button>
          </div>
        )}
      </div>

      {/* Alternative Text Area Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-cyan-400" /> Text Description Alternative</span>
            <span className="text-slate-500 lowercase font-normal">(optional if voice recorded)</span>
          </label>
          <textarea
            rows={3}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Or type your complaint details here... (e.g. Deep dangerous pothole on MG Road near Metro Station)"
            className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 transition-all"
          />
        </div>

        {/* Contact Phone & Location Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Citizen Phone Number</label>
            <input
              type="text"
              value={citizenPhone}
              onChange={(e) => setCitizenPhone(e.target.value)}
              placeholder="+919876543210"
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Geolocation Tagging</label>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isGettingLocation}
              className="w-full bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 flex items-center justify-between gap-2"
            >
              <span className="truncate flex items-center gap-1.5 text-cyan-400 font-medium">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {locationAddress || 'Detect Location'}
              </span>
              {isGettingLocation ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || (!audioBlob && !textInput.trim() && !selectedPhoto)}
          className="w-full mt-6 py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-cyan-950/60 hover:shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Analyzing with Groq AI & Registering...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Submit Grievance Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

