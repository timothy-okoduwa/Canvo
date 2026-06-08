// ============================================================
// Canvo — QR Code Generation
// ============================================================

import QRCode from 'qrcode';

/**
 * Generate a QR code as a data URL (base64 PNG).
 */
export async function generateQRDataURL(
  text: string,
  size = 400
): Promise<string> {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 2,
    color: {
      dark: '#1A1A18',
      light: '#FFFFFF',
    },
  });
}
