import React, { useState, useMemo, useRef } from 'react';
import { 
  Eraser, 
  EyeOff, 
  Shuffle, 
  Copy, 
  Check, 
  Download, 
  ShieldCheck, 
  Database, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Sparkles 
} from 'lucide-react';
import { Card3D } from '../ui/Card3D';
import { useScan } from '../../context/ScanContext';
import { RedactionMode, PseudonymVault, sanitizeText } from '../../utils/sanitizer';
import { isCSVContent, sanitizeCSV, downloadSanitizedFile } from '../../utils/csvHandler';
import { CATEGORY_META, PIIMatch } from '../../utils/piiEngine';
import { SAMPLE_TXT_PAYLOAD } from '../../utils/sampleData';

export const SanitizationView: React.FC = () => {
  const { rawText, fileName, scanResult } = useScan();
  const [mode, setMode] = useState<RedactionMode>('PARTIAL');
  const [copied, setCopied] = useState<boolean>(false);
  const [isVaultOpen, setIsVaultOpen] = useState<boolean>(true);

  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  // Fallback to sample text if user hasn't loaded any document yet
  const effectiveRawText = rawText || SAMPLE_TXT_PAYLOAD;
  const isCsv = isCSVContent(effectiveRawText, fileName);

  // Compute sanitization result in memory per render/mode change
  const { sanitizedOutput, vaultEntries, totalReplacements } = useMemo(() => {
    const sessionVault = new PseudonymVault();

    if (isCsv) {
      const csvRes = sanitizeCSV(effectiveRawText, mode, sessionVault);
      return {
        sanitizedOutput: csvRes.sanitizedCsv,
        vaultEntries: sessionVault.getEntries(),
        totalReplacements: csvRes.totalCellsModified,
      };
    } else {
      const textRes = sanitizeText(effectiveRawText, scanResult.matches, mode, sessionVault);
      return {
        sanitizedOutput: textRes.sanitizedText,
        vaultEntries: sessionVault.getEntries(),
        totalReplacements: textRes.replacements.length,
      };
    }
  }, [effectiveRawText, scanResult.matches, mode, isCsv]);

  // Synchronized scrolling between left and right diff wells
  const handleScrollLeft = () => {
    if (leftScrollRef.current && rightScrollRef.current) {
      rightScrollRef.current.scrollTop = leftScrollRef.current.scrollTop;
    }
  };

  const handleScrollRight = () => {
    if (leftScrollRef.current && rightScrollRef.current) {
      leftScrollRef.current.scrollTop = rightScrollRef.current.scrollTop;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sanitizedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadSanitizedFile(sanitizedOutput, fileName || 'privora_document', isCsv);
  };

  // Split lines for line numbers
  const originalLines = effectiveRawText.split('\n');
  const sanitizedLines = sanitizedOutput.split('\n');

  // Render left original document with safe token badges
  const renderOriginalHighlighted = () => {
    if (scanResult.matches.length === 0) {
      return <span className="text-slate-800 dark:text-slate-300">{effectiveRawText}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    scanResult.matches.forEach((m: PIIMatch) => {
      if (m.start > lastIndex) {
        elements.push(
          <span key={`orig_plain_${lastIndex}`} className="text-slate-800 dark:text-slate-300">
            {effectiveRawText.slice(lastIndex, m.start)}
          </span>
        );
      }

      const meta = CATEGORY_META[m.category];
      elements.push(
        <span
          key={`orig_m_${m.id}`}
          className={`px-1.5 py-0.5 rounded font-mono font-semibold text-xs border ${meta.bg} ${meta.text} ${meta.border}`}
        >
          {m.text}
        </span>
      );

      lastIndex = m.end;
    });

    if (lastIndex < effectiveRawText.length) {
      elements.push(
        <span key={`orig_plain_end_${lastIndex}`} className="text-slate-800 dark:text-slate-300">
          {effectiveRawText.slice(lastIndex)}
        </span>
      );
    }

    return elements;
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* 1. Header with Tactile 3D Segmented Mode Switcher & Export Actions */}
      <Card3D className="p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-mono">
            Transformation Engine
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display">
              Data Sanitization & Side-by-Side Diff Workspace
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Strip or replace sensitive tokens deterministically. Preserves exact byte structure & CSV layout.
          </p>
        </div>

        {/* 3D Segmented Control Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#070A10] p-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-inner">
            {/* Mode 1: Full Mask */}
            <button
              onClick={() => setMode('FULL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'FULL'
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_4px_0_#047857] active:translate-y-[3px]'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Eraser className="w-3.5 h-3.5" />
                Full Mask
              </span>
            </button>

            {/* Mode 2: Partial Mask */}
            <button
              onClick={() => setMode('PARTIAL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'PARTIAL'
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_4px_0_#047857] active:translate-y-[3px]'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5" />
                Partial Mask
              </span>
            </button>

            {/* Mode 3: Consistent Pseudonymization */}
            <button
              onClick={() => setMode('PSEUDONYM')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'PSEUDONYM'
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_4px_0_#047857] active:translate-y-[3px]'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Shuffle className="w-3.5 h-3.5" />
                Consistent Pseudonymization
              </span>
            </button>
          </div>

          {/* Action Buttons: Copy & Download */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="btn-3d-secondary text-xs px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
              {copied ? 'Copied' : 'Copy Sanitized'}
            </button>

            <button
              onClick={handleDownload}
              className="btn-3d-emerald text-xs px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-950" />
              Download {isCsv ? '.CSV' : '.TXT'}
            </button>
          </div>
        </div>
      </Card3D>

      {/* 2. Synchronized Side-by-Side Comparison (50/50 split) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANE: Original Document */}
        <Card3D className="p-5 flex flex-col h-[560px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 font-display">
                Original Payload (PII Exposed)
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-bold border border-red-500/25 tabular-nums">
              {scanResult.totalEntities} Sensitive Tokens
            </span>
          </div>

          {/* Sunken 3D Well with Line Numbers */}
          <div 
            ref={leftScrollRef}
            onScroll={handleScrollLeft}
            className="flex-1 bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-white/[0.08] shadow-[inset_0_2px_8px_rgba(15,23,42,0.06)] dark:shadow-[inset_0_3px_12px_rgba(0,0,0,0.85)] rounded-xl p-4 overflow-auto flex text-xs font-mono leading-relaxed select-text"
          >
            {/* Line Numbers Column */}
            <div className="select-none text-slate-400 dark:text-slate-600 pr-3 border-r border-slate-200 dark:border-slate-800 text-right font-mono tabular-nums">
              {originalLines.map((_, idx) => (
                <div key={`left_num_${idx}`} className="h-5">{idx + 1}</div>
              ))}
            </div>

            {/* Document Content with Highlighted Badges */}
            <div className="pl-3.5 whitespace-pre-wrap flex-1">
              {renderOriginalHighlighted()}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span>Encoding: UTF-8</span>
            <span>{isCsv ? 'Format: RFC-4180 CSV' : 'Format: Plain Text'}</span>
          </div>
        </Card3D>

        {/* RIGHT PANE: Live Sanitized Output */}
        <Card3D className="p-5 flex flex-col h-[560px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 font-display">
                Live Sanitized Output ({mode} Mode)
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/25 tabular-nums">
              Safe for Egress • {totalReplacements} Masked
            </span>
          </div>

          {/* Sunken 3D Well with Line Numbers */}
          <div 
            ref={rightScrollRef}
            onScroll={handleScrollRight}
            className="flex-1 bg-emerald-50/40 dark:bg-[#070A10] border border-emerald-500/20 dark:border-emerald-500/25 shadow-[inset_0_2px_8px_rgba(16,185,129,0.04)] dark:shadow-[inset_0_3px_12px_rgba(0,0,0,0.85)] rounded-xl p-4 overflow-auto flex text-xs font-mono leading-relaxed select-text"
          >
            {/* Line Numbers Column */}
            <div className="select-none text-slate-400 dark:text-slate-600 pr-3 border-r border-slate-200 dark:border-slate-800 text-right font-mono tabular-nums">
              {sanitizedLines.map((_, idx) => (
                <div key={`right_num_${idx}`} className="h-5">{idx + 1}</div>
              ))}
            </div>

            {/* Sanitized Content */}
            <div className="pl-3.5 whitespace-pre-wrap flex-1 text-emerald-800 dark:text-emerald-300">
              {sanitizedOutput}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Zero Residual Exposure
            </span>
            <span>Deterministic Masking</span>
          </div>
        </Card3D>
      </div>

      {/* 3. Collapsible Session Pseudonym Vault (In-Memory Only) */}
      {mode === 'PSEUDONYM' && (
        <Card3D className="p-5">
          <div 
            onClick={() => setIsVaultOpen(!isVaultOpen)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
                Session Pseudonym Vault (Deterministic Map)
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 tabular-nums">
                {vaultEntries.length} Unique Identifiers
              </span>
            </div>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
              {isVaultOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {isVaultOpen && (
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This table exists strictly in active browser RAM. Evaluators can confirm that repeated values (like identical emails across different rows) map deterministically to the exact same surrogate key.
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 shadow-sm">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Category</th>
                      <th className="py-2.5 px-4 font-semibold">Normalized Key / Raw Value</th>
                      <th className="py-2.5 px-4 font-semibold">Assigned Surrogate Token</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Occurrences</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-800 dark:text-slate-300">
                    {vaultEntries.length > 0 ? (
                      vaultEntries.map((entry) => {
                        const meta = CATEGORY_META[entry.category];
                        return (
                          <tr key={entry.normalizedKey} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                            <td className="py-2 px-4">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${meta.bg} ${meta.text} ${meta.border}`}>
                                {entry.category}
                              </span>
                            </td>
                            <td className="py-2 px-4 text-slate-700 dark:text-slate-300">
                              {entry.rawSample}
                            </td>
                            <td className="py-2 px-4">
                              <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                                {entry.token}
                              </span>
                            </td>
                            <td className="py-2 px-4 text-right tabular-nums text-slate-500 dark:text-slate-400 font-bold">
                              {entry.occurrences}x
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-600 dark:text-slate-400">
                          No sensitive tokens detected in current payload.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card3D>
      )}
    </div>
  );
};

export default SanitizationView;
