import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Trash2, 
  Eye, 
  Plus, 
  AlertTriangle, 
  Check, 
  Tag, 
  Layers, 
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ImageOff
} from 'lucide-react';
import { ImageRecord, BoundingBox, ImageCategoryLabel, ImageQualityLabel } from '../types';

interface ImageAnnotatorProps {
  records: ImageRecord[];
  onSaveRecord: (updatedRecord: ImageRecord, auditReason?: string) => void;
  annotatorId: string;
}

const BOX_CATEGORIES = [
  'Laptop / Device',
  'Person / Face',
  'Desk / Furniture',
  'Vehicle / Car',
  'Document / Text',
  'Animal / Wildlife',
  'Building / Structure',
  'Other Object'
];

const SCENE_CATEGORIES: ImageCategoryLabel[] = [
  'Technology & Devices',
  'Workplace & Office',
  'Healthcare & Medical',
  'Urban & Architecture',
  'Nature & Animals',
  'Other'
];

const QUALITY_LABELS: ImageQualityLabel[] = [
  'High Quality',
  'Acceptable',
  'Blurry / Low Res',
  'Watermarked / Occluded'
];

export const ImageAnnotator: React.FC<ImageAnnotatorProps> = ({
  records,
  onSaveRecord,
  annotatorId
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentRecord = records[currentIndex] || records[0];

  // Local state for image annotation
  const [category, setCategory] = useState<ImageCategoryLabel | undefined>(undefined);
  const [quality, setQuality] = useState<ImageQualityLabel | undefined>(undefined);
  const [isCorruptedOrUnclear, setIsCorruptedOrUnclear] = useState(false);
  const [notes, setNotes] = useState('');
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [activeBoxLabel, setActiveBoxLabel] = useState<string>(BOX_CATEGORIES[0]);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentDragBox, setCurrentDragBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Sync state on record switch
  useEffect(() => {
    if (currentRecord) {
      setCategory(currentRecord.category);
      setQuality(currentRecord.quality || 'High Quality');
      setIsCorruptedOrUnclear(currentRecord.isCorruptedOrUnclear || false);
      setNotes(currentRecord.notes || '');
      setBoundingBoxes(currentRecord.boundingBoxes ? [...currentRecord.boundingBoxes] : []);
      setSelectedBoxId(null);
      setImageError(false);
      setImageLoaded(false);
    }
  }, [currentRecord?.id]);

  // Mouse handlers for drawing bounding box on image
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || imageError) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentDragBox({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPos || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const curX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const curY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    const left = Math.min(startPos.x, curX);
    const top = Math.min(startPos.y, curY);
    const width = Math.abs(curX - startPos.x);
    const height = Math.abs(curY - startPos.y);

    setCurrentDragBox({ x: left, y: top, width, height });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentDragBox) return;
    setIsDrawing(false);

    // Only commit if width and height > 2% of image dimension (prevents accidental clicks)
    if (currentDragBox.width > 2 && currentDragBox.height > 2) {
      const newBox: BoundingBox = {
        id: `box-${Date.now()}`,
        x: Math.round(currentDragBox.x * 10) / 10,
        y: Math.round(currentDragBox.y * 10) / 10,
        width: Math.round(currentDragBox.width * 10) / 10,
        height: Math.round(currentDragBox.height * 10) / 10,
        label: activeBoxLabel,
        confidence: 1.0
      };
      setBoundingBoxes(prev => [...prev, newBox]);
      setSelectedBoxId(newBox.id);
    }

    setStartPos(null);
    setCurrentDragBox(null);
  };

  const handleDeleteBox = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBoundingBoxes(prev => prev.filter(b => b.id !== id));
    if (selectedBoxId === id) setSelectedBoxId(null);
  };

  const handleSave = () => {
    if (!currentRecord) return;
    const isComplete = Boolean(category && quality);
    const newStatus = isCorruptedOrUnclear 
      ? 'Needs Review' 
      : isComplete 
        ? 'Annotated' 
        : 'In Progress';

    const updated: ImageRecord = {
      ...currentRecord,
      category,
      quality,
      isCorruptedOrUnclear,
      boundingBoxes,
      notes: notes.trim(),
      status: newStatus,
      annotatedBy: annotatorId,
      annotatedAt: new Date().toISOString()
    };

    onSaveRecord(updated, `Image labeled: ${category || 'Unset'} with ${boundingBoxes.length} boxes`);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 1500);
  };

  if (!currentRecord) {
    return (
      <div className="p-12 text-center text-slate-500">
        <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-slate-400" />
        <h3 className="font-bold text-slate-800 text-base">No Image Records Available</h3>
        <p className="text-xs text-slate-500 mt-1">Import an image manifest or reset benchmark data.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-slate-900 text-sm bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
            {currentRecord.id}
          </span>
          <h3 className="font-semibold text-slate-800 text-sm">{currentRecord.title}</h3>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            currentRecord.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
            currentRecord.status === 'Annotated' ? 'bg-blue-100 text-blue-800' :
            currentRecord.status === 'Needs Review' ? 'bg-amber-100 text-amber-800' :
            'bg-slate-100 text-slate-600'
          }`}>
            {currentRecord.status}
          </span>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="p-1 rounded text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-medium px-2 text-slate-700">
              {currentIndex + 1} / {records.length}
            </span>
            <button
              onClick={() => setCurrentIndex(prev => Math.min(records.length - 1, prev + 1))}
              disabled={currentIndex >= records.length - 1}
              className="p-1 rounded text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Canvas & Image Viewer (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col items-center">
            {/* Toolbar above image */}
            <div className="w-full pb-3 mb-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Active Object Label:</span>
                <select
                  value={activeBoxLabel}
                  onChange={(e) => setActiveBoxLabel(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 text-xs outline-none cursor-pointer"
                >
                  {BOX_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                <span>Click & drag on image to draw bounding box</span>
                <span className="font-mono text-teal-400">{boundingBoxes.length} boxes</span>
              </div>
            </div>

            {/* Image viewport with Bounding Box SVG overlay */}
            <div 
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="relative w-full max-h-[520px] flex items-center justify-center overflow-hidden rounded-xl bg-slate-950 select-none cursor-crosshair"
              style={{ minHeight: '360px' }}
            >
              {imageError ? (
                <div className="p-8 text-center text-slate-400 space-y-3">
                  <ImageOff className="w-12 h-12 mx-auto text-rose-500" />
                  <p className="font-semibold text-white text-xs">Failed to load image from source manifest</p>
                  <p className="text-[11px] text-slate-500 max-w-sm truncate">{currentRecord.imageUrl}</p>
                  <button
                    onClick={() => {
                      setIsCorruptedOrUnclear(true);
                      setQuality('Blurry / Low Res');
                    }}
                    className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg"
                  >
                    Flag as Corrupted / Unreachable
                  </button>
                </div>
              ) : (
                <>
                  <img
                    ref={imgRef}
                    src={currentRecord.imageUrl}
                    alt={currentRecord.title}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    className="max-h-[520px] max-w-full object-contain pointer-events-none rounded"
                  />

                  {/* Render existing Bounding Boxes */}
                  {boundingBoxes.map((box) => {
                    const isSelected = selectedBoxId === box.id;
                    return (
                      <div
                        key={box.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBoxId(box.id);
                        }}
                        className={`absolute border-2 transition-all ${
                          isSelected
                            ? 'border-teal-400 bg-teal-400/20 shadow-lg'
                            : 'border-blue-500 bg-blue-500/15 hover:border-teal-300'
                        }`}
                        style={{
                          left: `${box.x}%`,
                          top: `${box.y}%`,
                          width: `${box.width}%`,
                          height: `${box.height}%`,
                        }}
                      >
                        <div className="absolute -top-6 left-0 bg-slate-900/90 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow flex items-center gap-1.5 whitespace-nowrap">
                          <span>{box.label}</span>
                          <button
                            onClick={(e) => handleDeleteBox(box.id, e)}
                            className="text-rose-400 hover:text-rose-200 cursor-pointer"
                            title="Delete Box"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Temporary drag box */}
                  {isDrawing && currentDragBox && (
                    <div
                      className="absolute border-2 border-dashed border-yellow-400 bg-yellow-400/20 pointer-events-none"
                      style={{
                        left: `${currentDragBox.x}%`,
                        top: `${currentDragBox.y}%`,
                        width: `${currentDragBox.width}%`,
                        height: `${currentDragBox.height}%`,
                      }}
                    />
                  )}
                </>
              )}
            </div>

            {/* Bounding Box List Strip */}
            {boundingBoxes.length > 0 && (
              <div className="w-full mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-slate-400 text-[11px] shrink-0">Objects:</span>
                {boundingBoxes.map((box, idx) => (
                  <div
                    key={box.id}
                    onClick={() => setSelectedBoxId(box.id)}
                    className={`shrink-0 px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 cursor-pointer ${
                      selectedBoxId === box.id
                        ? 'border-teal-400 bg-teal-950/80 text-teal-300'
                        : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>#{idx + 1} {box.label} ({box.width}% × {box.height}%)</span>
                    <button
                      onClick={(e) => handleDeleteBox(box.id, e)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reference Ground Truth (if available) */}
          {currentRecord.verifiedReference && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-xs text-teal-900 space-y-1">
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px]">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Verified Reference Annotation
              </div>
              <p>Expected Category: <strong>{currentRecord.verifiedReference.category}</strong></p>
              <p>Expected Quality: <strong>{currentRecord.verifiedReference.quality}</strong></p>
              {currentRecord.verifiedReference.explanation && (
                <p className="text-[11px] text-teal-800 italic mt-1">{currentRecord.verifiedReference.explanation}</p>
              )}
            </div>
          )}
        </div>

        {/* Right: Classification Controls & Inspection (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Scene Category Selection */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              1. Scene / Category Label
            </label>
            <div className="space-y-1.5">
              {SCENE_CATEGORIES.map((cat) => (
                <label
                  key={cat}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    category === cat
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{cat}</span>
                  <input
                    type="radio"
                    name="image_category"
                    checked={category === cat}
                    onChange={() => setCategory(cat)}
                    className="text-blue-600"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Quality Rating */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              2. Visual Quality Assessment
            </label>
            <div className="grid grid-cols-2 gap-2">
              {QUALITY_LABELS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuality(q)}
                  className={`p-2 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                    quality === q
                      ? 'border-blue-600 bg-blue-600 text-white font-semibold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Corrupted Toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800">Corrupted / Unclear Image</span>
                <p className="text-[10px] text-slate-400">Flag for review if severe artifacts</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCorruptedOrUnclear(prev => !prev)}
                className={`w-11 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                  isCorruptedOrUnclear ? 'bg-rose-500' : 'bg-slate-200'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isCorruptedOrUnclear ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Image Annotation Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Bounding boxes drawn around primary workstation devices..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Save Button */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Image Annotations</span>
            </button>

            {saveToast && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Image annotations saved persistently</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
