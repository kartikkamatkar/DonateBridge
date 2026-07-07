import React, { useState } from 'react';
import { useSocket } from '../context/GlobalStateContext';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Mail, ShieldAlert, Truck, Info, Check, Trash2,
  ArrowLeft, CheckSquare, Settings, MailOpen
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import Navbar from '../components/Navbar';

export default function NotificationCenter() {
  const { notifications, unreadCount, markAllRead, setNotifications } = useSocket();
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState('All'); // 'All' | 'Unread' | 'Deliveries' | 'Security'

  const handleArchive = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkOneRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterTab === 'Unread') return !n.read;
    if (filterTab === 'Deliveries') return n.type === 'delivery' || n.type === 'match';
    if (filterTab === 'Security') return n.type === 'system';
    return true;
  });

  return (
    <div className="db-page min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Shared Main Navbar */}
      <Navbar />

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-6 space-y-6 overflow-y-auto">
        
        {/* Title bar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 animate-fadeInUp">
          <div>
            <h1 className="font-sans font-bold text-xl flex items-center gap-2 text-slate-900">
              <Bell className="w-5 h-5 text-blue-600" /> Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-mono font-bold">
                  {unreadCount} UNREAD
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500">Manage transit reports, matching audits, and credential security logs.</p>
          </div>

          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllRead} icon={CheckSquare}>
              Mark all read
            </Button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="db-tabs animate-fadeInUp stagger-1">
          {['All', 'Unread', 'Deliveries', 'Security'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`db-tab ${filterTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stream List */}
        <div className="space-y-3 animate-fadeInUp stagger-2">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 text-xs text-slate-500 db-card bg-white border border-slate-200 rounded-lg shadow-premium-sm">
              <MailOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              Your notification log is currently clear.
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`db-card p-4 transition-all duration-200 bg-white border rounded-lg shadow-premium-sm ${
                  notif.read ? 'border-slate-200 opacity-80' : 'border-blue-600 bg-blue-50/10'
                }`}
              >
                <div className="flex gap-3 text-xs">
                  {/* Icon depending on type */}
                  <div className="shrink-0 pt-0.5">
                    {notif.type === 'delivery' ? <Truck className="w-4 h-4 text-blue-600" /> :
                     notif.type === 'match' ? <Check className="w-4 h-4 text-emerald-600" /> :
                     <ShieldAlert className="w-4 h-4 text-amber-500" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <p className={`leading-relaxed ${notif.read ? 'text-slate-600' : 'text-slate-900 font-bold'}`}>
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-4">{notif.time}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2 text-[10px] font-mono">
                      <span className="text-slate-400 uppercase font-bold">REF ID: {notif.id}</span>
                      <div className="flex gap-3">
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkOneRead(notif.id)}
                            className="text-blue-600 hover:underline font-bold cursor-pointer"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => handleArchive(notif.id)}
                          className="text-slate-400 hover:text-red-600 flex items-center gap-1 font-bold cursor-pointer"
                          aria-label="Archive notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Archive
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
}
