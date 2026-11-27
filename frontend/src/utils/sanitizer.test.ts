import { describe, it, expect, beforeEach } from 'vitest';
import { 
  sanitizeText, 
  PseudonymVault, 
  applyPartialMask 
} from './sanitizer';
import { scanTextForPII } from './piiEngine';

describe('Sanitizer Unit & Edge-Case Test Suite', () => {
  let vault: PseudonymVault;

  beforeEach(() => {
    vault = new PseudonymVault();
  });

  describe('PseudonymVault Token Generation & Normalization', () => {
    it('normalizes emails case-insensitively and returns identical tokens', () => {
      const t1 = vault.getOrCreateToken('Alice@Domain.Com', 'EMAIL');
      const t2 = vault.getOrCreateToken('alice@domain.com  ', 'EMAIL');
      expect(t1).toBe('USER_01');
      expect(t2).toBe('USER_01');
      expect(vault.getEntries()[0].occurrences).toBe(2);
    });

    it('normalizes credit cards by stripping spaces and hyphens', () => {
      const t1 = vault.getOrCreateToken('5425-2334-3010-9903', 'CREDIT_CARD');
      const t2 = vault.getOrCreateToken('5425 2334 3010 9903', 'CREDIT_CARD');
      expect(t1).toBe('CARD_01');
      expect(t2).toBe('CARD_01');
    });

    it('generates distinct prefixes for all 6 categories', () => {
      expect(vault.getOrCreateToken('test@test.com', 'EMAIL')).toBe('USER_01');
      expect(vault.getOrCreateToken('9876543210', 'PHONE')).toBe('PHONE_01');
      expect(vault.getOrCreateToken('ABCDE1234F', 'PAN')).toBe('PAN_01');
      expect(vault.getOrCreateToken('5432 1098 7654', 'AADHAAR')).toBe('AADHAAR_01');
      expect(vault.getOrCreateToken('5425-2334-3010-9903', 'CREDIT_CARD')).toBe('CARD_01');
      expect(vault.getOrCreateToken('192.168.1.1', 'IPV4')).toBe('IP_01');
    });

    it('clears vault entries properly on reset', () => {
      vault.getOrCreateToken('sample@sample.com', 'EMAIL');
      expect(vault.getEntries().length).toBe(1);
      vault.clear();
      expect(vault.getEntries().length).toBe(0);
    });
  });

  describe('applyPartialMask Category Anchors', () => {
    it('masks emails preserving first char and domain', () => {
      expect(applyPartialMask('rahul@gmail.com', 'EMAIL')).toBe('r****@gmail.com');
      expect(applyPartialMask('a@b.com', 'EMAIL')).toBe('*@b.com');
    });

    it('masks phone numbers keeping only last 4 digits', () => {
      expect(applyPartialMask('9876543210', 'PHONE')).toBe('XXXXXX3210');
      // '+91 98765 43210' has 12 digits, keeping last 4 and masking 8
      expect(applyPartialMask('+91 98765 43210', 'PHONE')).toBe('XXXXXXXX3210');
      // Short phone fallback (< 4 digits)
      expect(applyPartialMask('12', 'PHONE')).toBe('XXXXXX12');
    });

    it('masks PAN keeping last 5 chars and handles short fallback', () => {
      expect(applyPartialMask('ABCDE1234F', 'PAN')).toBe('XXXXX1234F');
      expect(applyPartialMask('123', 'PAN')).toBe('XXXXX123');
    });

    it('masks Aadhaar keeping last 4 digits with spacing and short fallback', () => {
      expect(applyPartialMask('5432 1098 7654', 'AADHAAR')).toBe('XXXX XXXX 7654');
      expect(applyPartialMask('12', 'AADHAAR')).toBe('XXXX XXXX 12');
    });

    it('masks Credit Cards keeping last 4 digits with formatting and short fallback', () => {
      expect(applyPartialMask('5425-2334-3010-9903', 'CREDIT_CARD')).toBe('XXXX-XXXX-XXXX-9903');
      expect(applyPartialMask('12', 'CREDIT_CARD')).toBe('XXXX-XXXX-XXXX-12');
    });

    it('masks IPv4 keeping first 2 octets and handles malformed fallback', () => {
      expect(applyPartialMask('192.168.1.50', 'IPV4')).toBe('192.168.xxx.xxx');
      expect(applyPartialMask('192.168', 'IPV4')).toBe('xxx.xxx.xxx.xxx');
    });

    it('masks email invalid format fallback', () => {
      expect(applyPartialMask('invalid_email', 'EMAIL')).toBe('[REDACTED_EMAIL]');
    });
  });

  describe('sanitizeText Edge Cases', () => {
    it('returns empty string when given empty input', () => {
      const res = sanitizeText('', [], 'FULL');
      expect(res.sanitizedText).toBe('');
      expect(res.replacements.length).toBe(0);
    });

    it('returns unmodified string when there are zero matches', () => {
      const clean = 'This is a clean security incident log with zero PII tokens.';
      const res = sanitizeText(clean, [], 'PARTIAL');
      expect(res.sanitizedText).toBe(clean);
      expect(res.replacements.length).toBe(0);
    });

    it('preserves surrounding unicode, emojis, and multiline spacing exactly', () => {
      const text = `🔒 Security Alert:
Incident reported by rahul@gmail.com at node 192.168.1.1!
End of report. ✔️`;
      const scanRes = scanTextForPII(text);
      const sanRes = sanitizeText(text, scanRes.matches, 'FULL');
      expect(sanRes.sanitizedText).toContain('🔒 Security Alert:');
      expect(sanRes.sanitizedText).toContain('[REDACTED]');
      expect(sanRes.sanitizedText).toContain('End of report. ✔️');
    });

    it('handles oversized payloads efficiently', () => {
      const baseLine = 'System user test.user@enterprise.org accessed IP 10.0.0.1 on 2026-11-27.\n';
      const largeText = baseLine.repeat(200); // 200 lines
      const scanRes = scanTextForPII(largeText);
      const sanRes = sanitizeText(largeText, scanRes.matches, 'PSEUDONYM', vault);

      expect(sanRes.sanitizedText.length).toBeGreaterThan(0);
      expect(sanRes.replacements.length).toBe(400); // 2 entities * 200 lines
    });
  });
});
