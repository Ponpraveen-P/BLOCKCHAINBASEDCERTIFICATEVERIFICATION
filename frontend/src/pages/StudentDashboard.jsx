import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FileText, 
  Download, 
  QrCode, 
  Database,
  Award,
  Calendar,
  Layers,
  X
} from 'lucide-react';
import { studentService, certificateService, BACKEND_URL } from '../services/api';

const StudentDashboard = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQr, setSelectedQr] = useState(null); // stores path of QR to show in modal

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const userString = localStorage.getItem('user');
        if (!userString) return;
        
        const user = JSON.parse(userString);
        
        if (!user.studentId) {
          toast.error('Student profile reference not found.');
          return;
        }

        // Fetch student profile along with manual certificates resolution
        const data = await studentService.getById(user.studentId);
        setStudentInfo(data.student);
        setCertificates(data.certificates);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load student credentials.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const handleDownloadPdf = (pdfPath) => {
    // Statically served by backend Express app
    const fileUrl = `${BACKEND_URL}${pdfPath}`;
    window.open(fileUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-cyber-cyan animate-pulse">
        Fetching cryptographic degree credentials...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Student Banner */}
      {studentInfo && (
        <div className="glass-panel p-6 relative overflow-hidden border border-cyber-border bg-gradient-to-r from-cyber-panel to-[#141E30]">
          <div className="absolute top-0 right-0 w-64 h-full bg-cyber-blue opacity-5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <p className="text-xs text-cyber-cyan tracking-wider font-semibold uppercase">Academic Record</p>
              <h1 className="text-3xl font-display font-bold text-white mt-1">{studentInfo.name}</h1>
              <p className="text-sm text-cyber-muted mt-2">{studentInfo.college}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs text-gray-300 border-l border-cyber-border pl-0 md:pl-8">
              <div>
                <span className="text-cyber-muted block uppercase">Enrollment ID</span>
                <span className="font-mono font-medium text-white">{studentInfo.enrollmentNumber}</span>
              </div>
              <div>
                <span className="text-cyber-muted block uppercase">Department</span>
                <span className="font-medium text-white">{studentInfo.department}</span>
              </div>
              <div>
                <span className="text-cyber-muted block uppercase">Degree Track</span>
                <span className="font-medium text-white">{studentInfo.course}</span>
              </div>
              <div>
                <span className="text-cyber-muted block uppercase">Verified Ledger Logs</span>
                <span className="font-semibold text-cyber-green">{certificates.length} Credentials Mined</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificates Section */}
      <div>
        <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center">
          <Award className="mr-2 h-5 w-5 text-cyber-cyan" />
          My Credentials
        </h2>

        {certificates.length === 0 ? (
          <div className="glass-panel p-12 text-center text-cyber-muted">
            No certificates have been issued to your academic account yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div 
                key={cert._id}
                className="glass-panel p-6 border border-cyber-border hover:border-cyber-cyan hover:border-opacity-35 transition-all group tilt-card"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-cyber-blue bg-opacity-10 text-cyber-cyan border border-cyber-blue border-opacity-10 text-[10px] font-mono tracking-wider">
                      {cert.certificateId}
                    </span>
                    <h3 className="text-lg font-display font-bold text-white mt-2 group-hover:text-cyber-cyan transition-colors">
                      {cert.course}
                    </h3>
                  </div>
                  <Award className="h-6 w-6 text-cyber-cyan" />
                </div>

                <div className="space-y-2 mb-6 text-xs text-cyber-muted">
                  <p className="flex items-center">
                    <Calendar className="mr-2 h-3.5 w-3.5" />
                    Issued: {new Date(cert.issueDate || cert.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="flex items-center">
                    <Layers className="mr-2 h-3.5 w-3.5" />
                    Performance Score: <span className="font-semibold text-white ml-1">{cert.grade}</span>
                  </p>
                  <p className="flex items-center">
                    <Database className="mr-2 h-3.5 w-3.5" />
                    Block Index: <span className="font-mono text-purple-400 ml-1">#{cert.blockIndex}</span>
                  </p>
                </div>

                {/* Card CTA Actions */}
                <div className="flex gap-3 pt-4 border-t border-cyber-border">
                  <button
                    onClick={() => handleDownloadPdf(cert.pdfPath)}
                    className="flex-1 flex items-center justify-center py-2 bg-cyber-cyan bg-opacity-10 border border-cyber-cyan border-opacity-20 rounded-lg text-xs font-semibold text-cyber-cyan hover:bg-cyber-cyan hover:text-cyber-bg transition-all"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => setSelectedQr(cert.qrPath)}
                    className="flex items-center justify-center p-2 bg-cyber-panel border border-cyber-border rounded-lg text-gray-300 hover:text-white hover:border-cyber-cyan transition-all"
                    title="Show Verification QR Code"
                  >
                    <QrCode className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal Overlay */}
      {selectedQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={() => setSelectedQr(null)} />
          
          <div className="relative bg-cyber-panel border border-cyber-border rounded-xl p-6 max-w-sm w-full text-center z-50 shadow-glow-cyan">
            <button 
              onClick={() => setSelectedQr(null)}
              className="absolute top-4 right-4 text-cyber-muted hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="font-display font-bold text-white text-md mb-4">Verification QR Code</h3>
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              <img 
                src={`${BACKEND_URL}${selectedQr}`} 
                alt="Verification QR Code" 
                className="w-48 h-48"
              />
            </div>
            <p className="text-xs text-cyber-muted px-4 leading-relaxed">
              Show this QR code to recruiters or audit managers to instantly verify the credential's hash ledger records.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
