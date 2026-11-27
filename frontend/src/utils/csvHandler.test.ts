import { describe, it, expect, vi } from 'vitest';
import { isCSVContent, sanitizeCSV, downloadSanitizedFile } from './csvHandler';

describe('CSV Handler Edge Cases & Sanitization', () => {
  it('correctly detects CSV vs plain text', () => {
    expect(isCSVContent('name,email,role\nAlice,alice@example.com,Admin')).toBe(true);
    expect(isCSVContent('name,email\n', 'data.csv')).toBe(true);
    expect(isCSVContent('just a single plain text line with no commas or headers')).toBe(false);
    expect(isCSVContent('')).toBe(false);
  });

  it('handles empty CSV input cleanly', () => {
    const res = sanitizeCSV('', 'FULL');
    expect(res.totalCellsModified).toBe(0);
    expect(res.sanitizedCsv).toBe('');
  });

  it('handles single row CSV without error (preserves headers)', () => {
    const singleRow = 'col1,col2,col3';
    const res = sanitizeCSV(singleRow, 'FULL');
    expect(res.sanitizedCsv).toBe(singleRow);
    expect(res.totalCellsModified).toBe(0);
  });

  it('preserves header row intact and sanitizes PII in data rows', () => {
    const csvData = 'id,name,email\n1,Alice,alice@example.com\n2,Bob,bob@corp.in';
    const fullRes = sanitizeCSV(csvData, 'FULL');
    expect(fullRes.totalCellsModified).toBe(2);
    expect(fullRes.sanitizedCsv).toContain('[REDACTED]');
    // Header remains unchanged
    expect(fullRes.sanitizedCsv.split('\n')[0].replace(/\r/g, '')).toBe('id,name,email');
  });

  it('handles CSV download trigger safely in browser environment', () => {
    const mockAnchor = document.createElement('a');
    const clickSpy = vi.spyOn(mockAnchor, 'click').mockImplementation(() => {});
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => 'blob:mock-url');

    downloadSanitizedFile('col1,col2\nval1,val2', 'test.csv', true);
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(clickSpy).toHaveBeenCalled();

    createElementSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
    createObjectURLSpy.mockRestore();
  });
});
