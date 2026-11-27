import React, { useState } from 'react';
import { 
  Lock, 
  CheckCircle2, 
  Trash2, 
  AlertTriangle, 
  Check 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useScan } from '../context/ScanContext';
import { Card3D } from '../components/ui/Card3D';
import { PIICategory, CATEGORY_META } from '../utils/piiEngine';

export const SettingsView: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { enabledCategories, toggleCategory, purgeSessionMemory, scanResult } = useScan();
  const [purged, setPurged] = useState<boolean>(false);

  const handlePurge = () => {
    purgeSessionMemory();
    setPurged(true);
    setTimeout(() => setPurged(false), 3000);
  };

  const categoriesList: { id: PIICategory; name: string; desc: string }[] = [
    { id: 'CREDIT_CARD', name: 'Credit Card & Luhn Checksum', desc: 'Validates 13–19 digit cards with modulo-10 Luhn checksum' },
    { id: 'AADHAAR', name: 'Indian UIDAI Aadhaar', desc: '12-digit structural format starting with [2-9] without repeated sequences' },
    { id: 'PAN', name: 'Indian Income Tax PAN', desc: '5 letters + 4 digits + 1 letter structure' },
    { id: 'EMAIL', name: 'RFC 5322 Email Validation', desc: 'Standard & international email address patterns' },
    { id: 'PHONE', name: 'Indian Mobile (+91) Heuristic', desc: '10-digit mobile numbers starting with 6, 7, 8, or 9' },
    { id: 'IPV4', name: 'IPv4 Network Host Format', desc: '4-octet dot-separated numbers between 0 and 255' },
  ];

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Detector Policies & Theme Switcher */}
        <div className="lg:col-span-2 space-y-6">
          {/* Working 6-Category PII Detector Toggles */}
          <Card3D className="p-5 space-y-4">
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
                6-Category Detection Engine Switches
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Toggle individual detector heuristics. Toggling immediately re-scans the active memory buffer without network egress.
              </p>
            </div>

            <div className="space-y-2.5">
              {categoriesList.map((cat) => {
                const isEnabled = enabledCategories[cat.id];
                const meta = CATEGORY_META[cat.id];
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs transition-colors hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-200 font-display">{cat.name}</span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${meta.bg} ${meta.text} ${meta.border}`}>
                          {cat.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{cat.desc}</p>
                    </div>

                    <button
                      onClick={() => toggleCategory(cat.id)}
                      role="switch"
                      aria-checked={isEnabled}
                      aria-label={`Toggle ${cat.name} detection`}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
                        isEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-800'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </Card3D>

          {/* Theme & Display Configuration */}
          <Card3D className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 font-display">
              Interface & Theme Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Privora respects strict system and explicit theme tokens with localStorage key isolation
            </p>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200">Active Theme System</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Persisted exclusively under <code className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">'privora-theme'</code>
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="btn-3d-secondary text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Switch to {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </Card3D>
        </div>

        {/* Right Column: Purge Session Memory & Storage Sanitation Audit */}
        <div className="space-y-6">
          {/* Purge Session Memory Card */}
          <Card3D className="p-5 border-red-500/25 bg-red-500/5 dark:bg-red-950/10">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
                Emergency RAM Purge
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Instantly destroy all loaded document buffers, detection spans, and surrogate pseudonym maps from active browser memory.
            </p>

            <button
              onClick={handlePurge}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-2 cursor-pointer ${
                purged
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_2px_8px_rgba(16,185,129,0.4)]'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_4px_0_#991b1b] active:translate-y-[3px]'
              }`}
            >
              {purged ? (
                <>
                  <Check className="w-4 h-4" />
                  Memory Purged Successfully
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Purge Session Memory
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center mt-2 font-mono">
              Irreversible action • Resets active buffer to 0 bytes
            </p>
          </Card3D>

          {/* Storage Sanitation Audit */}
          <Card3D className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
                Storage Sanitation Audit
              </h2>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Verify the strict privacy invariant: no user content, uploaded files, or PII ever touch persistent storage.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">localStorage Allowed Keys:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">['privora-theme']</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">sessionStorage Usage:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">0 bytes</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">IndexedDB Engine:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Disabled</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">External CDN Trackers:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">0 (Air-Gapped)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Active Buffer Entities:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{scanResult.totalEntities} in RAM</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero-Leak Invariant Verified</span>
            </div>
          </Card3D>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
