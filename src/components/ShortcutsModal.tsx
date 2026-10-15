import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { section: 'Sentiment Classification', keys: [
      { key: '1', action: 'Select Positive Sentiment' },
      { key: '2', action: 'Select Negative Sentiment' },
      { key: '3', action: 'Select Neutral Sentiment' },
      { key: '4', action: 'Select Unclear Sentiment' },
    ]},
    { section: 'Topic Classification', keys: [
      { key: 'Q', action: 'Select Technology' },
      { key: 'W', action: 'Select Education' },
      { key: 'E', action: 'Select Healthcare' },
      { key: 'R', action: 'Select Finance' },
      { key: 'T', action: 'Select Entertainment' },
      { key: 'Y', action: 'Select Other' },
    ]},
    { section: 'Workflow & Navigation', keys: [
      { key: 'S', action: 'Save Annotation & Advance' },
      { key: 'A', action: 'Toggle Ambiguous / Sarcasm Flag' },
      { key: 'N', action: 'Navigate to Next Record' },
      { key: 'P', action: 'Navigate to Previous Record' },
      { key: 'G', action: 'Open / Close Embedded Guidelines' },
      { key: '?', action: 'Toggle this Shortcuts Guide' },
    ]},
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 shadow-2xl animate-scaleIn">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Keyboard Power Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {shortcuts.map((group) => (
            <div key={group.section} className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {group.section}
              </h4>
              <div className="space-y-1.5">
                {group.keys.map((s) => (
                  <div key={s.key} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <span className="text-slate-700">{s.action}</span>
                    <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-900 font-mono font-bold shadow-xs">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
