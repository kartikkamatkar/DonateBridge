import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useSocket } from '../context/GlobalStateContext';
import { useNavigate } from 'react-router-dom';
import {
  Send, Paperclip, MapPin, CheckCheck, Smile, Phone, Video,
  Info, Search, MoreVertical, ShieldCheck, Heart, User, Image
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { InputField } from '../components/ui/InputField';

export default function ChatTerminal() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [activeThread, setActiveThread] = useState(1);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initial dummy threads
  const [threads, setThreads] = useState([
    { id: 1, name: 'Hope Foundation (Hub 4)', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=hope', online: true, role: 'ngo', unread: 0 },
    { id: 2, name: 'Red Cross Depot', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=redcross', online: false, role: 'ngo', unread: 2 },
    { id: 3, name: 'Marcus Cole (Courier)', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=marcus', online: true, role: 'courier', unread: 0 },
  ]);

  // Messages database
  const [messages, setMessages] = useState({
    1: [
      { id: 1, sender: 'ngo', text: 'Hello! Regarding your blanket donation #1042, when is the pickup timing?', time: '10:32 AM', status: 'read' },
      { id: 2, sender: 'donor', text: 'I scheduled the courier for 2:00 PM today. They should arrive soon.', time: '10:35 AM', status: 'read' },
      { id: 3, sender: 'ngo', text: 'Perfect, our dispatch center is notified. Thank you!', time: '10:36 AM', status: 'read' },
    ],
    2: [
      { id: 1, sender: 'ngo', text: 'Hi Sarah, did you get the tax receipt for the PCs?', time: 'Yesterday', status: 'read' },
      { id: 2, sender: 'ngo', text: 'We logged it in the impact audit sheet.', time: 'Yesterday', status: 'read' },
    ],
    3: [
      { id: 1, sender: 'courier', text: 'Hello! I am 4 minutes away from your apartment for the school supplies pickup.', time: '2:15 PM', status: 'read' },
      { id: 2, sender: 'donor', text: 'Excellent! I will meet you at the lobby.', time: '2:16 PM', status: 'read' },
    ],
  });

  const activeMessages = messages[activeThread] || [];
  const currentThreadInfo = threads.find(t => t.id === activeThread) || threads[0];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'donor',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    // Update messages
    setMessages(prev => ({
      ...prev,
      [activeThread]: [...(prev[activeThread] || []), newMsg]
    }));
    setInputText('');

    // Trigger simulated socket delivery state update
    setTimeout(() => {
      setMessages(prev => {
        const threadMsgs = [...prev[activeThread]];
        const target = threadMsgs.find(m => m.id === newMsg.id);
        if (target) target.status = 'delivered';
        return { ...prev, [activeThread]: threadMsgs };
      });
    }, 1000);

    // Simulate typing answer
    setTimeout(() => {
      setIsTyping(true);
    }, 2000);

    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        'Understood. Our logistics coordinates are aligned.',
        'Verified! The transit details have been locked into the ledger.',
        'Thank you! We will update the status once checked at our warehouse.',
      ];
      const reply = responses[Math.floor(Math.random() * responses.length)];
      const replyMsg = {
        id: Date.now() + 1,
        sender: 'ngo',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      };

      setMessages(prev => ({
        ...prev,
        [activeThread]: [...(prev[activeThread] || []), replyMsg]
      }));
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col h-screen overflow-hidden">
      {/* Header bar */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-primary rotate-45" />
          <span className="font-bold text-base">Direct Messaging Hub</span>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>Exit Terminal</Button>
      </header>

      {/* Main split frame */}
      <div className="flex-1 flex min-h-0 relative">
        
        {/* Left column: threads list */}
        <aside className="w-full sm:w-80 bg-white dark:bg-slate-850 border-r border-slate-200 dark:border-slate-800 flex flex-col min-h-0">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-8 pr-4 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {threads.map(thread => (
              <div
                key={thread.id}
                onClick={() => {
                  setActiveThread(thread.id);
                  // Clear unread
                  setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread: 0 } : t));
                }}
                className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-all ${
                  activeThread === thread.id
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 text-primary dark:text-emerald-450 border-l-4 border-primary'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="relative shrink-0">
                  <img src={thread.avatar} alt="avatar" className="w-10 h-10 rounded-full border border-slate-250 dark:border-slate-700" />
                  {thread.online && (
                    <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 absolute bottom-0 right-0" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs truncate block text-slate-800 dark:text-slate-200">{thread.name}</span>
                    <span className="text-[9px] text-slate-400">10:36</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5 uppercase tracking-wide font-semibold">
                    {thread.role}
                  </p>
                </div>

                {thread.unread > 0 && (
                  <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                    {thread.unread}
                  </span>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Right column: Chat box */}
        <main className="flex-1 flex flex-col min-h-0 bg-slate-100/50 dark:bg-slate-900/30">
          {/* Active Chat Header */}
          <div className="bg-white dark:bg-slate-850 h-14 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <img src={currentThreadInfo.avatar} alt="avatar" className="w-9 h-9 rounded-full" />
              <div>
                <span className="font-bold text-xs block text-slate-850 dark:text-slate-100">{currentThreadInfo.name}</span>
                <span className="text-[9px] text-emerald-500 font-semibold uppercase flex items-center gap-0.5">
                  {currentThreadInfo.online ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-400">
              <Phone className="w-4 h-4 hover:text-slate-650 cursor-pointer" />
              <Video className="w-4 h-4 hover:text-slate-650 cursor-pointer" />
              <Info className="w-4 h-4 hover:text-slate-650 cursor-pointer" />
              <MoreVertical className="w-4 h-4 hover:text-slate-650 cursor-pointer" />
            </div>
          </div>

          {/* Messages list (scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeMessages.map((msg, index) => {
              const isMe = msg.sender === 'donor';
              return (
                <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-lg p-3 text-xs shadow-premium-sm relative ${
                    isMe
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-750'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    
                    <div className="flex justify-end items-center gap-1.5 mt-1.5 text-[9px] text-slate-400 text-right">
                      <span>{msg.time}</span>
                      {isMe && (
                        <span>
                          {msg.status === 'sent' && '✓'}
                          {msg.status === 'delivered' && '✓✓'}
                          {msg.status === 'read' && <CheckCheck className="w-3.5 h-3.5 text-blue-300" />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-lg rounded-tl-none p-3 shadow-premium-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Form input bar */}
          <div className="p-4 bg-white dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
              <div className="flex items-center gap-1.5 text-slate-450 shrink-0">
                <button type="button" className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button type="button" className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                  <MapPin className="w-4 h-4" />
                </button>
                <button type="button" className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                  <Image className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Type your message here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
              />

              <Button type="submit" variant="primary" className="p-2 shrink-0" icon={Send}>
                Send
              </Button>
            </form>
          </div>
        </main>

      </div>
    </div>
  );
}
