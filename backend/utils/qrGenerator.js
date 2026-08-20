import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

const isBackendDir = path.basename(process.cwd()) === 'backend';
const UPLOADS_DIR = isBackendDir ? path.resolve('uploads/qrcodes') : path.resolve('backend/uploads/qrcodes');

// Ensure directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Generates a QR code image file and returns its relative web path.
 * @param {string} text - The text/URL to encode.
 * @param {string} filename - The name of the file (e.g. 'certId.png').
 * @returns {Promise<string>} - Relative path to the saved QR code image.
 */
export const generateQRCode = async (text, filename) => {
  const filePath = path.join(UPLOADS_DIR, filename);
  
  await QRCode.toFile(filePath, text, {
    color: {
      dark: '#0B0F19', // Dark base color matching design spec
      light: '#FFFFFF' // Clean white contrast
    },
    width: 300,
    margin: 2
  });

  return `/uploads/qrcodes/${filename}`;
};
