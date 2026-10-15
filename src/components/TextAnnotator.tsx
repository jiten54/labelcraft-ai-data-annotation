import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  AlertCircle, 
  HelpCircle, 
  Flag, 
  BookOpen, 
  Save, 
  SkipForward, 
  RotateCcw, 
  Copy, 
  CheckCheck,
  Tag,
  ShieldCheck,
  ExternalLink,
  Keyboard
} from 'lucide-react';
import { TextRecord, SentimentLabel, TopicLabel, ContentReviewLabel, GuidelineRule } from '../types';
import { ANNOTATION_GUIDELINES } from '../data/guidelinesData';

interface TextAnnotatorProps {
  records: TextRecord[];
  onSaveRecord: (updatedRecord: TextRecord, auditReason?: string) => void;
  annotatorId: string;
  autoAdvance?: boolean;
}

export const TextAnnotator: React.FC<TextAnnotatorProps> = ({
  records,
  onSaveRecord,
  annotatorId,
  autoAdvance = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Unlabeled' | 'Needs Review' | 'Annotated'>('All');
  
  // Working local annotation state
  const [sentiment, setSentiment] = useState<SentimentLabel | undefined>(undefined);
  const [topic, setTopic] = useState<TopicLabel | undefined>(undefined);
  const [contentReview, setContentReview] = useState<ContentReviewLabel | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');
  const [isAmbiguous, setIsAmbiguous] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [isGuidelineDrawerOpen, setIsGuidelineDrawerOpen] = useState(false);
  const [selectedGuidelineCategory, setSelectedGuidelineCategory] = useState<string>('Sentiment');
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [skipReason, setSkipReason] = useState('Missing context');

  // Filtered records
  const filteredRecords = records.filter(r => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Unlabeled') return r.status === 'Unlabeled' || r.status === 'In Progress';
    if (filterStatus === 'Needs Review') return r.status === 'Needs Review';
    if (filterStatus === 'Annotated') return r.status === 'Annotated' || r.status === 'Approved';
    return true;
  });

  const currentRecord = filteredRecords[currentIndex] || filteredRecords[0];

  // Sync state when record changes
  useEffect(() => {
    if (currentRecord) {
      setSentiment(currentRecord.sentiment);
      setTopic(currentRecord.topic);
      setContentReview(currentRecord.contentReview || 'Relevant');
      setNotes(currentRecord.notes || '');
      setIsAmbiguous(currentRecord.isAmbiguous || false);
    }
  }, [currentRecord?.id]);

  // Handle Save
  const handleSave = useCallback(() => {
    if (!currentRecord) return;

    const isComplete = sentiment && topic && contentReview;
    const newStatus = isAmbiguous 
      ? 'Needs Review' 
      : isComplete 
        ? 'Annotated' 
        : 'In Progress';

    const updated: TextRecord = {
      ...currentRecord,
      sentiment,
      topic,
      contentReview,
      notes: notes.trim(),
      isAmbiguous,
      status: newStatus,
      annotatedBy: annotatorId,
      annotatedAt: new Date().toISOString()
    };

    onSaveRecord(updated, `Annotated: [${sentiment || 'None'}] - [${topic || 'None'}]`);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 1500);

    if (autoAdvance && currentIndex < filteredRecords.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentRecord, sentiment, topic, contentReview, notes, isAmbiguous, annotatorId, autoAdvance, currentIndex, filteredRecords.length, onSaveRecord]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger hotkeys if user is focused inside textarea or input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case '1':
          setSentiment('Positive');
          break;
        case '2':
          setSentiment('Negative');
          break;
        case '3':
          setSentiment('Neutral');
          break;
        case '4':
          setSentiment('Unclear');
          break;
        case 'q':
          setTopic('Technology');
          break;
        case 'w':
          setTopic('Education');
          break;
        case 'e':
          setTopic('Healthcare');
          break;
        case 'r':
          setTopic('Finance');
          break;
        case 't':
          setTopic('Entertainment');
          break;
        case 'y':
          setTopic('Other');
          break;
        case 'a':
          setIsAmbiguous(prev => !prev);
          break;
        case 's':
          e.preventDefault();
          handleSave();
          break;
        case 'n':
          if (currentIndex < filteredRecords.length - 1) {
            setCurrentIndex(prev => prev + 1);
          }
          break;
        case 'p':
          if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
          }
          break;
        case 'g':
          setIsGuidelineDrawerOpen(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, currentIndex, filteredRecords.length]);

  const handleCopyText = () => {
    if (currentRecord?.text) {
      navigator.clipboard.writeText(currentRecord.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSkipConfirm = () => {
    if (!currentRecord) return;
    const updated: TextRecord = {
      ...currentRecord,
      status: 'Needs Review',
      isAmbiguous: true,
      notes: notes ? `${notes} | Skipped: ${skipReason}` : `Skipped: ${skipReason}`,
      annotatedBy: annotatorId,
      annotatedAt: new Date().toISOString()
    };
    onSaveRecord(updated, `Skipped record: ${skipReason}`);
    setSkipModalOpen(false);
    if (currentIndex < filteredRecords.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const quickTags = [
    'Sarcasm / Irony',
    'Mixed polarity',
    'Missing context',
    'Technical jargon',
    'Spam / Bot generated'
  ];

  const sentimentOptions: { label: SentimentLabel; key: string; color: string; desc: string }[] = [
    { label: 'Positive', key: '1', color: 'hover:border-emerald-500 hover:bg-emerald-50/50', desc: 'Approval, praise, satisfaction' },
    { label: 'Negative', key: '2', color: 'hover:border-rose-500 hover:bg-rose-50/50', desc: 'Frustration, complaint, criticism' },
    { label: 'Neutral', key: '3', color: 'hover:border-slate-400 hover:bg-slate-50', desc: 'Factual, objective, non-evaluative' },
    { label: 'Unclear', key: '4', color: 'hover:border-amber-500 hover:bg-amber-50/50', desc: 'Severely ambiguous, contradictory' },
  ];

  const topicOptions: { label: TopicLabel; key: string }[] = [
    { label: 'Technology', key: 'Q' },
    { label: 'Education', key: 'W' },
    { label: 'Healthcare', key: 'E' },
    { label: 'Finance', key: 'R' },
    { label: 'Entertainment', key: 'T' },
    { label: 'Other', key: 'Y' },
  ];

  const contentReviewOptions: { label: ContentReviewLabel; desc: string }[] = [
    { label: 'Relevant', desc: 'Standard domain training data' },
    { label: 'Irrelevant', desc: 'Gibberish, spam, out of scope' },
    { label: 'Needs Review', desc: 'Disputed or severely truncated' },
  ];

  if (!currentRecord) {
    return (
      <div className="p-12 text-center text-slate-500">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-400" />
        <h3 className="font-bold text-slate-800 text-base">No Records Match Current Filter</h3>
        <p className="text-xs text-slate-500 mt-1">Try switching filter back to "All".</p>
        <button
          onClick={() => setFilterStatus('All')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
        >
          Reset Filter to All
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn relative">
      {/* Workspace Sub-Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900 text-sm bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                {currentRecord.id}
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                currentRecord.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                currentRecord.status === 'Annotated' ? 'bg-blue-100 text-blue-800' :
                currentRecord.status === 'Needs Review' ? 'bg-amber-100 text-amber-800' :
                'bg-slate-100 text-slate-600'
              }`}>
                {currentRecord.status}
              </span>
              {currentRecord.isAmbiguous && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-white flex items-center gap-1">
                  <Flag className="w-3 h-3" /> Ambiguous
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Record {currentIndex + 1} of {filteredRecords.length}
            </p>
          </div>
        </div>

        {/* Filter & Navigation Bar */}
        <div className="flex items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as any);
              setCurrentIndex(0);
            }}
            className="text-xs border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All">All Records ({records.length})</option>
            <option value="Unlabeled">Unlabeled Only</option>
            <option value="Needs Review">Needs Review</option>
            <option value="Annotated">Annotated</option>
          </select>

          {/* Guidelines Drawer Trigger */}
          <button
            onClick={() => setIsGuidelineDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            title="Open side-by-side annotation rules (Hot-key: G)"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guidelines</span>
            <kbd className="text-[10px] bg-indigo-200/80 px-1 rounded font-mono">G</kbd>
          </button>

          {/* Prev / Next Pagination */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="p-1 rounded text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Record (P)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-medium px-2 text-slate-700">
              {currentIndex + 1}/{filteredRecords.length}
            </span>
            <button
              onClick={() => setCurrentIndex(prev => Math.min(filteredRecords.length - 1, prev + 1))}
              disabled={currentIndex >= filteredRecords.length - 1}
              className="p-1 rounded text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Next Record (N)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Annotation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Original Source Record Viewer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Source Header */}
            <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Source Text Payload</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  ({currentRecord.text ? currentRecord.text.length : 0} characters)
                </span>
              </div>
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors font-medium cursor-pointer"
              >
                {copied ? <CheckCheck className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            {/* Original Text Body (Kept strictly unmodified) */}
            <div className="p-6">
              {currentRecord.text ? (
                <p className="text-base font-normal text-slate-900 leading-relaxed font-sans select-text">
                  {currentRecord.text}
                </p>
              ) : (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Payload is empty or missing. QA Engine flagged this as a critical missing field.</span>
                </div>
              )}
            </div>

            {/* Read-Only Source Metadata */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap items-center gap-4">
              <span><strong>Dataset:</strong> {currentRecord.datasetId}</span>
              <span><strong>ID:</strong> {currentRecord.id}</span>
              {currentRecord.annotatedBy && (
                <span><strong>Last Editor:</strong> {currentRecord.annotatedBy}</span>
              )}
              {currentRecord.annotatedAt && (
                <span><strong>Timestamp:</strong> {new Date(currentRecord.annotatedAt).toLocaleString()}</span>
              )}
            </div>
          </div>

          {/* Verified Reference Label (Gold Standard) Comparison */}
          {currentRecord.verifiedReference && (
            <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  Verified Gold-Standard Ground Truth
                </div>
                <span className="text-[10px] font-mono text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full font-semibold">
                  Benchmarked
                </span>
              </div>
              <p className="text-xs text-teal-900 leading-relaxed">
                {currentRecord.verifiedReference.explanation || 'Verified reference label recorded by expert lead annotator.'}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="bg-white border border-teal-200 text-teal-900 font-semibold px-2 py-1 rounded">
                  Sentiment: <strong>{currentRecord.verifiedReference.sentiment}</strong>
                </span>
                <span className="bg-white border border-teal-200 text-teal-900 font-semibold px-2 py-1 rounded">
                  Topic: <strong>{currentRecord.verifiedReference.topic}</strong>
                </span>
                <span className="bg-white border border-teal-200 text-teal-900 font-semibold px-2 py-1 rounded">
                  Review: <strong>{currentRecord.verifiedReference.contentReview}</strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Annotation Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* Task 1: Sentiment Classification */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Sentiment Classification
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Hotkeys [1-4]</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {sentimentOptions.map((opt) => {
                const isSelected = sentiment === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSentiment(opt.label)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : `border-slate-200 bg-white text-slate-800 ${opt.color}`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs">{opt.label}</span>
                      <kbd className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {opt.key}
                      </kbd>
                    </div>
                    <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task 2: Topic Categorization */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Topic Categorization
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Hotkeys [Q-Y]</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {topicOptions.map((opt) => {
                const isSelected = topic === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setTopic(opt.label)}
                    className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="font-semibold text-xs">{opt.label}</div>
                    <kbd className={`text-[9px] font-mono font-bold mt-1 inline-block px-1 rounded ${
                      isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {opt.key}
                    </kbd>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task 3: Content Review & Quality Status */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Content Review & Relevance
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {contentReviewOptions.map((opt) => {
                const isSelected = contentReview === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setContentReview(opt.label)}
                    className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                      isSelected
                        ? 'border-slate-800 bg-slate-800 text-white'
                        : 'border-slate-200 bg-white hover:border-slate-400 text-slate-800'
                    }`}
                  >
                    <div className="font-semibold text-xs">{opt.label}</div>
                    <p className={`text-[9px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Ambiguity Toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800">Flag as Ambiguous / Edge Case</span>
                <p className="text-[10px] text-slate-400">Routes record to supervisor QA review queue</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAmbiguous(prev => !prev)}
                className={`w-11 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                  isAmbiguous ? 'bg-amber-500' : 'bg-slate-200'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isAmbiguous ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* Annotator Notes & Quick Tags */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Annotator Notes
              </label>
              <span className="text-[10px] text-slate-400">Optional rationale</span>
            </div>

            {/* Quick insert tag pills */}
            <div className="flex flex-wrap gap-1.5">
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setNotes(prev => prev ? `${prev}, ${tag}` : tag)}
                  className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
                >
                  +{tag}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              placeholder="e.g. Irony recognized in praise clause; tone reversed due to service failure..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Save & Action Buttons Bar */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSkipModalOpen(true)}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                title="Skip record and specify reason"
              >
                <SkipForward className="w-3.5 h-3.5 text-slate-500" />
                <span>Skip</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Annotation & Advance</span>
                <kbd className="text-[10px] bg-blue-700 px-1.5 py-0.5 rounded font-mono font-bold">S</kbd>
              </button>
            </div>

            {/* Save success toast */}
            {saveSuccessNotice && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Annotation saved persistently to dataset</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Side-Drawer for Guidelines */}
      {isGuidelineDrawerOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-slideLeft">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-400" />
              <h3 className="font-bold text-sm">Annotation Rulebook Reference</h3>
            </div>
            <button
              onClick={() => setIsGuidelineDrawerOpen(false)}
              className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
            >
              ×
            </button>
          </div>

          {/* Category Tabs inside drawer */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-3 py-2 gap-1 overflow-x-auto">
            {['Sentiment', 'Topic', 'Content Review', 'Edge Cases'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedGuidelineCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-md font-semibold whitespace-nowrap cursor-pointer ${
                  selectedGuidelineCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Drawer content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {ANNOTATION_GUIDELINES.filter(r => r.category === selectedGuidelineCategory).map((rule) => (
              <div key={rule.id} className="space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{rule.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{rule.description}</p>
                </div>

                {/* Do's & Don'ts */}
                <div className="space-y-2">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-[11px] text-emerald-900">
                    <strong className="block text-emerald-800 font-bold mb-1">Strict Rules (Do's):</strong>
                    <ul className="list-disc list-inside space-y-0.5">
                      {rule.dos.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>

                  <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-[11px] text-rose-900">
                    <strong className="block text-rose-800 font-bold mb-1">Common Pitfalls (Don'ts):</strong>
                    <ul className="list-disc list-inside space-y-0.5">
                      {rule.donts.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Concrete Examples */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Benchmarked Examples:</span>
                  {rule.examples.map((ex, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] space-y-1">
                      <p className="text-slate-900 italic">"{ex.input}"</p>
                      <div className="flex items-center gap-2 pt-1 font-mono">
                        <span className="text-emerald-700 font-bold">✓ {ex.correctLabel}</span>
                        <span className="text-rose-600 line-through">✗ {ex.incorrectLabel}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-sans">{ex.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
            <button
              onClick={() => setIsGuidelineDrawerOpen(false)}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Close Rulebook
            </button>
          </div>
        </div>
      )}

      {/* Skip Record Modal */}
      {skipModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <SkipForward className="w-4 h-4 text-slate-600" />
              <span>Skip Record Reason</span>
            </div>
            <p className="text-xs text-slate-600">
              Select the reason why record {currentRecord.id} cannot be annotated immediately:
            </p>
            <div className="space-y-2">
              {[
                'Missing crucial context',
                'Severely truncated or corrupted text',
                'Foreign language / out of domain',
                'Disputed polarity / sarcasm ambiguity',
                'Other reason'
              ].map((reason) => (
                <label key={reason} className="flex items-center gap-2 text-xs text-slate-700 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="skip_reason"
                    checked={skipReason === reason}
                    onChange={() => setSkipReason(reason)}
                    className="text-blue-600"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSkipModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSkipConfirm}
                className="px-4 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-500"
              >
                Confirm Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
