import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:5000/api';

const runIntegrationCheck = async () => {
  console.log('🧪 Starting End-to-End Cryptographic Ledger Integration Check...');
  
  try {
    // 1. Admin Login Verification
    console.log('\n🔐 [Step 1] Verifying Administrator Sign-In credentials...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@college.edu', password: 'admin123' })
    });
    
    if (!loginRes.ok) {
      throw new Error(`Admin login failed: ${loginRes.statusText}`);
    }
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✅ Admin credentials authenticated successfully. Session token acquired.');

    // 2. Enroll Student Verification
    console.log('\n🎓 [Step 2] Testing Student Registry enrollment...');
    const studentPayload = {
      name: 'Karthik Raja',
      email: 'karthik@college.edu',
      enrollmentNumber: 'CS-2023-999',
      department: 'Computer Science & Engineering',
      college: 'Anna University, Chennai',
      course: 'B.Tech Information Technology'
    };
    
    const studentRes = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(studentPayload)
    });
    
    if (!studentRes.ok) {
      const err = await studentRes.json();
      throw new Error(`Student enrollment failed: ${err.message || studentRes.statusText}`);
    }
    
    const student = await studentRes.json();
    console.log(`✅ Student registered successfully. Enrollment ID: ${student.enrollmentNumber}, ID: ${student._id}`);

    // 3. Issue and Mine Certificate Verification
    console.log('\n⛏️ [Step 3] Testing Certificate generation and Blockchain mining...');
    const certPayload = {
      studentId: student._id,
      grade: 'A+'
    };
    
    const certRes = await fetch(`${API_BASE}/certificates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(certPayload)
    });
    
    if (!certRes.ok) {
      const err = await certRes.json();
      throw new Error(`Certificate generation failed: ${err.message || certRes.statusText}`);
    }
    
    const cert = await certRes.json();
    console.log(`✅ Certificate issued successfully!`);
    console.log(`📜 Certificate ID: ${cert.certificateId}`);
    console.log(`📦 Mined into Block #${cert.blockIndex}`);
    console.log(`🔗 Transaction Hash: ${cert.txHash}`);
    console.log(`📂 PDF File path: http://localhost:5000${cert.pdfPath}`);

    // 4. Verify by ID Verification
    console.log('\n🔍 [Step 4] Testing public audit verification by ID...');
    const verifyIdRes = await fetch(`${API_BASE}/verification/id/${cert.certificateId}`);
    if (!verifyIdRes.ok) {
      throw new Error(`Verification by ID failed: ${verifyIdRes.statusText}`);
    }
    
    const verifyIdData = await verifyIdRes.json();
    console.log(`Audit Status: ${verifyIdData.status.toUpperCase()} (${verifyIdData.message})`);
    if (verifyIdData.verified && verifyIdData.status === 'genuine') {
      console.log('✅ Verification by ID passed successfully.');
    } else {
      throw new Error(`Verification by ID did not report Genuine status! Got: ${verifyIdData.status}`);
    }

    // 5. Verify by File Upload Verification
    console.log('\n📂 [Step 5] Testing integrity verification by PDF File Upload...');
    // We download the generated certificate file statically from the server
    const pdfUrl = `http://localhost:5000${cert.pdfPath}`;
    const downloadRes = await fetch(pdfUrl);
    if (!downloadRes.ok) {
      throw new Error(`Failed to download certificate PDF from server static directory: ${downloadRes.statusText}`);
    }
    
    const pdfBuffer = await downloadRes.arrayBuffer();
    const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
    
    // Construct multi-part form data
    const formData = new FormData();
    formData.append('file', pdfBlob, `cert_${cert.certificateId}.pdf`);
    
    const verifyFileRes = await fetch(`${API_BASE}/verification/file`, {
      method: 'POST',
      body: formData
    });
    
    if (!verifyFileRes.ok) {
      throw new Error(`Verification by file failed: ${verifyFileRes.statusText}`);
    }
    
    const verifyFileData = await verifyFileRes.json();
    console.log(`Audit Status: ${verifyFileData.status.toUpperCase()} (${verifyFileData.message})`);
    if (verifyFileData.verified && verifyFileData.status === 'genuine') {
      console.log('✅ Verification by PDF file upload matches ledger hash successfully.');
    } else {
      throw new Error(`Verification by PDF upload did not report Genuine status! Got: ${verifyFileData.status}`);
    }

    // 6. Ledger validation check
    console.log('\n🛡️ [Step 6] Testing total blockchain validation sequence...');
    const validateRes = await fetch(`${API_BASE}/blockchain/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!validateRes.ok) {
      throw new Error(`Blockchain validation endpoint failed: ${validateRes.statusText}`);
    }
    
    const validateData = await validateRes.json();
    console.log('Audit Result:', validateData);
    if (validateData.isValid) {
      console.log(`✅ System consensus verified. ${validateData.count} blocks audited and secure.`);
    } else {
      throw new Error(`System consensus validation failed! Reason: ${validateData.reason}`);
    }

    console.log('\n🎉 E2E INTEGRATION CHECKS COMPLETED: ALL PATTERNS WORK SUCCESSFULLY!');
  } catch (error) {
    console.error('\n❌ Integration check failed:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
};

runIntegrationCheck();
