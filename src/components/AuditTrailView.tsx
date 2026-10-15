import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Download, 
  Filter, 
  Clock, 
  User, 
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Trash2
} from 'lucide-react';
import { AuditLogEntry } from '../types';
import { exportToCSV, exportToJSON } from '../utils/storage';

interface AuditTrailViewProps {
  logs: AuditLogEntry[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('All');

  const actions = Array.from(new Set(logs.map(l => l.action)));

  const filteredLogs = logs.filter(log => {
    if (actionFilter !== 'All' && log.action !== actionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.recordId.toLowerCase().includes(q) ||
        log.operator.toLowerCase().includes(q) ||
        (log.notes && log.notes.toLowerCase().includes(q)) ||
        (log.newValue && log.newValue.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['id', 'recordId', 'datasetId', 'action', 'operator', 'previousValue', 'newValue', 'notes', 'timestamp'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.recordId,
      l.datasetId,
      l.action,
      l.operator,
      l.previousValue || '',
      l.newValue || '',
      l.notes || '',
      l.timestamp
    ]);
    exportToCSV('Codefeast_Annotation_Audit_Trail.csv', headers, rows);
  };

  const handleExportJSON = () => {
    exportToJSON('Codefeast_Annotation_Audit_Trail.json', filteredLogs);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-blue-600" />
            Annotation Audit Trail & Revision History
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Immutable chronological ledger tracking all label updates, QA review decisions, and operator interventions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search record ID, operator, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="text-xs border border-slate-200 bg-white rounded-lg px-3 py-1.5 font-medium text-slate-700 focus:outline-none w-full sm:w-auto"
        >
          <option value="All">All Actions ({actions.length})</option>
          {actions.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Record ID</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Change Log / Diff</th>
                <th className="py-3 px-4">Auditor Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No audit records match the current criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {log.recordId}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                          log.action === 'QA Approved' ? 'bg-teal-100 text-teal-800' :
                          log.action === 'QA Rejected' ? 'bg-rose-100 text-rose-800' :
                          log.action === 'Correction Requested' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {log.operator}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono">
                          {log.previousValue && (
                            <>
                              <span className="text-slate-400 line-through truncate max-w-[120px]">{log.previousValue}</span>
                              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                            </>
                          )}
                          <span className="text-slate-900 font-semibold truncate max-w-[180px]">{log.newValue || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-sm text-slate-600 text-[11px] italic">
                        {log.notes || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
