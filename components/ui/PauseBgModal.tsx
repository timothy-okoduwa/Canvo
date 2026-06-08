'use client';

import Modal from './Modal';
import { Heart, Coffee } from 'lucide-react';

interface PauseBgModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PauseBgModal({ open, onClose }: PauseBgModalProps) {
  return (
    <Modal open={open} onClose={onClose} maxWidth="460px">
      <div className="relative overflow-hidden rounded-[28px] bg-white text-left shadow-2xl border border-neutral-100">
        {/* Soft pink to blue gradient background */}
        <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-pink-500/[0.06] via-white to-blue-500/[0.03] -z-10" />

        <div className="p-8 flex flex-col items-start">
          {/* Heart icon card */}
          <div className="w-12 h-12 rounded-[18px] bg-white border border-pink-100 flex items-center justify-center shadow-md shadow-pink-100/50 mb-6">
            <Heart size={20} className="text-pink-500 fill-pink-50" />
          </div>

          {/* Heading */}
          <h2
            className="text-[32px] font-normal leading-[1.12] text-neutral-900 mb-4 max-w-sm"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Background removal is paused
          </h2>

          {/* Description */}
          <p className="text-[13.5px] leading-relaxed text-neutral-500 mb-8 max-w-sm">
            We have taken background removal down because the server cost is too high for a free and open-source project. If Avnac is useful to you, please consider sponsoring the project so we can bring it back.
          </p>

          {/* Actions (Stacked full-width buttons) */}
          <div className="w-full space-y-3">
            <a
              href="https://github.com/sponsors"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-xl text-[13.5px] flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Coffee size={14} />
              Sponsor Canvo
            </a>
            <button
              onClick={onClose}
              className="w-full h-11 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 font-semibold rounded-xl text-[13.5px] transition-all cursor-pointer flex items-center justify-center"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
