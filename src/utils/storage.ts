import { Dataset, TextRecord, ImageRecord, AuditLogEntry, SentimentLabel, TopicLabel, ContentReviewLabel, QAErrorItem } from '../types';
import { INITIAL_DATASETS, SAMPLE_TEXT_RECORDS, SAMPLE_IMAGE_RECORDS } from '../data/sampleDatasets';

const STORAGE_KEY_DATASETS = 'labelcraft_datasets_v1';
const STORAGE_KEY_TEXT = 'labelcraft_text_records_v1';
const STORAGE_KEY_IMAGE = 'labelcraft_image_records_v1';
const STORAGE_KEY_AUDIT = 'labelcraft_audit_logs_v1';

export function getStoredDatasets(): Dataset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DATASETS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load datasets from storage:', e);
  }
  return INITIAL_DATASETS;
}

export function saveDatasets(datasets: Dataset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DATASETS, JSON.stringify(datasets));
  } catch (e) {
    console.error('Failed to save datasets:', e);
  }
}

export function getStoredTextRecords(): TextRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEXT);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load text records from storage:', e);
  }
  return SAMPLE_TEXT_RECORDS;
}

export function saveTextRecords(records: TextRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TEXT, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save text records:', e);
  }
}

export function getStoredImageRecords(): ImageRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_IMAGE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load image records from storage:', e);
  }
  return SAMPLE_IMAGE_RECORDS;
}

export function saveImageRecords(records: ImageRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_IMAGE, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save image records:', e);
  }
}

export function getStoredAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load audit logs:', e);
  }
  // Default initial audit entries
  return [
    {
      id: 'log-001',
      recordId: 'TX-001',
      datasetId: 'ds-text-codefeast-100',
      action: 'QA Approved',
      operator: 'qa_auditor_lead',
      previousValue: 'Status: Annotated',
      newValue: 'Status: Approved',
      notes: 'Verified compliance with Sentiment & Topic taxonomy guidelines.',
      timestamp: '2026-03-10T10:15:30Z'
    },
    {
      id: 'log-002',
      recordId: 'TX-004',
      datasetId: 'ds-text-codefeast-100',
      action: 'Flagged Ambiguous',
      operator: 'annotator_01',
      previousValue: 'isAmbiguous: false',
      newValue: 'isAmbiguous: true',
      notes: 'Detected ironic sarcasm: marked as negative despite positive literal vocabulary.',
      timestamp: '2026-03-10T10:31:00Z'
    },
    {
      id: 'log-003',
      recordId: 'TX-027',
      datasetId: 'ds-text-codefeast-100',
      action: 'Updated Annotation',
      operator: 'annotator_03',
      previousValue: 'Sentiment: None',
      newValue: 'Sentiment: Positive (Contradictory)',
      notes: 'Initial tag saved.',
      timestamp: '2026-03-10T12:04:00Z'
    }
  ];
}

export function addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
  try {
    const logs = getStoredAuditLogs();
    const newLog: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    // Keep max 500 audit items
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(logs.slice(0, 500)));
  } catch (e) {
    console.error('Failed to record audit log:', e);
  }
}

export function resetAllToSampleData(): void {
  localStorage.setItem(STORAGE_KEY_DATASETS, JSON.stringify(INITIAL_DATASETS));
  localStorage.setItem(STORAGE_KEY_TEXT, JSON.stringify(SAMPLE_TEXT_RECORDS));
  localStorage.setItem(STORAGE_KEY_IMAGE, JSON.stringify(SAMPLE_IMAGE_RECORDS));
  localStorage.removeItem(STORAGE_KEY_AUDIT);
}

// ---------------- CSV & Export Utilities ----------------

export function exportToCSV(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]): void {
  const escapeCell = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = '\uFEFF' + [
    headers.map(escapeCell).join(','),
    ...rows.map(row => row.map(escapeCell).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJSON(filename: string, data: unknown): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface CSVParseResult {
  headers: string[];
  rows: Record<string, string>[];
  errors: { row: number; message: string }[];
}

export function parseCSVString(text: string): CSVParseResult {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  const errors: { row: number; message: string }[] = [];

  if (lines.length === 0) {
    return { headers: [], rows: [], errors: [{ row: 0, message: 'File is completely empty.' }] };
  }

  // Basic CSV line splitter respecting quoted commas
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const rawHeaders = parseLine(lines[0]);
  const headers = rawHeaders.map(h => h.replace(/^["']|["']$/g, '').trim());

  if (headers.length === 0) {
    return { headers: [], rows: [], errors: [{ row: 1, message: 'Header line could not be parsed.' }] };
  }

  const rows: Record<string, string>[] = [];
  const seenIds = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const lineNum = i + 1;
    const values = parseLine(lines[i]);
    
    if (values.length !== headers.length) {
      errors.push({
        row: lineNum,
        message: `Column count mismatch: Expected ${headers.length} columns, found ${values.length}.`
      });
    }

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] !== undefined ? values[idx].replace(/^["']|["']$/g, '') : '';
    });

    const idVal = rowObj['id'] || rowObj['ID'] || rowObj['record_id'];
    if (idVal) {
      if (seenIds.has(idVal)) {
        errors.push({
          row: lineNum,
          message: `Duplicate ID detected: "${idVal}". IDs must be strictly unique.`
        });
      }
      seenIds.add(idVal);
    }

    rows.push(rowObj);
  }

  return { headers, rows, errors };
}
