import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, useSocket } from '../../context/GlobalStateContext';
import { Menu, X, Bell, MessageSquare, User, Settings, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import Logo from '../Logo';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const currentPath = location.pathname;

  // Add scroll effect for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

    if (user?.role === 'ngo') {
      return [{ label: 'NGO Console', path: '/ngo' }, ...baseLinks];
    } else {
      return [{ label: 'Donor Hub', path: '/donor' }, ...baseLinks];
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs px-4 sm:px-6 lg:px-8 py-2.5">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-12">
          
          {/* Left: Brand logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-md bg-[#4A7C59] flex items-center justify-center text-white shadow-xs">
                 <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-stone-900 tracking-tight">
                DonateBridge
              </span>
            </Link>
          </div>

          {/* Middle: Links */}
          <nav className="hidden md:flex items-center space-x-1.5">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#4A7C59] text-white shadow-xs'
                      : 'text-stone-700 hover:bg-[#E8F3EC] hover:text-[#4A7C59]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

            {/* Right: Actions / Auth / User Menu */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/chat"
                    className={`p-2 rounded-xl transition-all duration-200 relative ${
                      currentPath === '/chat' 
                        ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100' 
                        : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100/80 border border-transparent'
                    }`}
                    title="Chat Messages"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Link>

                  <Link
                    to="/notifications"
                    className={`p-2 rounded-xl transition-all duration-200 relative ${
                      currentPath === '/notifications' 
                        ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100' 
                        : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100/80 border border-transparent'
                    }`}
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                    )}
                  </Link>

                  {/* User Dropdown */}
                  <div className="relative ml-2">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100/80 border border-transparent hover:border-slate-200/60 transition-all focus:outline-none cursor-pointer"
                    >
                      <img
                        src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=guest'}
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm bg-white"
                      />
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute right-0 mt-3 w-64 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-premium-xl z-20 overflow-hidden"
                          >
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                              <p className="text-sm font-black text-slate-900 truncate">{user?.name}</p>
                              <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{user?.email}</p>
                              <div className="mt-2 inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100">
                                <span className="font-mono text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                                  {user?.role} Account
                                </span>
                              </div>
                            </div>
                            
                            <div className="p-2 space-y-1">
                              <Link
                                to="/profile"
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                              >
                                <User className="w-4 h-4 text-slate-400" /> My Profile
                              </Link>
                              
                              <Link
                                to="/settings"
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                              >
                                <Settings className="w-4 h-4 text-slate-400" /> Settings
                              </Link>
                            </div>
                            
                            <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                              <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                              >
                                <LogOut className="w-4 h-4" /> Sign out
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Button variant="ghost" className="hidden lg:flex text-sm font-bold text-slate-500 hover:text-slate-900" onClick={() => navigate('/auth')}>
                    Sign In
                  </Button>
                  <Button className="bg-slate-900 text-white hover:bg-emerald-600 hover:shadow-emerald-500/25 shadow-lg rounded-xl text-sm font-bold px-5" onClick={() => navigate('/auth?tab=register')}>
                    Register Now
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-2 mx-4 overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-premium-xl"
          >
            <div className="p-4 space-y-4">
              <nav className="flex flex-col space-y-1 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`px-3.5 py-2 rounded-md text-sm transition-all duration-200 ${
                      currentPath === link.path
                        ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                        : 'font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                {isAuthenticated ? (
                  <div className="space-y-1">
                    <Link
                      to="/chat"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <MessageSquare className="w-5 h-5 text-slate-400" /> Messages
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <Bell className="w-5 h-5 text-slate-400" /> Notifications 
                      {unreadCount > 0 && <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <User className="w-5 h-5 text-slate-400" /> My Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <Settings className="w-5 h-5 text-slate-400" /> Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-rose-600 bg-rose-50/50 hover:bg-rose-100/50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-5 h-5" /> Sign out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button variant="outline" className="w-full justify-center h-11 border-slate-200 text-slate-700 font-bold rounded-xl" onClick={() => { navigate('/auth'); setIsOpen(false); }}>
                      Sign In
                    </Button>
                    <Button className="w-full justify-center h-11 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg" onClick={() => { navigate('/auth?tab=register'); setIsOpen(false); }}>
                      Register
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
