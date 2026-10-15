import React from 'react';
import { 
  FileCheck2, 
  Clock, 
  AlertCircle, 
  Flag, 
  BarChart2, 
  CheckCircle2, 
  TrendingUp, 
  Database,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { TextRecord, ImageRecord, QAErrorItem, Dataset, EvaluationMetrics } from '../types';
import { NavTab } from './Sidebar';

interface DashboardProps {
  datasets: Dataset[];
  textRecords: TextRecord[];
  imageRecords: ImageRecord[];
  qaErrors: QAErrorItem[];
  evaluationMetrics: EvaluationMetrics | null;
  onNavigate: (tab: NavTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  datasets,
  textRecords,
  imageRecords,
  qaErrors,
  evaluationMetrics,
  onNavigate
}) => {
  const totalText = textRecords.length;
  const totalImage = imageRecords.length;
  const totalRecords = totalText + totalImage;

  // Status metrics
  const annotatedText = textRecords.filter(r => r.status === 'Annotated' || r.status === 'Approved').length;
  const annotatedImage = imageRecords.filter(r => r.status === 'Annotated' || r.status === 'Approved').length;
  const totalAnnotated = annotatedText + annotatedImage;

  const awaitingText = textRecords.filter(r => r.status === 'Unlabeled' || r.status === 'In Progress').length;
  const awaitingImage = imageRecords.filter(r => r.status === 'Unlabeled' || r.status === 'In Progress').length;
  const totalAwaiting = awaitingText + awaitingImage;

  const needsReviewText = textRecords.filter(r => r.status === 'Needs Review').length;
  const needsReviewImage = imageRecords.filter(r => r.status === 'Needs Review').length;
  const totalNeedsReview = needsReviewText + needsReviewImage;

  const flaggedOrRejectedText = textRecords.filter(r => r.status === 'Rejected' || r.isAmbiguous).length;
  const flaggedOrRejectedImage = imageRecords.filter(r => r.status === 'Rejected' || r.isCorruptedOrUnclear).length;
  const totalFlaggedOrRejected = flaggedOrRejectedText + flaggedOrRejectedImage;

  const completionPercent = totalRecords > 0 ? Math.round((totalAnnotated / totalRecords) * 100) : 0;

  // Status Pie Chart Data
  const statusPieData = [
    { name: 'Annotated / Approved', value: totalAnnotated, color: '#2563eb' },
    { name: 'Awaiting Annotation', value: totalAwaiting, color: '#94a3b8' },
    { name: 'Needs Review', value: totalNeedsReview, color: '#f59e0b' },
    { name: 'Flagged / Ambiguous', value: totalFlaggedOrRejected, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Topic Distribution Bar Chart Data
  const topicCounts: Record<string, number> = {};
  textRecords.forEach(r => {
    if (r.topic) {
      topicCounts[r.topic] = (topicCounts[r.topic] || 0) + 1;
    }
  });
  const topicBarData = Object.entries(topicCounts).map(([topic, count]) => ({
    topic,
    count
  }));

  // QA Error Category Breakdown Data
  const qaCategoryCounts: Record<string, number> = {};
  qaErrors.forEach(err => {
    qaCategoryCounts[err.category] = (qaCategoryCounts[err.category] || 0) + 1;
  });
  const qaBarData = Object.entries(qaCategoryCounts).map(([category, count]) => ({
    category: category.replace('Duplicate Record ID', 'Duplicate ID').replace('Suspicious Sentiment Inconsistency', 'Suspicious Sentiment'),
    count
  }));

  // Health Score (100 minus penalty for critical QA errors and unresolved review items)
  const criticalErrorsCount = qaErrors.filter(e => e.severity === 'Critical').length;
  const warningErrorsCount = qaErrors.filter(e => e.severity === 'Warning').length;
  const rawScore = 100 - (criticalErrorsCount * 8) - (warningErrorsCount * 3) - (totalNeedsReview * 1);
  const healthScore = Math.max(0, Math.min(100, rawScore));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Codefeast Data Annotator (Fresher) Benchmark Workspace
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Data Annotation & Quality Assurance Operations
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Production workspace built to label datasets according to strict taxonomies, catch data contradictions, measure gold-standard accuracy, and export clean verified datasets.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-3 shrink-0">
            <button
              onClick={() => onNavigate('text-annotation')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Resume Text Labeling</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('qa')}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Review QA Queue ({qaErrors.length})</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Primary Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Total Records */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Imported</span>
            <Database className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalRecords}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalText} text · {totalImage} images
          </div>
        </div>

        {/* Records Annotated */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-medium">Annotated</span>
            <FileCheck2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-700">{totalAnnotated}</div>
          <div className="text-[11px] text-blue-600/80 font-medium mt-1">
            {completionPercent}% completed
          </div>
        </div>

        {/* Awaiting Annotation */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Awaiting Labeling</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{totalAwaiting}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Ready for annotator
          </div>
        </div>

        {/* Needs Review */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-medium">Needs Review</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{totalNeedsReview}</div>
          <div className="text-[11px] text-amber-600/80 mt-1 font-medium">
            Requires supervisor
          </div>
        </div>

        {/* Flagged / Ambiguous */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-medium">Flagged / Corrupt</span>
            <Flag className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-700">{totalFlaggedOrRejected}</div>
          <div className="text-[11px] text-rose-600/80 mt-1">
            Edge cases identified
          </div>
        </div>

        {/* Gold Standard Accuracy */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-teal-600 mb-2">
            <span className="text-xs font-medium">Verified Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-bold text-teal-700">
            {evaluationMetrics ? `${(evaluationMetrics.accuracy * 100).toFixed(1)}%` : 'N/A'}
          </div>
          <div className="text-[11px] text-teal-600/80 mt-1 font-mono">
            {evaluationMetrics ? `${evaluationMetrics.totalEvaluated} verified samples` : 'Not evaluated'}
          </div>
        </div>
      </div>

      {/* Quality Health Score & Operational Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative w-18 h-18 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={healthScore > 80 ? 'text-teal-500' : healthScore > 50 ? 'text-amber-500' : 'text-rose-500'}
                strokeDasharray={`${healthScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-bold text-slate-800 text-base">{healthScore}</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              Dataset Quality Health Index
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                healthScore >= 90 ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {healthScore >= 90 ? 'High Integrity' : 'Attention Required'}
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Calculated from automated QA rules: <strong className="text-slate-800">{criticalErrorsCount} critical violations</strong>, <strong className="text-slate-800">{warningErrorsCount} warnings</strong>, and <strong className="text-slate-800">{totalNeedsReview} items</strong> awaiting review decision.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('guidelines')}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Consult Guidelines</span>
          </button>
          <button
            onClick={() => onNavigate('evaluation')}
            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Evaluation Matrix</span>
          </button>
        </div>
      </div>

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Donut */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-800 text-sm">Annotation Progress Status</h4>
            <span className="text-xs text-slate-500">{totalRecords} Total Records</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(val: any) => [`${val || 0} records (${Math.round(((Number(val) || 0) / (totalRecords || 1)) * 100)}%)`, 'Count']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Classification Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-800 text-sm">Topic Label Distribution</h4>
            <span className="text-xs text-slate-500">Categorized Records</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="topic" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* QA Engine Automated Detections */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-800 text-sm">QA Defect Categories</h4>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              {qaErrors.length} Flags
            </span>
          </div>
          <div className="h-64">
            {qaBarData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-teal-500 mb-2" />
                <span>Zero QA defects detected. Clean dataset!</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  layout="vertical" 
                  data={qaBarData} 
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis 
                    dataKey="category" 
                    type="category" 
                    tick={{ fontSize: 10, fill: '#475569' }} 
                    width={110} 
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Critical QA Findings Preview & Guidelines Tip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active QA Alerts Preview */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h4 className="font-bold text-slate-800 text-sm">Active QA Rule Violations</h4>
            </div>
            <button
              onClick={() => onNavigate('qa')}
              className="text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View all ({qaErrors.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {qaErrors.slice(0, 3).map((err) => (
              <div key={err.id} className="py-2.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      err.severity === 'Critical' 
                        ? 'bg-rose-100 text-rose-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {err.severity}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-900">{err.recordId}</span>
                    <span className="text-xs text-slate-500 truncate">· {err.category}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">{err.description}</p>
                </div>
                <button
                  onClick={() => onNavigate('qa')}
                  className="shrink-0 text-xs text-slate-600 hover:text-slate-900 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded font-medium cursor-pointer"
                >
                  Resolve
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Codefeast Annotator Pro Tip */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" />
              Annotation Guideline Highlight
            </div>
            <h4 className="font-bold text-slate-900 text-sm">
              Handling Irony & Sarcastic Reversals
            </h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              When an author writes literal words of praise (e.g. <em>"Oh wonderful, another memory leak"</em> or <em>"Peak software excellence"</em>) while expressing obvious customer despair, do <strong>NOT</strong> label it as Positive. Label as <strong>Negative</strong>, toggle <strong>"Ambiguous / Sarcasm"</strong>, and document in notes.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Standard Rule #SENT-04</span>
            <button
              onClick={() => onNavigate('guidelines')}
              className="text-indigo-600 font-semibold hover:text-indigo-800 cursor-pointer"
            >
              Read full guidelines &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
