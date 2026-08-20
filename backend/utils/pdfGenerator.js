import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const isBackendDir = path.basename(process.cwd()) === 'backend';
const CERTIFICATES_DIR = isBackendDir ? path.resolve('uploads/certificates') : path.resolve('backend/uploads/certificates');

// Ensure directory exists
if (!fs.existsSync(CERTIFICATES_DIR)) {
  fs.mkdirSync(CERTIFICATES_DIR, { recursive: true });
}

/**
 * Generates a styled PDF certificate on disk and returns its relative web path.
 * @param {object} certData - The metadata of the certificate.
 * @param {string} filename - The filename to save as (e.g. 'certId.pdf').
 * @param {string} qrRelativePath - The relative path of the QR code image.
 * @returns {Promise<string>} - Relative path to the saved PDF file.
 */
export const generateCertificatePDF = (certData, filename, qrRelativePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margins: { top: 20, bottom: 20, left: 20, right: 20 }
      });

      const filePath = path.join(CERTIFICATES_DIR, filename);
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // --- STYLING CONSTANTS ---
      const primaryColor = '#0B0F19'; // Deep Navy/Charcoal
      const accentColor = '#3B82F6';  // Electric Blue accent
      const secondaryColor = '#4B5563'; // Gray

      // --- DECORATIVE BORDERS ---
      // Outer border
      doc.rect(20, 20, 801.89, 555.28)
         .lineWidth(5)
         .strokeColor(primaryColor)
         .stroke();

      // Inner border
      doc.rect(28, 28, 785.89, 539.28)
         .lineWidth(1.5)
         .strokeColor(accentColor)
         .stroke();

      // Corner accent triangles (decorative)
      doc.polygon([28, 28], [58, 28], [28, 58]).fill(accentColor);
      doc.polygon([813.89, 28], [783.89, 28], [813.89, 58]).fill(accentColor);
      doc.polygon([28, 567.28], [58, 567.28], [28, 537.28]).fill(accentColor);
      doc.polygon([813.89, 567.28], [783.89, 567.28], [813.89, 537.28]).fill(accentColor);

      // --- CERTIFICATE HEADER ---
      doc.font('Helvetica-Bold')
         .fillColor(primaryColor)
         .fontSize(22)
         .text('BOARD OF HIGHER EDUCATION', 40, 65, { align: 'center' });

      doc.font('Helvetica')
         .fillColor(secondaryColor)
         .fontSize(10)
         .text('OFFICIAL BLOCKCHAIN-SECURED CREDENTIAL', 40, 92, { align: 'center', characterSpacing: 1.5 });

      // Horizontal separator line
      doc.moveTo(250, 115)
         .lineTo(591.89, 115)
         .lineWidth(1)
         .strokeColor('#E5E7EB')
         .stroke();

      // --- CERTIFICATE MAIN BODY ---
      doc.font('Times-Italic')
         .fillColor(secondaryColor)
         .fontSize(16)
         .text('This is to certify that', 40, 140, { align: 'center' });

      doc.font('Helvetica-Bold')
         .fillColor(accentColor)
         .fontSize(32)
         .text(certData.studentName.toUpperCase(), 40, 175, { align: 'center' });

      doc.font('Times-Italic')
         .fillColor(secondaryColor)
         .fontSize(15)
         .text('has successfully completed the requirements for the award of the degree of', 40, 225, { align: 'center' });

      doc.font('Helvetica-Bold')
         .fillColor(primaryColor)
         .fontSize(20)
         .text(certData.course, 40, 260, { align: 'center' });

      doc.font('Helvetica')
         .fillColor(secondaryColor)
         .fontSize(14)
         .text(`at ${certData.college}`, 40, 295, { align: 'center' });

      doc.font('Helvetica-Bold')
         .fillColor(primaryColor)
         .fontSize(12)
         .text(`with Grade: ${certData.grade}`, 40, 330, { align: 'center' });

      // --- INTEGRITY FOOTNOTE ---
      doc.font('Courier')
         .fillColor('#6B7280')
         .fontSize(8)
         .text(`CERTIFICATE ID: ${certData.certificateId}`, 40, 375, { align: 'center' });

      // --- SIGNATURES & VERIFICATION QR ---
      const footerY = 430;

      // Draw Registrar Signature line
      doc.moveTo(100, footerY)
         .lineTo(260, footerY)
         .lineWidth(1)
         .strokeColor(secondaryColor)
         .stroke();

      doc.font('Helvetica')
         .fillColor(primaryColor)
         .fontSize(11)
         .text('REGISTRAR', 100, footerY + 8, { width: 160, align: 'center' });

      // Draw Academic Dean Signature line
      doc.moveTo(580, footerY)
         .lineTo(740, footerY)
         .lineWidth(1)
         .strokeColor(secondaryColor)
         .stroke();

      doc.font('Helvetica')
         .fillColor(primaryColor)
         .fontSize(11)
         .text('DEAN OF ACADEMIC AFFAIRS', 580, footerY + 8, { width: 160, align: 'center' });

      // Embedded QR Code in bottom center
      if (qrRelativePath) {
        const qrFullPath = path.resolve('backend', qrRelativePath.replace(/^\//, ''));
        if (fs.existsSync(qrFullPath)) {
          doc.image(qrFullPath, 380, footerY - 50, { width: 80, height: 80 });
          doc.font('Helvetica')
             .fillColor(secondaryColor)
             .fontSize(7)
             .text('SCAN TO VERIFY ON BLOCKCHAIN', 340, footerY + 38, { width: 160, align: 'center' });
        }
      }

      // Finish document
      doc.end();

      writeStream.on('finish', () => {
        resolve(`/uploads/certificates/${filename}`);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};
