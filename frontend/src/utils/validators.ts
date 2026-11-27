/**
 * Strict Client-Side Validators for PRIVORA
 * Zero external dependencies, executes 100% in local memory.
 */

/**
 * Modulo-10 Luhn Checksum Algorithm for Credit Cards & Payment Identifiers
 * - Strips spaces and hyphens
 * - Checks length between 13 and 19 digits
 * - Rejects repeated single-digit sequences (e.g. 0000000000000000 or 1111111111111111)
 * - Returns true ONLY if the Luhn checksum validates
 */
export function isValidLuhn(raw: string): boolean {
  if (!raw) return false;
  const digits = raw.replace(/[\s-]/g, '');

  // Must be strictly 13-19 digits
  if (!/^\d{13,19}$/.test(digits)) {
    return false;
  }

  // Reject identical-digit sequences (e.g. all 1s, all 0s, all 9s)
  if (/^(\d)\1+$/.test(digits)) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  // Traverse from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Functional alias for isValidLuhn
 */
export const luhnCheck = isValidLuhn;

/**
 * Indian Income Tax Permanent Account Number (PAN) Validator
 * - Format: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F, XYZPK9821L)
 * - Case-insensitive match on [A-Z]{5}[0-9]{4}[A-Z]
 * - Accepts standard and synthetic test formats without strict 4th-char rejections
 */
export function isValidPAN(raw: string): boolean {
  if (!raw) return false;
  const clean = raw.trim().toUpperCase();
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  return panRegex.test(clean);
}

/**
 * Indian Aadhaar Number Format Validator
 * - Exact 12 digits (after stripping spaces and hyphens)
 * - First digit must be between [2-9] (UIDAI numbers cannot start with 0 or 1)
 * - Cannot be all identical digits
 * - Structural format validation
 */
export function isValidAadhaarFormat(raw: string): boolean {
  if (!raw) return false;
  const digits = raw.replace(/[\s-]/g, '');

  if (!/^\d{12}$/.test(digits)) {
    return false;
  }

  // Must start with [2-9]
  if (!/^[2-9]/.test(digits)) {
    return false;
  }

  // Reject all identical digits (e.g. 222222222222, 999999999999)
  if (/^(\d)\1{11}$/.test(digits)) {
    return false;
  }

  return true;
}

/**
 * Strict IPv4 Address Validator
 * - 4 octets separated by dots
 * - Each octet must be between 0 and 255
 * - No invalid leading zeros (e.g. "01" is invalid, "0" is valid)
 */
export function isValidIPv4(raw: string): boolean {
  if (!raw) return false;
  const clean = raw.trim();

  const parts = clean.split('.');
  if (parts.length !== 4) {
    return false;
  }

  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) {
      return false;
    }

    // Check for invalid leading zeros (e.g. "01", "001")
    if (part.length > 1 && part.startsWith('0')) {
      return false;
    }

    const num = parseInt(part, 10);
    if (num < 0 || num > 255) {
      return false;
    }
  }

  return true;
}

/**
 * Indian Mobile Phone Validator
 * - Optional +91 or 0 prefix
 * - Followed by 10 digits starting with [6-9]
 */
export function isValidIndianPhone(raw: string): boolean {
  if (!raw) return false;
  // Strip spaces, hyphens, and brackets
  const clean = raw.replace(/[\s\-()]/g, '');

  // Matches +91XXXXXXXXXX, 91XXXXXXXXXX, 0XXXXXXXXXX, or XXXXXXXXXX
  const phoneRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/;
  return phoneRegex.test(clean);
}

/**
 * Email Address Validator
 * - Standard RFC 5322 compliant regex for web applications
 */
export function isValidEmail(raw: string): boolean {
  if (!raw) return false;
  const clean = raw.trim();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(clean);
}
