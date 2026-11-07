import React, { useRef, useState, useEffect } from 'react';
import { Download, Undo2, Trash2, Sparkles, Wand2, Paintbrush, PlusCircle } from 'lucide-react';
import { festiveAudio } from '../utils/audio';

interface StrokePoint {
  x: number;
  y: number;
}

interface Stroke {
  points: StrokePoint[];
  color: string;
  size: number;
  symmetry: number;
}

interface RangoliCanvasProps {
  onAttachToCard?: (dataUrl: string) => void;
}

const FESTIVE_PALETTE = [
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Marigold', hex: '#FF9933' },
  { name: 'Kumkum Red', hex: '#FF3D00' },
  { name: 'Gulabi Pink', hex: '#FF1493' },
  { name: 'Peacock Blue', hex: '#00E5FF' },
  { name: 'Emerald Green', hex: '#00E676' },
  { name: 'Pavitra White', hex: '#FFFFFF' },
  { name: 'Royal Purple', hex: '#E040FB' },
];

export const RangoliCanvas: React.FC<RangoliCanvasProps> = ({ onAttachToCard }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedColor, setSelectedColor] = useState(FESTIVE_PALETTE[0].hex);
  const [brushSize, setBrushSize] = useState(4);
  const [symmetry, setSymmetry] = useState<8 | 12>(8);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [attachedSuccess, setAttachedSuccess] = useState(false);

  // Initialize canvas with smooth rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderAllStrokes(ctx, strokes);
  }, [strokes]);

  // Redraw all strokes onto canvas
  const renderAllStrokes = (ctx: CanvasRenderingContext2D, strokeList: Stroke[]) => {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Deep starry circular canvas backdrop
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(cx, cy) - 10;

    // Outer sacred mandala boundary guideline
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.95, 0, Math.PI * 2);
    ctx.arc(cx, cy, radius * 0.65, 0, Math.PI * 2);
    ctx.arc(cx, cy, radius * 0.35, 0, Math.PI * 2);
    ctx.stroke();

    // Subtle center bindu
    ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw saved strokes with rotational & reflection symmetry
    strokeList.forEach((st) => drawSymmetricalStroke(ctx, st, cx, cy));
  };

  const drawSymmetricalStroke = (
    ctx: CanvasRenderingContext2D,
    st: Stroke,
    cx: number,
    cy: number
  ) => {
    if (st.points.length < 1) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = st.color;
    ctx.lineWidth = st.size;
    ctx.shadowColor = st.color;
    ctx.shadowBlur = 6;

    const angleStep = (Math.PI * 2) / st.symmetry;

    for (let i = 0; i < st.symmetry; i++) {
      const angle = i * angleStep;

      // Draw primary rotation
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      ctx.beginPath();
      st.points.forEach((pt, idx) => {
        const lx = pt.x - cx;
        const ly = pt.y - cy;
        if (idx === 0) ctx.moveTo(lx, ly);
        else ctx.lineTo(lx, ly);
      });
      ctx.stroke();

      // Mirror reflection along radial axis
      ctx.beginPath();
      st.points.forEach((pt, idx) => {
        const lx = -(pt.x - cx); // Invert X for mirror
        const ly = pt.y - cy;
        if (idx === 0) ctx.moveTo(lx, ly);
        else ctx.lineTo(lx, ly);
      });
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  };

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent): StrokePoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const pt = getCanvasCoords(e);
    if (!pt) return;
    setIsDrawing(true);

    const newStroke: Stroke = {
      points: [pt],
      color: selectedColor,
      size: brushSize,
      symmetry,
    };
    setCurrentStroke(newStroke);
    festiveAudio.playBellChime(1200);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentStroke) return;
    const pt = getCanvasCoords(e);
    if (!pt) return;

    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, pt],
    };
    setCurrentStroke(updatedStroke);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderAllStrokes(ctx, [...strokes, updatedStroke]);
  };

  const stopDrawing = () => {
    if (isDrawing && currentStroke && currentStroke.points.length > 0) {
      setStrokes((prev) => [...prev, currentStroke]);
    }
    setIsDrawing(false);
    setCurrentStroke(null);
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
    festiveAudio.playBellChime(600);
  };

  const handleClear = () => {
    setStrokes([]);
    festiveAudio.playBellChime(400);
  };

  // Procedural Rangoli Generator with Animated Strokes
  const handleAutoGenerate = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setStrokes([]);
    festiveAudio.playSparkle();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const maxR = Math.min(cx, cy) - 25;

    // Create algorithmic sacred geometric mandala strokes
    const generated: Stroke[] = [];

    // Layer 1: Inner Lotus Petals (Gold)
    const innerPoints: StrokePoint[] = [];
    for (let t = 0; t <= Math.PI / 4; t += 0.08) {
      const r = 25 + 38 * Math.sin(t * 4);
      innerPoints.push({ x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) });
    }
    generated.push({ points: innerPoints, color: '#FFD700', size: 3.5, symmetry: 8 });

    // Layer 2: Middle Floral Loop (Marigold & Pink)
    const midPoints: StrokePoint[] = [];
    for (let t = 0; t <= Math.PI / 4; t += 0.06) {
      const r = 65 + 45 * Math.sin(t * 8);
      midPoints.push({ x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) });
    }
    generated.push({ points: midPoints, color: '#FF9933', size: 3, symmetry: 8 });

    // Layer 3: Peacock Wing Scallops (Peacock Blue)
    const peacockPoints: StrokePoint[] = [];
    for (let t = 0; t <= Math.PI / 4; t += 0.05) {
      const r = 110 + 35 * Math.cos(t * 6);
      peacockPoints.push({ x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) });
    }
    generated.push({ points: peacockPoints, color: '#00E5FF', size: 3, symmetry: 8 });

    // Layer 4: Outer Diya Lamps / Kumkum points (Kumkum Red)
    const outerPoints: StrokePoint[] = [];
    for (let t = 0; t <= Math.PI / 4; t += 0.05) {
      const r = maxR - 15 + 18 * Math.sin(t * 12);
      outerPoints.push({ x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) });
    }
    generated.push({ points: outerPoints, color: '#FF1493', size: 4, symmetry: 8 });

    // Layer 5: Sparkling Dots
    const dotPoints: StrokePoint[] = [
      { x: cx + 45, y: cy + 45 },
      { x: cx + 90, y: cy + 90 },
      { x: cx + 135, y: cy + 135 },
    ];
    generated.push({ points: dotPoints, color: '#FFFFFF', size: 5, symmetry: 8 });

    // Animate the generated layers step-by-step
    generated.forEach((st, idx) => {
      setTimeout(() => {
        setStrokes((prev) => [...prev, st]);
        festiveAudio.playBellChime(500 + idx * 120);
        if (idx === generated.length - 1) {
          setIsGenerating(false);
          festiveAudio.playSparkle();
        }
      }, (idx + 1) * 350);
    });
  };

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    festiveAudio.playBellChime(880);

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'Diwali_Sacred_Rangoli.png';
    link.click();
  };

  const handleAttachCard = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onAttachToCard) return;

    const dataUrl = canvas.toDataURL('image/png');
    onAttachToCard(dataUrl);
    setAttachedSuccess(true);
    festiveAudio.playBellChime(1046.5);
    setTimeout(() => setAttachedSuccess(false), 3000);
  };

  return (
    <div id="rangoli-section" className="py-12 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-600/30">
          Auspicious Mandala Art
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif shimmer-gold mt-2">
          Interactive Symmetrical Rangoli
        </h2>
        <p className="text-amber-200/80 text-sm sm:text-base max-w-xl mx-auto mt-2 font-light">
          Draw with your finger or mouse; each stroke mirrors instantly in 8 or 12-fold sacred symmetry. Place your finished rangoli inside your greeting card!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Canvas Centerpiece (7 cols) */}
        <div className="md:col-span-7 flex flex-col items-center">
          <div className="relative p-2 rounded-3xl bg-gradient-to-tr from-amber-600/30 via-purple-600/30 to-rose-600/30 border border-amber-500/40 shadow-2xl backdrop-blur-md">
            <canvas
              ref={canvasRef}
              width={420}
              height={420}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] rounded-2xl bg-[#070112] touch-none cursor-crosshair shadow-inner border border-amber-500/20"
            />

            {/* Symmetry badge in corner */}
            <div className="absolute top-4 left-4 text-[10px] bg-purple-950/80 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
              {symmetry}-Fold Mirror Symmetry
            </div>
          </div>
        </div>

        {/* Toolbar & Controls (5 cols) */}
        <div className="md:col-span-5 bg-purple-950/40 border border-amber-500/30 rounded-2xl p-5 backdrop-blur-md space-y-5">
          {/* Color Palette */}
          <div>
            <label className="text-xs font-semibold text-amber-300 uppercase tracking-wider block mb-2">
              Festive Color Powders
            </label>
            <div className="grid grid-cols-4 gap-2">
              {FESTIVE_PALETTE.map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    setSelectedColor(c.hex);
                    festiveAudio.playBellChime(900);
                  }}
                  title={c.name}
                  className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all cursor-pointer ${
                    selectedColor === c.hex
                      ? 'border-amber-400 bg-amber-500/20 scale-105 shadow-md'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full shadow-inner"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[9px] text-amber-200/80 truncate w-full text-center">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Brush Thickness & Symmetry */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs text-amber-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Paintbrush className="w-3.5 h-3.5 text-amber-400" />
                Powder Stream Width
              </span>
              <span className="text-amber-400 font-bold">{brushSize}px</span>
            </div>
            <input
              type="range"
              min={2}
              max={12}
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-amber-300 font-medium">Sacred Symmetry:</span>
              <div className="flex gap-1.5">
                {[8, 12].map((sym) => (
                  <button
                    key={sym}
                    onClick={() => {
                      setSymmetry(sym as any);
                      festiveAudio.playBellChime(750);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      symmetry === sym
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-purple-900/60 text-amber-200 hover:bg-purple-800'
                    }`}
                  >
                    {sym}-Fold
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-amber-500/20">
            <button
              onClick={handleAutoGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-102 transition-all cursor-pointer disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4" />
              <span>{isGenerating ? 'Drawing Sacred Lotus...' : 'Auto-Generate Sacred Rangoli'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleUndo}
                disabled={strokes.length === 0}
                className="py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-amber-200 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>

              <button
                onClick={handleClear}
                disabled={strokes.length === 0}
                className="py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleDownloadPNG}
                className="py-2 rounded-xl bg-purple-900/50 hover:bg-purple-800 text-amber-200 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PNG</span>
              </button>

              {onAttachToCard && (
                <button
                  onClick={handleAttachCard}
                  className="py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{attachedSuccess ? 'Attached!' : 'Add to Card'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
