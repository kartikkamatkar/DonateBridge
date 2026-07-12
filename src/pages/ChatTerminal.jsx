import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import {
  Send, ShieldCheck, Phone, Video, Search, MessageSquare, Check, CheckCheck,
  Sparkles, AlertCircle, Paperclip, Image, MapPin, Eye
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import Navbar from '../components/Navbar';

export default function ChatTerminal() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeChannel, setActiveChannel] = useState(1);
  const [typedMessage, setTypedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Conversation thread list
  const [channels, setChannels] = useState([
    { id: 1, name: 'Hope Foundation', lastMsg: 'Courier is arriving at coordinate location.', time: '10:45 AM', unread: 0, verified: true },
    { id: 2, name: 'Red Cross Depot', lastMsg: 'Are first-aid kits verified under code specs?', time: 'Yesterday', unread: 0, verified: true },
    { id: 3, name: 'Sarah Jenkins (Donor)', lastMsg: 'I have logged 25 winter blankets.', time: 'July 01', unread: 0, verified: false },
  ]);

  // Message history stream with statuses
  const [messages, setMessages] = useState([
    { id: 1, channelId: 1, sender: 'Hope Foundation', text: 'Hello, our matchmaking algorithm highlighted your winter blankets as critical need.', time: '10:15 AM', self: false, status: 'read' },
    { id: 2, channelId: 1, sender: 'You', text: 'Great, packaging is complete and weights around 22kg.', time: '10:20 AM', self: true, status: 'read' },
    { id: 3, channelId: 1, sender: 'Hope Foundation', text: 'Excellent. Dispatch courier has collected cargo. DB-990 code assigned.', time: '10:45 AM', self: false, status: 'read' },
  ]);

  const currentChannel = channels.find(c => c.id === activeChannel) || channels[0];
  const channelMessages = messages.filter(m => m.channelId === activeChannel);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend, type = 'text', mediaUrl = null) => {
    const msgId = Date.now();
    const newMsg = {
      id: msgId,
      channelId: activeChannel,
      sender: 'You',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      self: true,
      status: 'sent', // 'sent', 'delivered', 'read'
      type, // 'text' | 'image' | 'location'
      mediaUrl
    };

    setMessages(prev => [...prev, newMsg]);

    // Update last message in channels list
    setChannels(prev => prev.map(ch => ch.id === activeChannel ? { ...ch, lastMsg: type === 'image' ? 'Sent a photo attachment' : type === 'location' ? 'Sent shared location coord' : textToSend } : ch));

    // Simulate delivery ticks progression
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'delivered' } : m));
    }, 600);

    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'read' } : m));
      // Trigger typing indicator for reply
      setIsTyping(true);
    }, 1200);

    // Simulate automated response reply
    setTimeout(() => {
      setIsTyping(false);
      const automatedReplies = [
        'Excellent, our dispatch logistics division has acknowledged this.',
        'Perfect. We are tracking this status stamp ID on our dashboard ledger.',
        'Understood. The courier will verify packaging specifications upon arrival.',
        'Thanks for the update. Let us coordinate the final delivery milestone.'
      ];
      const replyText = automatedReplies[Math.floor(Math.random() * automatedReplies.length)];
      
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          channelId: activeChannel,
          sender: currentChannel.name,
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          self: false,
          status: 'read',
          type: 'text'
        }
      ]);
    }, 3200);
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    handleSendMessage(typedMessage);
    setTypedMessage('');
  };

  // Mock Attachment triggers
  const sendMockImage = () => {
    const images = [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
      'https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=400',
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400'
    ];
    const pick = images[Math.floor(Math.random() * images.length)];
    handleSendMessage('Attached logistical shipment snapshot:', 'image', pick);
    toast.success('Mock photo attachment sent!');
  };

  const sendMockLocation = () => {
    handleSendMessage('Current GPS coordinates attached: 12.9716° N, 77.5946° E', 'location');
    toast.success('Mock location coordinates sent!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-6 min-h-0">
        
        {/* Left Side: Threads list */}
        <aside className="w-full lg:w-80 bg-white border border-border rounded-2xl flex flex-col shrink-0 shadow-premium-sm">
          <div className="p-4 border-b border-border space-y-3">
            <h3 className="text-sm font-display font-bold text-slate-900">Secure Messages</h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search conversations..."
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
                  <div className="font-semibold flex items-center gap-1 text-slate-950">
                    {ch.name}
                    {ch.verified && <ShieldCheck className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">{ch.time}</span>
                </div>
                <p className="text-[10px] truncate mt-1 text-slate-500">{ch.lastMsg}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Side: Message flow screen */}
        <main className="flex-grow flex flex-col bg-white border border-border rounded-2xl shadow-premium-sm overflow-hidden min-h-[500px]">
          {/* Active channel header */}
          <div className="p-4 border-b border-border flex justify-between items-center bg-slate-50">
            <div className="text-xs">
              <p className="font-bold flex items-center gap-1 text-slate-950">
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
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
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

                  {/* Image attachment rendering */}
                  {msg.type === 'image' && msg.mediaUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-black/10">
                      <img src={msg.mediaUrl} alt="attachment" className="max-w-full h-auto object-cover max-h-48" />
                    </div>
                  )}

                  {/* Location attachment rendering */}
                  {msg.type === 'location' && (
                    <div className="mt-2 p-2 bg-slate-100/90 text-slate-800 rounded-lg flex items-center gap-2 border border-slate-200">
                      <MapPin className="w-5 h-5 text-primary shrink-0" />
                      <div>
                        <p className="font-bold text-[10px]">Shared Location Coordinate</p>
                        <p className="text-[9px] text-slate-500">Click to view parcel route map</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Time & Read Receipts section */}
                <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
                  <span>{msg.time}</span>
                  {msg.self && (
                    <span>
                      {msg.status === 'sent' && <Check className="w-3.5 h-3.5 text-slate-300" />}
                      {msg.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5 text-slate-400" />}
                      {msg.status === 'read' && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Simulated Typing Indicator Bubble */}
            {isTyping && (
              <div className="mr-auto items-start max-w-[70%] text-xs space-y-1 flex flex-col">
                <span className="text-[9px] text-slate-400 font-semibold">{currentChannel.name}</span>
                <div className="bg-white text-slate-800 border border-border rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message input bar with attachment shortcuts */}
          <div className="border-t border-border bg-white p-3 space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={sendMockImage}
                className="p-1.5 bg-slate-50 border border-border hover:bg-slate-100 rounded-lg text-slate-500 flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                title="Attach Mock Image"
              >
                <Image className="w-3.5 h-3.5 text-slate-400" />
                <span>Add Photo Mock</span>
              </button>

              <button
                type="button"
                onClick={sendMockLocation}
                className="p-1.5 bg-slate-50 border border-border hover:bg-slate-100 rounded-lg text-slate-500 flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                title="Attach Mock Location"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Pin GPS Coord</span>
              </button>
            </div>

            <form onSubmit={handleTextSubmit} className="flex gap-3">
              <input
                type="text"
                placeholder="Type secure message..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-border bg-white text-slate-950 focus:outline-none placeholder-slate-400"
                required
              />
              <Button type="submit" variant="primary" icon={Send} className="px-5 font-bold">
                Send
              </Button>
            </form>
          </div>
        </main>

      </div>
    </div>
  );
}
