import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { 
  FileCheck2, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpRight, 
  Upload, 
  Lock, 
  Layers, 
  Database, 
  Radio, 
  Fingerprint, 
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  Clock,
  Trash2
} from 'lucide-react';
import { NavigationTab } from '../types/navigation';
import { Card3D } from '../components/ui/Card3D';
import { IsometricShieldCore } from '../components/IsometricShieldCore';
import { useScan } from '../context/ScanContext';
import { CATEGORY_META, PIICategory } from '../utils/piiEngine';
import { SAMPLE_TXT_PAYLOAD, SAMPLE_CSV_PAYLOAD } from '../utils/sampleData';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

const CATEGORY_WEIGHTS: Record<PIICategory, number> = {
  CREDIT_CARD: 25,
  AADHAAR: 25,
  PAN: 20,
  EMAIL: 10,
  PHONE: 10,
  IPV4: 8,
};

const getCategoryBarGradient = (c: PIICategory) => {
  switch (c) {
    case 'CREDIT_CARD': return 'from-rose-500 to-pink-500';
    case 'AADHAAR': return 'from-amber-500 to-orange-500';
    case 'PAN': return 'from-purple-500 to-violet-500';
    case 'EMAIL': return 'from-sky-500 to-cyan-500';
    case 'PHONE': return 'from-emerald-500 to-teal-400';
    case 'IPV4': return 'from-indigo-500 to-blue-500';
  }
};

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { 
    rawText, 
    fileName, 
    scanResult, 
    filesScannedCount, 
    setDocumentText, 
    clearDocument,
    activityEvents 
  } = useScan();

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeDocCount = filesScannedCount > 0 ? filesScannedCount : (rawText ? 1 : 0);

  // Deterministic live Heuristic Risk Gauge calculation
  const rawExposure = (Object.keys(CATEGORY_WEIGHTS) as PIICategory[]).reduce((acc, cat) => {
    return acc + (scanResult.entityCounts[cat] || 0) * CATEGORY_WEIGHTS[cat];
  }, 0);

  const riskScore = rawExposure === 0 
    ? 0 
    : Math.min(100, Math.round(100 * (1 - Math.exp(-rawExposure / 120))));

  const getRiskLevel = (score: number) => {
    if (score === 0) return { label: 'MINIMAL RISK', color: 'text-emerald-500 dark:text-emerald-400', stroke: '#10B981', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
    if (score < 35) return { label: 'LOW RISK', color: 'text-teal-500 dark:text-teal-400', stroke: '#14B8A6', bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30' };
    if (score < 70) return { label: 'MODERATE RISK', color: 'text-amber-500 dark:text-amber-400', stroke: '#F59E0B', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' };
    return { label: 'CRITICAL EXPOSURE', color: 'text-red-500 dark:text-red-400', stroke: '#EF4444', bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' };
  };

  const riskMeta = getRiskLevel(riskScore);
  const gaugeRadius = 36;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeOffset = gaugeCircumference - (riskScore / 100) * gaugeCircumference;

  // File drop handler
  const handleFileProcess = (file: File) => {
    const reader = new FileReader();
    if (file.name.endsWith('.csv')) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        Papa.parse(text, {
          complete: () => {
            setDocumentText(text, file.name);
            onNavigate('scanner');
          },
          error: () => {
            setDocumentText(text, file.name);
            onNavigate('scanner');
          }
        });
      };
      reader.readAsText(file);
    } else {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setDocumentText(text, file.name);
        onNavigate('scanner');
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4 max-w-[1440px] mx-auto">
      
      {/* 1. TOP ROW: Asymmetric 12-Col Bento Grid (Compact Above-The-Fold Profile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Left 7 Cols: Compact 3D Security Posture & Quick Dropzone Card */}
        <Card3D className="lg:col-span-7 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-sm">
                <Sparkles className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                Air-Gapped Client Security Active
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" />
                V8 Sandbox Active
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-display">
              Next-Gen Client-Side Privacy Defense
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
              Privora executes deterministic 6-category PII inspection and cryptographic sanitization strictly within browser memory. Raw document data never leaves your device.
            </p>

            {/* Quick Dropzone Well */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileInputChange} 
              accept=".csv,.txt,.json,.log" 
              className="hidden" 
            />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (!rawText && fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              className={`mt-3.5 rounded-xl p-3.5 sm:p-4 text-center transition-all cursor-pointer border ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
                  : rawText
                  ? 'bg-slate-50 dark:bg-[#070A10] border-slate-200 dark:border-white/[0.08]'
                  : 'bg-slate-50/80 hover:bg-slate-100/80 dark:bg-[#070A10]/80 dark:hover:bg-[#090E16] border-dashed border-slate-300 dark:border-white/15 hover:border-emerald-500/40'
              }`}
            >
              {rawText ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {fileName || 'Active In-Memory Document'}
                      </p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                        {rawText.length.toLocaleString()} chars • {scanResult.totalEntities} PII entities caught ({scanResult.executionTimeMs}ms)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('scanner');
                      }}
                      className="btn-3d-emerald text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      Inspect in Scanner <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearDocument();
                      }}
                      title="Clear Document Buffer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-1">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5 border border-emerald-500/20 shadow-sm">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Drag and drop <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">.csv</span> or <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">.txt</span> here, or click to browse
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    100% ephemeral client parsing. Zero egress guaranteed.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Benchmark Loaders with Instant 1-Click Scan Navigation */}
          <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-2.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Synthetic Benchmarks:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setDocumentText(SAMPLE_CSV_PAYLOAD, 'sample_customers.csv');
                  onNavigate('scanner');
                }}
                className="btn-3d-secondary text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
                Load Sample CSV
              </button>
              <button
                onClick={() => {
                  setDocumentText(SAMPLE_TXT_PAYLOAD, 'synthetic_incident_log.txt');
                  onNavigate('scanner');
                }}
                className="btn-3d-secondary text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                Load Sample TXT
              </button>
            </div>
          </div>
        </Card3D>

        {/* Right 5 Cols: Interactive 3D Isometric Security Core + Live Heuristic Risk Gauge */}
        <Card3D className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-mono">
                Security Core & Risk Posture
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${riskMeta.bg}`}>
                {riskMeta.label}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 font-display">
              Air-Gapped Telemetry Engine
            </h2>
          </div>

          {/* Isometric Shield and Radial Risk Gauge Showcase */}
          <div className="my-2.5 flex items-center justify-around gap-4 py-1">
            
            {/* 3D Isometric Rotating Shield */}
            <div className="flex flex-col items-center justify-center">
              <IsometricShieldCore size="sm" />
              <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mt-1.5">
                SHIELD KERNEL
              </span>
            </div>

            {/* Radial SVG Heuristic Risk Gauge */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 90 90">
                  <circle
                    cx="45"
                    cy="45"
                    r={gaugeRadius}
                    className="stroke-slate-200 dark:stroke-slate-800"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  <circle
                    cx="45"
                    cy="45"
                    r={gaugeRadius}
                    stroke={riskMeta.stroke}
                    strokeWidth="7"
                    fill="transparent"
                    strokeDasharray={gaugeCircumference}
                    strokeDashoffset={gaugeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-lg font-extrabold font-display tabular-nums ${riskMeta.color}`}>
                    {riskScore}
                  </span>
                  <span className="text-[8px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">
                    INDEX / 100
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mt-1">
                HEURISTIC EXPOSURE
              </span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              DPDP & GDPR Compliant
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              Latency &lt; 2ms
            </span>
          </div>
        </Card3D>
      </div>

      {/* 2. MIDDLE ROW: 4 Equal 3D Bento KPI Tiles (Color-Coded Semantic Lighting) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* KPI Tile 1: Documents Scanned (Electric Cyan / Sky) */}
        <Card3D className="p-3.5 sm:p-4 relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-400 to-cyan-400" />
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400 font-mono">
              Documents Scanned
            </span>
            <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 shadow-[0_0_12px_rgba(14,165,233,0.35)]">
              <FileCheck2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold font-display tabular-nums tracking-tight text-sky-600 dark:text-sky-400">
              {activeDocCount}
            </span>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              {activeDocCount > 0 ? 'Document Loaded' : 'Engine Ready'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {fileName || 'Awaiting local CSV, JSON or plain text'}
          </p>
        </Card3D>

        {/* KPI Tile 2: PII Entities Caught (Emerald / Teal) */}
        <Card3D className="p-3.5 sm:p-4 relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 to-teal-400" />
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-mono">
              PII Entities Caught
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.35)]">
              <Fingerprint className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold font-display tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">
              {scanResult.totalEntities}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {scanResult.executionTimeMs > 0 ? `${scanResult.executionTimeMs}ms` : '6 Categories'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {scanResult.totalEntities > 0
              ? `${scanResult.totalEntities} sensitive tokens identified`
              : 'Email, Phone, IPv4, PAN, Aadhaar, Card'}
          </p>
        </Card3D>

        {/* KPI Tile 3: Luhn False Positives Blocked (Amber / Gold) */}
        <Card3D className="p-3.5 sm:p-4 relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 to-orange-400" />
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 font-mono">
              False Positives Blocked
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.35)]">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold font-display tabular-nums tracking-tight text-amber-600 dark:text-amber-400">
              {scanResult.rejectedLuhnCount}
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
              Luhn Checksum
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Non-PCI 16-digit order numbers safely rejected
          </p>
        </Card3D>

        {/* KPI Tile 4: Memory Boundary (Violet / Indigo) */}
        <Card3D className="p-3.5 sm:p-4 relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-400 to-indigo-400" />
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400 font-mono">
              Memory Boundary
            </span>
            <div className="p-1.5 rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.35)]">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-violet-600 dark:text-violet-400">
              RAM Only
            </span>
            <span className="text-[11px] font-mono font-bold text-violet-600 dark:text-violet-400">
              0 B Egress
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            No document data written to disk or storage
          </p>
        </Card3D>
      </div>

      {/* 3. BOTTOM ROW: 2 Asymmetric 3D Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Left 7 Cols: 6-Category Live Breakdown Progress Bars */}
        <Card3D className="lg:col-span-7 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-mono">
                Heuristic Distribution
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Total Entities: <strong className="text-slate-900 dark:text-white tabular-nums">{scanResult.totalEntities}</strong>
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 font-display">
              6-Category Live Detection Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4">
              Real-time classification breakdown across active memory buffer
            </p>

            <div className="space-y-3.5">
              {(Object.keys(CATEGORY_META) as PIICategory[]).map((cat) => {
                const count = scanResult.entityCounts[cat] || 0;
                const meta = CATEGORY_META[cat];
                const percentage = scanResult.totalEntities > 0
                  ? Math.round((count / scanResult.totalEntities) * 100)
                  : 0;

                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {meta.label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                          ({cat})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                          {percentage}%
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                          count > 0 
                            ? `${meta.bg} ${meta.text} border ${meta.border}` 
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-800'
                        }`}>
                          {count} found
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar Track */}
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-900/90 overflow-hidden border border-slate-200 dark:border-white/[0.05]">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${getCategoryBarGradient(cat)}`}
                        style={{ width: `${Math.max(count > 0 ? 5 : 0, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              Full Regex + Luhn Checksum Pipeline
            </span>
            <button
              onClick={() => onNavigate('sanitize')}
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Sanitize Tokens →
            </button>
          </div>
        </Card3D>

        {/* Right 5 Cols: Recent Session Activity Feed */}
        <Card3D className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-mono">
                Volatile Audit Stream
              </span>
              <button
                onClick={() => onNavigate('logs')}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                All Logs <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 font-display">
              Recent Session Activity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-3">
              In-memory chronological audit events (destroyed on session exit)
            </p>

            <div className="space-y-2.5">
              {activityEvents.slice(0, 4).map((evt) => (
                <div 
                  key={evt.id} 
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-white/[0.06] text-xs transition-all hover:border-emerald-500/30"
                >
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                      {evt.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {evt.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
              Session Events: {activityEvents.length}
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              0 Bytes Leaked
            </span>
          </div>
        </Card3D>
      </div>
    </div>
  );
};

export default DashboardView;
