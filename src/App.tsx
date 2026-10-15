import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { DatasetManager } from './components/DatasetManager';
import { TextAnnotator } from './components/TextAnnotator';
import { ImageAnnotator } from './components/ImageAnnotator';
import { QualityAssurance } from './components/QualityAssurance';
import { GuidelinesView } from './components/GuidelinesView';
import { EvaluationView } from './components/EvaluationView';
import { AuditTrailView } from './components/AuditTrailView';
import { ExportCenter } from './components/ExportCenter';
import { ShortcutsModal } from './components/ShortcutsModal';
import { SettingsModal } from './components/SettingsModal';
import { 
  getStoredDatasets, 
  saveDatasets, 
  getStoredTextRecords, 
  saveTextRecords, 
  getStoredImageRecords, 
  saveImageRecords, 
  getStoredAuditLogs, 
  addAuditLog, 
  resetAllToSampleData 
} from './utils/storage';
import { runQAInspectionOnDataset } from './utils/qaEngine';
import { calculateGoldStandardMetrics } from './utils/metrics';
import { Dataset, TextRecord, ImageRecord, AuditLogEntry } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [textRecords, setTextRecords] = useState<TextRecord[]>([]);
  const [imageRecords, setImageRecords] = useState<ImageRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  
  // Search & shortcuts
  const [searchQuery, setSearchQuery] = useState('');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [annotatorId, setAnnotatorId] = useState(() => localStorage.getItem('labelcraft_operator_id') || 'annotator_01');
  const [autoAdvance, setAutoAdvance] = useState(() => localStorage.getItem('labelcraft_auto_advance') !== 'false');

  // Load from persistent storage on mount
  useEffect(() => {
    const loadedDatasets = getStoredDatasets();
    setDatasets(loadedDatasets);
    setSelectedDatasetId(loadedDatasets[0]?.id || '');
    setTextRecords(getStoredTextRecords());
    setImageRecords(getStoredImageRecords());
    setAuditLogs(getStoredAuditLogs());
  }, []);

  // Save changes to localStorage
  const handleSaveAnnotatorId = (id: string) => {
    setAnnotatorId(id);
    localStorage.setItem('labelcraft_operator_id', id);
  };

  const handleSaveAutoAdvance = (val: boolean) => {
    setAutoAdvance(val);
    localStorage.setItem('labelcraft_auto_advance', String(val));
  };

  // Active dataset
  const currentDataset = useMemo(() => {
    return datasets.find(d => d.id === selectedDatasetId) || datasets[0] || {
      id: 'default',
      name: 'Default Workspace',
      description: 'Default dataset',
      type: 'text' as const,
      createdDate: '2026-03-10',
      recordCount: 0,
      annotatedCount: 0,
      hasGoldStandard: false,
      isSynthetic: false
    };
  }, [datasets, selectedDatasetId]);

  // Filter records by dataset and search query
  const datasetTextRecords = useMemo(() => {
    let list = textRecords.filter(r => r.datasetId === currentDataset.id);
    if (list.length === 0 && currentDataset.type === 'text') list = textRecords;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => 
        r.id.toLowerCase().includes(q) ||
        r.text.toLowerCase().includes(q) ||
        r.sentiment?.toLowerCase().includes(q) ||
        r.topic?.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [textRecords, currentDataset, searchQuery]);

  const datasetImageRecords = useMemo(() => {
    let list = imageRecords.filter(r => r.datasetId === currentDataset.id);
    if (list.length === 0 && currentDataset.type === 'image') list = imageRecords;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => 
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [imageRecords, currentDataset, searchQuery]);

  // Automated QA Errors calculation
  const qaErrors = useMemo(() => {
    return runQAInspectionOnDataset(textRecords, imageRecords);
  }, [textRecords, imageRecords]);

  // Gold Standard Metrics calculation
  const evaluationMetrics = useMemo(() => {
    return calculateGoldStandardMetrics(textRecords);
  }, [textRecords]);

  // Counts for Sidebar Badges
  const unlabeledCount = useMemo(() => {
    return textRecords.filter(r => r.status === 'Unlabeled' || r.status === 'In Progress').length;
  }, [textRecords]);

  const needsReviewCount = useMemo(() => {
    return textRecords.filter(r => r.status === 'Needs Review').length + 
           imageRecords.filter(r => r.status === 'Needs Review').length;
  }, [textRecords, imageRecords]);

  // Global keyboard shortcuts (such as '?')
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === '?') {
        setIsShortcutsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Update a Text Record
  const handleSaveTextRecord = useCallback((updatedRecord: TextRecord, auditReason?: string) => {
    const oldRec = textRecords.find(r => r.id === updatedRecord.id);
    const updatedList = textRecords.map(r => r.id === updatedRecord.id ? updatedRecord : r);
    setTextRecords(updatedList);
    saveTextRecords(updatedList);

    // Record audit trail entry
    addAuditLog({
      recordId: updatedRecord.id,
      datasetId: updatedRecord.datasetId,
      action: 'Updated Annotation',
      operator: annotatorId,
      previousValue: oldRec ? `[${oldRec.sentiment || 'None'}] - [${oldRec.topic || 'None'}]` : 'Unlabeled',
      newValue: `[${updatedRecord.sentiment || 'None'}] - [${updatedRecord.topic || 'None'}]`,
      notes: auditReason || updatedRecord.notes
    });
    setAuditLogs(getStoredAuditLogs());
  }, [textRecords, annotatorId]);

  // Update an Image Record
  const handleSaveImageRecord = useCallback((updatedRecord: ImageRecord, auditReason?: string) => {
    const oldRec = imageRecords.find(r => r.id === updatedRecord.id);
    const updatedList = imageRecords.map(r => r.id === updatedRecord.id ? updatedRecord : r);
    setImageRecords(updatedList);
    saveImageRecords(updatedList);

    addAuditLog({
      recordId: updatedRecord.id,
      datasetId: updatedRecord.datasetId,
      action: 'Updated Annotation',
      operator: annotatorId,
      previousValue: oldRec ? `${oldRec.category || 'None'} (${oldRec.boundingBoxes?.length || 0} boxes)` : 'Unlabeled',
      newValue: `${updatedRecord.category || 'None'} (${updatedRecord.boundingBoxes?.length || 0} boxes)`,
      notes: auditReason || updatedRecord.notes
    });
    setAuditLogs(getStoredAuditLogs());
  }, [imageRecords, annotatorId]);

  // QA Review Decisions (Approve, Reject, Correction Requested)
  const handleReviewDecision = useCallback((
    recordId: string, 
    recordType: 'text' | 'image', 
    decision: 'Approved' | 'Rejected' | 'Correction Requested', 
    reason: string
  ) => {
    const actionLabel = decision === 'Approved' ? 'QA Approved' : decision === 'Rejected' ? 'QA Rejected' : 'Correction Requested';

    if (recordType === 'text') {
      const rec = textRecords.find(r => r.id === recordId);
      const updatedList = textRecords.map(r => {
        if (r.id === recordId) {
          return {
            ...r,
            status: decision === 'Approved' ? ('Approved' as const) : decision === 'Rejected' ? ('Rejected' as const) : ('Needs Review' as const),
            reviewDecision: {
              status: decision,
              reviewer: annotatorId,
              reason,
              timestamp: new Date().toISOString()
            }
          };
        }
        return r;
      });
      setTextRecords(updatedList);
      saveTextRecords(updatedList);
    } else {
      const updatedList = imageRecords.map(r => {
        if (r.id === recordId) {
          return {
            ...r,
            status: decision === 'Approved' ? ('Approved' as const) : decision === 'Rejected' ? ('Rejected' as const) : ('Needs Review' as const),
            reviewDecision: {
              status: decision,
              reviewer: annotatorId,
              reason,
              timestamp: new Date().toISOString()
            }
          };
        }
        return r;
      });
      setImageRecords(updatedList);
      saveImageRecords(updatedList);
    }

    addAuditLog({
      recordId,
      datasetId: currentDataset.id,
      action: actionLabel,
      operator: annotatorId,
      previousValue: 'Status: Needs Review',
      newValue: `Decision: ${decision}`,
      notes: reason
    });
    setAuditLogs(getStoredAuditLogs());
  }, [textRecords, imageRecords, annotatorId, currentDataset.id]);

  // Import New Text Dataset
  const handleImportTextDataset = (newDataset: Dataset, newRecords: TextRecord[]) => {
    const updatedDatasets = [...datasets, newDataset];
    const updatedText = [...textRecords, ...newRecords];
    setDatasets(updatedDatasets);
    saveDatasets(updatedDatasets);
    setTextRecords(updatedText);
    saveTextRecords(updatedText);
    setSelectedDatasetId(newDataset.id);
    setActiveTab('text-annotation');

    addAuditLog({
      recordId: newDataset.id,
      datasetId: newDataset.id,
      action: 'Created',
      operator: annotatorId,
      newValue: `Imported Text Dataset with ${newRecords.length} records`,
      notes: `Ingested ${newDataset.name}`
    });
    setAuditLogs(getStoredAuditLogs());
  };

  // Import New Image Dataset
  const handleImportImageDataset = (newDataset: Dataset, newRecords: ImageRecord[]) => {
    const updatedDatasets = [...datasets, newDataset];
    const updatedImage = [...imageRecords, ...newRecords];
    setDatasets(updatedDatasets);
    saveDatasets(updatedDatasets);
    setImageRecords(updatedImage);
    saveImageRecords(updatedImage);
    setSelectedDatasetId(newDataset.id);
    setActiveTab('image-annotation');

    addAuditLog({
      recordId: newDataset.id,
      datasetId: newDataset.id,
      action: 'Created',
      operator: annotatorId,
      newValue: `Imported Vision Manifest with ${newRecords.length} records`,
      notes: `Ingested ${newDataset.name}`
    });
    setAuditLogs(getStoredAuditLogs());
  };

  // Delete Dataset
  const handleDeleteDataset = (id: string) => {
    const filtered = datasets.filter(d => d.id !== id);
    setDatasets(filtered);
    saveDatasets(filtered);
    if (selectedDatasetId === id) {
      setSelectedDatasetId(filtered[0]?.id || '');
    }
  };

  // Reset to Baseline Data
  const handleResetBaseline = () => {
    if (window.confirm('Are you sure you want to restore the pristine 100-record benchmark and reset local edits?')) {
      resetAllToSampleData();
      const freshDatasets = getStoredDatasets();
      setDatasets(freshDatasets);
      setSelectedDatasetId(freshDatasets[0]?.id || '');
      setTextRecords(getStoredTextRecords());
      setImageRecords(getStoredImageRecords());
      setAuditLogs(getStoredAuditLogs());
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans antialiased text-slate-800 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unlabeledCount={unlabeledCount}
        qaErrorCount={qaErrors.length}
        needsReviewCount={needsReviewCount}
        annotatorId={annotatorId}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <Header
          datasets={datasets}
          selectedDatasetId={selectedDatasetId}
          onSelectDataset={setSelectedDatasetId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onResetData={handleResetBaseline}
          totalAnnotated={textRecords.filter(r => r.status === 'Annotated' || r.status === 'Approved').length}
          totalRecords={textRecords.length}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/70">
          {activeTab === 'dashboard' && (
            <Dashboard
              datasets={datasets}
              textRecords={textRecords}
              imageRecords={imageRecords}
              qaErrors={qaErrors}
              evaluationMetrics={evaluationMetrics}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'datasets' && (
            <DatasetManager
              datasets={datasets}
              textRecords={textRecords}
              imageRecords={imageRecords}
              onImportTextDataset={handleImportTextDataset}
              onImportImageDataset={handleImportImageDataset}
              onDeleteDataset={handleDeleteDataset}
              onSelectDataset={(id) => {
                setSelectedDatasetId(id);
                const d = datasets.find(item => item.id === id);
                if (d?.type === 'text') setActiveTab('text-annotation');
                else if (d?.type === 'image') setActiveTab('image-annotation');
              }}
              selectedDatasetId={selectedDatasetId}
            />
          )}

          {activeTab === 'text-annotation' && (
            <TextAnnotator
              records={datasetTextRecords}
              onSaveRecord={handleSaveTextRecord}
              annotatorId={annotatorId}
              autoAdvance={autoAdvance}
            />
          )}

          {activeTab === 'image-annotation' && (
            <ImageAnnotator
              records={datasetImageRecords}
              onSaveRecord={handleSaveImageRecord}
              annotatorId={annotatorId}
            />
          )}

          {activeTab === 'qa' && (
            <QualityAssurance
              qaErrors={qaErrors}
              textRecords={textRecords}
              imageRecords={imageRecords}
              onReviewDecision={handleReviewDecision}
              reviewerId={annotatorId}
            />
          )}

          {activeTab === 'guidelines' && (
            <GuidelinesView />
          )}

          {activeTab === 'evaluation' && (
            <EvaluationView
              records={textRecords}
              metrics={evaluationMetrics}
            />
          )}

          {activeTab === 'audit' && (
            <AuditTrailView logs={auditLogs} />
          )}

          {activeTab === 'export' && (
            <ExportCenter
              currentDataset={currentDataset}
              textRecords={datasetTextRecords}
              imageRecords={datasetImageRecords}
              qaErrors={qaErrors}
              auditLogs={auditLogs}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsModal
              annotatorId={annotatorId}
              setAnnotatorId={handleSaveAnnotatorId}
              autoAdvance={autoAdvance}
              setAutoAdvance={handleSaveAutoAdvance}
              onResetBaseline={handleResetBaseline}
            />
          )}
        </main>
      </div>

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
