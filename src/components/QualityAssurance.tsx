import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Filter, 
  Check, 
  X, 
  MessageSquare,
  FileText,
  Image as ImageIcon,
  ArrowRight,
  ShieldAlert,
  Search
} from 'lucide-react';
import { QAErrorItem, TextRecord, ImageRecord } from '../types';

interface QualityAssuranceProps {
  qaErrors: QAErrorItem[];
  textRecords: TextRecord[];
  imageRecords: ImageRecord[];
  onReviewDecision: (
    recordId: string, 
    recordType: 'text' | 'image', 
    decision: 'Approved' | 'Rejected' | 'Correction Requested', 
    reason: string
  ) => void;
  reviewerId: string;
}

export const QualityAssurance: React.FC<QualityAssuranceProps> = ({
  qaErrors,
  textRecords,
  imageRecords,
  onReviewDecision,
  reviewerId
}) => {
  const [severityFilter, setSeverityFilter] = useState<'All' | 'Critical' | 'Warning' | 'Info'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'text' | 'image'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected item for review modal
  const [selectedError, setSelectedError] = useState<QAErrorItem | null>(null);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionAction, setDecisionAction] = useState<'Approved' | 'Rejected' | 'Correction Requested'>('Approved');
  const [decisionReason, setDecisionReason] = useState('');

  // Filtered list of errors
  const filteredErrors = qaErrors.filter(err => {
    if (severityFilter !== 'All' && err.severity !== severityFilter) return false;
    if (categoryFilter !== 'All' && err.category !== categoryFilter) return false;
    if (typeFilter !== 'All' && err.recordType !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        err.recordId.toLowerCase().includes(q) ||
        err.description.toLowerCase().includes(q) ||
        err.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories = Array.from(new Set(qaErrors.map(e => e.category)));

  // Lookup record content for preview
  const getRecordContent = (recordId: string, type: 'text' | 'image') => {
    if (type === 'text') {
      const rec = textRecords.find(r => r.id === recordId);
      return rec ? rec.text : 'Record text payload not found';
    } else {
      const rec = imageRecords.find(r => r.id === recordId);
      return rec ? rec.title || rec.imageUrl : 'Image record not found';
    }
  };

  const handleOpenDecisionModal = (err: QAErrorItem, action: 'Approved' | 'Rejected' | 'Correction Requested') => {
    setSelectedError(err);
    setDecisionAction(action);
    setDecisionReason(
      action === 'Approved' ? 'Reviewed and verified conformant to guideline exception criteria.' :
      action === 'Rejected' ? 'Violates strict taxonomy guidelines or contains malformed duplicate key.' :
      'Please re-evaluate ambiguous polarity or clarify missing fields.'
    );
    setDecisionModalOpen(true);
  };

  const handleConfirmDecision = () => {
    if (!selectedError || !decisionReason.trim()) return;
    onReviewDecision(selectedError.recordId, selectedError.recordType, decisionAction, decisionReason.trim());
    setDecisionModalOpen(false);
    setSelectedError(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* QA Header & Ethical / Reliability Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Quality Assurance Engine & Review Queue
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Automated rule auditor for detecting missing fields, invalid taxonomy, duplicate IDs, and contradictory labels.
          </p>
        </div>
      </div>

      {/* Mandatory Accuracy Boundary Disclosure */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block text-amber-950 mb-0.5">Automated QA Integrity Note:</strong>
          <span>
            Automated rule engines detect structural schema defects, duplicate keys, and heuristic discrepancies. They do not constitute absolute proof of semantic correctness. Human review by trained annotators and gold-standard benchmarks establish ground truth.
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search record ID or issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="text-xs border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical Only</option>
            <option value="Warning">Warning Only</option>
            <option value="Info">Info / Queued Only</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
          >
            <option value="All">All Issue Categories ({categories.length})</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Modality Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="text-xs border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
          >
            <option value="All">All Modalities (Text & Images)</option>
            <option value="text">Text Records</option>
            <option value="image">Image Records</option>
          </select>
        </div>
      </div>

      {/* Review Queue Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <span>Showing {filteredErrors.length} of {qaErrors.length} flagged defects</span>
          <span>Click Approve, Reject, or Request Correction</span>
        </div>

        {filteredErrors.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-teal-500" />
            <h3 className="font-bold text-slate-900 text-base">No QA Rule Violations Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              All records in the current view satisfy validation checks and guideline rules.
            </p>
          </div>
        ) : (
          filteredErrors.map((err) => {
            const content = getRecordContent(err.recordId, err.recordType);
            return (
              <div 
                key={err.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      err.severity === 'Critical' ? 'bg-rose-100 text-rose-800' :
                      err.severity === 'Warning' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {err.severity}
                    </span>
                    <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {err.recordId}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {err.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {err.recordType.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-900 leading-normal">
                    {err.description}
                  </p>

                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-700 italic font-sans max-w-2xl truncate">
                    "{content}"
                  </div>

                  <p className="text-[11px] text-teal-800 font-medium">
                    <strong>Suggested Remedy:</strong> {err.suggestedAction}
                  </p>
                </div>

                {/* Auditor Decision Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => handleOpenDecisionModal(err, 'Approved')}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Approve record with explanation"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => handleOpenDecisionModal(err, 'Correction Requested')}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Send back to annotator with instructions"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Correction</span>
                  </button>

                  <button
                    onClick={() => handleOpenDecisionModal(err, 'Rejected')}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Reject annotation or record"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Decision Modal */}
      {decisionModalOpen && selectedError && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>Record Review Decision:</span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  decisionAction === 'Approved' ? 'bg-teal-100 text-teal-800' :
                  decisionAction === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {decisionAction}
                </span>
              </h3>
              <button
                onClick={() => setDecisionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p><strong>Target Record:</strong> {selectedError.recordId} ({selectedError.recordType})</p>
              <p><strong>Defect Category:</strong> {selectedError.category}</p>
              <p className="text-slate-500 italic mt-1">"{selectedError.description}"</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Decision Justification / Feedback for Annotator:
              </label>
              <textarea
                rows={3}
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="Detail reason for decision to preserve in audit history..."
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDecisionModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecision}
                disabled={!decisionReason.trim()}
                className={`px-4 py-1.5 text-xs font-semibold text-white rounded-lg cursor-pointer shadow-xs ${
                  decisionAction === 'Approved' ? 'bg-teal-600 hover:bg-teal-500' :
                  decisionAction === 'Rejected' ? 'bg-rose-600 hover:bg-rose-500' :
                  'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                Commit Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
