import { PIICategory, PIIMatch } from './piiEngine';

export type RedactionMode = 'FULL' | 'PARTIAL' | 'PSEUDONYM';

export interface PseudonymEntry {
  normalizedKey: string;
  token: string;
  category: PIICategory;
  rawSample: string;
  occurrences: number;
}

export class PseudonymVault {
  private map: Map<string, PseudonymEntry> = new Map();
  private counters: Record<PIICategory, number> = {
    EMAIL: 0,
    PHONE: 0,
    PAN: 0,
    AADHAAR: 0,
    CREDIT_CARD: 0,
    IPV4: 0,
  };

  private getCategoryPrefix(category: PIICategory): string {
    switch (category) {
      case 'EMAIL':
        return 'USER';
      case 'PHONE':
        return 'PHONE';
      case 'PAN':
        return 'PAN';
      case 'AADHAAR':
        return 'AADHAAR';
      case 'CREDIT_CARD':
        return 'CARD';
      case 'IPV4':
        return 'IP';
    }
  }

  public normalize(raw: string, category: PIICategory): string {
    switch (category) {
      case 'EMAIL':
        return raw.trim().toLowerCase();
      case 'PHONE':
      case 'AADHAAR':
      case 'CREDIT_CARD':
        // Strip non-digits for consistent key matching
        return raw.replace(/\D/g, '');
      case 'PAN':
        return raw.trim().toUpperCase();
      case 'IPV4':
        return raw.trim();
    }
  }

  public getOrCreateToken(raw: string, category: PIICategory): string {
    const key = `${category}:${this.normalize(raw, category)}`;
    const existing = this.map.get(key);

    if (existing) {
      existing.occurrences++;
      return existing.token;
    }

    this.counters[category]++;
    const padNum = String(this.counters[category]).padStart(2, '0');
    const token = `${this.getCategoryPrefix(category)}_${padNum}`;

    this.map.set(key, {
      normalizedKey: key,
      token,
      category,
      rawSample: raw,
      occurrences: 1,
    });

    return token;
  }

  public getEntries(): PseudonymEntry[] {
    return Array.from(this.map.values());
  }

  public clear(): void {
    this.map.clear();
    this.counters = {
      EMAIL: 0,
      PHONE: 0,
      PAN: 0,
      AADHAAR: 0,
      CREDIT_CARD: 0,
      IPV4: 0,
    };
  }
}

/**
 * Apply category-specific contextual partial masking
 */
export function applyPartialMask(raw: string, category: PIICategory): string {
  switch (category) {
    case 'EMAIL': {
      // rahul@gmail.com -> r****@gmail.com
      const atIndex = raw.indexOf('@');
      if (atIndex > 1) {
        const firstChar = raw.charAt(0);
        const domain = raw.slice(atIndex);
        return `${firstChar}****${domain}`;
      } else if (atIndex === 1) {
        return `*${raw.slice(atIndex)}`;
      }
      return '[REDACTED_EMAIL]';
    }

    case 'PHONE': {
      // Mask leading digits, keep last 4 digits (e.g. 9876543210 -> XXXXXX3210)
      const digits = raw.replace(/\D/g, '');
      if (digits.length >= 4) {
        const last4 = digits.slice(-4);
        const maskLen = Math.max(digits.length - 4, 6);
        return `${'X'.repeat(maskLen)}${last4}`;
      }
      return 'XXXXXX' + raw.slice(-4);
    }

    case 'PAN': {
      // Mask first 5 characters, keep last 5 characters (e.g. ABCDE1234F -> XXXXX1234F)
      const clean = raw.trim().toUpperCase();
      if (clean.length === 10) {
        return `XXXXX${clean.slice(5)}`;
      }
      return 'XXXXX' + clean.slice(-5);
    }

    case 'AADHAAR': {
      // Mask first 8 digits, keep last 4 digits (XXXX XXXX <last4>)
      const digits = raw.replace(/\D/g, '');
      if (digits.length >= 4) {
        const last4 = digits.slice(-4);
        return `XXXX XXXX ${last4}`;
      }
      return 'XXXX XXXX ' + raw.slice(-4);
    }

    case 'CREDIT_CARD': {
      // Mask leading digits, keep last 4 digits (XXXX-XXXX-XXXX-<last4>)
      const digits = raw.replace(/\D/g, '');
      if (digits.length >= 4) {
        const last4 = digits.slice(-4);
        return `XXXX-XXXX-XXXX-${last4}`;
      }
      return 'XXXX-XXXX-XXXX-' + raw.slice(-4);
    }

    case 'IPV4': {
      // Keep first two octets (192.168.1.10 -> 192.168.xxx.xxx)
      const parts = raw.trim().split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.xxx.xxx`;
      }
      return 'xxx.xxx.xxx.xxx';
    }
  }
}

export interface SanitizedReplacement {
  original: string;
  replacement: string;
  category: PIICategory;
  start: number;
  end: number;
}

export interface SanitizationResult {
  sanitizedText: string;
  replacements: SanitizedReplacement[];
  vault: PseudonymVault;
  mode: RedactionMode;
}

/**
 * Sanitize document text using detected disjoint matches
 * Preserves text outside matches strictly byte-for-byte
 */
export function sanitizeText(
  text: string,
  matches: PIIMatch[],
  mode: RedactionMode,
  externalVault?: PseudonymVault
): SanitizationResult {
  const vault = externalVault || new PseudonymVault();
  const replacements: SanitizedReplacement[] = [];

  if (!text || matches.length === 0) {
    return {
      sanitizedText: text || '',
      replacements: [],
      vault,
      mode,
    };
  }

  // Sort matches by start ascending to build string sequentially
  const sorted = [...matches].sort((a, b) => a.start - b.start);

  let result = '';
  let lastIndex = 0;

  for (const m of sorted) {
    // Append leading plain text
    result += text.slice(lastIndex, m.start);

    let replacement = '';
    if (mode === 'FULL') {
      replacement = '[REDACTED]';
    } else if (mode === 'PARTIAL') {
      replacement = applyPartialMask(m.text, m.category);
    } else if (mode === 'PSEUDONYM') {
      replacement = vault.getOrCreateToken(m.text, m.category);
    }

    replacements.push({
      original: m.text,
      replacement,
      category: m.category,
      start: m.start,
      end: m.end,
    });

    result += replacement;
    lastIndex = m.end;
  }

  // Append remaining trailing text
  result += text.slice(lastIndex);

  return {
    sanitizedText: result,
    replacements,
    vault,
    mode,
  };
}
