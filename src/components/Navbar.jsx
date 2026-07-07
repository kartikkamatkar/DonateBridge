import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useSocket } from '../context/GlobalStateContext';
import {
  Menu, X, Bell, MessageSquare, User, Settings,
  LogOut, ShieldAlert, Sparkles, Navigation, Globe
} from 'lucide-react';
import { Button } from './ui/Button';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const currentPath = location.pathname;

  // Navigation schema per role
  const visitorLinks = [
    { label: 'Home', path: '/' },
    { label: 'Search NGOs', path: '/search' },
    { label: 'Impact Analytics', path: '/impact' }
  ];

  const donorLinks = [
    { label: 'Dashboard', path: '/donor-dashboard' },
    { label: 'Search NGOs', path: '/search' },
    { label: 'Request Wizard', path: '/request-wizard' },
    { label: 'Smart Match', path: '/smart-match' },
    { label: 'Impact', path: '/impact' }
  ];

  const ngoLinks = [
    { label: 'NGO Console', path: '/ngo-dashboard' },
    { label: 'Smart Match', path: '/smart-match' },
    { label: 'Impact', path: '/impact' }
  ];

  const adminLinks = [
    { label: 'Admin Center', path: '/admin-dashboard' },
    { label: 'Platform Impact', path: '/impact' }
  ];

  const getLinks = () => {
    if (!isAuthenticated) return visitorLinks;
    if (user?.role === 'admin') return adminLinks;
    if (user?.role === 'ngo') return ngoLinks;
    return donorLinks;
  };

  const links = getLinks();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm" aria-label="Main Navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                DB
              </div>
              <span className="font-sans font-bold text-lg text-slate-900 tracking-tight">DonateBridge</span>
            </button>

            {/* Desktop main links */}
            <div className="hidden md:flex md:ml-8 md:space-x-1">
              {links.map((link) => {
                const isActive = currentPath === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => { navigate(link.path); setIsOpen(false); }}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex md:items-center md:gap-3">
            {isAuthenticated ? (
              <>
                {/* Chat link */}
                <button
                  onClick={() => navigate('/chat')}
                  className={`p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full relative focus:outline-none focus:ring-2 focus:ring-primary ${
                    currentPath === '/chat' ? 'bg-slate-100 text-slate-900' : ''
                  }`}
                  aria-label="Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>

                {/* Notifications link */}
                <button
                  onClick={() => navigate('/notifications')}
                  className={`p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full relative focus:outline-none focus:ring-2 focus:ring-primary ${
                    currentPath === '/notifications' ? 'bg-slate-100 text-slate-900' : ''
                  }`}
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 border border-white rounded-full" />
                  )}
                </button>

                {/* Settings link */}
                <button
                  onClick={() => navigate('/settings')}
                  className={`p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary ${
                    currentPath === '/settings' ? 'bg-slate-100 text-slate-900' : ''
                  }`}
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {/* Profile Link */}
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="View Profile"
                >
                  <img
                    src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=donor'}
                    alt="avatar"
                    className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200"
                  />
                  <span className="text-xs font-semibold">{user?.name || 'Sarah'}</span>
                </button>

                <Button variant="ghost" size="sm" onClick={handleLogout} icon={LogOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                  Login
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/auth?tab=register')}>
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center md:hidden">
            {isAuthenticated && unreadCount > 0 && (
              <span className="w-2 h-2 bg-red-600 rounded-full mr-2" />
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-expanded={isOpen}
              aria-label="Toggle main menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu panels */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pt-2 pb-4 space-y-1 shadow-inner">
          {links.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => { navigate(link.path); setIsOpen(false); }}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium block ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {link.label}
              </button>
            );
          })}

          <div className="pt-4 border-t border-slate-200 space-y-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => { navigate('/chat'); setIsOpen(false); }}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <MessageSquare className="w-4 h-4 text-slate-500" /> Messages
                </button>
                <button
                  onClick={() => { navigate('/notifications'); setIsOpen(false); }}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Bell className="w-4 h-4 text-slate-500" /> Notifications ({unreadCount})
                </button>
                <button
                  onClick={() => { navigate('/settings'); setIsOpen(false); }}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Settings className="w-4 h-4 text-slate-500" /> Settings
                </button>
                <button
                  onClick={() => { navigate('/profile'); setIsOpen(false); }}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <User className="w-4 h-4 text-slate-500" /> My Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-3 pt-2">
                <Button variant="secondary" size="sm" onClick={() => { navigate('/auth'); setIsOpen(false); }}>
                  Login
                </Button>
                <Button variant="primary" size="sm" onClick={() => { navigate('/auth?tab=register'); setIsOpen(false); }}>
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
