import React, { useState } from 'react';
import { useSocket } from '../context/GlobalStateContext';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Mail, ShieldAlert, Truck, Info, Check, Trash2,
  ArrowLeft, CheckSquare, Settings, MailOpen
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Navigation header */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-6 shrink-0 z-10">
        <button onClick={() => navigate(-1)} className="hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="font-bold text-sm uppercase text-slate-500">Alert Center</span>
      </nav>

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-6 space-y-6 overflow-y-auto">
        
        {/* Title bar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-350 text-[10px] font-bold">
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
        <div className="flex border-b border-slate-200 dark:border-slate-850 gap-2 overflow-x-auto">
          {['All', 'Unread', 'Deliveries', 'Security'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                filterTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-750'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stream List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs bg-white dark:bg-slate-850 rounded border border-slate-200 dark:border-slate-800">
              <MailOpen className="w-8 h-8 text-slate-350 mx-auto mb-2" />
              Your notification log is currently clear.
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <Card
                key={notif.id}
                className={`p-4 border transition-all ${
                  notif.read ? 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-800/40' : 'border-primary/40 bg-emerald-50/5 dark:bg-slate-800/90'
                }`}
              >
                <div className="flex gap-3 text-xs">
                  {/* Icon depending on type */}
                  <div className="shrink-0 pt-0.5">
                    {notif.type === 'delivery' ? <Truck className="w-4 h-4 text-emerald-500" /> :
                     notif.type === 'match' ? <Check className="w-4 h-4 text-indigo-500" /> :
                     <ShieldAlert className="w-4 h-4 text-amber-500" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <p className={`font-semibold ${notif.read ? 'text-slate-650 dark:text-slate-300' : 'text-slate-900 dark:text-white font-bold'}`}>
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-4">{notif.time}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 mt-2 text-[10px]">
                      <span className="text-slate-400 uppercase font-semibold">REF ID: {notif.id}</span>
                      <div className="flex gap-2">
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkOneRead(notif.id)}
                            className="text-primary hover:underline font-bold"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => handleArchive(notif.id)}
                          className="text-slate-500 hover:text-red-500 flex items-center gap-1 font-semibold"
                          aria-label="Archive notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Archive
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

      </main>
    </div>
  );
}
