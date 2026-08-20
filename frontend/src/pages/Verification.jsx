import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  UploadCloud, 
  FileText, 
  Search, 
  CheckCircle, 
  AlertTriangle,
  Database,
  Calendar,
  Layers,
  Fingerprint,
  QrCode
} from 'lucide-react';
import { verificationService } from '../services/api';
import VerificationBadge from '../components/3D/VerificationBadge';

const Verification = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('id'); // 'id', 'file', 'qr'
  const [certId, setCertId] = useState('');
  
  // File upload state
  const [file, setFile] = useState(null);
  
  // Verification Output States
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle', 'genuine', 'tampered', 'fake'
  const [resultData, setResultData] = useState(null);

  // Auto-verify if Certificate ID is provided in URL params (?id=...)
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      setCertId(idParam);
      setActiveTab('id');
      verifyCertificateById(idParam);
    }
  }, [searchParams]);

  const verifyCertificateById = async (idToVerify) => {
    const targetId = idToVerify || certId;
    if (!targetId) {
      toast.error('Please enter a Certificate ID');
      return;
    }

    setLoading(true);
    setStatus('idle');
    setResultData(null);

    // Dynamic delay to let 3D scanner spin and build fintech aesthetics
    await new Promise(r => setTimeout(r, 1200));

    try {
      const data = await verificationService.verifyById(targetId);
      setResultData(data);
      setStatus(data.status); // 'genuine', 'tampered'
      toast.success(data.message);
    } catch (err) {
      console.error(err);
      const errRes = err.response?.data;
      if (errRes && errRes.status) {
        setStatus(errRes.status); // 'fake', 'tampered'
        setResultData(errRes);
        toast.error(errRes.message);
      } else {
        setStatus('fake');
        toast.error('Verification failed. No matching certificate found.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const verifyCertificateByFile = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a PDF certificate file');
      return;
    }

    setLoading(true);
    setStatus('idle');
    setResultData(null);

    await new Promise(r => setTimeout(r, 1500));

    try {
      const data = await verificationService.verifyByFile(file);
      setResultData(data);
      setStatus(data.status); // 'genuine', 'tampered'
      toast.success(data.message);
    } catch (err) {
      console.error(err);
      const errRes = err.response?.data;
      if (errRes && errRes.status) {
        setStatus(errRes.status); // 'fake', 'tampered'
        setResultData(errRes);
        toast.error(errRes.message);
      } else {
        setStatus('fake');
        toast.error('Verification failed. The uploaded file is either fake or altered.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock QR Code Scanner for Web Camera simulation inside browser sandbox
  const handleQrMockUpload = async () => {
    setLoading(true);
    setStatus('idle');
    setResultData(null);
    toast.loading('Initializing mock camera scan...', { duration: 1000 });
    
    await new Promise(r => setTimeout(r, 1200));
    
    // Auto-fill Aarav's certificate ID to simulate scanning his QR code
    const mockId = 'CERT-CS2023081-0000'; // We will search for his actual ID or match the seed ID format
    // Since the seed format generated CS-2023-081 without hyphens: CS2023081
    // Let's resolve the first certificate in our database to mock realistically!
    try {
      // Find the first certificate of seed students to verify
      setCertId('CERT-CS2023081-');
      toast.success('QR Code read successfully! Initiating chain verification...');
      // Just run verify with standard seed ID
      // To ensure it matches, we can search by student enrollment or cert prefix
      // Let's query by mock ID CS2023081. In server.js we did:
      // const certificateId = `CERT-${student.enrollmentNumber.replace(/[-]/g, '')}-${timeSuffix}`;
      // So searching for "CERT-CS2023081" (which starts with CS2023081) will resolve.
      // We will look up certId using a query or just verify the first student
      verifyCertificateById('CERT-CS2023081-');
    } catch (e) {
      verifyCertificateById('CERT-CS2023081-');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold text-white">Cryptographic Verification Gate</h1>
        <p className="text-xs text-cyber-muted mt-1.5">Verify academic credentials on the blockchain ledger through multiple paths</p>
      </div>

      {/* Grid: Form on Left, 3D Badge Status on Right */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        {/* Verification Inputs (Left cols) */}
        <div className="md:col-span-3 glass-panel p-6 border border-cyber-border space-y-6">
          {/* Tab Selector */}
          <div className="flex bg-black bg-opacity-40 p-1 rounded-lg border border-cyber-border text-xs">
            <button
              onClick={() => { setActiveTab('id'); setStatus('idle'); setResultData(null); }}
              className={`flex-1 py-2 font-semibold rounded-md transition-all ${
                activeTab === 'id' ? 'bg-cyber-blue bg-opacity-10 text-cyber-cyan border border-cyber-cyan border-opacity-10 shadow-glow-cyan' : 'text-gray-400 hover:text-white'
              }`}
            >
              Certificate ID
            </button>
            <button
              onClick={() => { setActiveTab('file'); setStatus('idle'); setResultData(null); }}
              className={`flex-1 py-2 font-semibold rounded-md transition-all ${
                activeTab === 'file' ? 'bg-cyber-blue bg-opacity-10 text-cyber-cyan border border-cyber-cyan border-opacity-10 shadow-glow-cyan' : 'text-gray-400 hover:text-white'
              }`}
            >
              Upload PDF File
            </button>
            <button
              onClick={() => { setActiveTab('qr'); setStatus('idle'); setResultData(null); }}
              className={`flex-1 py-2 font-semibold rounded-md transition-all ${
                activeTab === 'qr' ? 'bg-cyber-blue bg-opacity-10 text-cyber-cyan border border-cyber-cyan border-opacity-10 shadow-glow-cyan' : 'text-gray-400 hover:text-white'
              }`}
            >
              Scan QR Code
            </button>
          </div>

          {/* Tab 1: Certificate ID Form */}
          {activeTab === 'id' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-cyber-muted uppercase tracking-wider mb-2">
                  Enter Certificate ID
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={certId}
                    onChange={(e) => setCertId(e.target.value)}
                    placeholder="e.g. CERT-CS2023081-1234"
                    className="w-full bg-black bg-opacity-40 border border-cyber-border rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition-all"
                  />
                </div>
              </div>

              <button
                onClick={() => verifyCertificateById()}
                disabled={loading}
                className="w-full py-2.5 bg-cyber-cyan text-cyber-bg font-bold text-xs rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center shadow-glow-cyan"
              >
                {loading ? 'Performing Ledger Audit...' : 'Audit Certificate ID'}
              </button>
            </div>
          )}

          {/* Tab 2: PDF File Upload Form */}
          {activeTab === 'file' && (
            <form onSubmit={verifyCertificateByFile} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-cyber-muted uppercase tracking-wider mb-2">
                  Upload Academic Certificate PDF
                </label>
                
                <div className="border-2 border-dashed border-cyber-border hover:border-cyber-cyan rounded-lg p-6 flex flex-col items-center justify-center transition-all bg-black bg-opacity-25 relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="h-10 w-10 text-cyber-muted mb-2" />
                  <p className="text-xs text-white font-medium">
                    {file ? file.name : 'Drag & drop or click to choose certificate file'}
                  </p>
                  <p className="text-[10px] text-cyber-muted mt-1">PDF documents only (max 5MB)</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full py-2.5 bg-cyber-cyan text-cyber-bg font-bold text-xs rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center shadow-glow-cyan"
              >
                {loading ? 'Re-calculating document hashes...' : 'Upload & Verify File'}
              </button>
            </form>
          )}

          {/* Tab 3: QR Code Scanner simulation */}
          {activeTab === 'qr' && (
            <div className="text-center py-6 space-y-5">
              <div className="w-48 h-48 border-2 border-dashed border-cyber-cyan border-opacity-40 rounded-xl mx-auto flex flex-col items-center justify-center bg-black bg-opacity-35 relative overflow-hidden group">
                <QrCode className="h-16 w-16 text-cyber-cyan text-opacity-30 group-hover:text-opacity-80 transition-colors duration-300" />
                <div className="absolute top-0 left-0 w-full h-0.5 bg-cyber-cyan animate-pulse bg-opacity-70" style={{
                  animation: 'scan 2s linear infinite',
                  boxShadow: '0 0 10px #06B6D4'
                }}></div>
              </div>

              <button
                onClick={handleQrMockUpload}
                disabled={loading}
                className="px-6 py-2.5 bg-cyber-cyan text-cyber-bg font-bold text-xs rounded-lg hover:opacity-90 transition-all shadow-glow-cyan"
              >
                Mock QR Camera Scan
              </button>

              {/* Scan style animation keyframe */}
              <style>{`
                @keyframes scan {
                  0% { top: 0%; }
                  50% { top: 100%; }
                  100% { top: 0%; }
                }
              `}</style>
            </div>
          )}
        </div>

        {/* 3D Verification Badge Display (Right cols) */}
        <div className="md:col-span-2 glass-panel p-6 border border-cyber-border flex flex-col items-center justify-center text-center">
          <p className="text-[10px] text-cyber-muted uppercase tracking-wider font-semibold mb-2">Verification Seal</p>
          <VerificationBadge status={status} />
          
          <div className="mt-4">
            <h4 className="font-display font-bold text-white text-md uppercase">
              {status === 'idle' && 'Scanner Ready'}
              {status === 'genuine' && '✅ Genuine Credential'}
              {status === 'tampered' && '❌ Tampered Certificate'}
              {status === 'fake' && '❌ Fake Certificate'}
            </h4>
            <p className="text-xs text-cyber-muted mt-1 px-4">
              {status === 'idle' && 'Submit a credential signature to verify block records.'}
              {status === 'genuine' && 'Verified genuine. The document SHA-256 matches the mined block.'}
              {status === 'tampered' && 'Caution: Certificate values matched, but document hash is broken!'}
              {status === 'fake' && 'Warning: No matching record found on the blockchain network ledger.'}
            </p>
          </div>
        </div>
      </div>

      {/* Result Inspector Panel */}
      <AnimatePresence>
        {resultData && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Student metadata */}
            {resultData.certificate && (
              <div className="glass-panel p-6 border border-cyber-border space-y-4">
                <h3 className="font-display font-bold text-white text-md border-b border-cyber-border pb-3 flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-cyber-cyan" />
                  Certificate Information
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-cyber-muted block uppercase text-[10px]">Student Graduate</span>
                      <span className="font-semibold text-white">{resultData.certificate.studentName}</span>
                    </div>
                    <div>
                      <span className="text-cyber-muted block uppercase text-[10px]">Enrollment Number</span>
                      <span className="font-mono text-white">{resultData.certificate.enrollmentNumber}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-cyber-muted block uppercase text-[10px]">Degree / Award course</span>
                    <span className="font-semibold text-white">{resultData.certificate.course}</span>
                  </div>
                  <div>
                    <span className="text-cyber-muted block uppercase text-[10px]">Affiliated College</span>
                    <span className="text-gray-300">{resultData.certificate.college}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-cyber-border border-opacity-30">
                    <div>
                      <span className="text-cyber-muted block uppercase text-[10px]"><Calendar className="inline h-3 w-3 mr-1" /> Issue Date</span>
                      <span className="text-gray-300">{new Date(resultData.certificate.issueDate || resultData.certificate.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-cyber-muted block uppercase text-[10px]"><Layers className="inline h-3 w-3 mr-1" /> Grade</span>
                      <span className="font-bold text-cyber-cyan">{resultData.certificate.grade}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Blockchain ledger details */}
            {resultData.block && (
              <div className="glass-panel p-6 border border-cyber-border space-y-4">
                <h3 className="font-display font-bold text-white text-md border-b border-cyber-border pb-3 flex items-center">
                  <Database className="mr-2 h-5 w-5 text-purple-400" />
                  Mined Ledger Audit
                </h3>
                <div className="space-y-3.5 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-cyber-muted block uppercase text-[10px] font-sans">Block Number</span>
                      <span className="font-bold text-white">Block #{resultData.block.index}</span>
                    </div>
                    <div>
                      <span className="text-cyber-muted block uppercase text-[10px] font-sans">Mining Nonce</span>
                      <span className="text-white">{resultData.block.nonce}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-black bg-opacity-25 rounded border border-cyber-border">
                    <span className="text-cyber-muted block uppercase text-[9px] font-sans mb-1"><Fingerprint className="inline h-3 w-3 mr-1" /> Block Hash</span>
                    <span className="text-cyber-cyan break-all text-[10px]">{resultData.block.hash}</span>
                  </div>

                  <div className="p-2.5 bg-black bg-opacity-25 rounded border border-cyber-border">
                    <span className="text-cyber-muted block uppercase text-[9px] font-sans mb-1">Previous Link Hash</span>
                    <span className="text-gray-400 break-all text-[10px]">{resultData.block.previousHash}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Verification;
