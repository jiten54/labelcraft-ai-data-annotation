import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  AlertTriangle, 
  FileText, 
  Image as ImageIcon,
  Check,
  X,
  Printer,
  Download
} from 'lucide-react';
import { ANNOTATION_GUIDELINES } from '../data/guidelinesData';
import { exportToJSON } from '../utils/storage';

export const GuidelinesView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Sentiment', 'Topic', 'Content Review', 'Image Classification', 'Bounding Boxes', 'Edge Cases'];

  const filteredRules = ANNOTATION_GUIDELINES.filter(rule => {
    if (selectedCategory !== 'All' && rule.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rule.title.toLowerCase().includes(q) ||
        rule.description.toLowerCase().includes(q) ||
        rule.dos.some(d => d.toLowerCase().includes(q)) ||
        rule.donts.some(d => d.toLowerCase().includes(q)) ||
        rule.examples.some(e => e.input.toLowerCase().includes(q) || e.rationale.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportGuidelines = () => {
    exportToJSON('Codefeast_Annotation_Standard_Operating_Procedures.json', ANNOTATION_GUIDELINES);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Annotation Guidelines & Taxonomy Standards
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative Codefeast operational handbook for sentiment, topic classification, and visual labeling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportGuidelines}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Guidelines (JSON)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search rules, keywords, examples..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Rules Accordion / Cards List */}
      <div className="space-y-6">
        {filteredRules.map((rule) => (
          <div key={rule.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Rule Header */}
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider font-mono">
                    {rule.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{rule.title}</h3>
                </div>
                <p className="text-xs text-slate-600 mt-1">{rule.description}</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Do's and Don'ts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Do's */}
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Mandatory Practices (Do's)
                  </div>
                  <ul className="text-xs text-emerald-950 space-y-1.5 list-disc list-inside">
                    {rule.dos.map((item, i) => (
                      <li key={i} className="leading-relaxed">{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Don'ts */}
                <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-900 uppercase tracking-wider">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Prohibited Actions & Pitfalls (Don'ts)
                  </div>
                  <ul className="text-xs text-rose-950 space-y-1.5 list-disc list-inside">
                    {rule.donts.map((item, i) => (
                      <li key={i} className="leading-relaxed">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Correct vs Incorrect Comparison Examples */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Side-by-Side Annotation Examples & Rationale
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rule.examples.map((example, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2.5">
                      <div className="text-xs font-medium text-slate-900 italic">
                        "{example.input}"
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs pt-1 border-t border-slate-200">
                        <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          <Check className="w-3.5 h-3.5" />
                          Correct: {example.correctLabel}
                        </span>
                        <span className="flex items-center gap-1 text-rose-700 font-medium line-through bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                          <X className="w-3.5 h-3.5" />
                          Incorrect: {example.incorrectLabel}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                        <strong className="text-slate-800 font-semibold">Guideline Rationale:</strong> {example.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
