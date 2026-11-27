import { describe, it, expect } from 'vitest';
import { 
  isValidLuhn, 
  luhnCheck, 
  isValidPAN, 
  isValidAadhaarFormat, 
  isValidIPv4, 
  isValidIndianPhone, 
  isValidEmail 
} from './validators';

describe('Validators Unit & Edge-Case Test Suite', () => {
  describe('isValidLuhn & luhnCheck', () => {
    it('handles empty, null, or whitespace strings gracefully', () => {
      expect(isValidLuhn('')).toBe(false);
      expect(isValidLuhn('   ')).toBe(false);
      expect(luhnCheck('')).toBe(false);
    });

    it('rejects numbers too short (< 13 digits) or too long (> 19 digits)', () => {
      expect(isValidLuhn('123456789012')).toBe(false); // 12 digits
      expect(isValidLuhn('12345678901234567890')).toBe(false); // 20 digits
    });

    it('rejects strings with letters or special characters other than space/dash', () => {
      expect(isValidLuhn('4532-0150-1234-567A')).toBe(false);
      expect(isValidLuhn('4532#0150#1234#5671')).toBe(false);
    });

    it('validates 15-digit Amex and 16-digit Visa/Mastercard', () => {
      expect(isValidLuhn('3782-822463-10005')).toBe(true);
      expect(luhnCheck('5425-2334-3010-9903')).toBe(true);
      expect(isValidLuhn('4532 0150 1234 5671')).toBe(true);
    });

    it('rejects unicode digits or non-ascii sequences', () => {
      expect(isValidLuhn('४५३२०१५०१२३४५६७१')).toBe(false);
    });
  });

  describe('isValidPAN', () => {
    it('handles empty or whitespace strings', () => {
      expect(isValidPAN('')).toBe(false);
      expect(isValidPAN('      ')).toBe(false);
    });

    it('validates uppercase and lowercase PAN formats', () => {
      expect(isValidPAN('ABCDE1234F')).toBe(true);
      expect(isValidPAN('abcde1234f')).toBe(true);
      expect(isValidPAN('  XYZPK9821L  ')).toBe(true);
    });

    it('rejects invalid character types or wrong positions', () => {
      expect(isValidPAN('12345ABCDE')).toBe(false);
      expect(isValidPAN('ABCDEF1234')).toBe(false);
      expect(isValidPAN('ABCDE12345')).toBe(false);
      expect(isValidPAN('ABCDE-1234-F')).toBe(false);
    });

    it('rejects oversized and unicode inputs', () => {
      expect(isValidPAN('ABCDE1234FZ')).toBe(false);
      expect(isValidPAN('ABCDE१२३४F')).toBe(false);
    });
  });

  describe('isValidAadhaarFormat', () => {
    it('handles empty or whitespace strings', () => {
      expect(isValidAadhaarFormat('')).toBe(false);
      expect(isValidAadhaarFormat('   ')).toBe(false);
    });

    it('rejects non-12 digit lengths', () => {
      expect(isValidAadhaarFormat('5432 1098 765')).toBe(false); // 11
      expect(isValidAadhaarFormat('5432 1098 76543')).toBe(false); // 13
    });

    it('rejects leading 0 or 1', () => {
      expect(isValidAadhaarFormat('0123 4567 8901')).toBe(false);
      expect(isValidAadhaarFormat('1234 5678 9012')).toBe(false);
    });

    it('rejects repetitive 12 digits', () => {
      expect(isValidAadhaarFormat('333333333333')).toBe(false);
      expect(isValidAadhaarFormat('7777 7777 7777')).toBe(false);
    });

    it('validates standard formats with spaces, hyphens, and continuous digits', () => {
      expect(isValidAadhaarFormat('5432 1098 7654')).toBe(true);
      expect(isValidAadhaarFormat('2345-6789-0123')).toBe(true);
      expect(isValidAadhaarFormat('987654321098')).toBe(true);
    });
  });

  describe('isValidIPv4', () => {
    it('handles empty or whitespace strings', () => {
      expect(isValidIPv4('')).toBe(false);
      expect(isValidIPv4('   ')).toBe(false);
    });

    it('validates boundary octets 0 and 255', () => {
      expect(isValidIPv4('0.0.0.0')).toBe(true);
      expect(isValidIPv4('255.255.255.255')).toBe(true);
      expect(isValidIPv4('127.0.0.1')).toBe(true);
      expect(isValidIPv4('192.168.1.1')).toBe(true);
    });

    it('rejects octets > 255 or negative octets', () => {
      expect(isValidIPv4('256.0.0.1')).toBe(false);
      expect(isValidIPv4('192.168.1.300')).toBe(false);
      expect(isValidIPv4('192.168.1.-1')).toBe(false);
    });

    it('rejects invalid octet count', () => {
      expect(isValidIPv4('192.168.1')).toBe(false);
      expect(isValidIPv4('192.168.1.1.1')).toBe(false);
    });

    it('rejects invalid leading zeros (e.g. 01, 001)', () => {
      expect(isValidIPv4('192.168.01.1')).toBe(false);
      expect(isValidIPv4('010.0.0.1')).toBe(false);
    });
  });

  describe('isValidIndianPhone', () => {
    it('handles empty or whitespace strings', () => {
      expect(isValidIndianPhone('')).toBe(false);
      expect(isValidIndianPhone('   ')).toBe(false);
    });

    it('validates 10-digit mobiles starting with 6, 7, 8, 9', () => {
      expect(isValidIndianPhone('9876543210')).toBe(true);
      expect(isValidIndianPhone('8765432109')).toBe(true);
      expect(isValidIndianPhone('7654321098')).toBe(true);
      expect(isValidIndianPhone('6543210987')).toBe(true);
    });

    it('validates with prefixes +91, 91, 0, spaces, and hyphens', () => {
      expect(isValidIndianPhone('+91 98765 43210')).toBe(true);
      expect(isValidIndianPhone('+91-98765-43210')).toBe(true);
      expect(isValidIndianPhone('919876543210')).toBe(true);
      expect(isValidIndianPhone('09876543210')).toBe(true);
    });

    it('rejects starting digit < 6', () => {
      expect(isValidIndianPhone('5876543210')).toBe(false);
      expect(isValidIndianPhone('1876543210')).toBe(false);
    });

    it('rejects incorrect lengths', () => {
      expect(isValidIndianPhone('987654321')).toBe(false); // 9
      expect(isValidIndianPhone('98765432101')).toBe(false); // 11
    });
  });

  describe('isValidEmail', () => {
    it('handles empty or whitespace strings', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('   ')).toBe(false);
    });

    it('validates standard, subdomain, and plus-addressed emails', () => {
      expect(isValidEmail('admin@privora.io')).toBe(true);
      expect(isValidEmail('user.name+tag@sub.domain.co.in')).toBe(true);
      expect(isValidEmail('customer_123@enterprise.org')).toBe(true);
    });

    it('rejects missing @ or missing domain or spaces', () => {
      expect(isValidEmail('plainaddress')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user @domain.com')).toBe(false);
    });
  });
});
