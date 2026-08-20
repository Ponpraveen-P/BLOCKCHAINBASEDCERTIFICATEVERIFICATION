import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  FileSpreadsheet, 
  Database, 
  ShieldCheck, 
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Award
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { reportsService, blockchainService, studentService, certificateService } from '../services/api';

const COLORS = ['#06B6D4', '#3B82F6', '#10B981', '#F59E0B', '#6366F1'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentCerts, setRecentCerts] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const statsData = await reportsService.getStats();
      setStats(statsData);

      const studResponse = await studentService.getAll(1, 4);
      setRecentStudents(studResponse.students);

      const certResponse = await certificateService.getAll(1, 4);
      setRecentCerts(certResponse.certificates);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleValidateLedger = async () => {
    setAuditLoading(true);
    try {
      const data = await blockchainService.validate();
      if (data.isValid) {
        toast.success(`Ledger Verified: Chain is secure. ${data.count} blocks audited.`);
      } else {
        toast.error(`LEDGER COMPROMISED! Tampering detected: ${data.reason}`);
      }
      fetchData(); // Reload stats to capture updated check
    } catch (err) {
      console.error(err);
      toast.error('Failed to execute blockchain ledger audit.');
    } finally {
      setAuditLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-cyber-cyan animate-pulse">
        Fetching cryptographic network stats...
      </div>
    );
  }

  const { summary, charts } = stats;

  return (
    <div className="space-y-8">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Dean Dashboard</h1>
          <p className="text-xs text-cyber-muted mt-1">Manage, issue and audit cryptographic credentials on the blockchain</p>
        </div>
        <button
          onClick={handleValidateLedger}
          disabled={auditLoading}
          className="flex items-center px-4 py-2.5 bg-cyber-panel border border-cyber-border rounded-lg text-xs font-semibold text-white hover:border-cyber-cyan transition-all shadow-glow-blue disabled:opacity-50"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${auditLoading ? 'animate-spin' : ''}`} />
          {auditLoading ? 'Auditing Ledger...' : 'Audit Ledger Integrity'}
        </button>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1 */}
        <div className="glass-panel p-6 tilt-card relative overflow-hidden group hover:border-cyber-cyan hover:border-opacity-35 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-cyber-muted uppercase tracking-wider font-semibold">Total Students</p>
              <h3 className="text-3xl font-display font-bold text-white mt-1.5">{summary.totalStudents}</h3>
            </div>
            <div className="p-3 bg-cyber-cyan bg-opacity-5 rounded-lg text-cyber-cyan group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-0.5 bg-cyber-cyan w-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </div>

        {/* Stat 2 */}
        <div className="glass-panel p-6 tilt-card relative overflow-hidden group hover:border-cyber-blue hover:border-opacity-35 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-cyber-muted uppercase tracking-wider font-semibold">Mined Certificates</p>
              <h3 className="text-3xl font-display font-bold text-white mt-1.5">{summary.totalCertificates}</h3>
            </div>
            <div className="p-3 bg-cyber-blue bg-opacity-5 rounded-lg text-cyber-blue group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-0.5 bg-cyber-blue w-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </div>

        {/* Stat 3 */}
        <div className="glass-panel p-6 tilt-card relative overflow-hidden group hover:border-purple-500 hover:border-opacity-35 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-cyber-muted uppercase tracking-wider font-semibold">Ledger Blocks</p>
              <h3 className="text-3xl font-display font-bold text-white mt-1.5">{summary.totalBlocks}</h3>
            </div>
            <div className="p-3 bg-purple-500 bg-opacity-5 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
              <Database className="h-6 w-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-0.5 bg-purple-500 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </div>

        {/* Stat 4 */}
        <div className="glass-panel p-6 tilt-card relative overflow-hidden group hover:border-cyber-green hover:border-opacity-35 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-cyber-muted uppercase tracking-wider font-semibold">Ledger Audit</p>
              <h3 className={`text-xl font-display font-bold mt-2.5 flex items-center ${summary.isChainValid ? 'text-cyber-green' : 'text-cyber-red animate-pulse'}`}>
                {summary.isChainValid ? (
                  <>
                    <ShieldCheck className="mr-1.5 h-5 w-5" />
                    SECURE
                  </>
                ) : (
                  <>
                    <ShieldAlert className="mr-1.5 h-5 w-5" />
                    TAMPERED
                  </>
                )}
              </h3>
            </div>
            <div className={`p-3 bg-opacity-5 rounded-lg group-hover:scale-110 transition-transform ${summary.isChainValid ? 'bg-cyber-green text-cyber-green' : 'bg-cyber-red text-cyber-red'}`}>
              {summary.isChainValid ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
            </div>
          </div>
          <div className={`absolute bottom-0 left-0 h-0.5 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left ${summary.isChainValid ? 'bg-cyber-green' : 'bg-cyber-red'}`}></div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificate Timeline Chart */}
        <div className="glass-panel p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-display font-bold text-white text-md flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-cyber-cyan" />
              Certificate Minting Activity
            </h4>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.timeline}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#101725', borderColor: '#1E293B', color: '#FFF' }}
                  itemStyle={{ color: '#06B6D4' }}
                />
                <Area type="monotone" dataKey="count" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution Pie */}
        <div className="glass-panel p-6">
          <h4 className="font-display font-bold text-white text-md mb-6">
            Student Distribution
          </h4>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.department}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.department.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#101725', borderColor: '#1E293B', color: '#FFF' }} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recents Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-display font-bold text-white text-md">Recently Registered Students</h4>
            <Link to="/students" className="text-xs text-cyber-cyan hover:underline flex items-center">
              View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cyber-border text-cyber-muted uppercase tracking-wider pb-2">
                  <th className="py-2.5 font-semibold">Name</th>
                  <th className="py-2.5 font-semibold">Enrollment No</th>
                  <th className="py-2.5 font-semibold">Department</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border divide-opacity-30">
                {recentStudents.map((st) => (
                  <tr key={st._id} className="hover:bg-gray-800 hover:bg-opacity-20 transition-colors">
                    <td className="py-3 font-medium text-white">{st.name}</td>
                    <td className="py-3 font-mono text-cyber-cyan">{st.enrollmentNumber}</td>
                    <td className="py-3 text-gray-300">{st.department}</td>
                  </tr>
                ))}
                {recentStudents.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-cyber-muted">No students registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Certificates Mined */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-display font-bold text-white text-md">Recent Certificates Mined</h4>
            <Link to="/certificates" className="text-xs text-cyber-cyan hover:underline flex items-center">
              View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cyber-border text-cyber-muted uppercase tracking-wider pb-2">
                  <th className="py-2.5 font-semibold">Recipient</th>
                  <th className="py-2.5 font-semibold">Certificate ID</th>
                  <th className="py-2.5 font-semibold">Block Index</th>
                  <th className="py-2.5 font-semibold">Tx Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border divide-opacity-30">
                {recentCerts.map((cert) => (
                  <tr key={cert._id} className="hover:bg-gray-800 hover:bg-opacity-20 transition-colors">
                    <td className="py-3 text-white font-medium">{cert.studentName}</td>
                    <td className="py-3 font-mono text-cyber-cyan">{cert.certificateId}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-purple-500 bg-opacity-10 text-purple-400 border border-purple-500 border-opacity-20 text-[10px] font-semibold">
                        Block #{cert.blockIndex}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-cyber-muted truncate max-w-[80px]" title={cert.txHash}>
                      {cert.txHash ? cert.txHash.slice(0, 10) + '...' : 'N/A'}
                    </td>
                  </tr>
                ))}
                {recentCerts.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-cyber-muted">No certificates issued yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
