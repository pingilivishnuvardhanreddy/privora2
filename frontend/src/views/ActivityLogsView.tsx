import React, { useState } from 'react';
import { 
  Shield, 
  Info, 
  FileText, 
  Trash2, 
  Download, 
  Filter, 
  Cpu, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { Card3D } from '../components/ui/Card3D';
import { useScan, ActivityEvent } from '../context/ScanContext';

export const ActivityLogsView: React.FC = () => {
  const { activityEvents } = useScan();
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredEvents = filterType === 'ALL'
    ? activityEvents
    : activityEvents.filter((e) => e.type === filterType);

  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'FILE_LOADED':
        return <FileText className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />;
      case 'SCAN_COMPLETED':
        return <Cpu className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />;
      case 'MODE_CHANGED':
        return <Shield className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />;
      case 'EXPORT_DOWNLOADED':
        return <Download className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />;
      case 'MEMORY_CLEARED':
        return <Trash2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />;
    }
  };

  const getEventBadge = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'FILE_LOADED':
        return 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25';
      case 'SCAN_COMPLETED':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25';
      case 'MODE_CHANGED':
        return 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/25';
      case 'EXPORT_DOWNLOADED':
        return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/25';
      case 'MEMORY_CLEARED':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25';
    }
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* 1. In-Memory Ephemeral Storage Disclaimer */}
      <Card3D className="p-4 border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-950/15">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-slate-100">Zero-Persistence Activity Log:</span> This chronological event trail records operational metadata (timestamps, file sizes, token counts). In accordance with the Zero-Leak Architecture, <strong className="text-emerald-600 dark:text-emerald-400 font-bold">zero raw PII values or customer tokens are ever logged</strong>. Closing or refreshing this browser tab clears all event memory.
          </div>
        </div>
      </Card3D>

      {/* 2. Activity Log Table with Live Events */}
      <Card3D className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
              Session Activity Log Stream
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deterministic audit of client operations performed during this active session
            </p>
          </div>

          {/* Event Filter Pills */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <Filter className="w-3 h-3 text-slate-500 dark:text-slate-400 mr-1" />
            {['ALL', 'FILE_LOADED', 'SCAN_COMPLETED', 'MEMORY_CLEARED'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  filterType === type
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 text-slate-600 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Chronological Event Stream */}
        <div className="space-y-3">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex-shrink-0 shadow-sm">
                  {getEventIcon(evt.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-200 font-display">{evt.title}</span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${getEventBadge(evt.type)}`}>
                      {evt.type}
                    </span>
                    {evt.entityCount !== undefined && evt.entityCount > 0 && (
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ({evt.entityCount} Entities)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    {evt.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center font-mono text-[10px] text-slate-600 dark:text-slate-400">
                <Clock className="w-3 h-3 text-slate-400 dark:text-slate-600" />
                <span>{evt.timestamp}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Audit Logging Active
          </span>
          <span className="tabular-nums">
            {activityEvents.length} Recorded Session Actions
          </span>
        </div>
      </Card3D>
    </div>
  );
};

export default ActivityLogsView;
