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

    // Simulate automated response
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-6 min-h-0">
        
        {/* Left Side: Threads list */}
        <aside className="w-full lg:w-80 bg-white border border-border rounded-2xl flex flex-col shrink-0 shadow-premium-sm">
          <div className="p-4 border-b border-border space-y-3">
            <h3 className="text-sm font-display font-bold text-slate-900">Chats & Messaging</h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-slate-50 text-slate-900 focus:outline-none placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
            {channels.map((ch) => (
              <div
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  activeChannel === ch.id
                    ? 'bg-[#F1F8F5] text-primary font-semibold'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start text-xs">
                  <div className="font-semibold flex items-center gap-1 text-slate-900">
                    {ch.name}
                    {ch.verified && <ShieldCheck className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">{ch.time}</span>
                </div>
                <p className="text-[10px] truncate mt-1 text-slate-500">{ch.lastMsg}</p>
                {ch.unread > 0 && activeChannel !== ch.id && (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-primary text-white text-[8px] font-mono font-bold mt-1">
                    {ch.unread} NEW
                  </span>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Right Side: Message flow screen */}
        <main className="flex-1 flex flex-col bg-white border border-border rounded-2xl shadow-premium-sm overflow-hidden min-h-[450px]">
          {/* Active channel header */}
          <div className="p-4 border-b border-border flex justify-between items-center bg-slate-50">
            <div className="text-xs">
              <p className="font-bold flex items-center gap-1 text-slate-900">
                {currentChannel.name}
                {currentChannel.verified && <ShieldCheck className="w-3.5 h-3.5 text-primary" />}
              </p>
              <p className="text-[10px] text-slate-500">Secure matching communications &bull; Encrypted logs</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => toast.info('Connecting voice call...')} icon={Phone} />
              <Button variant="secondary" size="sm" onClick={() => toast.info('Connecting video call...')} icon={Video} />
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
                <span className="text-[9px] text-slate-400 font-semibold">{msg.sender}</span>
                <div
                  className={`p-3 rounded-2xl leading-relaxed shadow-premium-xs ${
                    msg.self
                      ? 'bg-primary text-white font-medium rounded-tr-none'
                      : 'bg-white text-slate-800 border border-border rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-400 font-mono">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Message input bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-white flex gap-3">
            <input
              type="text"
              placeholder="Type your message here..."
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-border bg-white text-slate-950 focus:outline-none placeholder-slate-400"
              required
            />
            <Button type="submit" variant="primary" icon={Send} className="px-5 font-bold">
              Send
            </Button>
          </form>
        </main>

      </div>
    </div>
  );
}
