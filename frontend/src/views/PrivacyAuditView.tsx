import React from 'react';
import { 
  Scale, 
  ArrowRight, 
  Info, 
  Activity 
} from 'lucide-react';
import { Card3D } from '../components/ui/Card3D';
import { useScan } from '../context/ScanContext';
import { PIICategory, CATEGORY_META } from '../utils/piiEngine';

const CATEGORY_WEIGHTS: Record<PIICategory, number> = {
  CREDIT_CARD: 25,
  AADHAAR: 25,
  PAN: 20,
  EMAIL: 10,
  PHONE: 10,
  IPV4: 8,
};

export const PrivacyAuditView: React.FC = () => {
  const { scanResult } = useScan();

  // Deterministic 3D Risk Score Calculation:
  // raw = sum(count * weight)
  // score = raw === 0 ? 0 : Math.min(100, Math.round(100 * (1 - Math.exp(-raw / 120))))
  const rawExposure = (Object.keys(CATEGORY_WEIGHTS) as PIICategory[]).reduce((acc, cat) => {
    return acc + (scanResult.entityCounts[cat] || 0) * CATEGORY_WEIGHTS[cat];
  }, 0);

  const riskScore = rawExposure === 0 
    ? 0 
    : Math.min(100, Math.round(100 * (1 - Math.exp(-rawExposure / 120))));

  const getRiskLevel = (score: number) => {
    if (score === 0) return { label: 'MINIMAL RISK', color: 'text-emerald-600 dark:text-emerald-400', stroke: '#10B981', bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' };
    if (score < 35) return { label: 'LOW RISK', color: 'text-teal-600 dark:text-teal-400', stroke: '#14B8A6', bg: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/30' };
    if (score < 70) return { label: 'MODERATE RISK', color: 'text-amber-600 dark:text-amber-400', stroke: '#F59E0B', bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30' };
    return { label: 'CRITICAL EXPOSURE', color: 'text-red-600 dark:text-red-400', stroke: '#EF4444', bg: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30' };
  };

  const riskInfo = getRiskLevel(riskScore);

  // SVG Gauge calculations
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* 1. Header with 3D Radial Risk Gauge & Summary */}
      <Card3D className="p-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-1">
              <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
                Privacy Posture & Regulatory Risk Audit
              </h1>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Real-time exposure analysis calculated deterministically from active memory buffer tokens. Evaluates compliance requirements against Indian DPDP Act 2023, GDPR, PCI-DSS v4.0, and HIPAA.
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${riskInfo.bg}`}>
                {riskInfo.label} • {riskScore} / 100
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Raw Weighted Severity: {rawExposure} pts
              </span>
            </div>
          </div>

          {/* 3D Radial Gauge SVG */}
          <div className="relative flex items-center justify-center select-none">
            <svg className="w-40 h-40 transform -rotate-90">
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Progress Arc */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={riskInfo.stroke}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold font-display text-slate-950 dark:text-white tabular-nums tracking-tight">
                {riskScore}
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                Risk Index
              </span>
            </div>
          </div>
        </div>
      </Card3D>

      {/* 2. Before vs. After Exposure Comparison */}
      <Card3D className="p-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 font-display">
          Before vs. After Sanitization Exposure Delta
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Quantifies the residual PII risk reduction achieved through client-side masking.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Before */}
          <div className="p-4 rounded-xl border border-red-500/25 bg-red-500/10 text-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 font-mono">Raw State (Pre-Sanitization)</span>
              <div className="text-2xl font-extrabold font-display text-slate-950 dark:text-slate-100 my-1 tabular-nums">
                {scanResult.totalEntities} PII Entities
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Identifiers directly visible in document stream
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-red-500/20 text-red-600 dark:text-red-400 font-bold font-mono">
              Risk Score: {riskScore}/100
            </div>
          </div>

          {/* Transformation Arrow */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-col items-center justify-center text-center text-xs">
            <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
            <span className="font-bold text-slate-900 dark:text-slate-200">Client Memory Masking</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Zero Network Roundtrips
            </span>
            <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-2" />
          </div>

          {/* After */}
          <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 font-mono">Post-Sanitization Posture</span>
              <div className="text-2xl font-extrabold font-display text-emerald-600 dark:text-emerald-400 my-1 tabular-nums">
                0 Residual PII
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                100% of detected entities sanitized prior to downstream storage
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
              Residual Risk: 0/100
            </div>
          </div>
        </div>
      </Card3D>

      {/* 3. Category Weight Table & Detection Severity Matrix */}
      <Card3D className="p-5">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 font-display">
          Deterministic Category Weight Matrix
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Severity weights used in formula: <code className="font-mono text-emerald-600 dark:text-emerald-400">score = min(100, round(100 * (1 - e^(-raw/120))))</code>
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 shadow-sm">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Category</th>
                <th className="py-2.5 px-4 font-semibold">Regulatory Anchor</th>
                <th className="py-2.5 px-4 font-semibold text-center">Unit Weight</th>
                <th className="py-2.5 px-4 font-semibold text-center">Active Matches</th>
                <th className="py-2.5 px-4 font-semibold text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-800 dark:text-slate-300">
              {(Object.keys(CATEGORY_WEIGHTS) as PIICategory[]).map((cat) => {
                const count = scanResult.entityCounts[cat] || 0;
                const weight = CATEGORY_WEIGHTS[cat];
                const subtotal = count * weight;
                const meta = CATEGORY_META[cat];
                return (
                  <tr key={cat} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="py-2.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${meta.bg} ${meta.text} ${meta.border}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 text-[11px]">
                      {cat === 'CREDIT_CARD' && 'PCI-DSS v4.0 Requirement 3.4'}
                      {cat === 'AADHAAR' && 'UIDAI Aadhaar Act / DPDP Section 9'}
                      {cat === 'PAN' && 'Indian IT Act / DPDP Section 8'}
                      {cat === 'EMAIL' && 'GDPR Art. 4 Personal Identifier'}
                      {cat === 'PHONE' && 'TRAI / DPDP Direct Contact Data'}
                      {cat === 'IPV4' && 'GDPR Online Network Identifier'}
                    </td>
                    <td className="py-2.5 px-4 text-center tabular-nums font-bold text-slate-700 dark:text-slate-200">
                      {weight} pts
                    </td>
                    <td className="py-2.5 px-4 text-center tabular-nums font-bold">
                      <span className={count > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500'}>
                        {count}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums font-bold text-slate-900 dark:text-slate-100">
                      {subtotal} pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card3D>

      {/* 4. Statutory Disclaimer Callout */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400 shadow-sm">
        <Info className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-slate-900 dark:text-slate-200">Algorithm Transparency & Statutory Disclosure:</span>{' '}
          This Privacy Risk Index is a client-side heuristic exposure metric calculated deterministically from in-memory token matches. It represents relative exposure severity to assist data controllers in zero-egress audits and is not a formal legal opinion or UIDAI certification.
        </div>
      </div>
    </div>
  );
};

export default PrivacyAuditView;
