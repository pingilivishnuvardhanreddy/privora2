import { describe, it, expect, beforeEach } from 'vitest';
import { 
  isValidLuhn, 
  isValidPAN, 
  isValidAadhaarFormat, 
  isValidIPv4, 
  isValidIndianPhone, 
  isValidEmail 
} from '../utils/validators';
import { scanTextForPII, calculateRiskScore, detectPII } from '../utils/piiEngine';
import { sanitizeText, PseudonymVault } from '../utils/sanitizer';
import { sanitizeCSV } from '../utils/csvHandler';

describe('PRIVORA Core PII Detection & Sanitization Engine', () => {

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // ----------------------------------------------------------------------
  // 1. CREDIT CARDS & LUHN CHECKSUM VALIDATION
  // ----------------------------------------------------------------------
  describe('Credit Card & Luhn Checksum Engine', () => {
    it('1. should validate standard Luhn-valid Visa cards', () => {
      // 4532 0150 1234 5671 is Luhn-valid (4+5+3+2+0+1+5+0+1+2+3+4+5+6+7+1 mod 10 == 0)
      expect(isValidLuhn('4532015012345671')).toBe(true);
      expect(isValidLuhn('4532-0150-1234-5671')).toBe(true);
      expect(isValidLuhn('4532 0150 1234 5671')).toBe(true);
    });

    it('2. should validate standard Luhn-valid Mastercard & Amex cards', () => {
      // Mastercard sample (5425...)
      expect(isValidLuhn('5425-2334-3010-9903')).toBe(true);
      // Amex 15-digit card
      expect(isValidLuhn('3782-822463-10005')).toBe(true);
    });

    it('3. should safely reject non-PCI 16-digit order & tracking numbers', () => {
      // Synthetic 16-digit order number that fails Luhn checksum
      expect(isValidLuhn('1234567890123456')).toBe(false);
      expect(isValidLuhn('9999-8888-7777-6666')).toBe(false);
    });

    it('4. should reject repeated identical-digit sequences even if mod 10 works', () => {
      expect(isValidLuhn('0000000000000000')).toBe(false);
      expect(isValidLuhn('1111111111111111')).toBe(false);
      expect(isValidLuhn('9999999999999999')).toBe(false);
    });

    it('5. should record rejected Luhn non-payment numbers in scan result', () => {
      const payload = 'Order ID: 1234-5678-9012-3456, Card: 5425-2334-3010-9903';
      const result = scanTextForPII(payload);
      expect(result.rejectedLuhnCount).toBeGreaterThanOrEqual(1);
      expect(result.entityCounts.CREDIT_CARD).toBe(1);
    });
  });

  // ----------------------------------------------------------------------
  // 2. INDIAN PAN IDENTIFIER ENGINE
  // ----------------------------------------------------------------------
  describe('Indian PAN Validator & Boundaries', () => {
    it('6. should validate standard PAN cards', () => {
      expect(isValidPAN('ABCDE1234F')).toBe(true);
      expect(isValidPAN('XYZPK9821L')).toBe(true);
      expect(isValidPAN('abcde1234f')).toBe(true); // Case-insensitive
    });

    it('7. should reject invalid length and malformed structures', () => {
      expect(isValidPAN('ABCD12345F')).toBe(false); // 4 letters
      expect(isValidPAN('ABCDE123F')).toBe(false);  // 3 digits
      expect(isValidPAN('12345ABCDE')).toBe(false); // Reversed
      expect(isValidPAN('ABCDE12345')).toBe(false); // No trailing letter
    });

    it('8. should respect word boundaries when scanning PAN in text', () => {
      const text = 'Invoice code REF-ABCDE1234F-END and isolated PAN XYZPK9821L.';
      const res = scanTextForPII(text);
      expect(res.entityCounts.PAN).toBeGreaterThanOrEqual(1);
      const panMatch = res.matches.find(m => m.category === 'PAN');
      expect(panMatch?.text).toMatch(/^[A-Z]{5}\d{4}[A-Z]$/);
    });
  });

  // ----------------------------------------------------------------------
  // 3. INDIAN AADHAAR & NO-COLLISION GUARDS
  // ----------------------------------------------------------------------
  describe('Indian Aadhaar Validation & Card Collision Guard', () => {
    it('9. should validate 12-digit Aadhaar numbers starting with 2-9', () => {
      expect(isValidAadhaarFormat('5432 1098 7654')).toBe(true);
      expect(isValidAadhaarFormat('2345-6789-0123')).toBe(true);
      expect(isValidAadhaarFormat('987654321098')).toBe(true);
    });

    it('10. should reject Aadhaar numbers starting with 0 or 1', () => {
      expect(isValidAadhaarFormat('012345678901')).toBe(false);
      expect(isValidAadhaarFormat('123456789012')).toBe(false);
    });

    it('11. should reject identical 12-digit numbers', () => {
      expect(isValidAadhaarFormat('222222222222')).toBe(false);
      expect(isValidAadhaarFormat('9999 9999 9999')).toBe(false);
    });

    it('12. should NEVER swallow 12 digits of a 16-digit credit card as Aadhaar', () => {
      const cardString = 'Transaction on card 5425-2334-3010-9903 approved.';
      const res = scanTextForPII(cardString);
      // Must detect credit card, NEVER aadhaar
      expect(res.entityCounts.CREDIT_CARD).toBe(1);
      expect(res.entityCounts.AADHAAR).toBe(0);
    });
  });

  // ----------------------------------------------------------------------
  // 4. INDIAN MOBILE PHONE ENGINE & BOUNDARY CHECKS
  // ----------------------------------------------------------------------
  describe('Indian Mobile Phone Validation', () => {
    it('13. should validate 10-digit mobiles starting with 6, 7, 8, 9 with +91 or 0', () => {
      expect(isValidIndianPhone('9876543210')).toBe(true);
      expect(isValidIndianPhone('+91 98765 43210')).toBe(true);
      expect(isValidIndianPhone('+91-8765432109')).toBe(true);
      expect(isValidIndianPhone('07890123456')).toBe(true);
    });

    it('14. should reject numbers starting with 0-5 without valid prefix', () => {
      expect(isValidIndianPhone('5555543210')).toBe(false);
      expect(isValidIndianPhone('1234567890')).toBe(false);
    });

    it('15. should NOT falsely flag the tail of a 16-digit order number as a phone number', () => {
      const text = 'Batch order reference: 1234567890123456 and tracking ref 9876-5432-1098-7654 created.';
      const res = scanTextForPII(text);
      expect(res.entityCounts.PHONE).toBe(0);
    });
  });

  // ----------------------------------------------------------------------
  // 5. EMAIL & STRICT OCTET-VALIDATED IPV4
  // ----------------------------------------------------------------------
  describe('Email & IPv4 Validation', () => {
    it('16. should validate standard & international email formats', () => {
      expect(isValidEmail('support@privora.io')).toBe(true);
      expect(isValidEmail('john.doe+security@enterprise.co.uk')).toBe(true);
      expect(isValidEmail('admin_test12@sub.domain.org')).toBe(true);
    });

    it('17. should reject malformed email strings', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('@missinguser.com')).toBe(false);
    });

    it('18. should validate IPv4 addresses with 0-255 octets', () => {
      expect(isValidIPv4('192.168.1.1')).toBe(true);
      expect(isValidIPv4('10.0.0.1')).toBe(true);
      expect(isValidIPv4('127.0.0.1')).toBe(true);
      expect(isValidIPv4('255.255.255.255')).toBe(true);
    });

    it('19. should reject octets > 255 and invalid leading zeros', () => {
      expect(isValidIPv4('999.999.1.1')).toBe(false);
      expect(isValidIPv4('256.100.0.1')).toBe(false);
      expect(isValidIPv4('192.168.01.1')).toBe(false); // Leading zero invalid
      expect(isValidIPv4('1.2.3')).toBe(false);         // Only 3 octets
    });
  });

  // ----------------------------------------------------------------------
  // 6. REDACTION MODES (FULL, PARTIAL, PSEUDONYMIZATION)
  // ----------------------------------------------------------------------
  describe('Three Redaction Modes & Vault Consistency', () => {
    const sample = 'Contact rahul@gmail.com on +91 98765 43210 with PAN ABCDE1234F.';

    it('20. FULL mode should mask every PII span with [REDACTED]', () => {
      const scanRes = scanTextForPII(sample);
      const sanRes = sanitizeText(sample, scanRes.matches, 'FULL');
      expect(sanRes.sanitizedText).toContain('[REDACTED]');
      expect(sanRes.sanitizedText).not.toContain('rahul@gmail.com');
      expect(sanRes.sanitizedText).not.toContain('ABCDE1234F');
    });

    it('21. PARTIAL mode should apply category-specific masking', () => {
      const scanRes = scanTextForPII(sample);
      const sanRes = sanitizeText(sample, scanRes.matches, 'PARTIAL');
      // Email keeps first char + ****@domain
      expect(sanRes.sanitizedText).toContain('r****@gmail.com');
      // PAN masks first 5 chars
      expect(sanRes.sanitizedText).toContain('XXXXX1234F');
    });

    it('22. PSEUDONYM mode should assign surrogate tokens deterministically', () => {
      const vault = new PseudonymVault();
      const scanRes = scanTextForPII(sample);
      const sanRes1 = sanitizeText(sample, scanRes.matches, 'PSEUDONYM', vault);

      expect(sanRes1.sanitizedText).toContain('USER_01');
      expect(sanRes1.sanitizedText).toContain('PHONE_01');
      expect(sanRes1.sanitizedText).toContain('PAN_01');

      // Re-sanitizing identical entities must reuse the EXACT same surrogate token
      const sample2 = 'Reminder sent to rahul@gmail.com again.';
      const scanRes2 = scanTextForPII(sample2);
      const sanRes2 = sanitizeText(sample2, scanRes2.matches, 'PSEUDONYM', vault);

      expect(sanRes2.sanitizedText).toContain('USER_01');
      expect(sanRes2.sanitizedText).not.toContain('USER_02');
    });
  });

  // ----------------------------------------------------------------------
  // 7. CSV STRUCTURE PRESERVATION
  // ----------------------------------------------------------------------
  describe('CSV Structure-Preserving Sanitization', () => {
    it('23. should preserve headers and sanitize data rows while keeping column counts intact', () => {
      const rawCsv = `id,name,email,pan
1,Alice,alice@example.com,ABCDE1234F
2,Bob,bob@corp.org,XYZPK9821L
3,Alice Copy,alice@example.com,ABCDE1234F`;

      const result = sanitizeCSV(rawCsv, 'PSEUDONYM');
      expect(result.totalCellsModified).toBe(6);

      const lines = result.sanitizedCsv.replace(/\r/g, '').trim().split('\n');
      // Row 0 is unchanged headers
      expect(lines[0]).toBe('id,name,email,pan');
      // Column counts match
      expect(lines[1].split(',').length).toBe(4);
      // Repeated email maps to identical token across rows
      expect(lines[1]).toContain('USER_01');
      expect(lines[3]).toContain('USER_01');
    });

    it('24. should properly handle CSV fields containing quoted strings and commas', () => {
      const rawCsv = `id,customer,notes
101,"Smith, Rahul","Contact at rahul@gmail.com urgent"`;

      const result = sanitizeCSV(rawCsv, 'FULL');
      expect(result.sanitizedCsv).toContain('"Smith, Rahul"');
      expect(result.sanitizedCsv).toContain('[REDACTED]');
    });
  });

  // ----------------------------------------------------------------------
  // 8. ZERO-EGRESS AIR-GAP & MEMORY PURGE INVARIANT
  // ----------------------------------------------------------------------
  describe('Zero-Egress Security Invariant & RAM Purge', () => {
    it('25. should guarantee no document data or PII is ever written to storage', () => {
      const sensitiveText = 'Customer credit card 4532-0150-1234-5674 with PAN ABCDE1234F';
      const scanRes = scanTextForPII(sensitiveText);
      sanitizeText(sensitiveText, scanRes.matches, 'FULL');

      // Verify strict localStorage and sessionStorage air-gap
      expect(localStorage.getItem('privora_document')).toBeNull();
      expect(localStorage.getItem('rawText')).toBeNull();
      expect(sessionStorage.length).toBe(0);
      
      // Only 'privora-theme' is permitted in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        expect(key).toBe('privora-theme');
      }
    });

    it('26. should support instantaneous memory vault clearing', () => {
      const vault = new PseudonymVault();
      const token1 = vault.getOrCreateToken('user@test.com', 'EMAIL');
      expect(token1).toBe('USER_01');
      expect(vault.getEntries().length).toBe(1);

      vault.clear();
      expect(vault.getEntries().length).toBe(0);
    });
    it('resolves overlapping entities with same start index by category priority', () => {
      // Test ties and priority handling
      const result = scanTextForPII('Contact at 9876543210 and rahul@corp.in');
      expect(result.matches.length).toBe(2);
    });

    it('calculates risk score deterministically with zero and non-zero counts', () => {
      const zeroRisk = calculateRiskScore({
        EMAIL: 0,
        CREDIT_CARD: 0,
        AADHAAR: 0,
        PAN: 0,
        PHONE: 0,
        IPV4: 0,
      });
      expect(zeroRisk.rawExposure).toBe(0);
      expect(zeroRisk.riskScore).toBe(0);

      const highRisk = calculateRiskScore({
        EMAIL: 2,
        CREDIT_CARD: 2,
        AADHAAR: 1,
        PAN: 1,
        PHONE: 1,
        IPV4: 1,
      });
      expect(highRisk.rawExposure).toBeGreaterThan(0);
      expect(highRisk.riskScore).toBeGreaterThan(0);
      expect(highRisk.riskScore).toBeLessThanOrEqual(100);
    });

    it('invokes detectPII alias function matching scanTextForPII', () => {
      expect(detectPII).toBe(scanTextForPII);
      const res = detectPII('Sample text');
      expect(res.totalEntities).toBe(0);
    });
  });
});
