import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Download, 
  QrCode, 
  X,
  ChevronLeft,
  ChevronRight,
  Database,
  Award,
  Loader2,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { certificateService, studentService, BACKEND_URL } from '../services/api';

const CertificateManagement = () => {
  const [certificates, setCertificates] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Issue modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Student, 2: Grade & Confirm, 3: Mining Progress, 4: Success Details
  
  // Student selection list for dropdown
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [grade, setGrade] = useState('A+');
  const [miningStatusText, setMiningStatusText] = useState('');
  const [minedResult, setMinedResult] = useState(null);
  
  // QR Modal State
  const [qrModalPath, setQrModalPath] = useState(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const data = await certificateService.getAll(page, 10, search);
      setCertificates(data.certificates);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load certificates.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsList = async () => {
    try {
      const data = await studentService.getAll(1, 100); // Load students for selector
      setStudents(data.students);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [page, search]);

  useEffect(() => {
    if (modalOpen) {
      fetchStudentsList();
    }
  }, [modalOpen]);

  const handleOpenAdd = () => {
    setStep(1);
    setSelectedStudent(null);
    setGrade('A+');
    setMinedResult(null);
    setModalOpen(true);
  };

  const triggerMiningFlow = async () => {
    setStep(3);
    
    // Antigravity Loading animations delay to build tech atmosphere
    setMiningStatusText('📐 Compiling certificate PDF layout...');
    await new Promise(r => setTimeout(r, 800));
    
    setMiningStatusText('🔐 Embedding verification QR code...');
    await new Promise(r => setTimeout(r, 600));

    setMiningStatusText('⛏️ Mining new transaction block (Proof-of-Work)...');
    
    try {
      const res = await certificateService.generate(selectedStudent._id, grade);
      
      setMiningStatusText('✅ Validating ledger block hashes...');
      await new Promise(r => setTimeout(r, 600));

      setMinedResult(res);
      setStep(4);
      toast.success('Certificate issued and mined successfully!');
      fetchCertificates();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Certificate generation failed.');
      setStep(2);
    }
  };

  const handleDownloadPdf = (pdfPath) => {
    window.open(`${BACKEND_URL}${pdfPath}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header and Issue Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Certificate Ledger</h1>
          <p className="text-xs text-cyber-muted mt-1">Issue academic degrees and inspect digital signatures on-chain</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center px-4 py-2.5 bg-cyber-cyan text-cyber-bg font-semibold rounded-lg text-xs hover:bg-opacity-90 transition-all shadow-glow-cyan"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Issue Certificate
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by student, enrollment no, or cert ID..."
          className="w-full bg-cyber-panel border border-cyber-border rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyber-cyan transition-all"
        />
      </div>

      {/* Certificate Table */}
      <div className="glass-panel overflow-hidden border border-cyber-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cyber-border text-cyber-muted uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Recipient</th>
                <th className="px-6 py-4 font-semibold">Certificate ID</th>
                <th className="px-6 py-4 font-semibold">Course</th>
                <th className="px-6 py-4 font-semibold">Grade</th>
                <th className="px-6 py-4 font-semibold">Ledger Block</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border divide-opacity-35">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-cyber-cyan animate-pulse">
                    Querying credentials ledger...
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-cyber-muted">
                    No academic certificates have been issued yet.
                  </td>
                </tr>
              ) : (
                certificates.map((cert) => (
                  <tr key={cert._id} className="hover:bg-gray-800 hover:bg-opacity-25 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{cert.studentName}</td>
                    <td className="px-6 py-4 font-mono text-cyber-cyan">{cert.certificateId}</td>
                    <td className="px-6 py-4 text-gray-300">{cert.course}</td>
                    <td className="px-6 py-4 font-semibold text-white">{cert.grade}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-500 bg-opacity-10 text-purple-400 border border-purple-500 border-opacity-20 text-[10px] font-mono">
                        <Database className="h-3 w-3 mr-1" />
                        Block #{cert.blockIndex}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleDownloadPdf(cert.pdfPath)}
                        className="p-1.5 bg-cyber-panel border border-cyber-border rounded hover:border-cyber-cyan text-gray-400 hover:text-white transition-colors"
                        title="Download Certificate PDF"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setQrModalPath(cert.qrPath)}
                        className="p-1.5 bg-cyber-panel border border-cyber-border rounded hover:border-cyber-cyan text-gray-400 hover:text-white transition-colors"
                        title="View verification QR"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        {pages > 1 && (
          <div className="px-6 py-4 border-t border-cyber-border bg-black bg-opacity-15 flex justify-between items-center text-xs">
            <span className="text-cyber-muted">
              Page {page} of {pages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 border border-cyber-border rounded hover:bg-gray-800 disabled:opacity-50 text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
                className="p-2 border border-cyber-border rounded hover:bg-gray-800 disabled:opacity-50 text-white transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Step Issue Certificate Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" 
              onClick={() => step !== 3 && setModalOpen(false)} 
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-cyber-panel border border-cyber-border rounded-xl p-6 max-w-md w-full z-50 shadow-glow-cyan"
            >
              {step !== 3 && (
                <button 
                  onClick={() => setModalOpen(false)}
                  className="absolute top-4 right-4 text-cyber-muted hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              <h3 className="font-display font-bold text-white text-lg mb-6 flex items-center">
                <Award className="mr-2 h-5 w-5 text-cyber-cyan animate-pulse" />
                Issue Academic Degree
              </h3>

              {/* Step 1: Select Student */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-cyber-muted uppercase tracking-wider mb-2">
                      Select Recipient Student
                    </label>
                    <select
                      className="w-full bg-black bg-opacity-40 border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-cyan transition-all"
                      onChange={(e) => {
                        const student = students.find(s => s._id === e.target.value);
                        setSelectedStudent(student);
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>-- Choose Enrolled Student --</option>
                      {students.map((st) => (
                        <option key={st._id} value={st._id}>
                          {st.name} ({st.enrollmentNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedStudent && (
                    <div className="p-4 rounded-lg bg-black bg-opacity-30 border border-cyber-border text-xs space-y-2 text-gray-300">
                      <p><span className="text-cyber-muted">Department:</span> {selectedStudent.department}</p>
                      <p><span className="text-cyber-muted">Degree Track:</span> {selectedStudent.course}</p>
                      <p><span className="text-cyber-muted">Institute:</span> {selectedStudent.college}</p>
                    </div>
                  )}

                  <div className="pt-3">
                    <button
                      disabled={!selectedStudent}
                      onClick={() => setStep(2)}
                      className="w-full py-2.5 bg-cyber-cyan text-cyber-bg font-bold rounded-lg text-xs hover:opacity-90 disabled:opacity-50 transition-all shadow-glow-cyan"
                    >
                      Continue to Details
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Details & Grading */}
              {step === 2 && selectedStudent && (
                <div className="space-y-5">
                  <div className="p-4 rounded-lg bg-black bg-opacity-30 border border-cyber-border text-xs space-y-1">
                    <p className="text-[10px] text-cyber-muted uppercase tracking-wider font-semibold">Recipient Info</p>
                    <p className="font-bold text-white text-sm mt-1">{selectedStudent.name}</p>
                    <p className="text-gray-300">{selectedStudent.course} | {selectedStudent.enrollmentNumber}</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-cyber-muted uppercase tracking-wider mb-2">
                      Assign Grade / Division Score
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full bg-black bg-opacity-40 border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-cyan transition-all"
                    >
                      <option value="A+">Grade A+ (Distinction)</option>
                      <option value="A">Grade A (First Class)</option>
                      <option value="B+">Grade B+ (Upper Second)</option>
                      <option value="B">Grade B (Second Class)</option>
                      <option value="C">Grade C (Pass)</option>
                    </select>
                  </div>

                  <div className="pt-3 flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-2.5 border border-cyber-border rounded-lg text-xs font-semibold text-white hover:bg-gray-800 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={triggerMiningFlow}
                      className="flex-1 py-2.5 bg-cyber-cyan text-cyber-bg font-bold rounded-lg text-xs hover:opacity-90 transition-all shadow-glow-cyan"
                    >
                      Generate & Mine Block
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Computational Hashing & Mining Delay */}
              {step === 3 && (
                <div className="text-center py-10 space-y-6">
                  <Loader2 className="h-10 w-10 text-cyber-cyan animate-spin mx-auto" />
                  <div>
                    <h4 className="font-display font-bold text-white text-md">Ledger Mining in Progress</h4>
                    <p className="text-xs text-cyber-cyan mt-3 animate-pulse font-mono">{miningStatusText}</p>
                  </div>
                  <p className="text-[10px] text-cyber-muted px-4 leading-relaxed">
                    Please do not close this window. The server is mining a new block, linking block hashes, and validating proof-of-work.
                  </p>
                </div>
              )}

              {/* Step 4: Success Details */}
              {step === 4 && minedResult && (
                <div className="space-y-6 text-center">
                  <div className="p-2 bg-cyber-green bg-opacity-10 text-cyber-green rounded-full w-12 h-12 flex items-center justify-center mx-auto shadow-glow-green">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>

                  <div>
                    <h4 className="font-display font-bold text-white text-md">Certificate Successfully Mined!</h4>
                    <p className="text-[11px] text-cyber-muted mt-1">Immutable ledger block successfully appended.</p>
                  </div>

                  <div className="p-4 rounded-lg bg-black bg-opacity-30 border border-cyber-border text-left text-xs space-y-2 font-mono">
                    <p><span className="text-cyber-muted">Cert ID:</span> <span className="text-cyber-cyan">{minedResult.certificateId}</span></p>
                    <p><span className="text-cyber-muted">Block Mined:</span> <span className="text-white">#{minedResult.blockIndex}</span></p>
                    <p><span className="text-cyber-muted">Block Hash:</span> <span className="text-cyber-muted break-all text-[10px]">{minedResult.txHash}</span></p>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      onClick={() => handleDownloadPdf(minedResult.pdfPath)}
                      className="flex-1 py-2.5 bg-cyber-cyan bg-opacity-10 border border-cyber-cyan border-opacity-20 rounded-lg text-xs font-semibold text-cyber-cyan hover:bg-cyber-cyan hover:text-cyber-bg transition-all"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={() => setModalOpen(false)}
                      className="flex-1 py-2.5 bg-cyber-panel border border-cyber-border rounded-lg text-xs font-semibold text-white hover:bg-gray-800 transition-colors"
                    >
                      Close Portal
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Modal Overlay */}
      {qrModalPath && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={() => setQrModalPath(null)} />
          <div className="relative bg-cyber-panel border border-cyber-border rounded-xl p-6 max-w-sm w-full text-center z-50 shadow-glow-cyan animate-scaleUp">
            <button onClick={() => setQrModalPath(null)} className="absolute top-4 right-4 text-cyber-muted hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-display font-bold text-white text-md mb-4">Verification QR Code</h3>
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              <img src={`${BACKEND_URL}${qrModalPath}`} alt="QR Code" className="w-48 h-48" />
            </div>
            <p className="text-xs text-cyber-muted px-4">Scan this QR code with a camera to instantly view verification credentials.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateManagement;
