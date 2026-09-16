'use client';

interface RulersProps {
  width: number;
  height: number;
  zoom: number;
}

export default function Rulers({ width, height, zoom }: RulersProps) {
  const step = 100;
  const numHorizontalTicks = Math.floor(width / step);
  const numVerticalTicks = Math.floor(height / step);

  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      {/* Top Ruler Bar */}
      <div
        className="absolute top-0 left-0 right-0 h-5 bg-neutral-100/90 border-b border-neutral-300 flex items-end text-[9px] font-mono text-neutral-500 overflow-hidden"
        style={{ width: width * zoom }}
      >
        {Array.from({ length: numHorizontalTicks + 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute border-l border-neutral-400 h-2 flex items-start pl-1"
            style={{ left: i * step * zoom }}
          >
            <span className="-top-3 relative">{i * step}</span>
          </div>
        ))}
      </div>

      {/* Left Ruler Bar */}
      <div
        className="absolute top-0 left-0 bottom-0 w-5 bg-neutral-100/90 border-r border-neutral-300 flex flex-col text-[9px] font-mono text-neutral-500 overflow-hidden"
        style={{ height: height * zoom }}
      >
        {Array.from({ length: numVerticalTicks + 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute border-t border-neutral-400 w-2 flex items-center pt-1"
            style={{ top: i * step * zoom }}
          >
            <span className="left-2 relative">{i * step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
