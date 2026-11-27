import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { scanTextForPII, EngineResult, PIICategory } from '../utils/piiEngine';

export interface ActivityEvent {
  id: string;
  type: 'FILE_LOADED' | 'SCAN_COMPLETED' | 'MODE_CHANGED' | 'EXPORT_DOWNLOADED' | 'MEMORY_CLEARED';
  title: string;
  description: string;
  timestamp: string;
  entityCount?: number;
}

interface ScanContextType {
  rawText: string;
  fileName: string | null;
  scanResult: EngineResult;
  filesScannedCount: number;
  enabledCategories: Record<PIICategory, boolean>;
  activityEvents: ActivityEvent[];
  setDocumentText: (text: string, fileName?: string) => void;
  toggleCategory: (category: PIICategory) => void;
  logActivityEvent: (type: ActivityEvent['type'], title: string, description: string, entityCount?: number) => void;
  purgeSessionMemory: () => void;
  clearDocument: () => void;
}

const DEFAULT_CATEGORIES: Record<PIICategory, boolean> = {
  EMAIL: true,
  CREDIT_CARD: true,
  AADHAAR: true,
  PAN: true,
  PHONE: true,
  IPV4: true,
};

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export const ScanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rawText, setRawTextState] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [filesScannedCount, setFilesScannedCount] = useState<number>(0);
  const [enabledCategories, setEnabledCategories] = useState<Record<PIICategory, boolean>>(DEFAULT_CATEGORIES);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([
    {
      id: 'init_evt_1',
      type: 'SCAN_COMPLETED',
      title: 'V8 Regex Core Initialized',
      description: 'Air-gapped client regex engines loaded in memory with 6 active PII categories.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      entityCount: 0,
    }
  ]);

  const logActivityEvent = useCallback((
    type: ActivityEvent['type'],
    title: string,
    description: string,
    entityCount?: number
  ) => {
    const newEvent: ActivityEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      title,
      description,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      entityCount,
    };
    setActivityEvents((prev) => [newEvent, ...prev]);
  }, []);

  // Compute scan result in volatile memory
  const scanResult = useMemo(() => {
    return scanTextForPII(rawText, { enabledCategories });
  }, [rawText, enabledCategories]);

  const setDocumentText = (text: string, name?: string) => {
    setRawTextState(text);
    const assignedName = name || fileName || 'direct_input_buffer.txt';
    setFileName(assignedName);
    setFilesScannedCount((prev) => prev + 1);

    const quickScan = scanTextForPII(text, { enabledCategories });

    logActivityEvent(
      'FILE_LOADED',
      name ? `Payload Loaded (${name})` : 'Buffer Updated',
      `Parsed ${text.length} chars, matched ${quickScan.totalEntities} PII entities in ${quickScan.executionTimeMs}ms.`,
      quickScan.totalEntities
    );
  };

  const toggleCategory = (category: PIICategory) => {
    setEnabledCategories((prev) => {
      const updated = { ...prev, [category]: !prev[category] };
      logActivityEvent(
        'SCAN_COMPLETED',
        `Detector ${category} ${updated[category] ? 'Enabled' : 'Disabled'}`,
        `Re-evaluating active memory buffer under updated rule policies.`
      );
      return updated;
    });
  };

  const clearDocument = () => {
    setRawTextState('');
    setFileName(null);
    logActivityEvent(
      'MEMORY_CLEARED',
      'Document Buffer Cleared',
      'Input editor and preview wells reset to empty.'
    );
  };

  const purgeSessionMemory = () => {
    setRawTextState('');
    setFileName(null);
    setFilesScannedCount(0);
    setEnabledCategories(DEFAULT_CATEGORIES);
    setActivityEvents([
      {
        id: `purge_${Date.now()}`,
        type: 'MEMORY_CLEARED',
        title: 'Session Memory Purged',
        description: 'All documents, detections, and surrogate pseudonym maps permanently wiped from browser RAM.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        entityCount: 0,
      }
    ]);
  };

  return (
    <ScanContext.Provider
      value={{
        rawText,
        fileName,
        scanResult,
        filesScannedCount,
        enabledCategories,
        activityEvents,
        setDocumentText,
        toggleCategory,
        logActivityEvent,
        purgeSessionMemory,
        clearDocument,
      }}
    >
      {children}
    </ScanContext.Provider>
  );
};

export const useScan = (): ScanContextType => {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
};
