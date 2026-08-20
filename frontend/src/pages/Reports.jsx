import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  TrendingUp, 
  Database, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  PieChart as PieIcon,
  BarChart2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { reportsService } from '../services/api';

const COLORS = ['#06B6D4', '#3B82F6', '#10B981', '#F59E0B', '#6366F1'];

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await reportsService.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load system reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-cyber-cyan animate-pulse">
        Generating database analytics reports...
      </div>
    );
  }

  const { summary, charts } = stats;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">System Analytics Reports</h1>
          <p className="text-xs text-cyber-muted mt-1">Detailed statistical insights into credential security and ledger size</p>
        </div>
        <button
          onClick={fetchStats}
          className="p-2 bg-cyber-panel border border-cyber-border rounded-lg text-gray-300 hover:text-cyber-cyan hover:border-cyber-cyan transition-all"
          title="Refresh analytics data"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Grid: Multi-Chart Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Student department distribution */}
        <div className="glass-panel p-6 border border-cyber-border">
          <h3 className="font-display font-bold text-white text-md mb-6 flex items-center">
            <BarChart2 className="mr-2 h-4.5 w-4.5 text-cyber-cyan" />
            Enrollment by Department
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.department}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickFormatter={(v) => v.split(' ')[0]} />
                <YAxis stroke="#64748B" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#101725', borderColor: '#1E293B', color: '#FFF' }} />
                <Bar dataKey="value" fill="#06B6D4">
                  {charts.department.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Grade Breakdown */}
        <div className="glass-panel p-6 border border-cyber-border">
          <h3 className="font-display font-bold text-white text-md mb-6 flex items-center">
            <PieIcon className="mr-2 h-4.5 w-4.5 text-cyber-blue" />
            Mined Grade Performance Ratio
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.grades}
                  cx="50%"
                  cy="45%"
                  innerRadius={0}
                  outerRadius={75}
                  dataKey="value"
                  label
                >
                  {charts.grades.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#101725', borderColor: '#1E293B', color: '#FFF' }} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={8} iconType="square" wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Verification Auditing metrics */}
        <div className="glass-panel p-6 border border-cyber-border">
          <h3 className="font-display font-bold text-white text-md mb-6 flex items-center">
            <CheckCircle className="mr-2 h-4.5 w-4.5 text-cyber-green" />
            Verification Success Ratio
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.verifications}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.verifications.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#101725', borderColor: '#1E293B', color: '#FFF' }} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health Audit Panel */}
        <div className="glass-panel p-6 border border-cyber-border flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-white text-md mb-4 flex items-center">
              <Database className="mr-2 h-4.5 w-4.5 text-purple-400" />
              Cryptographic Health Audit
            </h3>
            <p className="text-xs text-cyber-muted mb-6 leading-relaxed">
              Academic credentials integrity validation is computed mathematically block-by-block. Below is the current system ledger consensus health state.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg border border-cyber-border bg-black bg-opacity-20 text-xs">
              <span className="text-gray-300">Ledger Block Count</span>
              <span className="font-bold text-white font-mono">{summary.totalBlocks} Blocks</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg border border-cyber-border bg-black bg-opacity-20 text-xs">
              <span className="text-gray-300">Integrity Consensus Mode</span>
              <span className="font-semibold text-cyber-cyan">SHA-256 Linkages</span>
            </div>

            <div className={`p-4 rounded-lg border flex items-center justify-between ${
              summary.isChainValid 
                ? 'bg-cyber-green bg-opacity-10 border-cyber-green border-opacity-20 text-cyber-green'
                : 'bg-cyber-red bg-opacity-10 border-cyber-red border-opacity-20 text-cyber-red animate-pulse'
            }`}>
              <div className="flex items-center space-x-3 text-xs">
                {summary.isChainValid ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                <div>
                  <p className="font-bold uppercase">{summary.isChainValid ? 'Ledger Secure' : 'Consensus Compromised'}</p>
                  <p className="text-[10px] text-cyber-muted mt-0.5">
                    {summary.isChainValid ? 'Block hashes match previous indices.' : summary.chainReason}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
