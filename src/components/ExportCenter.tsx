import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileJson, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Database,
  Code2,
  FileCheck,
  Sparkles
} from 'lucide-react';
import { TextRecord, ImageRecord, QAErrorItem, AuditLogEntry, Dataset } from '../types';
import { exportToCSV, exportToJSON } from '../utils/storage';

interface ExportCenterProps {
  currentDataset: Dataset;
  textRecords: TextRecord[];
  imageRecords: ImageRecord[];
  qaErrors: QAErrorItem[];
  auditLogs: AuditLogEntry[];
}

export const ExportCenter: React.FC<ExportCenterProps> = ({
  currentDataset,
  textRecords,
  imageRecords,
  qaErrors,
  auditLogs
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json'>('csv');
  const [activeTab, setActiveTab] = useState<'full' | 'approved' | 'review' | 'qa' | 'audit'>('full');

  // Exports handlers
  const handleExportFull = () => {
    if (currentDataset.type === 'text') {
      if (selectedFormat === 'csv') {
        const headers = ['id', 'datasetId', 'text', 'sentiment', 'topic', 'contentReview', 'isAmbiguous', 'status', 'notes', 'annotatedBy', 'annotatedAt'];
        const rows = textRecords.map(r => [
          r.id,
          r.datasetId,
          r.text,
          r.sentiment || '',
          r.topic || '',
          r.contentReview || '',
          r.isAmbiguous ? 'true' : 'false',
          r.status,
          r.notes || '',
          r.annotatedBy || '',
          r.annotatedAt || ''
        ]);
        exportToCSV(`${currentDataset.name.replace(/\s+/g, '_')}_full_annotations.csv`, headers, rows);
      } else {
        exportToJSON(`${currentDataset.name.replace(/\s+/g, '_')}_full_annotations.json`, textRecords);
      }
    } else {
      if (selectedFormat === 'csv') {
        const headers = ['id', 'datasetId', 'imageUrl', 'title', 'category', 'quality', 'isCorruptedOrUnclear', 'boundingBoxCount', 'status', 'notes', 'annotatedBy', 'annotatedAt'];
        const rows = imageRecords.map(r => [
          r.id,
          r.datasetId,
          r.imageUrl,
          r.title,
          r.category || '',
          r.quality || '',
          r.isCorruptedOrUnclear ? 'true' : 'false',
          r.boundingBoxes?.length || 0,
          r.status,
          r.notes || '',
          r.annotatedBy || '',
          r.annotatedAt || ''
        ]);
        exportToCSV(`${currentDataset.name.replace(/\s+/g, '_')}_vision_annotations.csv`, headers, rows);
      } else {
        exportToJSON(`${currentDataset.name.replace(/\s+/g, '_')}_vision_annotations.json`, imageRecords);
      }
    }
  };

  const handleExportApproved = () => {
    const approved = currentDataset.type === 'text'
      ? textRecords.filter(r => r.status === 'Approved' || r.status === 'Annotated')
      : imageRecords.filter(r => r.status === 'Approved' || r.status === 'Annotated');

    if (selectedFormat === 'csv') {
      if (currentDataset.type === 'text') {
        const headers = ['id', 'text', 'sentiment', 'topic', 'contentReview', 'status', 'annotatedBy', 'annotatedAt'];
        const rows = (approved as TextRecord[]).map(r => [
          r.id,
          r.text,
          r.sentiment || '',
          r.topic || '',
          r.contentReview || '',
          r.status,
          r.annotatedBy || '',
          r.annotatedAt || ''
        ]);
        exportToCSV(`${currentDataset.name.replace(/\s+/g, '_')}_approved_clean.csv`, headers, rows);
      } else {
        const headers = ['id', 'imageUrl', 'category', 'quality', 'boundingBoxCount', 'status'];
        const rows = (approved as ImageRecord[]).map(r => [
          r.id,
          r.imageUrl,
          r.category || '',
          r.quality || '',
          r.boundingBoxes?.length || 0,
          r.status
        ]);
        exportToCSV(`${currentDataset.name.replace(/\s+/g, '_')}_approved_vision.csv`, headers, rows);
      }
    } else {
      exportToJSON(`${currentDataset.name.replace(/\s+/g, '_')}_approved.json`, approved);
    }
  };

  const handleExportReviewQueue = () => {
    const reviewQueue = currentDataset.type === 'text'
      ? textRecords.filter(r => r.status === 'Needs Review' || r.isAmbiguous)
      : imageRecords.filter(r => r.status === 'Needs Review' || r.isCorruptedOrUnclear);

    if (selectedFormat === 'csv') {
      const headers = ['id', 'content', 'status', 'isAmbiguous', 'notes', 'annotatedBy'];
      const rows = reviewQueue.map(r => [
        r.id,
        (r as any).text || (r as any).imageUrl,
        r.status,
        (r as any).isAmbiguous ? 'true' : 'false',
        r.notes || '',
        r.annotatedBy || ''
      ]);
      exportToCSV(`${currentDataset.name.replace(/\s+/g, '_')}_review_queue.csv`, headers, rows);
    } else {
      exportToJSON(`${currentDataset.name.replace(/\s+/g, '_')}_review_queue.json`, reviewQueue);
    }
  };

  const handleExportQAReport = () => {
    if (selectedFormat === 'csv') {
      const headers = ['id', 'recordId', 'recordType', 'severity', 'category', 'description', 'suggestedAction', 'detectedAt'];
      const rows = qaErrors.map(e => [
        e.id,
        e.recordId,
        e.recordType,
        e.severity,
        e.category,
        e.description,
        e.suggestedAction,
        e.detectedAt
      ]);
      exportToCSV('QA_Defect_Inspection_Report.csv', headers, rows);
    } else {
      exportToJSON('QA_Defect_Inspection_Report.json', qaErrors);
    }
  };

  // Generate preview snippet
  const getPreviewSnippet = () => {
    if (selectedFormat === 'json') {
      const sample = currentDataset.type === 'text' ? textRecords[0] : imageRecords[0];
      return JSON.stringify([sample], null, 2);
    } else {
      if (currentDataset.type === 'text') {
        const r = textRecords[0];
        return `id,datasetId,text,sentiment,topic,contentReview,status\n"${r?.id}","${r?.datasetId}","${r?.text?.substring(0, 45)}...","${r?.sentiment}","${r?.topic}","${r?.contentReview}","${r?.status}"`;
      } else {
        const r = imageRecords[0];
        return `id,imageUrl,category,quality,boundingBoxCount,status\n"${r?.id}","${r?.imageUrl?.substring(0, 35)}...","${r?.category}","${r?.quality}",${r?.boundingBoxes?.length || 0},"${r?.status}"`;
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Download className="w-6 h-6 text-blue-600" />
            Dataset & QA Export Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Package verified annotations, review queues, and QA compliance reports into standard CSV and JSON.
          </p>
        </div>

        {/* Global Format Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setSelectedFormat('csv')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              selectedFormat === 'csv'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>CSV Table</span>
          </button>
          <button
            onClick={() => setSelectedFormat('json')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              selectedFormat === 'json'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileJson className="w-3.5 h-3.5 text-blue-600" />
            <span>Structured JSON</span>
          </button>
        </div>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Full Dataset Export */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-400 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Full Annotated Dataset</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Complete batch with original text, final labels, annotator metadata, and audit status.
            </p>
            <div className="mt-3 text-[11px] font-mono text-slate-400">
              {currentDataset.type === 'text' ? textRecords.length : imageRecords.length} Total Records
            </div>
          </div>
          <button
            onClick={handleExportFull}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Full ({selectedFormat.toUpperCase()})</span>
          </button>
        </div>

        {/* Clean Approved Records Only */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-400 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Approved Records Only</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Filtered clean dataset containing only verified, annotated, or approved records ready for model training.
            </p>
            <div className="mt-3 text-[11px] font-mono text-teal-600">
              {currentDataset.type === 'text' 
                ? textRecords.filter(r => r.status === 'Approved' || r.status === 'Annotated').length
                : imageRecords.filter(r => r.status === 'Approved' || r.status === 'Annotated').length} Clean Records
            </div>
          </div>
          <button
            onClick={handleExportApproved}
            className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Clean ({selectedFormat.toUpperCase()})</span>
          </button>
        </div>

        {/* Needs-Review Queue Handoff */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-400 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Needs-Review Queue</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Ambiguous, skipped, and flagged records formatted for senior supervisor adjudication.
            </p>
            <div className="mt-3 text-[11px] font-mono text-amber-600">
              {currentDataset.type === 'text'
                ? textRecords.filter(r => r.status === 'Needs Review' || r.isAmbiguous).length
                : imageRecords.filter(r => r.status === 'Needs Review' || r.isCorruptedOrUnclear).length} Queued Items
            </div>
          </div>
          <button
            onClick={handleExportReviewQueue}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Review Queue</span>
          </button>
        </div>

        {/* QA Compliance & Defects Report */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-rose-400 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">QA Defect Audit Report</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Complete list of detected missing annotations, contradictions, duplicate IDs, and review decisions.
            </p>
            <div className="mt-3 text-[11px] font-mono text-rose-600">
              {qaErrors.length} Flagged Defects
            </div>
          </div>
          <button
            onClick={handleExportQAReport}
            className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export QA Report</span>
          </button>
        </div>
      </div>

      {/* Live Schema & Preview Inspector */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-slate-600" />
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Output Schema & Payload Live Preview ({selectedFormat.toUpperCase()})
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">First record serialized</span>
        </div>

        <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-64">
          <pre>{getPreviewSnippet()}</pre>
        </div>
      </div>
    </div>
  );
};
