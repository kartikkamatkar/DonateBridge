import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import {
  Send, ShieldCheck, Phone, Video, Info, ArrowLeft,
  Search, MessageSquare, Check, Sparkles, AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import Navbar from '../components/Navbar';

export default function ChatTerminal() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeChannel, setActiveChannel] = useState(1);
  const [typedMessage, setTypedMessage] = useState('');

  // Conversation thread list
  const [channels, setChannels] = useState([
    { id: 1, name: 'Hope Foundation', lastMsg: 'Courier is arriving at coordinate location.', time: '10:45 AM', unread: 2, verified: true },
    { id: 2, name: 'Red Cross Depot', lastMsg: 'Are first-aid kits verified under code specs?', time: 'Yesterday', unread: 0, verified: true },
    { id: 3, name: 'Sarah Jenkins (Donor)', lastMsg: 'I have logged 25 winter blankets.', time: 'July 01', unread: 0, verified: false },
  ]);

  // Message history stream
  const [messages, setMessages] = useState([
    { id: 1, channelId: 1, sender: 'Hope Foundation', text: 'Hello, our matchmaking algorithm highlighted your winter blankets as critical need.', time: '10:15 AM', self: false },
    { id: 2, channelId: 1, sender: 'You', text: 'Great, packaging is complete and weights around 22kg.', time: '10:20 AM', self: true },
    { id: 3, channelId: 1, sender: 'Hope Foundation', text: 'Excellent. Dispatch courier has collected cargo. DB-990 code assigned.', time: '10:45 AM', self: false },
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    setMessages(prev => [
      ...prev,
      { id: Date.now(), channelId: activeChannel, sender: 'You', text: typedMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), self: true }
    ]);
    setTypedMessage('');

    // Simulate quick automated response from NGO
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, channelId: activeChannel, sender: channels.find(c => c.id === activeChannel).name, text: 'Our systems verified receipt of message. Logs updating.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), self: false }
      ]);
    }, 1500);
  };

  const currentChannel = channels.find(c => c.id === activeChannel) || channels[0];
  const channelMessages = messages.filter(m => m.channelId === activeChannel);

  return (
    <div className="db-page min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Shared Main Navbar */}
      <Navbar />

      {/* Main split chat workspace */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Left Side: Active Threads list */}
        <aside className="w-full md:w-80 bg-white border border-slate-200 rounded-lg flex flex-col min-h-0 shrink-0 shadow-premium-sm">
          <div className="p-4 border-b border-slate-100 space-y-3">
            <h3 className="font-sans font-bold text-sm text-slate-900">Discussions</h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search threads..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {channels.map((ch) => (
              <div
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`p-3 rounded-md cursor-pointer transition-all ${
                  activeChannel === ch.id
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start text-xs">
                  <div className="font-bold flex items-center gap-1 text-slate-900">
                    {ch.name}
                    {ch.verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">{ch.time}</span>
                </div>
                <p className="text-[10px] truncate mt-1 text-slate-500">{ch.lastMsg}</p>
                {ch.unread > 0 && activeChannel !== ch.id && (
                  <span className="inline-block px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[8px] font-mono font-bold mt-1">
                    {ch.unread} NEW
                  </span>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Right Side: Message flow screen */}
        <main className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200 rounded-lg shadow-premium-sm overflow-hidden">
          {/* Active channel summary */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="text-xs space-y-0.5">
              <p className="font-bold flex items-center gap-1 text-slate-900">
                {currentChannel.name}
                {currentChannel.verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />}
              </p>
              <p className="text-[10px] text-slate-500">Active match channel &bull; Secure dispatch logs</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => toast.info('Initiating voice call...')} icon={Phone} />
              <Button variant="secondary" size="sm" onClick={() => toast.info('Initiating video call...')} icon={Video} />
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {channelMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[70%] text-xs space-y-1 ${
                  msg.self ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <span className="text-[9px] text-slate-400 font-mono font-bold">{msg.sender}</span>
                <div
                  className={`p-3 rounded-lg leading-relaxed ${
                    msg.self
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-premium-xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-400 font-mono font-bold">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Message input bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white flex gap-3">
            <input
              type="text"
              placeholder="Send secure encrypted transaction details..."
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-md border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
            <Button type="submit" variant="primary" icon={Send} className="px-4">
              Send
            </Button>
          </form>
        </main>

      </div>
    </div>
  );
}
