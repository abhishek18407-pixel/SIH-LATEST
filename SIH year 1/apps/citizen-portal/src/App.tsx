import React, { useState } from 'react';
import { Mic, Search, ShieldCheck, Sparkles, Building2, Landmark, Radio } from 'lucide-react';
import { LanguageCode, ComplaintResult } from './types';
import { LanguageSelector } from './components/LanguageSelector';
import { VoiceRecorder } from './components/VoiceRecorder';
import { ComplaintConfirmationCard } from './components/ComplaintConfirmationCard';
import { TrackerSearchBar } from './components/TrackerSearchBar';

export const App: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [activeTab, setActiveTab] = useState<'submit' | 'track'>('submit');
  const [createdComplaint, setCreatedComplaint] = useState<ComplaintResult | null>(null);
  const [trackQueryId, setTrackQueryId] = useState<string>('');

  const handleComplaintCreated = (complaint: ComplaintResult) => {
    setCreatedComplaint(complaint);
  };

  const handleTrackClick = (trackingId: string) => {
    setTrackQueryId(trackingId);
    setActiveTab('track');
  };

  const handleResetForm = () => {
    setCreatedComplaint(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950 font-sans relative overflow-x-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-cyan-600/15 via-blue-600/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[300px] bg-gradient-to-t from-emerald-600/10 to-transparent blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-slate-800/80 px-4 sm:px-8 py-4 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
                Civic Redressal Gateway
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Sparkles className="w-3 h-3" /> Groq AI
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Smart City Municipal Governance Platform</p>
            </div>
          </div>

          <LanguageSelector
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
          />
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 z-10 flex flex-col items-center">
        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shadow-xl mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('submit')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'submit'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>File Grievance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('track')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'track'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Track Status</span>
          </button>
        </div>

        {/* Tab View Switcher */}
        {activeTab === 'submit' ? (
          createdComplaint ? (
            <ComplaintConfirmationCard
              complaint={createdComplaint}
              onTrackClick={handleTrackClick}
              onReset={handleResetForm}
            />
          ) : (
            <VoiceRecorder
              currentLanguage={currentLanguage}
              onComplaintCreated={handleComplaintCreated}
            />
          )
        ) : (
          <TrackerSearchBar initialTrackingId={trackQueryId} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Official SIH Civic Grievance Portal — Secured by Supabase & Groq AI</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <span>Supported Languages: Hindi, Tamil, Telugu, Kannada, Marathi, English</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
