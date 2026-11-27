import React from 'react';
import { 
  LayoutDashboard, 
  FileSearch, 
  ShieldCheck, 
  Eraser, 
  History, 
  Settings, 
  Lock,
  Cpu
} from 'lucide-react';
import { NavigationTab } from '../types/navigation';
import { IsometricShieldCore } from './IsometricShieldCore';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'scanner', label: 'Document Scanner', icon: FileSearch, badge: 'Live Core' },
  { id: 'audit', label: 'Privacy Audit', icon: ShieldCheck },
  { id: 'sanitize', label: 'Sanitization', icon: Eraser },
  { id: 'logs', label: 'Activity Logs', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-[#0B0F19] text-slate-300 border-r border-slate-800 select-none transition-colors duration-200 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.6)]">
      {/* Brand Header with 3D Mini Shield */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800 gap-3 bg-slate-950/50">
        <IsometricShieldCore size="sm" />
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-wider font-mono text-white">
              PRIVORA
            </span>
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
              3D CORE
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium truncate tracking-tight">
            Detect. Audit. Sanitize. Protect.
          </span>
        </div>
      </div>

      {/* Engine Status Callout with 3D Specular Highlight */}
      <div className="px-3.5 py-3 mx-3 my-3 rounded-xl bg-slate-900/90 border-t border-t-white/15 border-x border-b border-slate-800 shadow-md">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-200 font-semibold flex items-center gap-1.5 text-[11px]">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            V8 / Regex Core
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 beacon-pulse-emerald"></span>
            ZERO-EGRESS
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Air-gapped execution sandbox. 100% in-browser volatile RAM processing.
        </p>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-1 space-y-1.5 overflow-y-auto">
        <div className="px-2 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-500">
          Security Suite
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group relative cursor-pointer ${
                isActive
                  ? 'bg-sky-500 text-slate-950 shadow-[0_4px_16px_rgba(14,165,233,0.35)] font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-sky-400'
                }`}
              />
              <span className="truncate flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive 
                    ? 'bg-slate-950/20 text-slate-950' 
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Security Guarantee 3D Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
          <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-200 text-[10px]">Zero Telemetry Policy</span>
            <span className="text-[9px] text-slate-400 truncate">Payload never touches network or disk</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
