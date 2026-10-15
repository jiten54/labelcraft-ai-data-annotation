import React from 'react';
import { 
  Database, 
  Search, 
  HelpCircle, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle,
  Keyboard
} from 'lucide-react';
import { Dataset } from '../types';

interface HeaderProps {
  datasets: Dataset[];
  selectedDatasetId: string;
  onSelectDataset: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenShortcuts: () => void;
  onResetData: () => void;
  totalAnnotated: number;
  totalRecords: number;
}

export const Header: React.FC<HeaderProps> = ({
  datasets,
  selectedDatasetId,
  onSelectDataset,
  searchQuery,
  onSearchChange,
  onOpenShortcuts,
  onResetData,
  totalAnnotated,
  totalRecords
}) => {
  const currentDataset = datasets.find(d => d.id === selectedDatasetId) || datasets[0];
  const progressPercent = totalRecords > 0 ? Math.round((totalAnnotated / totalRecords) * 100) : 0;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10 shadow-xs">
      {/* Left: Dataset Selector & Scope */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 transition-colors py-1.5 px-3 rounded-lg border border-slate-200 text-xs text-slate-700 font-medium">
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-slate-500 font-normal">Active Dataset:</span>
          <select
            value={selectedDatasetId}
            onChange={(e) => onSelectDataset(e.target.value)}
            className="bg-transparent font-semibold text-slate-900 border-none outline-none cursor-pointer pr-1"
          >
            {datasets.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.type.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Synthetic Data tag */}
        {currentDataset?.isSynthetic && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Synthetic Benchmark Records
          </span>
        )}
      </div>

      {/* Middle: Search Box */}
      <div className="hidden md:flex items-center relative w-72">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search records, labels, notes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 text-xs text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Right: Progress & Utility Actions */}
      <div className="flex items-center gap-3">
        {/* Progress Mini Pill */}
        <div className="hidden lg:flex items-center gap-2.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="text-right">
            <div className="text-[11px] font-bold text-slate-800">
              {totalAnnotated} / {totalRecords} ({progressPercent}%)
            </div>
            <div className="text-[9px] text-slate-500 font-medium">Batch Progress</div>
          </div>
          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Keyboard Shortcuts Trigger */}
        <button
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts [?]"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Keyboard className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Shortcuts</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-200 text-slate-700 rounded font-mono font-bold">?</kbd>
        </button>

        {/* Reset / Reseed Benchmark Button */}
        <button
          onClick={onResetData}
          title="Reset to clean baseline sample datasets"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-amber-700 hover:bg-amber-50 hover:border-amber-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Reset Baseline</span>
        </button>
      </div>
    </header>
  );
};
