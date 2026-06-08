'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCanvoFiles } from '@/hooks/useCanvoFiles';
import FileGrid from '@/components/landing/FileGrid';
import NewFileButton from '@/components/landing/NewFileButton';
import NewCanvasModal from '@/components/landing/NewCanvasModal';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function HomePage() {
  const router = useRouter();
  const { files, loading, createFile, removeFile, renameFile, duplicateFile } =
    useCanvoFiles();
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [modalOpen, setModalOpen] = useState(false);

  const templates = [
    {
      name: 'Instagram Post',
      dims: '1080 × 1080 px',
      w: 1080,
      h: 1080,
      gradient: 'from-[#FF512F] to-[#DD2476]', // Sunset pink-red
      icon: InstagramIcon,
    },
    {
      name: 'YouTube Thumbnail',
      dims: '1280 × 720 px',
      w: 1280,
      h: 720,
      gradient: 'from-[#4776E6] to-[#8E54E9]', // Purple-blue
      icon: YoutubeIcon,
    },
    {
      name: 'Story / Reels',
      dims: '1080 × 1920 px',
      w: 1080,
      h: 1920,
      gradient: 'from-[#F857A6] to-[#FF5858]', // Fuchsia-coral
      icon: SmartPhone01Icon,
    },
    {
      name: 'Presentation HD',
      dims: '1920 × 1080 px',
      w: 1920,
      h: 1080,
      gradient: 'from-[#11998e] to-[#38ef7d]', // Emerald green-teal
      icon: ComputerIcon,
    },
    {
      name: 'A4 Print Document',
      dims: '2480 × 3508 px',
      w: 2480,
      h: 3508,
      gradient: 'from-[#F2994A] to-[#F2C94C]', // Amber gold
      icon: File01Icon,
    },
  ];

  async function handleQuickCreate(name: string, w: number, h: number) {
    const id = await createFile(name, w, h);
    router.push(`/editor/${id}`);
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#FAFAF9] text-neutral-900 selection:bg-neutral-200">
      {/* Background Mesh Gradient */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-[#FFF5F3] via-[#F5F7FF] to-[#FAFAF9] -z-20" />
      <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[50%] rounded-full bg-pink-200/35 blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute top-[-10%] right-[-10%] w-[55%] h-[45%] rounded-full bg-amber-200/30 blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '14s' }} />

      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          /* SCREEN 1: LANDING PAGE */
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="relative z-10 max-w-6xl mx-auto px-6 py-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-20">
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
                className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full font-medium text-sm transition-all shadow-md shadow-neutral-950/10 hover:shadow-lg hover:shadow-neutral-950/15 cursor-pointer"
              >
                Open Dashboard
              </button>
            </div>

            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-32 relative pt-4">
              {/* Left Column: Heading and description */}
              <div className="lg:col-span-7 text-left space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 border border-pink-100 rounded-full text-pink-600 font-semibold text-xs uppercase tracking-wider">
                  <SparklesIcon size={12} /> Browser Graphic Design
                </div>
                <h1
                  className="text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-neutral-950 leading-[1.08] mb-4"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Design in the browser, <span className="bg-gradient-to-r from-pink-500 via-orange-500 to-amber-500 bg-clip-text text-transparent font-medium">openly.</span>
                </h1>
                <p className="text-lg text-neutral-600 max-w-xl leading-relaxed">
                  Your browser-first graphic design companion. Open source, fast, and always waiting. No login, no complexity, just pure creative space.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => setView('dashboard')}
                    className="px-7 py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white font-semibold rounded-full shadow-md shadow-neutral-950/10 hover:shadow-lg transition-all flex items-center gap-2 group cursor-pointer"
                  >
                    Start designing
                    <ArrowRight01Icon size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-7 py-3.5 border border-neutral-200 hover:bg-neutral-50 font-semibold rounded-full transition-all text-neutral-800 flex items-center gap-2"
                  >
                    GitHub Project
                  </a>
                </div>
              </div>

              {/* Right Column: Floating sticker illustrations */}
              <div className="lg:col-span-5 relative h-[380px] lg:h-[450px] flex items-center justify-center">
                {/* Sticker 1: Bird */}
                <motion.div
                  initial={{ rotate: -10, y: 15 }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                  whileHover={{ scale: 1.05, rotate: -5 }}
                  className="absolute top-4 left-6 p-4 bg-white border border-neutral-100 rounded-2xl shadow-xl shadow-neutral-200/50 w-36 rotate-[-10deg] z-10 cursor-grab"
                >
                  <div className="w-full aspect-square rounded-xl bg-sky-50 flex items-center justify-center mb-3">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-sky-500">
                      <path d="M12 2C6.48 2 2 6.48 2 12c0 2.2.7 4.2 1.9 5.9L3.1 21l3.2-.8c1.7 1.2 3.7 1.8 5.7 1.8 5.52 0 10-4.48 10-10S17.52 2 12 2Zm-1 14H9v-2h2v2Zm3-4h-4V9h4v3Z" fill="currentColor" opacity="0.15" />
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 2.2.7 4.2 1.9 5.9L3 21l3.2-.8c1.7 1.2 3.7 1.8 5.8 1.8 5.52 0 10-4.48 10-10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-xs font-semibold text-center text-neutral-800">Abstract Art</div>
                </motion.div>

                {/* Sticker 2: Leaf */}
                <motion.div
                  initial={{ rotate: 8, y: -10 }}
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 1 }}
                  whileHover={{ scale: 1.05, rotate: 12 }}
                  className="absolute top-12 right-6 p-4 bg-white border border-neutral-100 rounded-2xl shadow-xl shadow-neutral-200/50 w-36 rotate-[8deg] z-20 cursor-grab"
                >
                  <div className="w-full aspect-square rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-emerald-500">
                      <path d="M12 2c5.52 0 10 4.48 10 10S17.52 22 12 22 2 17.52 2 12 6.48 2 12 2Z" fill="currentColor" opacity="0.15" />
                      <path d="M2 12h20M12 2v20" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="text-xs font-semibold text-center text-neutral-800">Fresh Vector</div>
                </motion.div>

                {/* Sticker 3: Ice Cream */}
                <motion.div
                  initial={{ rotate: -5, y: 0 }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.5 }}
                  whileHover={{ scale: 1.05, rotate: 0 }}
                  className="absolute bottom-4 left-10 p-4 bg-white border border-neutral-100 rounded-2xl shadow-xl shadow-neutral-200/50 w-36 rotate-[-5deg] z-10 cursor-grab"
                >
                  <div className="w-full aspect-square rounded-xl bg-amber-50 flex items-center justify-center mb-3">
                    <span className="text-3xl">🍦</span>
                  </div>
                  <div className="text-xs font-semibold text-center text-neutral-800">Ice Cream</div>
                </motion.div>

                {/* Sticker 4: Watermelon */}
                <motion.div
                  initial={{ rotate: 12, y: 15 }}
                  animate={{ y: [0, -12, 0] }}
                  transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut', delay: 1.5 }}
                  whileHover={{ scale: 1.05, rotate: 6 }}
                  className="absolute bottom-8 right-12 p-4 bg-white border border-neutral-100 rounded-2xl shadow-xl shadow-neutral-200/50 w-36 rotate-[12deg] z-30 cursor-grab"
                >
                  <div className="w-full aspect-square rounded-xl bg-rose-50 flex items-center justify-center mb-3">
                    <span className="text-3xl">🍉</span>
                  </div>
                  <div className="text-xs font-semibold text-center text-neutral-800">Watermelon</div>
                </motion.div>

                {/* Sticker 5: Flower */}
                <motion.div
                  initial={{ rotate: -15, y: -20 }}
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 6.5, ease: 'easeInOut', delay: 2 }}
                  whileHover={{ scale: 1.05, rotate: -8 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-white border border-neutral-100 rounded-2xl shadow-2xl shadow-neutral-300 w-40 rotate-[-15deg] z-40 cursor-grab"
                >
                  <div className="w-full aspect-square rounded-xl bg-pink-50 flex items-center justify-center mb-3">
                    <span className="text-4xl">🌸</span>
                  </div>
                  <div className="text-xs font-bold text-center text-neutral-900">Custom Shapes</div>
                </motion.div>
              </div>
            </div>

            {/* Feature Highlights Section */}
            <div className="border-t border-neutral-200/70 pt-20 pb-20">
              <div className="text-center md:text-left mb-16 space-y-2">
                <h2
                  className="text-3xl md:text-4xl font-normal tracking-tight text-neutral-950"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  All the essential tools.
                </h2>
                <p className="text-sm text-neutral-500">Every design instrument you need, built natively for browser execution.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Feature 1: Text */}
                <div className="p-8 bg-white border border-neutral-200/40 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-[-10%] right-[-10%] w-[120px] h-[120px] bg-pink-50 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                  <div className="relative z-10 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-lg">T</div>
                    <h3 className="text-lg font-bold text-neutral-900">Rich Typography</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      Write and format texts instantly. Tweak fonts, weights, alignments, spacing, and styles with full system and custom google fonts.
                    </p>
                  </div>
                </div>

                {/* Feature 2: Vectors */}
                <div className="p-8 bg-white border border-neutral-200/40 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-[-10%] right-[-10%] w-[120px] h-[120px] bg-sky-50 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                  <div className="relative z-10 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polygon points="12 8 8 12 12 16 16 12 12 8" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900">Scalable Vectors</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      Add shapes, lines, arrows, custom vector illustrations. Scale, rotate, and style vector objects without losing crispness.
                    </p>
                  </div>
                </div>

                {/* Feature 3: Images */}
                <div className="p-8 bg-white border border-neutral-200/40 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-[-10%] right-[-10%] w-[120px] h-[120px] bg-emerald-50 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                  <div className="relative z-10 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900">Unsplash & Filtering</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      Search millions of Unsplash photos or upload your own. Crop, apply blur, modify corner radius, and add drop shadows.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer card */}
            <div className="p-10 rounded-3xl bg-neutral-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl mb-12">
              <div className="text-center md:text-left space-y-1">
                <h3 className="text-2xl font-bold">Start making something.</h3>
                <p className="text-sm text-neutral-400">Launch the open-source graphic design canvas in one click.</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setView('dashboard')}
                  className="px-6 py-3 bg-white hover:bg-neutral-100 text-neutral-950 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Start Designing
                </button>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 border border-neutral-800 hover:bg-neutral-900 text-white font-semibold rounded-xl transition-all"
                >
                  View on GitHub
                </a>
              </div>
            </div>
          </motion.div>
        ) : (
          /* SCREEN 2: TEMPLATE GRID & DASHBOARD */
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="relative z-10 max-w-5xl mx-auto px-6 py-8"
          >
            {/* Header with back navigation button */}
            <div className="flex items-center justify-between mb-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView('landing')}
                  className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer shadow-sm"
                  title="Back to Landing Page"
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

            {/* Template Selection */}
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

            {/* Quick Templates Grid */}
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

              {/* Custom Size Card */}
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

            {/* Recent Designs (IndexedDB File List) */}
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
                <FileGrid
                  files={files}
                  onRename={renameFile}
                  onDuplicate={duplicateFile}
                  onDelete={removeFile}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NewCanvasModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreateFile={createFile}
      />
    </div>
  );
}
