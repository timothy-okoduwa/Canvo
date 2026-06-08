'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, useInView } from 'framer-motion';
import {
  InstagramIcon,
  YoutubeIcon,
  SmartPhone01Icon,
  ComputerIcon,
  File01Icon,
  SlidersHorizontalIcon,
  FolderOpenIcon,
  ArrowLeft01Icon,
  SparklesIcon,
  ArrowRight01Icon,
} from 'hugeicons-react';
import { useCanvoFiles } from '@/hooks/useCanvoFiles';
import FileGrid from '@/components/landing/FileGrid';
import NewFileButton from '@/components/landing/NewFileButton';
import NewCanvasModal from '@/components/landing/NewCanvasModal';

// ─── Draggable Sticker ───────────────────────────────────────────────────────
type StickerPos = { x: number; y: number };

function DraggableSticker({
  children,
  initialPos,
  rotation,
  zBase,
}: {
  children: React.ReactNode;
  initialPos: StickerPos;
  rotation: string;
  zBase: number;
}) {
  const [pos, setPos] = useState<StickerPos>(initialPos);
  const [dragging, setDragging] = useState(false);
  const [zIndex, setZIndex] = useState(zBase);
  const dragStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
      setDragging(true);
      setZIndex(50);
    },
    [pos]
  );
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    setPos({
      x: dragStart.current.px + e.clientX - dragStart.current.mx,
      y: dragStart.current.py + e.clientY - dragStart.current.my,
    });
  }, []);
  const onPointerUp = useCallback(() => {
    dragStart.current = null;
    setDragging(false);
    setZIndex(zBase);
  }, [zBase]);

  return (
    <motion.div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      initial={{ opacity: 0, scale: 0.7, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        zIndex,
        transform: `rotate(${rotation})`,
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
      className={`p-3 bg-white border border-neutral-100 rounded-2xl w-32 ${dragging ? 'shadow-2xl shadow-neutral-400/40' : 'shadow-xl shadow-neutral-200/50'
        }`}
    >
      {children}
    </motion.div>
  );
}

function DraggableStickers() {
  const stickers = [
    {
      initialPos: { x: 24, y: 16 },
      rotation: '-10deg',
      zBase: 10,
      bg: 'bg-sky-50',
      label: 'Abstract Art',
      content: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-sky-500">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 2.2.7 4.2 1.9 5.9L3.1 21l3.2-.8c1.7 1.2 3.7 1.8 5.7 1.8 5.52 0 10-4.48 10-10S17.52 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      initialPos: { x: 168, y: 44 },
      rotation: '8deg',
      zBase: 20,
      bg: 'bg-emerald-50',
      label: 'Fresh Vector',
      content: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-emerald-500">
          <path d="M12 2c5.52 0 10 4.48 10 10S17.52 22 12 22 2 17.52 2 12 6.48 2 12 2Z" fill="currentColor" opacity="0.15" />
          <path d="M2 12h20M12 2v20" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      initialPos: { x: 36, y: 240 },
      rotation: '-5deg',
      zBase: 10,
      bg: 'bg-amber-50',
      label: 'Ice Cream',
      content: <span className="text-3xl">🍦</span>,
    },
    {
      initialPos: { x: 175, y: 210 },
      rotation: '12deg',
      zBase: 30,
      bg: 'bg-rose-50',
      label: 'Watermelon',
      content: <span className="text-3xl">🍉</span>,
    },
    {
      initialPos: { x: 95, y: 128 },
      rotation: '-15deg',
      zBase: 40,
      bg: 'bg-pink-50',
      label: 'Custom Shapes',
      content: <span className="text-4xl">🌸</span>,
    },
  ];
  return (
    <div className="relative w-full h-full">
      {stickers.map((s, i) => (
        <DraggableSticker key={i} initialPos={s.initialPos} rotation={s.rotation} zBase={s.zBase}>
          <div className={`w-full aspect-square rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
            {s.content}
          </div>
          <div className="text-xs font-semibold text-center text-neutral-800">{s.label}</div>
        </DraggableSticker>
      ))}
    </div>
  );
}

// ─── Scroll-Driven Feature Showcase ─────────────────────────────────────────
const FEATURES = [
  {
    id: 'text',
    number: '01',
    title: 'Rich Typography',
    description:
      'Write and format text instantly. Tweak fonts, weights, alignments, spacing and styles with full Google Fonts support.',
    accent: 'from-pink-400 to-rose-500',
    bg: 'bg-pink-50',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    visual: (
      <div className="relative flex items-center justify-center w-full h-full">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50" />
        <div className="relative z-10 text-center select-none">
          <span
            className="text-8xl md:text-9xl font-black bg-gradient-to-br from-pink-400 to-rose-500 bg-clip-text text-transparent leading-none"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Aa
          </span>
          <div className="mt-4 flex gap-2 justify-center flex-wrap">
            {['Bold', 'Italic', 'Light', 'Serif'].map((t) => (
              <span key={t} className="px-3 py-1 text-xs bg-white rounded-full text-neutral-500 border border-pink-100 shadow-sm font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
  },
  {
    id: 'shapes',
    number: '02',
    title: 'Scalable Vectors',
    description:
      'Add shapes, lines, arrows, and custom vector illustrations. Scale and rotate without ever losing crispness.',
    accent: 'from-sky-400 to-blue-500',
    bg: 'bg-sky-50',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    visual: (
      <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50" />
        <svg viewBox="0 0 200 200" className="relative z-10 w-48 h-48 md:w-56 md:h-56" fill="none">
          <circle cx="100" cy="100" r="70" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 4" />
          <polygon points="100,40 155,130 45,130" fill="#bae6fd" stroke="#38bdf8" strokeWidth="2.5" />
          <rect x="72" y="72" width="56" height="56" rx="8" fill="white" stroke="#0ea5e9" strokeWidth="2.5" />
          <circle cx="100" cy="100" r="14" fill="#38bdf8" />
        </svg>
      </div>
    ),
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="12 8 8 12 12 16 16 12 12 8" />
      </svg>
    ),
  },
  {
    id: 'images',
    number: '03',
    title: 'Unsplash & Filters',
    description:
      'Search millions of Unsplash photos or upload your own. Crop, blur, adjust corner radius, and add drop shadows.',
    accent: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    visual: (
      <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50" />
        <div className="relative z-10 grid grid-cols-2 gap-2 p-4">
          {[
            'bg-gradient-to-br from-emerald-200 to-teal-300',
            'bg-gradient-to-br from-sky-200 to-blue-300',
            'bg-gradient-to-br from-rose-200 to-pink-300',
            'bg-gradient-to-br from-amber-200 to-orange-300',
          ].map((g, i) => (
            <div key={i} className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl ${g} shadow-md`} />
          ))}
        </div>
        <div className="absolute bottom-5 right-5 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-emerald-100">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-neutral-600">Unsplash</span>
        </div>
      </div>
    ),
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    id: 'export',
    number: '04',
    title: 'Instant Export',
    description:
      'Export to PNG, JPG, SVG, or PDF in one click. Every design, pixel-perfect and ready to share or print.',
    accent: 'from-violet-400 to-purple-500',
    bg: 'bg-violet-50',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    visual: (
      <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          {['PNG', 'SVG', 'PDF', 'JPG'].map((fmt, i) => (
            <motion.div
              key={fmt}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1, type: 'spring' }}
              className="flex items-center gap-3 bg-white border border-violet-100 rounded-xl px-5 py-2.5 shadow-sm w-44"
            >
              <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold">
                {fmt[0]}
              </div>
              <span className="text-sm font-semibold text-neutral-700">{fmt}</span>
              <div className="ml-auto w-4 h-4 rounded-full bg-violet-100 text-violet-500 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M5 1v6M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    ),
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
];

function FeatureShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  // pinned: true while the scroll container is in the viewport window
  const [pinned, setPinned] = useState(false);
  // "past": scroll has gone beyond the section — panel should sit at bottom
  const [past, setPast] = useState(false);

  useEffect(() => {
    const SECTION_HEIGHT = FEATURES.length * 100; // vh units worth of scroll
    const SCREEN = window.innerHeight;

    function onScroll() {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrolled = -rect.top; // px scrolled into the section

      // Before section reaches top
      if (rect.top > 0) {
        setPinned(false);
        setPast(false);
        setCurrentIndex(0);
        return;
      }

      // After section has fully scrolled past
      const sectionScrollLength = el.offsetHeight - SCREEN;
      if (scrolled >= sectionScrollLength) {
        setPinned(false);
        setPast(true);
        setCurrentIndex(FEATURES.length - 1);
        return;
      }

      // Inside the section
      setPinned(true);
      setPast(false);
      const progress = scrolled / sectionScrollLength;
      const idx = Math.min(FEATURES.length - 1, Math.floor(progress * FEATURES.length));
      setCurrentIndex(idx);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const PanelContent = () => (
    <div className="max-w-6xl mx-auto w-full px-6 py-8">
      {/* Section header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Features</p>
          <h2
            className="text-4xl md:text-5xl font-normal tracking-tight text-neutral-950 leading-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            All the essential tools.
          </h2>
        </div>
        {/* Progress indicator */}
        <div className="hidden md:flex items-center gap-2">
          {FEATURES.map((f, i) => (
            <div
              key={f.id}
              className={`h-1 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-8 bg-neutral-950' : i < currentIndex ? 'w-4 bg-neutral-400' : 'w-4 bg-neutral-200'
                }`}
            />
          ))}
          <span className="ml-2 text-xs tabular-nums font-mono text-neutral-400">
            {String(currentIndex + 1).padStart(2, '0')} / {String(FEATURES.length).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Feature panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left: Text content */}
        <div className="flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -24, filter: 'blur(6px)' }}
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${FEATURES[currentIndex].iconBg} ${FEATURES[currentIndex].iconColor} flex items-center justify-center`}
                >
                  {FEATURES[currentIndex].icon}
                </div>
                <span className="text-sm font-mono text-neutral-400">{FEATURES[currentIndex].number}</span>
              </div>
              <h3
                className="text-3xl md:text-4xl font-normal tracking-tight text-neutral-950 leading-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {FEATURES[currentIndex].title}
              </h3>
              <p className="text-base text-neutral-500 leading-relaxed max-w-sm">
                {FEATURES[currentIndex].description}
              </p>
              {/* Feature list pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {FEATURES.map((f, i) => (
                  <button
                    key={f.id}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${i === currentIndex
                        ? 'bg-neutral-950 text-white border-neutral-950'
                        : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400'
                      }`}
                  >
                    {f.title}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Visual */}
        <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden border border-neutral-100 shadow-xl shadow-neutral-200/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute inset-0"
            >
              {FEATURES[currentIndex].visual}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile progress dots */}
      <div className="flex md:hidden justify-center gap-2 mt-8">
        {FEATURES.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-neutral-950' : 'w-1.5 bg-neutral-300'
              }`}
          />
        ))}
      </div>
    </div>
  );

  return (
    // Tall scroll container — gives the section its scrollable height
    <div
      ref={containerRef}
      style={{ height: `${FEATURES.length * 100}vh` }}
      className="relative"
    >
      {/* 
        Three render states:
        1. pinned=true  → fixed to viewport, scrolls through features
        2. past=true    → absolute at bottom of container (after section)
        3. neither      → absolute at top of container (before section hits)
      */}
      <div
        className={`
          w-full bg-[#FAFAF9] flex items-center
          ${pinned
            ? 'fixed top-0 left-0 right-0 z-30'
            : past
              ? 'absolute bottom-0 left-0 right-0'
              : 'absolute top-0 left-0 right-0'}
        `}
        style={{ height: '100vh' }}
      >
        <PanelContent />
      </div>
    </div>
  );
}

// ─── Scroll-Revealed SVG Illustration ────────────────────────────────────────
function VectorRevealSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  // Path lengths (estimated; fine-tune if needed)
  const TOTAL_PATH = 600;

  const pathProgress = useTransform(smooth, [0.05, 0.55], [0, 1]);
  const fillOpacity = useTransform(smooth, [0.45, 0.75], [0, 1]);
  const decorScale = useTransform(smooth, [0.5, 0.8], [0, 1]);

  // strokeDashoffset helpers
  function useDash(len: number, delayFrac = 0) {
    return useTransform(pathProgress, (p) => {
      const adjusted = Math.max(0, Math.min(1, (p - delayFrac) / (1 - delayFrac)));
      return len * (1 - adjusted);
    });
  }

  const isInView = useInView(containerRef, { once: false, margin: '-10%' });

  // Path lengths
  const bodyLen = 320;
  const headLen = 130;
  const armLen = 180;
  const heartLen1 = 90;
  const heartLen2 = 90;

  const bodyDash = useDash(bodyLen, 0);
  const headDash = useDash(headLen, 0.1);
  const armDash = useDash(armLen, 0.2);
  const heart1Dash = useDash(heartLen1, 0.35);
  const heart2Dash = useDash(heartLen2, 0.45);

  return (
    <div ref={containerRef} className="relative py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="space-y-5"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600 font-semibold text-xs uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Vector Tools
            </div>
            <h2
              className="text-4xl md:text-5xl font-normal tracking-tight text-neutral-950 leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Vectors,{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                come to life.
              </span>
            </h2>
            <p className="text-base text-neutral-500 leading-relaxed max-w-md">
              Every curve stays sharp, editable, and clean as your drawing comes to life. Watch shapes sketch themselves into existence as you scroll.
            </p>
            <div className="flex flex-col gap-3 pt-2">
              {[
                { icon: '✦', label: 'Draw freehand or import SVG files' },
                { icon: '◈', label: 'Edit anchor points precisely' },
                { icon: '▣', label: 'Apply fills, strokes, and gradients' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm text-neutral-600">
                  <span className="text-emerald-500 font-bold">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: animated SVG */}
          <div className="relative flex items-center justify-center">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50/60 via-transparent to-emerald-50/60 rounded-3xl" />

            <svg
              viewBox="0 0 300 320"
              className="relative z-10 w-72 h-72 md:w-80 md:h-80 drop-shadow-xl"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Body / hoodie */}
              <motion.path
                d="M100 220 C80 220 60 200 60 175 L60 155 C60 140 70 130 85 128 L95 126 L100 140 L200 140 L205 126 L215 128 C230 130 240 140 240 155 L240 175 C240 200 220 220 200 220 Z"
                stroke="#f9a8d4"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="transparent"
                style={{ strokeDasharray: bodyLen, strokeDashoffset: bodyDash }}
              />
              <motion.path
                d="M100 220 C80 220 60 200 60 175 L60 155 C60 140 70 130 85 128 L95 126 L100 140 L200 140 L205 126 L215 128 C230 130 240 140 240 155 L240 175 C240 200 220 220 200 220 Z"
                fill="#fce7f3"
                style={{ opacity: fillOpacity }}
              />

              {/* Head */}
              <motion.ellipse
                cx="150"
                cy="100"
                rx="42"
                ry="46"
                stroke="#fda4af"
                strokeWidth="3"
                fill="transparent"
                style={{ strokeDasharray: headLen, strokeDashoffset: headDash }}
              />
              <motion.ellipse
                cx="150"
                cy="100"
                rx="42"
                ry="46"
                fill="#fecdd3"
                style={{ opacity: fillOpacity }}
              />

              {/* Face: eyes */}
              <motion.circle cx="136" cy="96" r="6" fill="#f43f5e" style={{ opacity: fillOpacity }} />
              <motion.circle cx="164" cy="96" r="6" fill="#f43f5e" style={{ opacity: fillOpacity }} />
              {/* Pupils */}
              <motion.circle cx="136" cy="96" r="3" fill="white" style={{ opacity: fillOpacity }} />
              <motion.circle cx="164" cy="96" r="3" fill="white" style={{ opacity: fillOpacity }} />
              {/* Smile */}
              <motion.path
                d="M138 112 Q150 122 162 112"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                style={{ opacity: fillOpacity }}
              />
              {/* Cheeks */}
              <motion.circle cx="122" cy="108" r="8" fill="#fda4af" style={{ opacity: fillOpacity, fillOpacity: 0.4 }} />
              <motion.circle cx="178" cy="108" r="8" fill="#fda4af" style={{ opacity: fillOpacity, fillOpacity: 0.4 }} />

              {/* Arms */}
              <motion.path
                d="M60 155 C40 150 30 165 38 178 L60 175"
                stroke="#f9a8d4"
                strokeWidth="3"
                strokeLinecap="round"
                fill="transparent"
                style={{ strokeDasharray: armLen / 2, strokeDashoffset: useDash(armLen / 2, 0.2) }}
              />
              <motion.path
                d="M240 155 C260 150 270 165 262 178 L240 175"
                stroke="#f9a8d4"
                strokeWidth="3"
                strokeLinecap="round"
                fill="transparent"
                style={{ strokeDasharray: armLen / 2, strokeDashoffset: useDash(armLen / 2, 0.25) }}
              />

              {/* Hearts */}
              <motion.path
                d="M68 140 C68 134 74 130 80 135 C86 130 92 134 92 140 C92 148 80 156 80 156 C80 156 68 148 68 140 Z"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="transparent"
                style={{ strokeDasharray: heartLen1, strokeDashoffset: heart1Dash }}
              />
              <motion.path
                d="M68 140 C68 134 74 130 80 135 C86 130 92 134 92 140 C92 148 80 156 80 156 C80 156 68 148 68 140 Z"
                fill="#fda4af"
                style={{ opacity: fillOpacity }}
              />

              <motion.path
                d="M208 140 C208 134 214 130 220 135 C226 130 232 134 232 140 C232 148 220 156 220 156 C220 156 208 148 208 140 Z"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="transparent"
                style={{ strokeDasharray: heartLen2, strokeDashoffset: heart2Dash }}
              />
              <motion.path
                d="M208 140 C208 134 214 130 220 135 C226 130 232 134 232 140 C232 148 220 156 220 156 C220 156 208 148 208 140 Z"
                fill="#fda4af"
                style={{ opacity: fillOpacity }}
              />

              {/* Decorative sparkles */}
              {[
                { cx: 48, cy: 80, r: 4, delay: 0.5 },
                { cx: 252, cy: 90, r: 3, delay: 0.6 },
                { cx: 150, cy: 28, r: 5, delay: 0.55 },
                { cx: 100, cy: 250, r: 3.5, delay: 0.65 },
                { cx: 200, cy: 255, r: 3, delay: 0.7 },
              ].map((s, i) => (
                <motion.circle
                  key={i}
                  cx={s.cx}
                  cy={s.cy}
                  r={s.r}
                  fill="#f43f5e"
                  style={{
                    opacity: useTransform(smooth, [s.delay, s.delay + 0.15], [0, 0.8]),
                    scale: useTransform(smooth, [s.delay, s.delay + 0.15], [0, 1]),
                  }}
                />
              ))}
            </svg>

            {/* Floating tag */}
            <motion.div
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md border border-neutral-100 rounded-xl px-3 py-2 shadow-lg text-xs font-medium text-neutral-700 flex items-center gap-2"
              style={{ opacity: fillOpacity, y: useTransform(fillOpacity, [0, 1], [10, 0]) }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Vector complete
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main HomePage ───────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const { files, loading, createFile, removeFile, renameFile, duplicateFile } = useCanvoFiles();
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [modalOpen, setModalOpen] = useState(false);

  const templates = [
    { name: 'Instagram Post', dims: '1080 × 1080 px', w: 1080, h: 1080, gradient: 'from-[#FF512F] to-[#DD2476]', icon: InstagramIcon },
    { name: 'YouTube Thumbnail', dims: '1280 × 720 px', w: 1280, h: 720, gradient: 'from-[#4776E6] to-[#8E54E9]', icon: YoutubeIcon },
    { name: 'Story / Reels', dims: '1080 × 1920 px', w: 1080, h: 1920, gradient: 'from-[#F857A6] to-[#FF5858]', icon: SmartPhone01Icon },
    { name: 'Presentation HD', dims: '1920 × 1080 px', w: 1920, h: 1080, gradient: 'from-[#11998e] to-[#38ef7d]', icon: ComputerIcon },
    { name: 'A4 Print Document', dims: '2480 × 3508 px', w: 2480, h: 3508, gradient: 'from-[#F2994A] to-[#F2C94C]', icon: File01Icon },
  ];

  async function handleQuickCreate(name: string, w: number, h: number) {
    const id = await createFile(name, w, h);
    router.push(`/editor/${id}`);
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#FAFAF9] text-neutral-900 selection:bg-neutral-200">
      {/* Background mesh */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-[#FFF5F3] via-[#F5F7FF] to-[#FAFAF9] -z-20" />
      <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[50%] rounded-full bg-pink-200/35 blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute top-[-10%] right-[-10%] w-[55%] h-[45%] rounded-full bg-amber-200/30 blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '14s' }} />

      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            {/* ── HERO ── */}
            <div className="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-0">
              {/* Nav */}
              <nav className="flex items-center justify-between mb-16">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-neutral-950 rounded-xl flex items-center justify-center shadow-md">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7l10 5 10-5-10-5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold tracking-tight text-neutral-950">Canvo</span>
                </div>
                <button
                  onClick={() => setView('dashboard')}
                  className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full font-medium text-sm transition-all shadow-md shadow-neutral-950/10 hover:shadow-lg cursor-pointer"
                >
                  Open Dashboard
                </button>
              </nav>

              {/* Hero grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pb-24">
                <div className="lg:col-span-7 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 border border-pink-100 rounded-full text-pink-600 font-semibold text-xs uppercase tracking-wider"
                  >
                    <SparklesIcon size={12} /> Browser Graphic Design
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.6 }}
                    className="text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-neutral-950 leading-[1.08]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Design in the browser,{' '}
                    <span className="bg-gradient-to-r from-pink-500 via-orange-500 to-amber-500 bg-clip-text text-transparent font-medium">
                      openly.
                    </span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                    className="text-lg text-neutral-600 max-w-xl leading-relaxed"
                  >
                    Your browser-first graphic design companion. Open source, fast, and always waiting. No login, no complexity — just pure creative space.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-4 pt-2"
                  >
                    <button
                      onClick={() => setView('dashboard')}
                      className="px-7 py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 group cursor-pointer"
                    >
                      Start designing
                      <ArrowRight01Icon size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <a
                      href="https://github.com/timothy-okoduwa/Canvo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-7 py-3.5 border border-neutral-200 hover:bg-neutral-50 font-semibold rounded-full transition-all text-neutral-800 flex items-center gap-2"
                    >
                      GitHub Project
                    </a>
                  </motion.div>

                  {/* Social proof strip */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="flex items-center gap-4 pt-2"
                  >
                    <div className="flex -space-x-2">
                      {['#fda4af', '#86efac', '#93c5fd', '#fcd34d'].map((c, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-full border-2 border-white"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-neutral-500">
                      <span className="font-semibold text-neutral-700">Open source</span> — free forever, MIT licensed
                    </p>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="lg:col-span-5 relative h-[360px] lg:h-[420px]"
                >
                  <DraggableStickers />
                </motion.div>
              </div>
            </div>

            {/* ── SCROLL-DRIVEN FEATURE SHOWCASE ── */}
            <FeatureShowcase />

            {/* ── SVG VECTOR REVEAL ── */}
            <div className="bg-gradient-to-b from-[#FAFAF9] to-[#F5F7F5]">
              <VectorRevealSection />
            </div>

            {/* ── FOOTER CTA ── */}
            <div className="relative z-10 max-w-6xl mx-auto px-6 pb-16 pt-4">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-10 rounded-3xl bg-neutral-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
              >
                <div className="text-center md:text-left space-y-1">
                  <h3 className="text-2xl font-bold">Start making something.</h3>
                  <p className="text-sm text-neutral-400">
                    Launch the open-source graphic design canvas in one click.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setView('dashboard')}
                    className="px-6 py-3 bg-white hover:bg-neutral-100 text-neutral-950 font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Start Designing
                  </button>
                  <a
                    href="https://github.com/timothy-okoduwa/Canvo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 border border-neutral-800 hover:bg-neutral-900 text-white font-semibold rounded-xl transition-all"
                  >
                    View on GitHub
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          /* ── DASHBOARD ── */
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="relative z-10 max-w-5xl mx-auto px-6 py-8"
          >
            <div className="flex items-center justify-between mb-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView('landing')}
                  className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer shadow-sm"
                >
                  <ArrowLeft01Icon size={20} />
                </button>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-neutral-950 rounded-lg flex items-center justify-center shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7l10 5 10-5-10-5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-lg font-bold tracking-tight text-neutral-950">Canvo Dashboard</span>
                </div>
              </div>
              <NewFileButton onClick={() => setModalOpen(true)} />
            </div>

            <div className="text-left mb-8">
              <h2
                className="text-3xl md:text-4xl font-normal tracking-tight text-neutral-950 mb-2"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                What will you design today?
              </h2>
              <p className="text-sm text-neutral-500">
                Choose a pre-defined canvas template to start fresh, or define a custom workspace size.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-16">
              {templates.map((tpl) => {
                const Icon = tpl.icon;
                return (
                  <motion.button
                    key={tpl.name}
                    onClick={() => handleQuickCreate(tpl.name, tpl.w, tpl.h)}
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative overflow-hidden aspect-[4/5] rounded-2xl bg-gradient-to-br ${tpl.gradient} text-white flex flex-col justify-between p-4 cursor-pointer shadow-md shadow-black/5 border border-white/10`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center self-start">
                      <Icon size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-xs leading-tight mb-1">{tpl.name}</div>
                      <div className="text-[9px] text-white/80 font-mono font-medium">{tpl.dims}</div>
                    </div>
                  </motion.button>
                );
              })}
              <motion.button
                onClick={() => setModalOpen(true)}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden aspect-[4/5] rounded-2xl bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950 text-white flex flex-col justify-between p-4 cursor-pointer shadow-md shadow-black/5 border border-neutral-700/35"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center self-start">
                  <SlidersHorizontalIcon size={16} />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-xs leading-tight mb-1">Custom Size</div>
                  <div className="text-[9px] text-white/80 font-mono font-medium">Enter custom px</div>
                </div>
              </motion.button>
            </div>

            <div className="border-t border-neutral-200/70 pt-12">
              <div className="flex items-center gap-2 mb-8">
                <FolderOpenIcon size={20} className="text-neutral-500" />
                <h3
                  className="text-2xl font-normal tracking-tight text-neutral-950"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Recent designs
                </h3>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-7 h-7 border-2 border-neutral-200 border-t-neutral-950 rounded-full animate-spin" />
                </div>
              ) : (
                <FileGrid files={files} onRename={renameFile} onDuplicate={duplicateFile} onDelete={removeFile} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NewCanvasModal open={modalOpen} onClose={() => setModalOpen(false)} onCreateFile={createFile} />
    </div>
  );
}