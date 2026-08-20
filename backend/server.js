import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

import { connectDB, User, Student, Certificate } from './utils/db.js';
import { blockchain } from './utils/blockchain.js';
import { generateQRCode } from './utils/qrGenerator.js';
import { generateCertificatePDF } from './utils/pdfGenerator.js';
import { calculateFileHash } from './utils/hashUtils.js';

// Route Imports
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import certificateRoutes from './routes/certificate.js';
import blockchainRoutes from './routes/blockchain.js';
import verificationRoutes from './routes/verification.js';
import reportsRoutes from './routes/reports.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173', // Frontend Vite Port
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const isBackendDir = path.basename(process.cwd()) === 'backend';
const UPLOADS_DIR = isBackendDir ? path.resolve('uploads') : path.resolve('backend/uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/reports', reportsRoutes);

// Seeding function for demo profiles
const seedDatabase = async () => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      console.log('🌱 Seeding database with admin credentials & default students...');
      
      const salt = await bcrypt.genSalt(10);
      const adminPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        name: 'Dean Administrator',
        email: 'admin@college.edu',
        password: adminPassword,
        role: 'admin'
      });
      console.log('✅ Default Admin created: admin@college.edu / admin123');

      // Create realistic Indian college student records
      const studentsToSeed = [
        {
          name: 'Aarav Sharma',
          email: 'aarav@college.edu',
          enrollmentNumber: 'CS-2023-081',
          department: 'Computer Science & Engineering',
          college: 'Indian Institute of Technology, Delhi',
          course: 'B.Tech Computer Science',
          grade: 'A+'
        },
        {
          name: 'Priya Patel',
          email: 'priya@college.edu',
          enrollmentNumber: 'CA-2024-042',
          department: 'Computer Applications',
          college: 'National Institute of Technology, Trichy',
          course: 'Master of Computer Applications',
          grade: 'A'
        },
        {
          name: 'Vikram Singh',
          email: 'vikram@college.edu',
          enrollmentNumber: 'EC-2023-119',
          department: 'Electronics & Communication',
          college: 'Indian Institute of Information Technology, Hyderabad',
          course: 'B.Tech Electronics & Comm.',
          grade: 'B+'
        }
      ];

      for (const stData of studentsToSeed) {
        const studentPass = await bcrypt.hash(stData.enrollmentNumber, salt);
        
        // Save student profile
        const student = await Student.create({
          name: stData.name,
          email: stData.email,
          enrollmentNumber: stData.enrollmentNumber,
          department: stData.department,
          college: stData.college,
          course: stData.course,
          certificates: []
        });

        // Save login user credentials (role: student)
        await User.create({
          name: stData.name,
          email: stData.email,
          password: studentPass,
          role: 'student',
          enrollmentNumber: stData.enrollmentNumber
        });

        // Auto-generate a certificate for seed students
        const timeSuffix = Date.now().toString().slice(-4);
        const certificateId = `CERT-${student.enrollmentNumber.replace(/[-]/g, '')}-${timeSuffix}`;
        
        const qrFilename = `qr_${certificateId}.png`;
        const pdfFilename = `cert_${certificateId}.pdf`;

        // 1. Generate QR Code pointing to local verify page
        const qrPath = await generateQRCode(`http://localhost:5173/verify?id=${certificateId}`, qrFilename);

        const tempCert = {
          certificateId,
          studentName: student.name,
          enrollmentNumber: student.enrollmentNumber,
          course: student.course,
          college: student.college,
          grade: stData.grade
        };

        // 2. Generate PDF Certificate
        const pdfPath = await generateCertificatePDF(tempCert, pdfFilename, qrPath);
        
        // 3. Compute PDF Hash
        const isBackendDir = path.basename(process.cwd()) === 'backend';
        const pdfDiskPath = isBackendDir 
          ? path.resolve(pdfPath.replace(/^\//, '')) 
          : path.resolve('backend', pdfPath.replace(/^\//, ''));
        const pdfHash = await calculateFileHash(pdfDiskPath);

        // 4. Mine a block containing this transaction data
        const blockTx = {
          certificateId,
          studentName: student.name,
          enrollmentNumber: student.enrollmentNumber,
          course: student.course,
          grade: stData.grade,
          pdfHash
        };

        const minedBlock = await blockchain.mineBlock([blockTx]);

        // 5. Save Certificate record
        const certificate = await Certificate.create({
          certificateId,
          studentId: student._id,
          studentName: student.name,
          enrollmentNumber: student.enrollmentNumber,
          course: student.course,
          college: student.college,
          grade: stData.grade,
          hash: pdfHash,
          pdfPath,
          qrPath,
          blockIndex: minedBlock.index,
          txHash: minedBlock.hash
        });

        // 6. Update student record certificates array
        await Student.findByIdAndUpdate(student._id, {
          $push: { certificates: certificate._id }
        });
      }
      console.log('✅ Successfully seeded 3 student profiles and mined 3 blockchain certificate blocks.');
    }
  } catch (err) {
    console.error('❌ Data seeding failed:', err);
  }
};

// Start Express Server
const startServer = async () => {
  await connectDB();
  await blockchain.initialize();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
