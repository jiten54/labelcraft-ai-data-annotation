export type SentimentLabel = 'Positive' | 'Negative' | 'Neutral' | 'Unclear';

export type TopicLabel = 
  | 'Technology' 
  | 'Education' 
  | 'Healthcare' 
  | 'Finance' 
  | 'Entertainment' 
  | 'Other';

export type ContentReviewLabel = 
  | 'Relevant' 
  | 'Irrelevant' 
  | 'Needs Review';

export type ImageCategoryLabel = 
  | 'Technology & Devices' 
  | 'Workplace & Office' 
  | 'Healthcare & Medical' 
  | 'Urban & Architecture' 
  | 'Nature & Animals' 
  | 'Other';

export type ImageQualityLabel = 
  | 'High Quality' 
  | 'Acceptable' 
  | 'Blurry / Low Res' 
  | 'Watermarked / Occluded';

export type AnnotationStatus = 'Unlabeled' | 'In Progress' | 'Annotated' | 'Needs Review' | 'Rejected' | 'Approved';

export type DatasetType = 'text' | 'image';

export interface BoundingBox {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  label: string;
  confidence?: number;
}

export interface TextRecord {
  id: string;
  datasetId: string;
  text: string;
  metadata?: {
    source?: string;
    domain?: string;
    authorRole?: string;
    createdDate?: string;
    originalLanguage?: string;
  };
  // Annotation fields
  sentiment?: SentimentLabel;
  topic?: TopicLabel;
  contentReview?: ContentReviewLabel;
  notes?: string;
  isAmbiguous?: boolean;
  status: AnnotationStatus;
  annotatedBy?: string;
  annotatedAt?: string;
  verifiedReference?: {
    sentiment: SentimentLabel;
    topic: TopicLabel;
    contentReview: ContentReviewLabel;
    explanation?: string;
  };
  reviewDecision?: {
    status: 'Approved' | 'Rejected' | 'Correction Requested';
    reviewer: string;
    reason: string;
    timestamp: string;
  };
}

export interface ImageRecord {
  id: string;
  datasetId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  title: string;
  dimensions?: { width: number; height: number };
  category?: ImageCategoryLabel;
  quality?: ImageQualityLabel;
  isCorruptedOrUnclear?: boolean;
  boundingBoxes: BoundingBox[];
  notes?: string;
  status: AnnotationStatus;
  annotatedBy?: string;
  annotatedAt?: string;
  verifiedReference?: {
    category: ImageCategoryLabel;
    quality: ImageQualityLabel;
    isCorruptedOrUnclear: boolean;
    explanation?: string;
  };
  reviewDecision?: {
    status: 'Approved' | 'Rejected' | 'Correction Requested';
    reviewer: string;
    reason: string;
    timestamp: string;
  };
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  type: DatasetType;
  createdDate: string;
  recordCount: number;
  annotatedCount: number;
  hasGoldStandard: boolean;
  isSynthetic: boolean;
}

export interface QAErrorItem {
  id: string;
  recordId: string;
  datasetId: string;
  recordType: DatasetType;
  severity: 'Critical' | 'Warning' | 'Info';
  category: 
    | 'Missing Annotation' 
    | 'Invalid Label' 
    | 'Duplicate Record ID' 
    | 'Contradictory Labels' 
    | 'Incomplete Fields' 
    | 'Unresolved Review Flag' 
    | 'Suspicious Sentiment Inconsistency';
  description: string;
  suggestedAction: string;
  detectedAt: string;
}

export interface AuditLogEntry {
  id: string;
  recordId: string;
  datasetId: string;
  action: 
    | 'Created' 
    | 'Updated Annotation' 
    | 'Flagged Ambiguous' 
    | 'QA Approved' 
    | 'QA Rejected' 
    | 'Correction Requested' 
    | 'Skipped' 
    | 'Exported';
  operator: string;
  previousValue?: string;
  newValue?: string;
  notes?: string;
  timestamp: string;
}

export interface EvaluationMetrics {
  totalEvaluated: number;
  totalWithGroundTruth: number;
  accuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  confusionMatrix: {
    labels: string[];
    matrix: number[][]; // [groundTruthIndex][predictedIndex]
  };
  classMetrics: {
    label: string;
    precision: number;
    recall: number;
    f1: number;
    support: number;
  }[];
}

export interface GuidelineRule {
  id: string;
  category: 'Sentiment' | 'Topic' | 'Content Review' | 'Image Classification' | 'Bounding Boxes' | 'Edge Cases';
  title: string;
  description: string;
  dos: string[];
  donts: string[];
  examples: {
    input: string;
    correctLabel: string;
    incorrectLabel: string;
    rationale: string;
  }[];
}
