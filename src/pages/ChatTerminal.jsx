import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import {
  Send, ShieldCheck, Phone, Video, Search, MessageSquare, Check, CheckCheck,
  Sparkles, AlertCircle, Paperclip, Image, MapPin, Eye, X, Info, Truck, Calendar, ShoppingBag
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

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-6 py-8 gap-6 items-stretch h-[calc(100vh-140px)] min-h-[640px]">
        
        {/* Column 1: Threads list */}
        <aside className="w-full lg:w-72 bg-white border border-border rounded-2xl flex flex-col shrink-0 shadow-premium-sm overflow-hidden">
          <div className="p-5 border-b border-border space-y-4">
            <h3 className="font-display font-bold text-slate-900" style={{ fontSize: '18px' }}>Messages</h3>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-primary placeholder-slate-400"
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {channels.map((ch) => (
              <div
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  activeChannel === ch.id
                    ? 'bg-emerald-50/40 border-primary text-slate-900 font-bold'
                    : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center text-xs">
                  <div className="font-bold flex items-center gap-1 text-slate-900" style={{ fontSize: '14px' }}>
                    {ch.name}
                    {ch.verified && <ShieldCheck className="w-4 h-4 text-primary shrink-0" />}
                  </div>
                  <span className="font-mono text-slate-400" style={{ fontSize: '11px' }}>{ch.time}</span>
                </div>
                <p className="truncate mt-1.5 text-slate-500 font-medium" style={{ fontSize: '13px' }}>{ch.lastMsg}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Column 2: Message flow screen */}
        <main className="flex-1 flex flex-col bg-white border border-border rounded-2xl shadow-premium-sm overflow-hidden min-h-[480px]">
          {/* Active channel header */}
          <div className="p-5 border-b border-border flex justify-between items-center bg-slate-50">
            <div>
              <p className="font-bold flex items-center gap-1.5 text-slate-900" style={{ fontSize: '16px' }}>
                {currentChannel.name}
                {currentChannel.verified && <ShieldCheck className="w-4.5 h-4.5 text-primary shrink-0" />}
              </p>
              <p className="text-slate-500 mt-0.5" style={{ fontSize: '13px' }}>Secure NGO matching chat &bull; Encrypted logs</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => toast.info('Connecting voice call...')} icon={Phone} />
              <Button variant="secondary" onClick={() => toast.info('Connecting video call...')} icon={Video} />
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/20">
            {channelMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] space-y-1.5 ${
                  msg.self ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <span className="text-slate-400 font-semibold" style={{ fontSize: '11px' }}>{msg.sender}</span>
                <div
                  className={`p-4 rounded-2xl leading-relaxed shadow-premium-xs text-slate-800 ${
                    msg.self
                      ? 'bg-primary text-white font-medium rounded-tr-none'
                      : 'bg-white border border-border rounded-tl-none'
                  }`}
                  style={{ fontSize: '15px' }}
                >
                  {msg.text}

                  {/* Image attachment rendering */}
                  {msg.type === 'image' && msg.mediaUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-black/10">
                      <img src={msg.mediaUrl} alt="attachment" className="max-w-full h-auto object-cover max-h-52" />
                    </div>
                  )}

                  {/* Location attachment rendering */}
                  {msg.type === 'location' && (
                    <div className="mt-3 p-3 bg-slate-100 rounded-xl flex items-center gap-3 border border-slate-200">
                      <MapPin className="w-5 h-5 text-primary shrink-0" />
                      <div>
                        <p className="font-bold text-slate-850" style={{ fontSize: '13px' }}>Current Pickup Coordinates</p>
                        <p className="text-slate-500 mt-0.5" style={{ fontSize: '11px' }}>Click to trace logistics route</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Time & Read Receipts section */}
                <div className="flex items-center gap-1.5 text-slate-400 font-mono" style={{ fontSize: '11px' }}>
                  <span>{msg.time}</span>
                  {msg.self && (
                    <span>
                      {msg.status === 'sent' && <Check className="w-3.5 h-3.5 text-slate-350" />}
                      {msg.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5 text-slate-400" />}
                      {msg.status === 'read' && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Simulated Typing Indicator Bubble */}
            {isTyping && (
              <div className="mr-auto items-start max-w-[85%] space-y-1.5 flex flex-col">
                <span className="text-slate-400 font-semibold" style={{ fontSize: '11px' }}>{currentChannel.name}</span>
                <div className="bg-white border border-border rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message input bar with attachment shortcuts */}
          <div className="border-t border-border bg-white p-4 space-y-3 shrink-0">
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={sendMockImage}
                className="py-2 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 flex items-center gap-1.5 font-bold cursor-pointer transition-all"
                style={{ fontSize: '12px', minHeight: '36px' }}
              >
                <Image className="w-4 h-4 text-slate-400" />
                <span>Attach Photo</span>
              </button>

              <button
                type="button"
                onClick={sendMockLocation}
                className="py-2 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 flex items-center gap-1.5 font-bold cursor-pointer transition-all"
                style={{ fontSize: '12px', minHeight: '36px' }}
              >
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Share Coordinates</span>
              </button>
            </div>

            <form onSubmit={handleTextSubmit} className="flex gap-3">
              <input
                type="text"
                placeholder="Type secure message..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-primary placeholder-slate-400"
                style={{ fontSize: '15px', minHeight: '48px' }}
                required
              />
              <Button type="submit" variant="primary" icon={Send}>
                Send
              </Button>
            </form>
          </div>
        </main>

        {/* Column 3: Active Match Details & Action Console (New Column to fill horizontal gaps!) */}
        <aside className="hidden xl:flex w-80 bg-white border border-border rounded-2xl flex-col shrink-0 shadow-premium-sm p-5 space-y-6 overflow-y-auto">
          <div>
            <h4 className="font-display font-bold text-slate-900" style={{ fontSize: '16px' }}>Match Information</h4>
            <p className="text-slate-400 mt-0.5" style={{ fontSize: '12px' }}>Fulfillment status &amp; logistics tracking details</p>
          </div>

          {/* Stepper Status */}
          <div className="space-y-4">
            <h5 className="text-slate-450 uppercase font-mono tracking-wider font-bold" style={{ fontSize: '10px' }}>Logistics Status</h5>
            <div className="space-y-3.5">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-primary border border-emerald-100 flex items-center justify-center font-mono font-bold" style={{ fontSize: '11px' }}>1</div>
                <div>
                  <p className="font-bold text-slate-800" style={{ fontSize: '13px' }}>Donation Registered</p>
                  <p className="text-slate-400" style={{ fontSize: '11px' }}>Fleece blankets submitted by donor.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-primary border border-emerald-100 flex items-center justify-center font-mono font-bold" style={{ fontSize: '11px' }}>2</div>
                <div>
                  <p className="font-bold text-slate-800" style={{ fontSize: '13px' }}>Fulfillment Audited</p>
                  <p className="text-slate-400" style={{ fontSize: '11px' }}>Verification documents reviewed and certified.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-primary border border-emerald-100 flex items-center justify-center font-mono font-bold" style={{ fontSize: '11px' }}>3</div>
                <div>
                  <p className="font-bold text-slate-800" style={{ fontSize: '13px' }}>Smart Match Confirmed</p>
                  <p className="text-slate-400" style={{ fontSize: '11px' }}>Linked to Hope Foundation (1.2 km away).</p>
                </div>
              </div>

              <div className="flex gap-3 items-start opacity-50">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center font-mono font-bold" style={{ fontSize: '11px' }}>4</div>
                <div>
                  <p className="font-bold text-slate-800" style={{ fontSize: '13px' }}>Courier Dispatched</p>
                  <p className="text-slate-400" style={{ fontSize: '11px' }}>Scheduled for pickup on Monday 10:00 AM.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Courier Details */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <h5 className="text-slate-450 uppercase font-mono tracking-wider font-bold" style={{ fontSize: '10px' }}>Courier Assignment</h5>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary shrink-0" />
                <span className="font-bold text-slate-850" style={{ fontSize: '13px' }}>Express Cargo Unit</span>
              </div>
              <div className="space-y-1 text-slate-500" style={{ fontSize: '12px' }}>
                <p>Carrier: <b>LogiTransit Services</b></p>
                <p>Weight Class: <b>22.5 kg</b></p>
                <p>Milestone Code: <strong className="font-mono text-primary">DB-MATCH-990</strong></p>
              </div>
            </div>
          </div>

          {/* Proximity / Carbon info */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <h5 className="text-slate-450 uppercase font-mono tracking-wider font-bold" style={{ fontSize: '10px' }}>Eco Optimization</h5>
            <div className="flex items-center justify-between" style={{ fontSize: '13px' }}>
              <span className="text-slate-500 font-medium">Logistics Radius</span>
              <span className="font-bold text-slate-900">1.2 km</span>
            </div>
            <div className="flex items-center justify-between" style={{ fontSize: '13px' }}>
              <span className="text-slate-500 font-medium">Estimated Carbon Saved</span>
              <span className="font-bold text-primary">10.1 kg CO₂</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 text-center">
            <button
              onClick={() => toast.info('Logistics manifest printed successfully.')}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold transition-all cursor-pointer"
              style={{ fontSize: '13px', minHeight: '40px' }}
            >
              Print Delivery Manifest
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
}
