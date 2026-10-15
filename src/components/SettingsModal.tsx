import React from 'react';
import { Settings, User, Sliders, RotateCcw, ShieldCheck, Check } from 'lucide-react';

interface SettingsModalProps {
  annotatorId: string;
  setAnnotatorId: (id: string) => void;
  autoAdvance: boolean;
  setAutoAdvance: (val: boolean) => void;
  onResetBaseline: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  annotatorId,
  setAnnotatorId,
  autoAdvance,
  setAutoAdvance,
  onResetBaseline
}) => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-blue-600" />
          Workspace Configuration & Annotator Profile
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Customize annotator operator ID, labeling preferences, and dataset baseline states.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
        {/* Annotator Profile */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <User className="w-4 h-4 text-blue-600" />
            <span>Annotator Operator Profile</span>
          </div>

          <div className="max-w-md space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Annotator Identifier (Operator Tag)
            </label>
            <input
              type="text"
              value={annotatorId}
              onChange={(e) => setAnnotatorId(e.target.value.trim() || 'annotator_01')}
              placeholder="e.g. jiten_annotator"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="text-[11px] text-slate-400">
              Attached to all saved annotations and immutable audit trail event logs.
            </p>
          </div>
        </div>

        {/* Workflow Automation */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Sliders className="w-4 h-4 text-teal-600" />
            <span>Labeling Ergonomics</span>
          </div>

          <div className="flex items-center justify-between max-w-md">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">
                Auto-Advance on Save
              </span>
              <span className="text-[11px] text-slate-500">
                Automatically navigate to the next record immediately after pressing Save or shortcut [S].
              </span>
            </div>
            <button
              onClick={() => setAutoAdvance(!autoAdvance)}
              className={`w-11 h-6 rounded-full transition-colors p-1 cursor-pointer shrink-0 ml-4 ${
                autoAdvance ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                autoAdvance ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Reset / Reseed Baseline Data */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm text-rose-700">
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Dataset Baseline Reset</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">
                Restore Clean 100-Record Codefeast Benchmark
              </span>
              <p className="text-[11px] text-slate-500 max-w-md mt-0.5">
                Restores the initial benchmark text records, vision dataset, and gold-standard references. Clears unsaved edits from local storage.
              </p>
            </div>
            <button
              onClick={onResetBaseline}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-colors"
            >
              Reset to Benchmark Baseline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
