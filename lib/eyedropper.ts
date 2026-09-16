// ============================================================
// Canvo — EyeDropper Helper
// Uses native browser EyeDropper API where available
// ============================================================

export interface EyeDropperResult {
  sRGBHex: string;
}

declare global {
  interface Window {
    EyeDropper?: new () => {
      open: (options?: { signal?: AbortSignal }) => Promise<EyeDropperResult>;
    };
  }
}

export function isEyeDropperSupported(): boolean {
  return typeof window !== 'undefined' && 'EyeDropper' in window;
}

export async function pickColorWithEyeDropper(): Promise<string | null> {
  if (!isEyeDropperSupported() || !window.EyeDropper) {
    return null;
  }
  try {
    const eyeDropper = new window.EyeDropper();
    const result = await eyeDropper.open();
    return result.sRGBHex;
  } catch {
    return null;
  }
}
