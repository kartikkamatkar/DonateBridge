import React, { useState } from 'react';
import { useSocket } from '../context/GlobalStateContext';
import { Bell, ShieldAlert, Truck, Check, Trash2, CheckSquare, MailOpen } from 'lucide-react';
import { Button } from '../components/ui/Button';
import Navbar from '../components/Navbar';

export default function NotificationCenter() {
  const { notifications, unreadCount, markAllRead, setNotifications } = useSocket();
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full p-6 sm:p-8 space-y-6">
        
        {/* Title bar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Notifications
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 border border-emerald-100 bg-[#F1F8F5] text-primary text-[9px] font-bold rounded-full uppercase">
                  {unreadCount} UNREAD
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium font-sans">SMS tracking reports, matching audits, and credential security logs.</p>
          </div>

          {unreadCount > 0 && (
            <Button variant="secondary" className="text-xs font-semibold" onClick={markAllRead} icon={CheckSquare}>
              Mark All Read
            </Button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex border-b border-border gap-2">
          {['All', 'Unread', 'Deliveries', 'Security'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                filterTab === tab
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-slate-500 hover:text-ink'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stream List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 text-xs text-slate-400 bg-white border border-border rounded-2xl shadow-premium-sm">
              <MailOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              Your notification log is currently clear.
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 transition-all duration-200 bg-white border rounded-2xl shadow-premium-xs ${
                  notif.read ? 'border-border opacity-70' : 'border-primary/30 ring-1 ring-primary/5 bg-[#F1F8F5]/10'
                }`}
              >
                <div className="flex gap-3 text-xs">
                  {/* Icon depending on type */}
                  <div className="shrink-0 pt-0.5">
                    {notif.type === 'delivery' ? <Truck className="w-4 h-4 text-primary" /> :
                     notif.type === 'match' ? <Check className="w-4 h-4 text-[#4CAF50]" /> :
                     <ShieldAlert className="w-4 h-4 text-red-500" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <p className={`leading-relaxed ${notif.read ? 'text-slate-500 font-medium' : 'text-slate-900 font-semibold'}`}>
                        {notif.message}
                      </p>
                      <span className="text-[9px] text-slate-400 font-mono shrink-0 ml-4">{notif.time}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-border mt-3 text-[9px] font-mono">
                      <span className="text-slate-400 font-bold uppercase">REF: {notif.id}</span>
                      <div className="flex gap-3">
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkOneRead(notif.id)}
                            className="text-primary hover:underline font-bold cursor-pointer"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => handleArchive(notif.id)}
                          className="text-slate-400 hover:text-red-500 flex items-center gap-1 font-bold cursor-pointer"
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
