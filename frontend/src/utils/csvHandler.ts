import Papa from 'papaparse';
import { scanTextForPII } from './piiEngine';
import { PseudonymVault, RedactionMode, sanitizeText } from './sanitizer';

export interface CSVSanitizationResult {
  sanitizedCsv: string;
  vault: PseudonymVault;
  totalCellsModified: number;
}

/**
 * Check if the text or filename represents CSV content
 */
export function isCSVContent(text: string, filename?: string | null): boolean {
  if (filename && filename.toLowerCase().endsWith('.csv')) {
    return true;
  }
  if (!text) return false;
  // Inspect first line for typical CSV structure
  const firstLine = text.trim().split('\n')[0];
  return firstLine.includes(',') && firstLine.split(',').length >= 2;
}

/**
 * Structure-Preserving CSV Sanitization
 * - Preserves row 0 (headers) intact
 * - Scans and sanitizes rows 1..N using a single shared session pseudonym Map
 * - Re-serializes with Papa.unparse() to preserve RFC-4180 quotes, commas, and line breaks
 */
export function sanitizeCSV(
  rawCsv: string,
  mode: RedactionMode,
  externalVault?: PseudonymVault
): CSVSanitizationResult {
  const vault = externalVault || new PseudonymVault();

  if (!rawCsv || rawCsv.trim().length === 0) {
    return { sanitizedCsv: '', vault, totalCellsModified: 0 };
  }

  const parsed = Papa.parse<string[]>(rawCsv, {
    skipEmptyLines: false,
  });

  const rows = parsed.data;
  if (!rows || rows.length <= 1) {
    return { sanitizedCsv: rawCsv, vault, totalCellsModified: 0 };
  }

  let totalCellsModified = 0;

  // Row 0 is headers: PRESERVED INTACT
  // Iterate data rows starting from index 1
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const cellValue = row[c];
      if (typeof cellValue === 'string' && cellValue.trim().length > 0) {
        const scanRes = scanTextForPII(cellValue);
        if (scanRes.matches.length > 0) {
          const sanRes = sanitizeText(cellValue, scanRes.matches, mode, vault);
          if (sanRes.sanitizedText !== cellValue) {
            row[c] = sanRes.sanitizedText;
            totalCellsModified++;
          }
        }
      }
    }
  }

  // Re-serialize with Papa.unparse() conforming strictly to RFC-4180
  const sanitizedCsv = Papa.unparse(rows);

  return {
    sanitizedCsv,
    vault,
    totalCellsModified,
  };
}

/**
 * 1-Click File Download via browser Blob API
 * Guarantees zero disk writes prior to user-initiated download
 */
export function downloadSanitizedFile(
  content: string,
  originalFilename?: string | null,
  isCsv: boolean = false
): void {
  const baseName = originalFilename
    ? originalFilename.replace(/\.[^/.]+$/, '')
    : 'document';
  const extension = isCsv ? 'csv' : 'txt';
  const finalFilename = `sanitized_${baseName}.${extension}`;
  const mimeType = isCsv ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', finalFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
