import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  KeyRound, 
  Mail, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { authService } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('admin'); // 'admin' or 'student'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect them
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        navigate(user.role === 'admin' ? '/admin' : '/dashboard');
      } catch (e) {
        localStorage.clear();
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter all fields');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(email, password);
      toast.success(`Welcome back, ${data.user.name}!`);
      
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (selectedRole) => {
    setRole(selectedRole);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center p-4 relative">
      {/* Back button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 text-sm text-cyber-muted hover:text-white flex items-center transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>

      <div className="w-full max-w-md glass-panel p-8 relative border border-cyber-border">
        {/* Glow effect background */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-cyber-cyan opacity-10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-cyber-blue opacity-10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-cyber-cyan bg-opacity-10 rounded-xl text-cyber-cyan mb-3 shadow-glow-cyan">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white">Access Portal</h2>
          <p className="text-xs text-cyber-muted mt-1.5">Sign in to manage academic records and blockchain blocks</p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="flex bg-black bg-opacity-40 p-1 rounded-lg border border-cyber-border mb-6">
          <button
            type="button"
            onClick={() => handleRoleToggle('admin')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
              role === 'admin' 
                ? 'bg-cyber-blue bg-opacity-10 text-cyber-cyan border border-cyber-cyan border-opacity-10 shadow-glow-cyan' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Administrator
          </button>
          <button
            type="button"
            onClick={() => handleRoleToggle('student')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
              role === 'student' 
                ? 'bg-cyber-blue bg-opacity-10 text-cyber-cyan border border-cyber-cyan border-opacity-10 shadow-glow-cyan' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Enrolled Student
          </button>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'admin' ? 'admin@college.edu' : 'student@college.edu'}
                className="w-full bg-black bg-opacity-40 border border-cyber-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <KeyRound className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black bg-opacity-40 border border-cyber-border rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyber-cyan to-cyber-blue text-cyber-bg font-bold text-sm rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center shadow-glow-cyan"
          >
            {loading ? 'Verifying Credentials...' : 'Sign In'}
          </button>
        </form>

        {/* Credentials helper hint card */}
        <div className="mt-6 p-4 rounded-lg border border-cyber-border bg-black bg-opacity-30 flex items-start space-x-3">
          <ShieldAlert className="h-5 w-5 text-cyber-cyan flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-cyber-muted leading-relaxed">
            <span className="font-semibold text-gray-300">DEMO INSTRUCTIONS:</span> <br />
            {role === 'admin' ? (
              <>Use administrator credentials: <span className="text-cyber-cyan font-mono">admin@college.edu</span> and password <span className="text-cyber-cyan font-mono">admin123</span>.</>
            ) : (
              <>Use student credentials: <span className="text-cyber-cyan font-mono">aarav@college.edu</span> and password <span className="text-cyber-cyan font-mono">CS-2023-081</span> (default password is their enrollment number).</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
