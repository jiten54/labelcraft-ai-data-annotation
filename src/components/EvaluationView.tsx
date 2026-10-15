import React, { useState } from 'react';
import { 
  BarChart3, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  ShieldCheck, 
  FileCheck2, 
  TrendingUp, 
  Download,
  Info
} from 'lucide-react';
import { TextRecord, EvaluationMetrics } from '../types';
import { exportToCSV, exportToJSON } from '../utils/storage';

interface EvaluationViewProps {
  records: TextRecord[];
  metrics: EvaluationMetrics | null;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  records,
  metrics
}) => {
  const [filterMismatchOnly, setFilterMismatchOnly] = useState(false);

  // Eligible records with verified reference labels
  const groundTruthRecords = records.filter(r => r.verifiedReference && r.verifiedReference.sentiment);
  
  const evaluatedRecords = groundTruthRecords.filter(r => {
    if (filterMismatchOnly) {
      return r.sentiment !== r.verifiedReference?.sentiment;
    }
    return true;
  });

  const handleExportEvaluationReport = () => {
    if (!metrics) return;
    const report = {
      benchmarkName: 'Codefeast NLP Sentiment Gold-Standard Benchmark',
      evaluatedTimestamp: new Date().toISOString(),
      summaryMetrics: {
        totalEvaluated: metrics.totalEvaluated,
        accuracy: metrics.accuracy,
        macroPrecision: metrics.macroPrecision,
        macroRecall: metrics.macroRecall,
        macroF1: metrics.macroF1
      },
      classBreakdown: metrics.classMetrics,
      confusionMatrix: metrics.confusionMatrix
    };
    exportToJSON('Codefeast_Gold_Standard_Evaluation_Report.json', report);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-teal-600" />
            Gold-Standard Benchmark Evaluation
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Statistical measurement of annotator quality, inter-rater consistency, and agreement against verified reference labels.
          </p>
        </div>

        {metrics && (
          <button
            onClick={handleExportEvaluationReport}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Evaluation Report</span>
          </button>
        )}
      </div>

      {/* Disclaimers & Integrity Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <strong className="text-teal-300 font-bold block text-sm">Ground-Truth Verification Protocol:</strong>
          <p className="text-slate-300 leading-relaxed">
            Evaluation scores below are calculated <strong>strictly against verified ground-truth labels</strong> curated by senior lead annotators. If a record has not been verified or reference data is absent, it is classified as <span className="text-amber-400 font-mono">"Not evaluated"</span> rather than generating synthetic scores.
          </p>
        </div>
      </div>

      {!metrics ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base">Not Evaluated</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            There are no annotated records with corresponding ground-truth reference labels in this dataset yet. Annotate benchmark records in the Text Annotator workspace to generate metrics.
          </p>
        </div>
      ) : (
        <>
          {/* Top Level Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Total Evaluated */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Evaluated Sample Size</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {metrics.totalEvaluated}
              </div>
              <span className="text-[11px] text-slate-500">
                of {metrics.totalWithGroundTruth} ground truth records
              </span>
            </div>

            {/* Overall Accuracy */}
            <div className="bg-white rounded-xl p-4 border border-teal-200 bg-teal-50/20 shadow-xs">
              <span className="text-xs text-teal-700 font-medium block">Overall Accuracy</span>
              <div className="text-2xl font-bold text-teal-800 mt-1">
                {(metrics.accuracy * 100).toFixed(1)}%
              </div>
              <span className="text-[11px] text-teal-600">Exact match ratio</span>
            </div>

            {/* Macro Precision */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Macro Precision</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {(metrics.macroPrecision * 100).toFixed(1)}%
              </div>
              <span className="text-[11px] text-slate-500">Avg positive predictive value</span>
            </div>

            {/* Macro Recall */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Macro Recall</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {(metrics.macroRecall * 100).toFixed(1)}%
              </div>
              <span className="text-[11px] text-slate-500">Avg sensitivity across classes</span>
            </div>

            {/* Macro F1-Score */}
            <div className="bg-white rounded-xl p-4 border border-blue-200 bg-blue-50/20 shadow-xs">
              <span className="text-xs text-blue-700 font-medium block">Macro F1-Score</span>
              <div className="text-2xl font-bold text-blue-800 mt-1">
                {(metrics.macroF1 * 100).toFixed(1)}%
              </div>
              <span className="text-[11px] text-blue-600">Harmonic mean precision & recall</span>
            </div>
          </div>

          {/* Interactive Confusion Matrix Grid */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Sentiment Confusion Matrix</h3>
                <p className="text-xs text-slate-500">
                  Rows represent <strong>Verified Ground Truth</strong>; columns represent <strong>Annotator Prediction</strong>.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                N = {metrics.totalEvaluated} paired observations
              </span>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2.5 px-4 text-left font-bold text-slate-400 text-[10px] uppercase">
                      Ground Truth \ Prediction
                    </th>
                    {metrics.confusionMatrix.labels.map((colLabel) => (
                      <th key={colLabel} className="py-2.5 px-4 font-bold text-slate-700">
                        {colLabel} (Pred)
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.confusionMatrix.labels.map((rowLabel, rIdx) => (
                    <tr key={rowLabel} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-left font-bold text-slate-800 bg-slate-50/50">
                        {rowLabel} (Truth)
                      </td>
                      {metrics.confusionMatrix.matrix[rIdx].map((count, cIdx) => {
                        const isDiagonal = rIdx === cIdx;
                        return (
                          <td 
                            key={cIdx} 
                            className={`py-3 px-4 font-mono font-bold text-sm ${
                              isDiagonal
                                ? count > 0 ? 'bg-teal-100/70 text-teal-900' : 'text-slate-400'
                                : count > 0 ? 'bg-rose-100/70 text-rose-900' : 'text-slate-300'
                            }`}
                          >
                            {count}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Per-Class Detailed Performance Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Class-Level Precision, Recall, and Support</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Sentiment Class</th>
                    <th className="py-2.5 px-4">Precision</th>
                    <th className="py-2.5 px-4">Recall</th>
                    <th className="py-2.5 px-4">F1-Score</th>
                    <th className="py-2.5 px-4">Support (Ground Truth Count)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {metrics.classMetrics.map((cm) => (
                    <tr key={cm.label} className="hover:bg-slate-50 font-mono">
                      <td className="py-3 px-4 font-sans font-semibold text-slate-900">{cm.label}</td>
                      <td className="py-3 px-4">{(cm.precision * 100).toFixed(1)}%</td>
                      <td className="py-3 px-4">{(cm.recall * 100).toFixed(1)}%</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{(cm.f1 * 100).toFixed(1)}%</td>
                      <td className="py-3 px-4 text-slate-600">{cm.support}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample Records Inspector */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Evaluated Record Discrepancy Log</h3>
              <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterMismatchOnly}
                  onChange={(e) => setFilterMismatchOnly(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Show Mismatches Only</span>
              </label>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Record ID</th>
                    <th className="py-2.5 px-4">Text Excerpt</th>
                    <th className="py-2.5 px-4">Annotator Label</th>
                    <th className="py-2.5 px-4">Ground Truth</th>
                    <th className="py-2.5 px-4">Evaluation Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {evaluatedRecords.map((rec) => {
                    const isMatch = rec.sentiment === rec.verifiedReference?.sentiment;
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {rec.id}
                        </td>
                        <td className="py-3 px-4 max-w-md truncate text-slate-700">
                          {rec.text}
                        </td>
                        <td className="py-3 px-4 font-semibold whitespace-nowrap">
                          {rec.sentiment || <span className="text-slate-400 italic">Unlabeled</span>}
                        </td>
                        <td className="py-3 px-4 font-semibold text-teal-800 whitespace-nowrap">
                          {rec.verifiedReference?.sentiment}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {rec.sentiment ? (
                            isMatch ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                <CheckCircle className="w-3.5 h-3.5" /> Match
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                                <AlertCircle className="w-3.5 h-3.5" /> Mismatch
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">Not evaluated</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
