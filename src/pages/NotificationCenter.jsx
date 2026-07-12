import React, { useState } from 'react';
import { useSocket } from '../context/GlobalStateContext';
import { Bell, ShieldAlert, Truck, Check, Trash2, CheckSquare, MailOpen, Info, ShieldCheck, Cpu } from 'lucide-react';
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

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10 flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* Left Column: Notification Stream (flex-1) */}
        <div className="flex-1 space-y-6">
          {/* Title bar */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="space-y-1">
              <h1 className="font-display font-black text-slate-900 flex items-center gap-2.5" style={{ fontSize: '24px' }}>
                <Bell className="w-6 h-6 text-primary animate-bounce" /> Notifications
                {unreadCount > 0 && (
                  <span className="px-3 py-0.5 border border-emerald-100 bg-emerald-50 text-primary rounded-full font-semibold uppercase tracking-wider" style={{ fontSize: '11px' }}>
                    {unreadCount} Unread
                  </span>
                )}
              </h1>
              <p className="text-slate-500 font-medium" style={{ fontSize: '15px' }}>Track your donation milestones, delivery pickups, and account updates.</p>
            </div>

            {unreadCount > 0 && (
              <Button variant="secondary" onClick={markAllRead} icon={CheckSquare}>
                Mark All Read
              </Button>
            )}
          </div>

          {/* Tab Filters */}
          <div className="flex border-b border-slate-200 gap-3">
            {['All', 'Unread', 'Deliveries', 'Security'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-4 py-3 font-semibold border-b-2 transition-all cursor-pointer ${
                  filterTab === tab
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
                style={{ fontSize: '15px' }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Stream List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-20 text-slate-400 bg-white border border-border rounded-2xl shadow-premium-sm space-y-3">
                <MailOpen className="w-10 h-10 text-slate-350 mx-auto" />
                <p className="font-bold text-slate-800" style={{ fontSize: '16px' }}>All clear!</p>
                <p className="text-slate-500" style={{ fontSize: '14px' }}>You don't have any notifications under this category.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-5 transition-all duration-200 bg-white border rounded-2xl shadow-premium-sm ${
                    notif.read ? 'border-border opacity-75' : 'border-primary/30 ring-1 ring-primary/5 bg-emerald-50/10'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Icon depending on type */}
                    <div className="shrink-0 pt-0.5">
                      {notif.type === 'delivery' ? (
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-primary flex items-center justify-center border border-emerald-100">
                          <Truck className="w-5 h-5" />
                        </div>
                      ) : notif.type === 'match' ? (
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-primary flex items-center justify-center border border-emerald-100">
                          <Check className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-650 flex items-center justify-center border border-red-100">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <p className={`leading-relaxed ${notif.read ? 'text-slate-600 font-medium' : 'text-slate-900 font-bold'}`} style={{ fontSize: '15px' }}>
                          {notif.message}
                        </p>
                        <span className="font-mono text-slate-400 shrink-0 ml-auto" style={{ fontSize: '12px' }}>{notif.time}</span>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-slate-400 font-mono" style={{ fontSize: '12px' }}>
                        <span className="font-semibold uppercase">ID: {notif.id}</span>
                        <div className="flex gap-4">
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
                            className="text-slate-450 hover:text-red-600 flex items-center gap-1 font-bold cursor-pointer"
                            aria-label="Archive notification"
                          >
                            <Trash2 className="w-4 h-4" /> Archive
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Security Alerts console (Innovative Sidebar to fill gaps!) */}
        <aside className="w-full lg:w-80 bg-white border border-border rounded-2xl flex flex-col shrink-0 shadow-premium-sm p-6 space-y-6 overflow-y-auto">
          <div>
            <h4 className="font-display font-bold text-slate-900 flex items-center gap-2" style={{ fontSize: '16px' }}>
              <ShieldCheck className="w-5 h-5 text-primary" /> Security Console
            </h4>
            <p className="text-slate-500 mt-0.5" style={{ fontSize: '12px' }}>Real-time platform access verification logs.</p>
          </div>

          {/* Active login session */}
          <div className="space-y-3.5">
            <h5 className="text-slate-400 uppercase font-mono tracking-wider font-bold" style={{ fontSize: '10px' }}>Active Session</h5>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-slate-650" style={{ fontSize: '13px' }}>
              <p>Platform Access: <b>Authorized</b></p>
              <p>Device: <b>Linux Chrome Web</b></p>
              <p>IP Address: <b>192.168.1.104</b></p>
              <p>Sync status: <span className="text-primary font-bold">Encrypted SSL</span></p>
            </div>
          </div>

          {/* Diagnostic status */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <h5 className="text-slate-400 uppercase font-mono tracking-wider font-bold" style={{ fontSize: '10px' }}>System Health</h5>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-slate-700" style={{ fontSize: '13px' }}>
                <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-primary" /> Socket Stream</span>
                <span className="font-bold text-primary font-mono">CONNECTED</span>
              </div>
              <div className="flex justify-between items-center text-slate-700" style={{ fontSize: '13px' }}>
                <span className="flex items-center gap-1.5"><Info className="w-4 h-4 text-primary" /> SMS Gateways</span>
                <span className="font-bold text-slate-900 font-mono">ONLINE</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 text-slate-500" style={{ fontSize: '12px' }}>
            <p className="leading-relaxed font-sans">
              All communications and matches on DonateBridge use digital tokens to safeguard personal phone numbers and locations.
            </p>
          </div>
        </aside>

      </main>
    </div>
  );
}
