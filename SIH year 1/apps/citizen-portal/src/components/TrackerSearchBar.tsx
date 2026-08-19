import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle2, AlertCircle, RefreshCw, Building2, MapPin, ShieldCheck, FileText, Camera } from 'lucide-react';
import { TrackResult } from '../types';

interface TrackerSearchBarProps {
  initialTrackingId?: string;
}

export const TrackerSearchBar: React.FC<TrackerSearchBarProps> = ({ initialTrackingId = '' }) => {
  const [trackingIdInput, setTrackingIdInput] = useState(initialTrackingId);
  const [isLoading, setIsLoading] = useState(false);
  const [trackResult, setTrackResult] = useState<TrackResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTrackingDetails = async (queryId: string) => {
    if (!queryId || !queryId.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    // Normalize URL encoding for leading #
    const cleanId = queryId.trim();
    const encodedId = encodeURIComponent(cleanId);

    try {
      const baseUrl = typeof window !== 'undefined' && window.location.origin.includes('http')
        ? `${window.location.origin}/api/complaints/track`
        : 'http://127.0.0.1:8000/api/complaints/track';

      const response = await fetch(`${baseUrl}/${encodedId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Grievance code '${cleanId}' not found in municipal records.`);
        }
        const err = await response.json();
        throw new Error(err.detail || 'Failed to fetch status timeline.');
      }

      const data: TrackResult = await response.json();
      setTrackResult(data);
    } catch (err: any) {
      console.error('Tracking fetch error:', err);
      setErrorMsg(err.message || 'Unable to connect to gateway.');
      setTrackResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrackingId) {
      setTrackingIdInput(initialTrackingId);
      fetchTrackingDetails(initialTrackingId);
    }
  }, [initialTrackingId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrackingDetails(trackingIdInput);
  };

  const getTimelineStepState = (stepName: string, currentStatus: string) => {
    const order = ['PENDING', 'IN_PROGRESS', 'RESOLVED'];
    const currentIdx = order.indexOf(currentStatus.toUpperCase());
    const stepIdx = order.indexOf(stepName.toUpperCase());

    if (currentStatus.toUpperCase() === 'REJECTED') {
      return stepName === 'REJECTED' ? 'rejected' : 'upcoming';
    }

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'active';
    return 'upcoming';
  };

  const formatTimestamp = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Search Input Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Track Grievance Status</h2>
        <p className="text-xs text-slate-400 mb-6">Enter your 10-digit tracking reference code (e.g. #GR-2026-3189) to view officer dispatch updates.</p>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={trackingIdInput}
              onChange={(e) => setTrackingIdInput(e.target.value)}
              placeholder="e.g. #GR-2026-3189"
              className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-100 font-mono font-bold focus:outline-none focus:border-cyan-500 transition-all placeholder-slate-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !trackingIdInput.trim()}
            className="w-full sm:w-auto px-6 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search</span>
          </button>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Track Result Timeline Display */}
      {trackResult && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6 animate-fade-in">
          {/* Header Status Overview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tracking Reference</span>
              <h3 className="text-xl font-mono font-extrabold text-cyan-400">{trackResult.complaint.tracking_id}</h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Status:</span>
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                trackResult.complaint.status === 'RESOLVED'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : trackResult.complaint.status === 'IN_PROGRESS'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {trackResult.complaint.status}
              </span>
            </div>
          </div>

          {/* Grievance Metadata Summary */}
          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-cyan-400" /> {trackResult.complaint.department_name || 'Assigned Department'}</span>
              <span className="font-semibold text-amber-400">{trackResult.complaint.urgency} Urgency</span>
            </div>
            <p className="text-slate-200 text-sm pt-1">{trackResult.complaint.translated_text || trackResult.complaint.raw_text}</p>
            
            {trackResult.complaint.photo_url && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold uppercase text-cyan-400 flex items-center gap-1.5 mb-2">
                  <Camera className="w-3.5 h-3.5" /> Filed Problem Photo Evidence
                </span>
                <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <img
                    src={trackResult.complaint.photo_url}
                    alt="Grievance evidence"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {trackResult.complaint.audio_url && (
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                  🎙️ Saved Voice Complaint Recording
                </span>
                <audio src={trackResult.complaint.audio_url} controls className="w-full h-9 rounded-xl" />
              </div>
            )}
          </div>

          {/* Visual Step Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" /> Dispatch Status Timeline
            </h4>

            <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {/* Step 1: PENDING */}
              <div className="relative">
                <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  getTimelineStepState('PENDING', trackResult.complaint.status) === 'completed' || getTimelineStepState('PENDING', trackResult.complaint.status) === 'active'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  ✓
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-200">1. Grievance Filed & Registered</span>
                    <span className="text-[11px] text-slate-500">{formatTimestamp(trackResult.complaint.created_at)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Complaint registered in Supabase database & auto-routed by Groq AI engine.</p>
                </div>
              </div>

              {/* Step 2: IN_PROGRESS */}
              <div className="relative">
                <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  getTimelineStepState('IN_PROGRESS', trackResult.complaint.status) === 'completed'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40'
                    : getTimelineStepState('IN_PROGRESS', trackResult.complaint.status) === 'active'
                    ? 'bg-cyan-500 text-slate-950 animate-pulse shadow-md shadow-cyan-500/40'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  2
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-200">2. Officer Dispatched & In-Progress</span>
                    <span className="text-[11px] text-slate-500">{formatTimestamp(trackResult.complaint.updated_at)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Field officer assigned. Remediation work currently under execution.</p>
                </div>
              </div>

              {/* Step 3: RESOLVED */}
              <div className="relative">
                <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  trackResult.complaint.status === 'RESOLVED'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  3
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-200">3. Resolution & Closure</span>
                    <span className="text-[11px] text-slate-500">
                      {trackResult.complaint.status === 'RESOLVED' ? formatTimestamp(trackResult.complaint.updated_at) : 'Pending resolution'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Inspection verified and complaint officially marked resolved.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Logs Trail */}
          {trackResult.status_timeline && trackResult.status_timeline.length > 0 && (
            <div className="pt-4 border-t border-slate-800">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">Audit Logs Trail</h5>
              <div className="space-y-2">
                {trackResult.status_timeline.map((log) => (
                  <div key={log.id} className="p-2.5 bg-slate-900/40 rounded-xl border border-slate-800/60 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-cyan-400">{log.new_status}</span>
                      <span className="text-slate-400 ml-2">{log.notes || 'Status changed'}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">{formatTimestamp(log.updated_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
