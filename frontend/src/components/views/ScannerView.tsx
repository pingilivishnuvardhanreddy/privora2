import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  RefreshCw, 
  FileCode, 
  Trash2, 
  ShieldCheck, 
  AlertTriangle,
  Fingerprint,
  Clock,
  Filter
} from 'lucide-react';
import { Card3D } from '../ui/Card3D';
import { useScan } from '../../context/ScanContext';
import { CATEGORY_META, PIICategory, PIIMatch } from '../../utils/piiEngine';
import { SAMPLE_TXT_PAYLOAD, SAMPLE_CSV_PAYLOAD } from '../../utils/sampleData';

export const ScannerView: React.FC = () => {
  const { rawText, fileName, scanResult, setDocumentText, clearDocument } = useScan();
  const [selectedFilter, setSelectedFilter] = useState<PIICategory | 'ALL'>('ALL');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Line & character counters
  const charCount = rawText.length;
  const lineCount = rawText ? rawText.split('\n').length : 0;

  // File drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();

    if (file.name.endsWith('.csv')) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        // Parse CSV with PapaParse to validate structure
        Papa.parse(text, {
          complete: () => {
            setDocumentText(text, file.name);
          },
          error: () => {
            setDocumentText(text, file.name);
          }
        });
      };
      reader.readAsText(file);
    } else {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setDocumentText(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Safe Highlight Renderer: slices rawText into React elements (Zero dangerouslySetInnerHTML)
  const renderSafeHighlightedText = () => {
    if (!rawText) return null;
    if (scanResult.matches.length === 0) {
      return <span className="text-slate-800 dark:text-slate-300 font-mono text-xs">{rawText}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    const filteredMatches = selectedFilter === 'ALL'
      ? scanResult.matches
      : scanResult.matches.filter((m) => m.category === selectedFilter);

    filteredMatches.forEach((m: PIIMatch) => {
      // Unmatched leading text
      if (m.start > lastIndex) {
        elements.push(
          <span key={`plain_${lastIndex}`} className="text-slate-800 dark:text-slate-300">
            {rawText.slice(lastIndex, m.start)}
          </span>
        );
      }

      // Matched PII Entity badge with hover tooltip
      const meta = CATEGORY_META[m.category];
      elements.push(
        <span
          key={`match_${m.id}`}
          className={`relative inline-block mx-0.5 px-1.5 py-0.5 rounded font-mono font-semibold text-xs border cursor-pointer transition-all ${meta.bg} ${meta.text} ${meta.border} hover:scale-105 group z-20`}
        >
          {m.text}

          {/* Hover Tooltip (Safe React Overlay) */}
          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col gap-1 w-64 p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 shadow-2xl text-[11px] text-slate-800 dark:text-slate-200 z-50 backdrop-blur-md">
            <span className="flex items-center justify-between font-bold">
              <span style={{ color: meta.pillColor }}>{meta.label}</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono">
                {m.validationStatus}
              </span>
            </span>
            <span className="text-slate-600 dark:text-slate-400 text-[10px] leading-tight">
              {m.details}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-[9px] font-mono border-t border-slate-200 dark:border-slate-800 pt-1 mt-0.5">
              Position: [{m.start}:{m.end}]
            </span>
          </span>
        </span>
      );

      lastIndex = m.end;
    });

    // Trailing unmatched text
    if (lastIndex < rawText.length) {
      elements.push(
        <span key={`plain_end_${lastIndex}`} className="text-slate-800 dark:text-slate-300">
          {rawText.slice(lastIndex)}
        </span>
      );
    }

    return elements;
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.csv,.log,.json"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Scanner Header Actions Bar */}
      <Card3D className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-mono">
            Real-time Inspection
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <Fingerprint className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display">
              Client-Side Document & Stream Scanner
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Parses text, logs, CSV and JSON completely in browser RAM with zero server egress
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Load Sample TXT */}
          <button
            onClick={() => setDocumentText(SAMPLE_TXT_PAYLOAD, 'synthetic_incident_log.txt')}
            className="btn-3d-secondary text-xs px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            Load Sample TXT
          </button>

          {/* Load Sample CSV */}
          <button
            onClick={() => setDocumentText(SAMPLE_CSV_PAYLOAD, 'synthetic_users_dataset.csv')}
            className="btn-3d-secondary text-xs px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-teal-400" />
            Load Sample CSV
          </button>

          {/* Upload File */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-3d-emerald text-xs px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-950" />
            Upload (.txt / .csv)
          </button>

          {/* Clear Buffer */}
          {rawText && (
            <button
              onClick={clearDocument}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-600 dark:text-red-400 border border-red-500/30 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </Card3D>

      {/* Main Workspace: 2 Recessed 3D Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Pane: Recessed 3D Text Editor */}
        <Card3D className="p-5 flex flex-col h-[600px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 font-mono truncate max-w-xs">
                {fileName || 'Payload Buffer (Raw Memory Input)'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                {lineCount} lines
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                {charCount} chars
              </span>
            </div>
          </div>

          {/* Sunken 3D Well Drag & Drop Paste Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex-1 rounded-xl p-3.5 flex flex-col transition-all border ${
              isDragging
                ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-slate-50 dark:bg-[#070A10] border-slate-200 dark:border-white/[0.08] shadow-[inset_0_2px_8px_rgba(15,23,42,0.06)] dark:shadow-[inset_0_3px_12px_rgba(0,0,0,0.85)]'
            }`}
          >
            <textarea
              value={rawText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder="Paste raw text, logs, CSV content, or drop a .txt/.csv file here..."
              className="w-full h-full bg-transparent font-mono text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Drag & Drop .txt, .csv, .log files
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              Volatile RAM Buffer
            </span>
          </div>
        </Card3D>

        {/* Right Pane: Live PII Detection Engine Preview */}
        <Card3D className="p-5 flex flex-col h-[600px]">
          {/* Header with Detection Counts & Latency */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 font-display">
                Live PII Detection Engine Preview
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-teal-700 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/25 tabular-nums">
                <Clock className="w-3 h-3" />
                {scanResult.executionTimeMs}ms
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 tabular-nums">
                {scanResult.totalEntities} Detected
              </span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2 mb-2 text-[10px] font-mono">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer tabular-nums ${
                selectedFilter === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              All ({scanResult.totalEntities})
            </button>
            {(Object.keys(CATEGORY_META) as PIICategory[]).map((cat) => {
              const count = scanResult.entityCounts[cat];
              const meta = CATEGORY_META[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  className={`px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer tabular-nums ${
                    selectedFilter === cat
                      ? `${meta.bg} ${meta.text} font-bold border ${meta.border}`
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="text-[9px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>

          {/* False-Positive Prevention Alert Callout (Luhn Checksum Tracking) */}
          {scanResult.rejectedLuhnCount > 0 && (
            <div className="mb-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
              <div className="text-[11px] leading-tight">
                <span className="font-bold">{scanResult.rejectedLuhnCount} Non-PCI 16-Digit Sequence(s) Rejected:</span>{' '}
                <span className="text-amber-800 dark:text-amber-200/80">
                  Modulo-10 Luhn checksum prevented false-positive alerts on non-payment order numbers.
                </span>
              </div>
            </div>
          )}

          {/* Sunken 3D Well: Safe Highlighted Document View */}
          <div className="flex-1 bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-white/[0.08] shadow-[inset_0_2px_8px_rgba(15,23,42,0.06)] dark:shadow-[inset_0_3px_12px_rgba(0,0,0,0.85)] rounded-xl p-4 overflow-auto leading-relaxed">
            {rawText ? (
              <div className="whitespace-pre-wrap font-mono text-xs select-text">
                {renderSafeHighlightedText()}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
                <RefreshCw className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-2 animate-spin-slow" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-display">
                  Awaiting Payload Input
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-500 max-w-xs mt-1">
                  Type on the left or click 'Load Sample TXT' or 'Load Sample CSV' to trigger instant disjoint token inspection.
                </p>
              </div>
            )}
          </div>

          {/* Summary Footnote */}
          <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Overlapping Spans Disjointed
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              100% In-Memory Sandbox
            </span>
          </div>
        </Card3D>
      </div>
    </div>
  );
};

export default ScannerView;
