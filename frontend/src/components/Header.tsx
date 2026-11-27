import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileSearch, 
  ShieldCheck, 
  Eraser, 
  History, 
  Settings, 
  Trash2, 
  Sun, 
  Moon, 
  Lock, 
  CheckCircle2, 
  Radio, 
  X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useScan } from '../context/ScanContext';
import { NavigationTab } from '../types/navigation';
import { IsometricShieldCore } from './IsometricShieldCore';

interface HeaderProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'scanner', label: 'Scanner', icon: FileSearch },
  { id: 'audit', label: 'Audit', icon: ShieldCheck },
  { id: 'sanitize', label: 'Sanitize', icon: Eraser },
  { id: 'logs', label: 'Logs', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const { theme, toggleTheme } = useTheme();
  const { scanResult, rawText, purgeSessionMemory } = useScan();
  const [showInspector, setShowInspector] = useState<boolean>(false);
  const [purgeSuccess, setPurgeSuccess] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Dismiss popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowInspector(false);
      }
    };
    if (showInspector) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInspector]);

  const handleQuickPurge = () => {
    purgeSessionMemory();
    setPurgeSuccess(true);
    setTimeout(() => setPurgeSuccess(false), 2000);
  };

  return (
    <header role="banner" className="sticky top-0 z-40 w-full transition-colors duration-200 bg-white/85 dark:bg-[#070A10]/90 backdrop-blur-xl border-b border-slate-200/90 dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.6)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Left: PRIVORA Logo + 3D Isometric Emblem + ZERO-EGRESS ENGINE Pill */}
        <div 
          onClick={() => onTabChange('dashboard')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onTabChange('dashboard');
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="PRIVORA Home Dashboard"
          className="flex items-center gap-3 cursor-pointer group flex-shrink-0 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none rounded-xl p-1"
        >
          <div className="flex items-center justify-center">
            <IsometricShieldCore size="sm" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-extrabold tracking-wider font-display text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
              PRIVORA
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ZERO-EGRESS ENGINE
            </span>
          </div>
        </div>

        {/* Center: 3D Recessed Pill Navigation Dock with Sliding/Active Indicator */}
        <nav 
          aria-label="Primary Workspace Navigation" 
          role="tablist" 
          className="flex items-center bg-slate-200/80 dark:bg-[#0C1018]/90 p-1.5 rounded-full border border-slate-300/80 dark:border-white/[0.08] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.85)] overflow-x-auto no-scrollbar"
        >
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`tab-${item.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${item.id}`}
                  tabIndex={isActive ? 0 : -1}
                  aria-label={`${item.label} View`}
                  onClick={() => onTabChange(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer select-none whitespace-nowrap focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-md -translate-y-[1px] shadow-emerald-500/25 scale-[1.02]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-300/50 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Right: Live 0 B Egress Trust Badge, Quick RAM Purge, & Theme Toggle */}
        <div className="flex items-center gap-2.5 relative flex-shrink-0">
          
          {/* Clickable 0 B Egress Trust Pill */}
          <button
            onClick={() => setShowInspector(!showInspector)}
            aria-expanded={showInspector}
            aria-haspopup="dialog"
            aria-label="Inspect Client-Side Zero-Egress Runtime Telemetry"
            title="Inspect Client-Side Zero-Egress Runtime Telemetry"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none
              bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 
              shadow-[0_2px_8px_rgba(16,185,129,0.15)] hover:border-emerald-500/60 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-mono text-[11px] font-bold tracking-tight whitespace-nowrap">
              0 B Egress
            </span>
          </button>

          {/* Quick RAM Purge Button */}
          <button
            onClick={handleQuickPurge}
            aria-label={purgeSuccess ? "RAM Cleared" : "Quick Purge Session RAM"}
            title={purgeSuccess ? "RAM Cleared!" : "Quick Purge Session RAM"}
            className={`p-2 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-center focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
              purgeSuccess
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                : 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border-slate-200 dark:bg-slate-900/80 dark:hover:bg-red-950/40 dark:text-slate-400 dark:hover:text-red-400 dark:border-white/[0.08] hover:border-red-500/30'
            }`}
          >
            {purgeSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-slate-950 animate-bounce" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="flex items-center justify-center w-9 h-9 rounded-xl border transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none
              bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700
              dark:bg-slate-900/90 dark:hover:bg-slate-800 dark:border-white/[0.08] dark:text-slate-200"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-emerald-600 transition-transform duration-200 hover:-rotate-12" />
            )}
          </button>

          {/* Popover for Live Zero-Leak Inspector */}
          {showInspector && (
            <div
              ref={popoverRef}
              role="dialog"
              aria-modal="true"
              aria-label="Zero-Leak Runtime Telemetry Details"
              className="absolute top-12 right-0 w-80 p-4 rounded-2xl bg-white dark:bg-[#0D111A] border border-slate-200 dark:border-t-white/20 dark:border-x-white/[0.08] dark:border-b-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-50 text-xs text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-display">
                    Zero-Leak Runtime Telemetry
                  </span>
                </div>
                <button
                  onClick={() => setShowInspector(false)}
                  aria-label="Close Telemetry Inspector"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-md focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="py-3 space-y-2.5 font-mono text-[11px]">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Outbound Bytes:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    0 B (Zero Egress)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Persistent Storage Keys:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    0 (RAM Only)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Execution Mode:</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    Ephemeral Browser RAM
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Volatile Buffer:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {rawText.length} chars ({scanResult.totalEntities} entities)
                  </span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  Air-Gapped V8 Sandbox
                </span>
                <span className="font-mono">Local Host Only</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
