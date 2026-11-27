import {
  isValidLuhn,
  isValidPAN,
  isValidAadhaarFormat,
  isValidIPv4,
  isValidIndianPhone,
  isValidEmail,
} from './validators';

export type PIICategory = 'EMAIL' | 'CREDIT_CARD' | 'AADHAAR' | 'PAN' | 'PHONE' | 'IPV4';

export interface PIIMatch {
  id: string;
  category: PIICategory;
  text: string;
  start: number;
  end: number;
  validationStatus: 'VALID' | 'STRUCTURALLY_VALID';
  details: string;
}

export interface EngineResult {
  matches: PIIMatch[];
  entityCounts: Record<PIICategory, number>;
  totalEntities: number;
  rejectedLuhnCount: number;
  executionTimeMs: number;
}

// Priority for overlap resolution: CREDIT_CARD > AADHAAR > PAN > EMAIL > PHONE > IPV4
const CATEGORY_PRIORITY: Record<PIICategory, number> = {
  CREDIT_CARD: 6,
  AADHAAR: 5,
  PAN: 4,
  EMAIL: 3,
  PHONE: 2,
  IPV4: 1,
};

export const CATEGORY_META: Record<
  PIICategory,
  { label: string; bg: string; text: string; border: string; pillColor: string }
> = {
  CREDIT_CARD: {
    label: 'Credit Card (Luhn)',
    bg: 'bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-500/30',
    pillColor: '#F43F5E',
  },
  AADHAAR: {
    label: 'Indian Aadhaar',
    bg: 'bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-500/30',
    pillColor: '#F59E0B',
  },
  PAN: {
    label: 'Indian PAN Card',
    bg: 'bg-purple-500/15',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-500/30',
    pillColor: '#A855F7',
  },
  EMAIL: {
    label: 'Email Address',
    bg: 'bg-sky-500/15',
    text: 'text-sky-700 dark:text-sky-400',
    border: 'border-sky-500/30',
    pillColor: '#0EA5E9',
  },
  PHONE: {
    label: 'Indian Mobile Phone',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    pillColor: '#10B981',
  },
  IPV4: {
    label: 'IPv4 Address',
    bg: 'bg-indigo-500/15',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-500/30',
    pillColor: '#6366F1',
  },
};

export interface ScanOptions {
  enabledCategories?: Record<PIICategory, boolean>;
}

/**
 * Scan raw text payload for sensitive PII entities
 * Executes completely client-side in volatile memory.
 */
export function scanTextForPII(text: string, options?: ScanOptions): EngineResult {
  const startTime = performance.now();
  const rawCandidates: PIIMatch[] = [];
  let rejectedLuhnCount = 0;

  const isEnabled = (cat: PIICategory): boolean => {
    if (!options?.enabledCategories) return true;
    return options.enabledCategories[cat] !== false;
  };

  if (!text || text.trim().length === 0) {
    return {
      matches: [],
      entityCounts: {
        EMAIL: 0,
        CREDIT_CARD: 0,
        AADHAAR: 0,
        PAN: 0,
        PHONE: 0,
        IPV4: 0,
      },
      totalEntities: 0,
      rejectedLuhnCount: 0,
      executionTimeMs: 0,
    };
  }

  // 1. Credit Cards & Payment Numbers (MATCH FIRST with lookbehind/lookahead boundaries)
  // Fix 2: /(?<![\d-])(?:\d[ -]?){13,19}(?![\d-])/g
  if (isEnabled('CREDIT_CARD')) {
    const ccRegex = /(?<![\d-])(?:\d[ -]?){13,19}(?![\d-])/g;
    let match: RegExpExecArray | null;

    while ((match = ccRegex.exec(text)) !== null) {
      const rawVal = match[0].trim();
      const cleanDigits = rawVal.replace(/[\s-]/g, '');

      if (isValidLuhn(rawVal)) {
        rawCandidates.push({
          id: `cc_${match.index}_${match.index + rawVal.length}`,
          category: 'CREDIT_CARD',
          text: rawVal,
          start: match.index,
          end: match.index + rawVal.length,
          validationStatus: 'VALID',
          details: `Luhn mod-10 verified (${cleanDigits.length} digits)`,
        });
      } else {
        // If 16 digits and fails Luhn, track as rejected candidate (avoids false positives on order IDs)
        if (cleanDigits.length === 16) {
          rejectedLuhnCount++;
        }
      }
    }
  }

  // 2. Indian Aadhaar Number (12 digits starting with 2-9)
  // Fix 2: Strict boundaries (?<![\d-]) and (?![\d-]) so 16-digit cards are never partially swallowed as 12-digit
  if (isEnabled('AADHAAR')) {
    const aadhaarRegex = /(?<![\d-])[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}(?![\d-])/g;
    let match: RegExpExecArray | null;

    while ((match = aadhaarRegex.exec(text)) !== null) {
      const rawVal = match[0].trim();
      if (isValidAadhaarFormat(rawVal)) {
        rawCandidates.push({
          id: `aad_${match.index}_${match.index + rawVal.length}`,
          category: 'AADHAAR',
          text: rawVal,
          start: match.index,
          end: match.index + rawVal.length,
          validationStatus: 'STRUCTURALLY_VALID',
          details: 'UIDAI format verified (12-digit Indian National Identity)',
        });
      }
    }
  }

  // 3. Indian Income Tax PAN Card (5 letters + 4 digits + 1 letter)
  // Fix 1: Accept all valid PAN formats case-insensitively without strict 4th-char rejections
  if (isEnabled('PAN')) {
    const panRegex = /\b[A-Za-z]{5}[0-9]{4}[A-Za-z]\b/g;
    let match: RegExpExecArray | null;

    while ((match = panRegex.exec(text)) !== null) {
      const rawVal = match[0];
      if (isValidPAN(rawVal)) {
        rawCandidates.push({
          id: `pan_${match.index}_${match.index + rawVal.length}`,
          category: 'PAN',
          text: rawVal,
          start: match.index,
          end: match.index + rawVal.length,
          validationStatus: 'VALID',
          details: `Indian PAN format verified (${rawVal.toUpperCase()})`,
        });
      }
    }
  }

  // 4. Email Addresses
  if (isEnabled('EMAIL')) {
    const emailRegex = /\b[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+\b/g;
    let match: RegExpExecArray | null;

    while ((match = emailRegex.exec(text)) !== null) {
      const rawVal = match[0];
      if (isValidEmail(rawVal)) {
        rawCandidates.push({
          id: `email_${match.index}_${match.index + rawVal.length}`,
          category: 'EMAIL',
          text: rawVal,
          start: match.index,
          end: match.index + rawVal.length,
          validationStatus: 'VALID',
          details: 'RFC 5322 formatted email address',
        });
      }
    }
  }

  // 5. Indian Mobile Phone Numbers
  // Fix 3: Strict boundaries (?<![\d-]) and (?![\d-]) so phone regex never matches inside an invalid 16-digit order ID
  if (isEnabled('PHONE')) {
    const phoneRegex = /(?<![\d-])(?:\+91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}(?![\d-])/g;
    let match: RegExpExecArray | null;

    while ((match = phoneRegex.exec(text)) !== null) {
      const rawVal = match[0].trim();
      if (isValidIndianPhone(rawVal)) {
        rawCandidates.push({
          id: `phone_${match.index}_${match.index + rawVal.length}`,
          category: 'PHONE',
          text: rawVal,
          start: match.index,
          end: match.index + rawVal.length,
          validationStatus: 'VALID',
          details: 'Indian TRAI 10-digit mobile series [6-9]',
        });
      }
    }
  }

  // 6. IPv4 Addresses
  if (isEnabled('IPV4')) {
    const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
    let match: RegExpExecArray | null;

    while ((match = ipRegex.exec(text)) !== null) {
      const rawVal = match[0];
      if (isValidIPv4(rawVal)) {
        rawCandidates.push({
          id: `ip_${match.index}_${match.index + rawVal.length}`,
          category: 'IPV4',
          text: rawVal,
          start: match.index,
          end: match.index + rawVal.length,
          validationStatus: 'VALID',
          details: 'Valid 4-octet IPv4 host address',
        });
      }
    }
  }

  // Overlap Resolution Algorithm:
  // Sort candidates by start ascending, then higher category priority, then longer span length
  rawCandidates.sort((a, b) => {
    if (a.start !== b.start) {
      return a.start - b.start;
    }
    const prioDiff = CATEGORY_PRIORITY[b.category] - CATEGORY_PRIORITY[a.category];
    if (prioDiff !== 0) {
      return prioDiff;
    }
    return (b.end - b.start) - (a.end - a.start);
  });

  // Filter overlapping spans to ensure all matches are disjoint
  const disjointMatches: PIIMatch[] = [];
  let lastEnd = -1;

  for (const candidate of rawCandidates) {
    if (candidate.start >= lastEnd) {
      disjointMatches.push(candidate);
      lastEnd = candidate.end;
    }
  }

  // Calculate entity counts
  const entityCounts: Record<PIICategory, number> = {
    EMAIL: 0,
    CREDIT_CARD: 0,
    AADHAAR: 0,
    PAN: 0,
    PHONE: 0,
    IPV4: 0,
  };

  for (const item of disjointMatches) {
    entityCounts[item.category]++;
  }

  const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));

  return {
    matches: disjointMatches,
    entityCounts,
    totalEntities: disjointMatches.length,
    rejectedLuhnCount,
    executionTimeMs,
  };
}
