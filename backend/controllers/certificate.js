import path from 'path';
import fs from 'fs';
import { Certificate, Student } from '../utils/db.js';
import { generateQRCode } from '../utils/qrGenerator.js';
import { generateCertificatePDF } from '../utils/pdfGenerator.js';
import { calculateFileHash } from '../utils/hashUtils.js';
import { blockchain } from '../utils/blockchain.js';

export const generateCertificate = async (req, res) => {
  const { studentId, grade } = req.body;

  try {
    if (!studentId || !grade) {
      return res.status(400).json({ message: 'Student ID and Grade are required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Generate unique Certificate ID
    const timeSuffix = Date.now().toString().slice(-6);
    const certificateId = `CERT-${student.enrollmentNumber.replace(/\s+/g, '')}-${timeSuffix}`;

    // Target filenames
    const qrFilename = `qr_${certificateId}.png`;
    const pdfFilename = `cert_${certificateId}.pdf`;

    // 1. Generate QR Code
    // Point QR code to frontend verification URL
    const frontendVerifyUrl = `http://localhost:5173/verify?id=${certificateId}`;
    const qrPath = await generateQRCode(frontendVerifyUrl, qrFilename);

    // Temp cert data for PDF rendering
    const tempCertData = {
      certificateId,
      studentName: student.name,
      enrollmentNumber: student.enrollmentNumber,
      course: student.course,
      college: student.college,
      grade
    };

    // 2. Generate PDF Certificate (embeds the generated QR code)
    const pdfPath = await generateCertificatePDF(tempCertData, pdfFilename, qrPath);

    // 3. Compute SHA-256 hash of the generated PDF file
    const isBackendDir = path.basename(process.cwd()) === 'backend';
    const pdfDiskPath = isBackendDir 
      ? path.resolve(pdfPath.replace(/^\//, '')) 
      : path.resolve('backend', pdfPath.replace(/^\//, ''));
    const pdfHash = await calculateFileHash(pdfDiskPath);

    // 4. Mine block containing certificate details & PDF hash
    const blockTransaction = {
      certificateId,
      studentName: student.name,
      enrollmentNumber: student.enrollmentNumber,
      course: student.course,
      grade,
      pdfHash
    };

    const minedBlock = await blockchain.mineBlock([blockTransaction]);

    // 5. Create Certificate Record in DB
    const certificate = await Certificate.create({
      certificateId,
      studentId: student._id,
      studentName: student.name,
      enrollmentNumber: student.enrollmentNumber,
      course: student.course,
      college: student.college,
      grade,
      hash: pdfHash,
      pdfPath,
      qrPath,
      blockIndex: minedBlock.index,
      txHash: minedBlock.hash
    });

    // 6. Update Student's list of certificates
    await Student.findByIdAndUpdate(student._id, {
      $push: { certificates: certificate._id }
    });

    res.status(201).json(certificate);
  } catch (err) {
    console.error('Generate certificate error:', err);
    res.status(500).json({ message: 'Server error during certificate generation' });
  }
};

export const getCertificates = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';

  try {
    const query = {};
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { enrollmentNumber: { $regex: search, $options: 'i' } },
        { certificateId: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Certificate.countDocuments(query);
    const rawCerts = await Certificate.find(query);
    
    let certificates = rawCerts;
    if (typeof rawCerts.sort === 'function') {
      certificates = await Certificate.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    } else {
      certificates = rawCerts.slice((page - 1) * limit, page * limit);
    }

    res.json({
      certificates,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    console.error('Get certificates error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCertificateById = async (req, res) => {
  const { id } = req.params;

  try {
    // Try by certificateId first, then by internal database ID
    let certificate = await Certificate.findOne({ certificateId: id });
    if (!certificate) {
      certificate = await Certificate.findById(id);
    }

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    res.json(certificate);
  } catch (err) {
    console.error('Get certificate by ID error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentCertificates = async (req, res) => {
  const { studentId } = req.params;

  try {
    const certificates = await Certificate.find({ studentId });
    res.json(certificates);
  } catch (err) {
    console.error('Get student certificates error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
