import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  AlertOctagon, 
  CheckCircle, 
  AlertTriangle, 
  Database,
  Trash2,
  Eye,
  FileCheck,
  RefreshCw,
  Plus,
  Info
} from 'lucide-react';
import { Dataset, TextRecord, ImageRecord } from '../types';
import { parseCSVString, exportToCSV, exportToJSON } from '../utils/storage';

interface DatasetManagerProps {
  datasets: Dataset[];
  textRecords: TextRecord[];
  imageRecords: ImageRecord[];
  onImportTextDataset: (newDataset: Dataset, newRecords: TextRecord[]) => void;
  onImportImageDataset: (newDataset: Dataset, newRecords: ImageRecord[]) => void;
  onDeleteDataset: (datasetId: string) => void;
  onSelectDataset: (id: string) => void;
  selectedDatasetId: string;
}

export const DatasetManager: React.FC<DatasetManagerProps> = ({
  datasets,
  textRecords,
  imageRecords,
  onImportTextDataset,
  onImportImageDataset,
  onDeleteDataset,
  onSelectDataset,
  selectedDatasetId
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [datasetName, setDatasetName] = useState('');
  const [datasetDesc, setDatasetDesc] = useState('');
  
  // Staged import states
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<'csv' | 'json'>('csv');
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ row: number; message: string }[]>([]);
  const [parsedTextRecords, setParsedTextRecords] = useState<TextRecord[]>([]);
  const [parsedImageRecords, setParsedImageRecords] = useState<ImageRecord[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const isJson = file.name.endsWith('.json');
    setFileType(isJson ? 'json' : 'csv');
    setIsParsing(true);
    setValidationErrors([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
      validateAndParseFile(text, isJson ? 'json' : 'csv', activeTab);
      setIsParsing(false);
    };
    reader.onerror = () => {
      setValidationErrors([{ row: 0, message: 'Failed to read file from disk.' }]);
      setIsParsing(false);
    };
    reader.readAsText(file);
  };

  const validateAndParseFile = (raw: string, format: 'csv' | 'json', targetType: 'text' | 'image') => {
    const errors: { row: number; message: string }[] = [];
    const newTextRecs: TextRecord[] = [];
    const newImageRecs: ImageRecord[] = [];
    const seenIds = new Set<string>();

    if (format === 'json') {
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
          errors.push({ row: 0, message: 'JSON root must be an array of record objects.' });
          setValidationErrors(errors);
          return;
        }

        if (parsed.length === 0) {
          errors.push({ row: 0, message: 'JSON array is empty.' });
          setValidationErrors(errors);
          return;
        }

        const headers = Object.keys(parsed[0] || {});
        setPreviewHeaders(headers);
        setPreviewRows(parsed.slice(0, 5));

        parsed.forEach((item, idx) => {
          const rowNum = idx + 1;
          const id = item.id || item.record_id || item.ID;

          if (!id) {
            errors.push({ row: rowNum, message: 'Missing required field: "id"' });
          } else if (seenIds.has(String(id))) {
            errors.push({ row: rowNum, message: `Duplicate record ID "${id}" detected.` });
          } else {
            seenIds.add(String(id));
          }

          if (targetType === 'text') {
            const textVal = item.text || item.content || item.sentence;
            if (textVal === undefined || textVal === null || String(textVal).trim() === '') {
              errors.push({ row: rowNum, message: 'Missing or empty required field: "text"' });
            }
            newTextRecs.push({
              id: String(id || `GEN-${idx}`),
              datasetId: 'pending',
              text: String(textVal || ''),
              status: 'Unlabeled'
            });
          } else {
            const urlVal = item.imageUrl || item.image_url || item.url || item.path;
            if (!urlVal || String(urlVal).trim() === '') {
              errors.push({ row: rowNum, message: 'Missing required image link field: "image_url"' });
            }
            newImageRecs.push({
              id: String(id || `IMG-${idx}`),
              datasetId: 'pending',
              imageUrl: String(urlVal || ''),
              title: item.title || `Imported Image #${rowNum}`,
              boundingBoxes: [],
              status: 'Unlabeled'
            });
          }
        });

        setValidationErrors(errors);
        setParsedTextRecords(newTextRecs);
        setParsedImageRecords(newImageRecs);
      } catch (e: any) {
        errors.push({ row: 0, message: `JSON syntax error: ${e.message}` });
        setValidationErrors(errors);
      }
    } else {
      // CSV format
      const result = parseCSVString(raw);
      setPreviewHeaders(result.headers);
      setPreviewRows(result.rows.slice(0, 5));

      // Append structural CSV parsing errors
      errors.push(...result.errors);

      // Validate required columns based on target dataset type
      const lowerHeaders = result.headers.map(h => h.toLowerCase());
      const hasId = lowerHeaders.some(h => ['id', 'record_id', 'recordid'].includes(h));
      
      if (!hasId) {
        errors.push({ row: 1, message: 'Required column "id" not found in CSV header row.' });
      }

      if (targetType === 'text') {
        const hasText = lowerHeaders.some(h => ['text', 'content', 'sentence', 'data'].includes(h));
        if (!hasText) {
          errors.push({ row: 1, message: 'Required column "text" not found in CSV header row.' });
        }

        result.rows.forEach((row, idx) => {
          const rowNum = idx + 2;
          const id = row['id'] || row['ID'] || row['record_id'];
          const text = row['text'] || row['content'] || row['sentence'] || row['data'];

          if (text === undefined || text === null || text.trim() === '') {
            errors.push({ row: rowNum, message: 'Empty text field detected.' });
          }

          newTextRecs.push({
            id: id || `TX-${rowNum}`,
            datasetId: 'pending',
            text: text || '',
            status: 'Unlabeled'
          });
        });
      } else {
        const hasUrl = lowerHeaders.some(h => ['image_url', 'imageurl', 'url', 'image_path', 'path'].includes(h));
        if (!hasUrl) {
          errors.push({ row: 1, message: 'Required column "image_url" not found in manifest CSV header.' });
        }

        result.rows.forEach((row, idx) => {
          const rowNum = idx + 2;
          const id = row['id'] || row['ID'] || row['record_id'];
          const url = row['image_url'] || row['imageurl'] || row['url'] || row['path'];

          if (!url || url.trim() === '') {
            errors.push({ row: rowNum, message: 'Empty image URL manifest link.' });
          }

          newImageRecs.push({
            id: id || `IMG-${rowNum}`,
            datasetId: 'pending',
            imageUrl: url || '',
            title: row['title'] || `Imported Manifest #${rowNum}`,
            boundingBoxes: [],
            status: 'Unlabeled'
          });
        });
      }

      setValidationErrors(errors);
      setParsedTextRecords(newTextRecs);
      setParsedImageRecords(newImageRecs);
    }
  };

  const handleConfirmImport = () => {
    if (validationErrors.length > 0) return;

    const datasetId = `ds-${Date.now()}`;
    const newDataset: Dataset = {
      id: datasetId,
      name: datasetName.trim() || `${activeTab === 'text' ? 'Text' : 'Image'} Dataset (${new Date().toLocaleDateString()})`,
      description: datasetDesc.trim() || `User imported dataset from ${fileName}`,
      type: activeTab,
      createdDate: new Date().toISOString().split('T')[0],
      recordCount: activeTab === 'text' ? parsedTextRecords.length : parsedImageRecords.length,
      annotatedCount: 0,
      hasGoldStandard: false,
      isSynthetic: false
    };

    if (activeTab === 'text') {
      const recordsWithDatasetId = parsedTextRecords.map(r => ({ ...r, datasetId }));
      onImportTextDataset(newDataset, recordsWithDatasetId);
    } else {
      const recordsWithDatasetId = parsedImageRecords.map(r => ({ ...r, datasetId }));
      onImportImageDataset(newDataset, recordsWithDatasetId);
    }

    // Reset modal state
    setIsModalOpen(false);
    setFileContent(null);
    setFileName('');
    setPreviewHeaders([]);
    setPreviewRows([]);
    setValidationErrors([]);
    setDatasetName('');
    setDatasetDesc('');
  };

  // Sample Download Handlers
  const handleDownloadSampleTextCSV = () => {
    const headers = ['id', 'text', 'metadata_domain', 'metadata_language'];
    const rows = [
      ['SMP-001', 'The latency dropped by 35% after the server migration.', 'Technology', 'en'],
      ['SMP-002', 'Customer support answered promptly and resolved my billing issue.', 'Finance', 'en'],
      ['SMP-003', 'Course syllabus requires three weekly laboratory sessions.', 'Education', 'en'],
      ['SMP-004', 'Blood pressure monitoring cuff cuff is simple to calibrate.', 'Healthcare', 'en'],
      ['SMP-005', 'Yeah right, because losing 4 hours of unsaved work is amazing.', 'Technology', 'en']
    ];
    exportToCSV('sample_text_dataset_template.csv', headers, rows);
  };

  const handleDownloadSampleImageManifestCSV = () => {
    const headers = ['id', 'image_url', 'title', 'expected_category'];
    const rows = [
      ['IMG-SMP-01', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80', 'Developer Laptop Display', 'Technology & Devices'],
      ['IMG-SMP-02', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', 'Open Modern Office', 'Workplace & Office'],
      ['IMG-SMP-03', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80', 'Physician with Tablet', 'Healthcare & Medical']
    ];
    exportToCSV('sample_image_manifest_template.csv', headers, rows);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Database className="w-6 h-6 text-blue-600" />
            Dataset Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Import, validate, preview, and organize text and vision datasets for labeling.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={handleDownloadSampleTextCSV}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-white rounded transition-colors flex items-center gap-1 cursor-pointer"
              title="Download clean CSV sample template for text labeling"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Sample Text CSV</span>
            </button>
            <button
              onClick={handleDownloadSampleImageManifestCSV}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-white rounded transition-colors flex items-center gap-1 cursor-pointer"
              title="Download image manifest template"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span>Sample Manifest CSV</span>
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import Dataset</span>
          </button>
        </div>
      </div>

      {/* Datasets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Loaded Datasets ({datasets.length})</h3>
          <span className="text-xs text-slate-500">Active dataset selected for current workspace</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Dataset Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Records</th>
                <th className="py-3 px-4">Annotated</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Ground Truth</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {datasets.map((d) => {
                const isSelected = d.id === selectedDatasetId;
                const recCount = d.type === 'text' 
                  ? textRecords.filter(r => r.datasetId === d.id).length || d.recordCount
                  : imageRecords.filter(r => r.datasetId === d.id).length || d.recordCount;
                const annCount = d.type === 'text'
                  ? textRecords.filter(r => r.datasetId === d.id && (r.status === 'Annotated' || r.status === 'Approved')).length
                  : imageRecords.filter(r => r.datasetId === d.id && (r.status === 'Annotated' || r.status === 'Approved')).length;
                const percent = recCount > 0 ? Math.round((annCount / recCount) * 100) : 0;

                return (
                  <tr key={d.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" title="Active Dataset"></span>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900">{d.name}</div>
                          <div className="text-[11px] text-slate-500 max-w-md truncate">{d.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        d.type === 'text' 
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {d.type === 'text' ? <FileText className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                        {d.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">{recCount}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{annCount} ({percent}%)</span>
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{d.createdDate}</td>
                    <td className="py-3.5 px-4">
                      {d.hasGoldStandard ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3 text-teal-600" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectDataset(d.id)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Select'}
                        </button>
                        {datasets.length > 1 && (
                          <button
                            onClick={() => onDeleteDataset(d.id)}
                            title="Delete Dataset"
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Import New Dataset</h3>
                <p className="text-xs text-slate-500">
                  Select dataset modality, upload file, and validate schema before ingestion.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Modality Selector */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('text');
                  if (fileContent) validateAndParseFile(fileContent, fileType, 'text');
                }}
                className={`flex-1 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  activeTab === 'text'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Text Dataset
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  CSV or JSON with required columns: <code className="font-mono text-slate-700">id, text</code>
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('image');
                  if (fileContent) validateAndParseFile(fileContent, fileType, 'image');
                }}
                className={`flex-1 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  activeTab === 'image'
                    ? 'border-teal-600 bg-teal-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                  <ImageIcon className="w-4 h-4 text-teal-600" />
                  Image Manifest
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  CSV or JSON with required columns: <code className="font-mono text-slate-700">id, image_url</code>
                </p>
              </button>
            </div>

            {/* Dataset metadata inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dataset Title</label>
                <input
                  type="text"
                  placeholder="e.g. Codefeast Review Batch 2"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Source</label>
                <input
                  type="text"
                  placeholder="e.g. Raw user forum feedback Q1"
                  value={datasetDesc}
                  onChange={(e) => setDatasetDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* File Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 rounded-xl p-6 text-center cursor-pointer transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-800">
                {fileName ? fileName : 'Click to select CSV or JSON dataset'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Supports standard comma-separated CSV with headers or JSON array of objects
              </p>
            </div>

            {/* Validation Feedback & Preview */}
            {isParsing && (
              <div className="flex items-center justify-center p-4 text-xs text-slate-500 gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                Validating dataset schema...
              </div>
            )}

            {validationErrors.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 space-y-1.5 max-h-48 overflow-y-auto">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                  <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                  Validation Errors ({validationErrors.length})
                </div>
                <p className="text-[11px] text-rose-700">
                  The dataset cannot be imported because validation rules failed. Inspect exact row numbers below:
                </p>
                <ul className="text-[11px] text-rose-800 space-y-1 list-disc list-inside">
                  {validationErrors.map((err, i) => (
                    <li key={i}>
                      {err.row > 0 ? <strong>Row #{err.row}: </strong> : null}
                      {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {validationErrors.length === 0 && fileContent && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Validation Passed: {activeTab === 'text' ? parsedTextRecords.length : parsedImageRecords.length} records ready
                  </span>
                  <span className="text-slate-500 font-normal">Previewing first 5 rows:</span>
                </div>

                {/* Pre-import Preview Table */}
                <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-36">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                      <tr>
                        {previewHeaders.map((h, i) => (
                          <th key={i} className="py-1.5 px-3 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          {previewHeaders.map((h, i) => (
                            <td key={i} className="py-1.5 px-3 max-w-xs truncate text-slate-700">
                              {row[h] || ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={!fileContent || validationErrors.length > 0}
                className={`px-5 py-2 rounded-lg text-xs font-semibold text-white shadow-xs cursor-pointer transition-all ${
                  !fileContent || validationErrors.length > 0
                    ? 'bg-slate-300 cursor-not-allowed opacity-60'
                    : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                Import Verified Dataset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
