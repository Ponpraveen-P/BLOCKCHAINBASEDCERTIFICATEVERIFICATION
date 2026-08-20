import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileSpreadsheet, 
  Database, 
  ShieldCheck, 
  TrendingUp, 
  LogOut, 
  Menu, 
  X,
  GraduationCap
} from 'lucide-react';
import { authService } from '../../services/api';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        setUser(JSON.parse(userString));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/');
  };

  const isPublicRoute = ['/', '/login', '/verify'].includes(location.pathname);

  // If no user is logged in and we are on a public page, show public header layout
  if (!user && isPublicRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-cyber-bg">
        {/* Public Header */}
        <header className="sticky top-0 z-50 bg-cyber-bg bg-opacity-70 backdrop-blur-md border-b border-cyber-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center space-x-2">
                <GraduationCap className="h-8 w-8 text-cyber-cyan" />
                <span className="font-display font-bold text-xl tracking-wider text-white">
                  CERT<span className="text-cyber-cyan">LEDGER</span>
                </span>
              </Link>
              <nav className="flex space-x-6 items-center">
                <Link to="/" className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-cyber-cyan' : 'text-gray-300 hover:text-white'}`}>
                  Home
                </Link>
                <Link to="/verify" className={`text-sm font-medium transition-colors ${location.pathname === '/verify' ? 'text-cyber-cyan' : 'text-gray-300 hover:text-white'}`}>
                  Verification
                </Link>
                <Link to="/blockchain" className={`text-sm font-medium transition-colors ${location.pathname === '/blockchain' ? 'text-cyber-cyan' : 'text-gray-300 hover:text-white'}`}>
                  Explorer
                </Link>
                <Link to="/login" className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyber-border text-white border border-cyber-border hover:bg-opacity-80 transition-all">
                  Sign In
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    );
  }

  // Admin and Student Private Layout (with Sidebar)
  const menuItems = user?.role === 'admin' ? [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Certificates', path: '/certificates', icon: FileSpreadsheet },
    { name: 'Blockchain Explorer', path: '/blockchain', icon: Database },
    { name: 'Verification Engine', path: '/verify', icon: ShieldCheck },
    { name: 'Analytics Reports', path: '/reports', icon: TrendingUp }
  ] : [
    { name: 'My Credentials', path: '/dashboard', icon: FileSpreadsheet },
    { name: 'Blockchain Ledger', path: '/blockchain', icon: Database },
    { name: 'Verification Gate', path: '/verify', icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen flex bg-cyber-bg">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-cyber-panel border-r border-cyber-border">
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-cyber-border">
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-cyber-cyan" />
            <span className="font-display font-bold text-lg tracking-wider text-white">
              CERT<span className="text-cyber-cyan">LEDGER</span>
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-cyber-blue bg-opacity-10 text-cyber-cyan border border-cyber-cyan border-opacity-20 shadow-glow-cyan' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-cyber-cyan' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-cyber-border bg-black bg-opacity-20">
          <div className="flex items-center justify-between">
            <div className="truncate mr-2">
              <p className="text-xs text-cyber-muted uppercase tracking-wider font-semibold">{user?.role}</p>
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-cyber-red rounded-lg hover:bg-gray-800 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-cyber-panel border-b border-cyber-border h-16 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <GraduationCap className="h-7 w-7 text-cyber-cyan" />
          <span className="font-display font-bold text-md tracking-wider text-white">
            CERT<span className="text-cyber-cyan">LEDGER</span>
          </span>
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-400 hover:text-white rounded-lg"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <aside className="relative flex flex-col w-64 max-w-xs bg-cyber-panel border-r border-cyber-border pt-16 z-50">
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-cyber-blue bg-opacity-10 text-cyber-cyan' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-cyber-border bg-black bg-opacity-20 flex justify-between items-center">
              <div className="truncate">
                <p className="text-xs text-cyber-muted">{user?.role}</p>
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-cyber-red rounded-lg">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0">
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
