import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, useSocket } from '../../context/GlobalStateContext';
import { Menu, X, Bell, MessageSquare, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import Logo from '../Logo';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentPath = location.pathname;

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  // Nav items based on role
  const getNavLinks = () => {
    const baseLinks = [
      { label: 'Discover', path: '/discover' },
      { label: 'Bridge', path: '/bridge' },
      { label: 'About', path: '/about' },
      { label: 'Contact', path: '/contact' }
    ];

    if (!isAuthenticated) return baseLinks;

    if (user?.role === 'admin') {
      return [{ label: 'Admin Panel', path: '/admin' }, ...baseLinks];
    } else if (user?.role === 'ngo') {
      return [{ label: 'NGO Console', path: '/ngo' }, ...baseLinks];
    } else {
      return [{ label: 'Donor Hub', path: '/donor' }, ...baseLinks];
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 w-full">
      {/* Main Wide Navigation Container (No gaps on left/right most) */}
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <Logo type="navbar" />
            </Link>
          </div>

          {/* Middle: Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions / Auth / User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/chat"
                  className={`p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg relative ${
                    currentPath === '/chat' ? 'bg-slate-50 text-slate-900' : ''
                  }`}
                  title="Chat Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                <Link
                  to="/notifications"
                  className={`p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg relative ${
                    currentPath === '/notifications' ? 'bg-slate-50 text-slate-900' : ''
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 hover:text-slate-950 focus:outline-none cursor-pointer"
                  >
                    <img
                      src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=guest'}
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full border border-border bg-white"
                    />
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-border shadow-premium-lg z-20 py-2">
                        <div className="px-4 py-2 border-b border-border">
                          <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                          <span className="inline-block px-1.5 py-0.5 bg-primary/10 text-primary font-mono text-[9px] font-bold rounded-sm mt-1 uppercase tracking-wider">
                            {user?.role}
                          </span>
                        </div>
                        
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <User className="w-4 h-4" /> Profile Node
                        </Link>
                        
                        <Link
                          to="/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Settings className="w-4 h-4" /> Settings Panel
                        </Link>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50/50 border-t border-border mt-1 text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" /> Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/auth?tab=register')}>
                  Register
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-white py-4 px-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 block"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-border pt-4 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/chat"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 block"
                >
                  <MessageSquare className="w-5 h-5 text-slate-400" /> Messages
                </Link>
                <Link
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 block"
                >
                  <Bell className="w-5 h-5 text-slate-400" /> Notifications ({unreadCount})
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 block"
                >
                  <User className="w-5 h-5 text-slate-400" /> My Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 block"
                >
                  <Settings className="w-5 h-5 text-slate-400" /> Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 text-left cursor-pointer"
                >
                  <LogOut className="w-5 h-5" /> Sign out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={() => { navigate('/auth'); setIsOpen(false); }}>
                  Sign In
                </Button>
                <Button variant="primary" size="sm" onClick={() => { navigate('/auth?tab=register'); setIsOpen(false); }}>
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
