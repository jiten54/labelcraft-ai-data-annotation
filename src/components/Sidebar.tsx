import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  FileText, 
  Image as ImageIcon, 
  ShieldCheck, 
  BookOpen, 
  BarChart3, 
  History, 
  Download, 
  Settings,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'datasets' 
  | 'text-annotation' 
  | 'image-annotation' 
  | 'qa' 
  | 'guidelines' 
  | 'evaluation' 
  | 'audit' 
  | 'export' 
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  unlabeledCount: number;
  qaErrorCount: number;
  needsReviewCount: number;
  annotatorId: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unlabeledCount,
  qaErrorCount,
  needsReviewCount,
  annotatorId
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'datasets' as NavTab, label: 'Datasets', icon: Database },
    { 
      id: 'text-annotation' as NavTab, 
      label: 'Text Annotation', 
      icon: FileText,
      badge: unlabeledCount > 0 ? `${unlabeledCount}` : undefined,
      badgeColor: 'bg-blue-600'
    },
    { id: 'image-annotation' as NavTab, label: 'Image Annotation', icon: ImageIcon },
    { 
      id: 'qa' as NavTab, 
      label: 'Quality Assurance', 
      icon: ShieldCheck,
      badge: qaErrorCount > 0 ? `${qaErrorCount}` : undefined,
      badgeColor: 'bg-amber-600'
    },
    { id: 'guidelines' as NavTab, label: 'Annotation Guidelines', icon: BookOpen },
    { id: 'evaluation' as NavTab, label: 'Gold-Standard Metrics', icon: BarChart3 },
    { id: 'audit' as NavTab, label: 'Audit Trail', icon: History },
    { id: 'export' as NavTab, label: 'Export Center', icon: Download },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen select-none shrink-0 text-slate-300">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-tight text-base">LabelCraft</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-semibold bg-teal-500/20 text-teal-400 border border-teal-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Data Annotation & QA</p>
          </div>
        </div>
        <div className="mt-3 px-2 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-[11px]">QA Engine Active</span>
          </div>
          <span className="text-[10px] text-slate-400">Codefeast Spec</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Workspace Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full text-white font-semibold ${item.badgeColor || 'bg-slate-700'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile & Settings Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90">
        <div className="flex items-center justify-between px-2 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
              {annotatorId.substring(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{annotatorId}</p>
              <p className="text-[10px] text-teal-400 truncate font-mono">Data Annotator</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            title="Workspace Settings"
            className={`p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors ${
              activeTab === 'settings' ? 'text-white bg-slate-700' : ''
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
