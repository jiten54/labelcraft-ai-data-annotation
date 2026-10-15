import { TextRecord, ImageRecord, QAErrorItem, SentimentLabel, TopicLabel, ContentReviewLabel, ImageCategoryLabel, ImageQualityLabel } from '../types';

const VALID_SENTIMENTS: SentimentLabel[] = ['Positive', 'Negative', 'Neutral', 'Unclear'];
const VALID_TOPICS: TopicLabel[] = ['Technology', 'Education', 'Healthcare', 'Finance', 'Entertainment', 'Other'];
const VALID_CONTENT_REVIEWS: ContentReviewLabel[] = ['Relevant', 'Irrelevant', 'Needs Review'];

const VALID_IMAGE_CATEGORIES: ImageCategoryLabel[] = [
  'Technology & Devices',
  'Workplace & Office',
  'Healthcare & Medical',
  'Urban & Architecture',
  'Nature & Animals',
  'Other'
];

const VALID_IMAGE_QUALITIES: ImageQualityLabel[] = [
  'High Quality',
  'Acceptable',
  'Blurry / Low Res',
  'Watermarked / Occluded'
];

// Heuristics for detecting suspicious inconsistency
const STRONG_POSITIVE_WORDS = ['outstanding', 'superb', 'best ever', 'game-changing', 'excellent', 'mesmerized', 'delightful'];
const STRONG_NEGATIVE_WORDS = ['crashed', 'horrible', 'unacceptable', 'appalling', 'leak', 'tamper', 'broken', 'freezes', 'glitches'];

export function runQAInspectionOnDataset(
  textRecords: TextRecord[],
  imageRecords: ImageRecord[]
): QAErrorItem[] {
  const errors: QAErrorItem[] = [];
  const textIdCounts = new Map<string, number>();
  const imageIdCounts = new Map<string, number>();

  // Count IDs to detect duplicates
  textRecords.forEach(r => textIdCounts.set(r.id, (textIdCounts.get(r.id) || 0) + 1));
  imageRecords.forEach(r => imageIdCounts.set(r.id, (imageIdCounts.get(r.id) || 0) + 1));

  // --- Inspect Text Records ---
  textRecords.forEach((record, index) => {
    const rowNum = index + 1;

    // 1. Duplicate ID Check
    if ((textIdCounts.get(record.id) || 0) > 1) {
      errors.push({
        id: `qa-dup-${record.id}-${rowNum}`,
        recordId: record.id,
        datasetId: record.datasetId,
        recordType: 'text',
        severity: 'Critical',
        category: 'Duplicate Record ID',
        description: `Duplicate record ID "${record.id}" detected in row #${rowNum}. Primary keys must be unique.`,
        suggestedAction: 'Assign a unique ID (e.g. append a sequence suffix) or deduplicate dataset source.',
        detectedAt: new Date().toISOString()
      });
    }

    // 2. Missing text content
    if (!record.text || record.text.trim().length === 0) {
      errors.push({
        id: `qa-empty-text-${record.id}-${rowNum}`,
        recordId: record.id,
        datasetId: record.datasetId,
        recordType: 'text',
        severity: 'Critical',
        category: 'Incomplete Fields',
        description: `Record "${record.id}" has empty or missing text content payload.`,
        suggestedAction: 'Review original data ingestion pipeline or mark record as Irrelevant / Truncated.',
        detectedAt: new Date().toISOString()
      });
    }

    // 3. Missing Annotations when marked as Annotated or Approved
    if (record.status === 'Annotated' || record.status === 'Approved') {
      if (!record.sentiment) {
        errors.push({
          id: `qa-miss-sent-${record.id}`,
          recordId: record.id,
          datasetId: record.datasetId,
          recordType: 'text',
          severity: 'Critical',
          category: 'Missing Annotation',
          description: `Record "${record.id}" is marked as ${record.status} but sentiment label is missing.`,
          suggestedAction: 'Assign a valid sentiment (Positive, Negative, Neutral, Unclear).',
          detectedAt: new Date().toISOString()
        });
      }
      if (!record.topic) {
        errors.push({
          id: `qa-miss-topic-${record.id}`,
          recordId: record.id,
          datasetId: record.datasetId,
          recordType: 'text',
          severity: 'Warning',
          category: 'Incomplete Fields',
          description: `Record "${record.id}" has sentiment labeled but topic classification is missing.`,
          suggestedAction: 'Assign a primary topic from the guideline taxonomy.',
          detectedAt: new Date().toISOString()
        });
      }
      if (!record.contentReview) {
        errors.push({
          id: `qa-miss-rev-${record.id}`,
          recordId: record.id,
          datasetId: record.datasetId,
          recordType: 'text',
          severity: 'Warning',
          category: 'Incomplete Fields',
          description: `Content review status (Relevant/Irrelevant/Needs Review) is missing.`,
          suggestedAction: 'Specify whether the text is relevant for training.',
          detectedAt: new Date().toISOString()
        });
      }
    }

    // 4. Invalid Labels (checking runtime data corruption)
    if (record.sentiment && !VALID_SENTIMENTS.includes(record.sentiment)) {
      errors.push({
        id: `qa-inv-sent-${record.id}`,
        recordId: record.id,
        datasetId: record.datasetId,
        recordType: 'text',
        severity: 'Critical',
        category: 'Invalid Label',
        description: `Invalid sentiment label "${record.sentiment}" found on record "${record.id}".`,
        suggestedAction: 'Select a valid label conforming to guidelines.',
        detectedAt: new Date().toISOString()
      });
    }
    if (record.topic && !VALID_TOPICS.includes(record.topic)) {
      errors.push({
        id: `qa-inv-topic-${record.id}`,
        recordId: record.id,
        datasetId: record.datasetId,
        recordType: 'text',
        severity: 'Critical',
        category: 'Invalid Label',
        description: `Invalid topic label "${record.topic}" found on record "${record.id}".`,
        suggestedAction: 'Select a valid topic conforming to guidelines.',
        detectedAt: new Date().toISOString()
      });
    }

    // 5. Contradictory Annotations
    if (record.sentiment === 'Positive' && record.contentReview === 'Irrelevant') {
      const lower = record.text.toLowerCase();
      const hasStrongNeg = STRONG_NEGATIVE_WORDS.some(w => lower.includes(w));
      if (hasStrongNeg) {
        errors.push({
          id: `qa-contra-${record.id}`,
          recordId: record.id,
          datasetId: record.datasetId,
          recordType: 'text',
          severity: 'Critical',
          category: 'Contradictory Labels',
          description: `Record "${record.id}" was labeled "Positive" & "Irrelevant", but contains strong grievance vocabulary ("${hasStrongNeg}"). Probable mislabeling.`,
          suggestedAction: 'Re-evaluate tone: verify if sentiment was intended as Negative and content Relevant.',
          detectedAt: new Date().toISOString()
        });
      }
    }

    // 6. Suspicious Sentiment Inconsistency (Heuristic)
    if (record.sentiment === 'Positive') {
      const lower = record.text.toLowerCase();
      const matchNeg = STRONG_NEGATIVE_WORDS.find(w => lower.includes(w));
      if (matchNeg && !record.isAmbiguous && !record.notes?.toLowerCase().includes('sarcasm')) {
        errors.push({
          id: `qa-susp-neg-${record.id}`,
          recordId: record.id,
          datasetId: record.datasetId,
          recordType: 'text',
          severity: 'Warning',
          category: 'Suspicious Sentiment Inconsistency',
          description: `Record "${record.id}" is marked Positive but contains severe negative trigger "${matchNeg}". If this is sarcasm or mixed review, mark Ambiguous and document in notes.`,
          suggestedAction: 'Check for sarcasm or review negative phrasing.',
          detectedAt: new Date().toISOString()
        });
      }
    }

    // 7. Unresolved Review Flags
    if (record.status === 'Needs Review' && (!record.reviewDecision || record.reviewDecision.status === 'Correction Requested')) {
      errors.push({
        id: `qa-unres-rev-${record.id}`,
        recordId: record.id,
        datasetId: record.datasetId,
        recordType: 'text',
        severity: 'Info',
        category: 'Unresolved Review Flag',
        description: `Record "${record.id}" is marked "Needs Review" and is awaiting QA auditor disposition.`,
        suggestedAction: 'Open record in QA Review queue to approve, reject, or correct.',
        detectedAt: new Date().toISOString()
      });
    }
  });

  // --- Inspect Image Records ---
  imageRecords.forEach((record, index) => {
    const rowNum = index + 1;

    // Duplicate check
    if ((imageIdCounts.get(record.id) || 0) > 1) {
      errors.push({
        id: `qa-dup-img-${record.id}-${rowNum}`,
        recordId: record.id,
        datasetId: record.datasetId,
        recordType: 'image',
        severity: 'Critical',
        category: 'Duplicate Record ID',
        description: `Duplicate image record ID "${record.id}" detected in row #${rowNum}.`,
        suggestedAction: 'Ensure distinct unique manifest IDs.',
        detectedAt: new Date().toISOString()
      });
    }

    // Missing URL check
    if (!record.imageUrl || record.imageUrl.trim().length === 0) {
      errors.push({
        id: `qa-empty-url-${record.id}`,
        recordId: record.id,
        datasetId: record.datasetId,
        recordType: 'image',
        severity: 'Critical',
        category: 'Incomplete Fields',
        description: `Image record "${record.id}" has empty or missing image URL manifest link.`,
        suggestedAction: 'Provide valid image path or URL.',
        detectedAt: new Date().toISOString()
      });
    }

    // Contradictory image annotations: Marked High Quality while flagged as Corrupted / Unclear
    if (record.quality === 'High Quality' && record.isCorruptedOrUnclear) {
      errors.push({
        id: `qa-img-contra-${record.id}`,
        recordId: record.id,
        datasetId: record.datasetId,
        recordType: 'image',
        severity: 'Critical',
        category: 'Contradictory Labels',
        description: `Image "${record.id}" is marked "High Quality" but also flagged as "Corrupted / Unclear". These flags conflict.`,
        suggestedAction: 'Adjust quality tier to Blurry / Low Res or uncheck Corrupted flag.',
        detectedAt: new Date().toISOString()
      });
    }

    // Incomplete annotation check
    if (record.status === 'Annotated' || record.status === 'Approved') {
      if (!record.category) {
        errors.push({
          id: `qa-img-miss-cat-${record.id}`,
          recordId: record.id,
          datasetId: record.datasetId,
          recordType: 'image',
          severity: 'Critical',
          category: 'Missing Annotation',
          description: `Image "${record.id}" is marked ${record.status} but scene category is missing.`,
          suggestedAction: 'Select a primary scene category.',
          detectedAt: new Date().toISOString()
        });
      }
      if (!record.quality) {
        errors.push({
          id: `qa-img-miss-qual-${record.id}`,
          recordId: record.id,
          datasetId: record.datasetId,
          recordType: 'image',
          severity: 'Warning',
          category: 'Incomplete Fields',
          description: `Image "${record.id}" quality assessment tier is unselected.`,
          suggestedAction: 'Assign image quality (High Quality, Acceptable, etc.).',
          detectedAt: new Date().toISOString()
        });
      }
    }

    // Unresolved Review flag
    if (record.status === 'Needs Review' && (!record.reviewDecision || record.reviewDecision.status === 'Correction Requested')) {
      errors.push({
        id: `qa-img-unres-${record.id}`,
        recordId: record.id,
        datasetId: record.datasetId,
        recordType: 'image',
        severity: 'Info',
        category: 'Unresolved Review Flag',
        description: `Image record "${record.id}" is queued in "Needs Review" awaiting auditor decision.`,
        suggestedAction: 'Review image bounding boxes and scene flags.',
        detectedAt: new Date().toISOString()
      });
    }
  });

  return errors;
}
