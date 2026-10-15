import { TextRecord, EvaluationMetrics } from '../types';

export function calculateGoldStandardMetrics(records: TextRecord[]): EvaluationMetrics | null {
  // Only evaluate records that have BOTH a verifiedReference and an annotator sentiment
  const eligibleRecords = records.filter(
    r => r.verifiedReference && r.verifiedReference.sentiment && r.sentiment
  );

  const totalWithGroundTruth = records.filter(r => r.verifiedReference?.sentiment).length;

  if (eligibleRecords.length === 0) {
    return null;
  }

  const classes = ['Positive', 'Negative', 'Neutral', 'Unclear'];
  const labelToIndex = new Map<string, number>(classes.map((cls, idx) => [cls, idx]));

  // Initialize confusion matrix [groundTruthIndex][predictedIndex]
  const matrix: number[][] = Array.from({ length: classes.length }, () =>
    Array(classes.length).fill(0)
  );

  let correctCount = 0;

  eligibleRecords.forEach(rec => {
    const truth = rec.verifiedReference!.sentiment;
    const pred = rec.sentiment!;

    const truthIdx = labelToIndex.get(truth);
    const predIdx = labelToIndex.get(pred);

    if (truthIdx !== undefined && predIdx !== undefined) {
      matrix[truthIdx][predIdx] += 1;
      if (truth === pred) {
        correctCount += 1;
      }
    }
  });

  const accuracy = eligibleRecords.length > 0 ? (correctCount / eligibleRecords.length) : 0;

  // Calculate per-class metrics
  const classMetrics = classes.map((cls, i) => {
    let tp = matrix[i][i]; // True Positives: groundTruth == i and pred == i
    let fp = 0; // False Positives: groundTruth != i but pred == i (sum down column i, excluding row i)
    let fn = 0; // False Negatives: groundTruth == i but pred != i (sum across row i, excluding col i)
    let support = 0; // Total instances of ground truth i

    for (let r = 0; r < classes.length; r++) {
      support += matrix[i][r];
      if (r !== i) {
        fp += matrix[r][i];
      }
    }

    for (let c = 0; c < classes.length; c++) {
      if (c !== i) {
        fn += matrix[i][c];
      }
    }

    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    return {
      label: cls,
      precision,
      recall,
      f1,
      support
    };
  });

  // Calculate Macro-averaged metrics across active classes (where support > 0 or predictions were made)
  const evaluatedClasses = classMetrics.filter(c => c.support > 0);
  const classCount = evaluatedClasses.length || 1;

  const macroPrecision = evaluatedClasses.reduce((sum, c) => sum + c.precision, 0) / classCount;
  const macroRecall = evaluatedClasses.reduce((sum, c) => sum + c.recall, 0) / classCount;
  const macroF1 = evaluatedClasses.reduce((sum, c) => sum + c.f1, 0) / classCount;

  return {
    totalEvaluated: eligibleRecords.length,
    totalWithGroundTruth,
    accuracy,
    macroPrecision,
    macroRecall,
    macroF1,
    confusionMatrix: {
      labels: classes,
      matrix
    },
    classMetrics
  };
}
