import React from 'react';
import { Globe } from 'lucide-react';
import { LanguageCode, LanguageOption } from '../types';

interface LanguageSelectorProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'கன்னட / ಕನ್ನಡ' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' }
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange
}) => {
  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-full px-3 py-1.5 shadow-lg backdrop-blur-md hover:border-cyan-500/50 transition-all">
        <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
        <select
          value={currentLanguage}
          onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
          className="bg-transparent text-sm font-medium text-slate-200 cursor-pointer focus:outline-none pr-1"
          aria-label="Select preferred language"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-100">
              {lang.nativeLabel} ({lang.label})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
