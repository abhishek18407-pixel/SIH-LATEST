import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, Search, MapPin, Building2, AlertTriangle, ArrowRight, Camera } from 'lucide-react';
import { ComplaintResult } from '../types';

interface ComplaintConfirmationCardProps {
  complaint: ComplaintResult;
  onTrackClick: (trackingId: string) => void;
  onReset: () => void;
}

export const ComplaintConfirmationCard: React.FC<ComplaintConfirmationCardProps> = ({
  complaint,
  onTrackClick,
  onReset
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(complaint.tracking_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-500/30 relative overflow-hidden animate-fade-in">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-100">Grievance Registered!</h3>
          <p className="text-xs text-slate-400">Groq AI has categorized and dispatched your complaint.</p>
        </div>
      </div>

      {/* Tracking ID Copy Box */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl mb-6 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Unique Tracking Reference</span>
          <span className="text-xl font-mono font-extrabold text-cyan-400">{complaint.tracking_id}</span>
        </div>
        <button
          type="button"
          onClick={copyToClipboard}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all border border-slate-700"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Grid Metadata Details */}
      <div className="space-y-4 mb-6 text-sm">
        {complaint.photo_url && (
          <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[11px] uppercase font-bold text-cyan-400 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" /> Attached Problem Photo Evidence
            </span>
            <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <img
                src={complaint.photo_url}
                alt="Grievance evidence photo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {complaint.audio_url && (
          <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[11px] uppercase font-bold text-cyan-400 flex items-center gap-1.5">
              🎙️ Play Saved Voice Recording
            </span>
            <audio src={complaint.audio_url} controls className="w-full h-9 rounded-xl" />
          </div>
        )}

        <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-3">
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">🎙️ Spoken Words (Voice Transcription)</span>
            <p className="text-slate-200 font-medium italic">"{complaint.raw_text}"</p>
          </div>

          {complaint.translated_text && complaint.translated_text !== complaint.raw_text && (
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] uppercase font-bold text-cyan-400 block mb-1">🌐 AI Translated English Summary</span>
              <p className="text-slate-200 text-sm leading-relaxed">{complaint.translated_text}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 bg-slate-900/40 rounded-xl border border-slate-800 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Auto-Assigned Dept</span>
              <span className="text-xs font-semibold text-slate-200">{complaint.department_name || 'Municipal Department'}</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900/40 rounded-xl border border-slate-800 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">AI Priority Level</span>
              <span className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-md border ${getUrgencyBadge(complaint.urgency)}`}>
                {complaint.urgency}
              </span>
            </div>
          </div>
        </div>

        {complaint.lat && complaint.long && (
          <div className="flex items-center gap-2 text-xs text-slate-400 px-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tagged Location: {complaint.lat}, {complaint.long}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={() => onTrackClick(complaint.tracking_id)}
          className="w-full py-3.5 px-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
        >
          <Search className="w-4 h-4" />
          <span>Track Status Live</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto py-3.5 px-5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-sm rounded-xl border border-slate-800 transition-all shrink-0"
        >
          File Another Complaint
        </button>
      </div>
    </div>
  );
};
