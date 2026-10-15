import { describe, it, expect } from 'vitest';
import { runQAInspectionOnDataset } from '../utils/qaEngine';
import { calculateGoldStandardMetrics } from '../utils/metrics';
import { parseCSVString } from '../utils/storage';
import { TextRecord, ImageRecord } from '../types';

describe('Dataset Parsing and Validation', () => {
  it('parses valid CSV string into structured rows and headers', () => {
    const csv = `id,text,domain\nTX-1,"Hello world, this is a test.",Tech\nTX-2,"Second record content.",Edu`;
    const result = parseCSVString(csv);

    expect(result.errors).toHaveLength(0);
    expect(result.headers).toEqual(['id', 'text', 'domain']);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].id).toBe('TX-1');
    expect(result.rows[0].text).toBe('Hello world, this is a test.');
  });

  it('detects duplicate record IDs during CSV parsing and flags exact row numbers', () => {
    const csv = `id,text\nTX-1,"First entry"\nTX-1,"Duplicate entry"`;
    const result = parseCSVString(csv);

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].row).toBe(3);
    expect(result.errors[0].message).toContain('Duplicate ID detected');
  });

  it('handles empty CSV gracefully and returns error', () => {
    const result = parseCSVString('');
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('QA Engine Automated Checks', () => {
  it('detects duplicate record IDs across text records', () => {
    const records: TextRecord[] = [
      { id: 'DUP-1', datasetId: 'ds1', text: 'Sample one', status: 'Annotated' },
      { id: 'DUP-1', datasetId: 'ds1', text: 'Sample two duplicate', status: 'Annotated' },
    ];
    const errors = runQAInspectionOnDataset(records, []);
    const dupErrors = errors.filter(e => e.category === 'Duplicate Record ID');
    expect(dupErrors.length).toBe(2);
    expect(dupErrors[0].severity).toBe('Critical');
  });

  it('flags records with missing or empty text payload', () => {
    const records: TextRecord[] = [
      { id: 'EMPTY-1', datasetId: 'ds1', text: '   ', status: 'Needs Review' },
    ];
    const errors = runQAInspectionOnDataset(records, []);
    const emptyErrors = errors.filter(e => e.category === 'Incomplete Fields');
    expect(emptyErrors.length).toBeGreaterThan(0);
  });

  it('flags missing sentiment annotations when marked as Annotated', () => {
    const records: TextRecord[] = [
      { id: 'MISS-1', datasetId: 'ds1', text: 'Valid text sample', status: 'Annotated' },
    ];
    const errors = runQAInspectionOnDataset(records, []);
    const missErrors = errors.filter(e => e.category === 'Missing Annotation');
    expect(missErrors.length).toBeGreaterThan(0);
  });

  it('detects contradictory annotations (marked Positive with grievance vocabulary)', () => {
    const records: TextRecord[] = [
      { 
        id: 'CONTRA-1', 
        datasetId: 'ds1', 
        text: 'The server crashed and memory leak destroyed our database!', 
        sentiment: 'Positive', 
        topic: 'Technology',
        contentReview: 'Irrelevant',
        status: 'Annotated' 
      },
    ];
    const errors = runQAInspectionOnDataset(records, []);
    const contraErrors = errors.filter(e => e.category === 'Contradictory Labels');
    expect(contraErrors.length).toBeGreaterThan(0);
  });

  it('detects conflicting image quality annotations (High Quality + Corrupted flag)', () => {
    const imageRecords: ImageRecord[] = [
      {
        id: 'IMG-BAD-1',
        datasetId: 'ds-img',
        imageUrl: 'https://example.com/test.jpg',
        title: 'Conflicting record',
        category: 'Technology & Devices',
        quality: 'High Quality',
        isCorruptedOrUnclear: true,
        boundingBoxes: [],
        status: 'Needs Review'
      }
    ];
    const errors = runQAInspectionOnDataset([], imageRecords);
    const contra = errors.filter(e => e.category === 'Contradictory Labels');
    expect(contra.length).toBeGreaterThan(0);
  });
});

describe('Gold-Standard Statistical Metrics Calculation', () => {
  it('calculates perfect 100% accuracy and F1 score when predictions match ground truth', () => {
    const records: TextRecord[] = [
      {
        id: 'GOLD-1',
        datasetId: 'ds1',
        text: 'Superb deployment speed.',
        sentiment: 'Positive',
        topic: 'Technology',
        status: 'Approved',
        verifiedReference: { sentiment: 'Positive', topic: 'Technology', contentReview: 'Relevant' }
      },
      {
        id: 'GOLD-2',
        datasetId: 'ds1',
        text: 'Outage occurred.',
        sentiment: 'Negative',
        topic: 'Technology',
        status: 'Approved',
        verifiedReference: { sentiment: 'Negative', topic: 'Technology', contentReview: 'Relevant' }
      }
    ];

    const metrics = calculateGoldStandardMetrics(records);
    expect(metrics).not.toBeNull();
    expect(metrics?.accuracy).toBe(1.0);
    expect(metrics?.macroPrecision).toBe(1.0);
    expect(metrics?.macroRecall).toBe(1.0);
    expect(metrics?.macroF1).toBe(1.0);
  });

  it('correctly calculates confusion matrix when discrepancies exist', () => {
    const records: TextRecord[] = [
      {
        id: 'GOLD-1',
        datasetId: 'ds1',
        text: 'Sample',
        sentiment: 'Positive',
        status: 'Approved',
        verifiedReference: { sentiment: 'Positive', topic: 'Technology', contentReview: 'Relevant' }
      },
      {
        id: 'GOLD-2',
        datasetId: 'ds1',
        text: 'Sample',
        sentiment: 'Neutral', // Prediction
        status: 'Approved',
        verifiedReference: { sentiment: 'Negative', topic: 'Technology', contentReview: 'Relevant' } // Ground truth
      }
    ];

    const metrics = calculateGoldStandardMetrics(records);
    expect(metrics?.accuracy).toBe(0.5);
    expect(metrics?.totalEvaluated).toBe(2);
  });

  it('returns null and does not invent scores if no reference labels exist', () => {
    const records: TextRecord[] = [
      { id: 'NO-GOLD-1', datasetId: 'ds1', text: 'Unverified item', sentiment: 'Positive', status: 'Annotated' }
    ];

    const metrics = calculateGoldStandardMetrics(records);
    expect(metrics).toBeNull();
  });
});
