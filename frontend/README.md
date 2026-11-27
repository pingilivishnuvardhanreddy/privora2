# PRIVORA — Detect. Audit. Sanitize. Protect.

Next-Gen 3D Enterprise Client-Side Privacy Defense & Sensitive Data Sanitization Platform.

---

## Architecture Overview: 100% Client-Side Zero-Egress

PRIVORA is engineered with a strict **Zero-Egress Security Invariant**:
- **Air-Gapped V8 Sandbox:** All PII detection, regex analysis, Luhn validation, and file parsing occur 100% inside local browser heap memory.
- **Zero Inbound/Outbound Leakage:** No server payload transmission, telemetry tracking, or external API roundtrips containing document content.
- **Ephemeral Storage Policy:** Strictly **zero** document records or PII values are persisted to `localStorage` or `sessionStorage`. Only the UI theme toggle (`'privora-theme'`) is retained. Closing or reloading the browser tab immediately purges volatile memory.

---

## Core Detection & Sanitization Capabilities

### 1. 6-Category PII Detection Engine
- **Credit Cards & Payment Accounts:** Validates 13–19 digit card numbers using the Modulo-10 Luhn checksum algorithm. Automatically differentiates PCI card numbers from non-payment 16-digit order/tracking numbers to eliminate false positives.
- **Indian UIDAI Aadhaar:** Detects 12-digit Aadhaar formats starting with `[2-9]`, enforcing strict regex lookahead/lookbehind boundaries `(?<![\d-])` to avoid partial overlap with 16-digit payment cards.
- **Indian Income Tax PAN:** Validates standard 10-character alphanumeric PAN cards (`[A-Z]{5}[0-9]{4}[A-Z]`) across standard and synthetic formats.
- **RFC 5322 Email:** High-performance detection of personal and corporate email addresses.
- **Indian Mobile Telephony:** Identifies numbers prefixed with `+91`, `91`, or `0`, followed by 10 digits starting with `6`, `7`, `8`, or `9`.
- **IPv4 Network Hosts:** Validates 4-octet dot-separated addresses within the `0-255` range while rejecting invalid leading zeros or out-of-bounds octets.

### 2. Three Deterministic Redaction Modes
- **FULL MASK:** Replaces every identified PII entity with `[REDACTED]`.
- **PARTIAL MASK:** Preserves contextual anchors while obfuscating sensitive segments (e.g. `r****@gmail.com`, `XXXXX1234F`, `XXXX-XXXX-XXXX-5674`, `XXXX XXXX 7654`).
- **CONSISTENT PSEUDONYMIZATION:** Uses an in-memory `PseudonymVault` that deterministically maps identical raw identifiers across documents or CSV rows to the exact same surrogate token (e.g. `USER_01`, `CARD_01`, `PAN_01`).

### 3. Structure-Preserving CSV Engine
- Powered by `PapaParse`.
- Preserves Row 0 (headers), column counts, commas, and quoted fields intact while sanitizing sensitive cell values.

---

## WCAG 2.1 AA Accessibility Standards

PRIVORA is built to satisfy WCAG 2.1 AA accessibility guidelines:
- **Skip to Main Content Link:** Visually hidden until keyboard focus is received.
- **Semantic HTML Landmarks:** Proper `<header role="banner">`, `<main id="main-content" role="main">`, and `<nav aria-label="Primary Workspace Navigation" role="tablist">`.
- **Full Keyboard Navigation:** Tab navigation follows `role="tab"` / `aria-selected` / `aria-controls` standards; file dropzones support Enter and Space key activation (`role="button"`, `tabIndex={0}`).
- **Screen Reader Announcements:** Dynamic scan statistics and diff results update politely with `aria-live="polite"`.
- **High-Contrast Indicators:** All text and background pairings meet or exceed a 4.5:1 contrast ratio across both Dark (`#060811`) and Light (`#F5F7FF`) modes, paired with visible focus rings (`focus-visible:ring-2 focus-visible:ring-cyan-400`).

---

## Automated Test Suite

The test suite runs on **Vitest** and **React Testing Library** with a simulated JSDOM environment.

### Run Unit & Integration Tests
```bash
npm test
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

### Production Build Verification
```bash
npm run build
```

---

## Test Suite Coverage Summary

- `src/__tests__/piiEngine.test.ts`: 26 unit tests covering Luhn valid/invalid numbers, PAN formats, Aadhaar boundary safety, Indian phone numbers, Email, IPv4 octet checks, Full/Partial/Pseudonym sanitization, CSV structure preservation, and zero-egress storage validation.
- `src/__tests__/App.test.tsx`: End-to-end integration tests covering initial load, tab switching across all 6 views (`Dashboard`, `Scanner`, `Audit`, `Sanitize`, `Logs`, `Settings`), Dark/Light mode persistence, sample CSV/TXT loading, and RAM purge execution.
