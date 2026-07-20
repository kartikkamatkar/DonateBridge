import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import {
  Send, ShieldCheck, Phone, Video, Search, MessageSquare, Check, CheckCheck,
  Sparkles, AlertCircle, Paperclip, Image, MapPin, Eye, X, Info, Truck, Calendar, ShoppingBag
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import Navbar from '../components/layout/Navbar';
import { chatAPI, getApiError } from '../api/index';
import { useAuth } from '../context/GlobalStateContext';

export default function ChatTerminal() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const [activeChannel, setActiveChannel] = useState(null);
  const [typedMessage, setTypedMessage] = useState('');
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch Channels on mount
  const fetchChannels = async (showLoading = true) => {
    if (!isAuthenticated) return;
    try {
      if (showLoading) setLoading(true);
      const res = await chatAPI.getChannels();
      setChannels(res.data);
      if (res.data.length > 0 && !activeChannel) {
        setActiveChannel(res.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load chat channels:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Fetch messages for active channel
  const fetchMessages = async (channelId) => {
    if (!channelId) return;
    try {
      const res = await chatAPI.getMessages(channelId);
      // Backend returns fields: id, sender_name, message_type, text, media_url, self, status, time, etc.
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load channel messages:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchChannels();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Poll messages every 3 seconds for active channel
  useEffect(() => {
    if (!activeChannel) return;
    fetchMessages(activeChannel);

    const interval = setInterval(() => {
      fetchMessages(activeChannel);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeChannel]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend, type = 'text', mediaUrl = null, lat = null, lng = null) => {
    if (!activeChannel) return;
    setSending(true);
    try {
      const res = await chatAPI.sendMessage(activeChannel, textToSend, type, mediaUrl, lat, lng);
      // Append the new message immediately for crisp feel
      setMessages(prev => [...prev, res.data]);
      setTypedMessage('');
      
      // Update channel's last message locally
      setChannels(prev => prev.map(ch => ch.id === activeChannel ? { ...ch, lastMsg: textToSend, time: 'Just now' } : ch));
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSending(false);
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || sending) return;
    handleSendMessage(typedMessage.trim());
  };

  // Quick attachment shortcuts
  const sendMockImage = () => {
    const images = [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
      'https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=400',
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400'
    ];
    const pick = images[Math.floor(Math.random() * images.length)];
    handleSendMessage('Attached logistical shipment snapshot:', 'image', pick);
    toast.success('Photo attachment sent!');
  };

  const sendMockLocation = () => {
    handleSendMessage('Current GPS coordinates attached: 12.9716° N, 77.5946° E', 'location', null, 12.9716, 77.5946);
    toast.success('Location coordinates sent!');
  };

  const currentChannel = channels.find(c => c.id === activeChannel);

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
            {loading ? (
              <div className="text-center py-8 text-slate-400 text-xs">Loading conversations…</div>
            ) : channels.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No active chat conversations.</div>
            ) : (
              channels.map((ch) => (
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
              ))
            )}
          </div>
        </aside>

        {/* Column 2: Message flow screen */}
        <main className="flex-1 flex flex-col bg-white border border-border rounded-2xl shadow-premium-sm overflow-hidden min-h-[480px]">
          {/* Active channel header */}
          <div className="p-5 border-b border-border flex justify-between items-center bg-slate-50">
            {currentChannel ? (
              <div>
                <p className="font-bold flex items-center gap-1.5 text-slate-900" style={{ fontSize: '16px' }}>
                  {currentChannel.name}
                  {currentChannel.verified && <ShieldCheck className="w-4.5 h-4.5 text-primary shrink-0" />}
                </p>
                <p className="text-slate-500 mt-0.5" style={{ fontSize: '13px' }}>Secure NGO matching chat &bull; Encrypted logs</p>
              </div>
            ) : (
              <div>
                <p className="font-bold text-slate-900" style={{ fontSize: '16px' }}>No Conversation Selected</p>
                <p className="text-slate-500 mt-0.5" style={{ fontSize: '13px' }}>Select an active user chat to begin</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => toast.info('Connecting voice call...')} icon={Phone} />
              <Button variant="secondary" onClick={() => toast.info('Connecting video call...')} icon={Video} />
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/20">
            {!isAuthenticated ? (
              <div className="text-center py-16 text-slate-450 space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="font-bold">Authentication Required</p>
                <p className="text-xs">Sign in to coordinate with matches.</p>
                <Button onClick={() => navigate('/auth')}>Sign In</Button>
              </div>
            ) : !activeChannel ? (
              <div className="text-center py-16 text-slate-450 text-xs">
                Select a thread from the side panel to view messages.
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                No messages yet. Say hello!
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] space-y-1.5 ${
                    msg.self ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <span className="text-slate-400 font-semibold" style={{ fontSize: '11px' }}>{msg.sender_name}</span>
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
                    {msg.message_type === 'image' && msg.media_url && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-black/10">
                        <img src={msg.media_url} alt="attachment" className="max-w-full h-auto object-cover max-h-52" />
                      </div>
                    )}

                    {/* Location attachment rendering */}
                    {msg.message_type === 'location' && (
                      <div className="mt-3 p-3 bg-slate-100 rounded-xl flex items-center gap-3 border border-slate-200">
                        <MapPin className="w-5 h-5 text-primary shrink-0" />
                        <div>
                          <p className="font-bold text-slate-850" style={{ fontSize: '13px' }}>Current Pickup Coordinates</p>
                          <p className="text-slate-500 mt-0.5" style={{ fontSize: '11px' }}>
                            {msg.lat && msg.lng ? `${msg.lat.toFixed(4)}° N, ${msg.lng.toFixed(4)}° E` : 'Coords shared'}
                          </p>
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
              ))
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message input bar with attachment shortcuts */}
          <div className="border-t border-border bg-white p-4 space-y-3 shrink-0">
            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={!activeChannel || sending}
                onClick={sendMockImage}
                className="py-2 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 flex items-center gap-1.5 font-bold cursor-pointer transition-all disabled:opacity-50"
                style={{ fontSize: '12px', minHeight: '36px' }}
              >
                <Image className="w-4 h-4 text-slate-400" />
                <span>Attach Photo</span>
              </button>

              <button
                type="button"
                disabled={!activeChannel || sending}
                onClick={sendMockLocation}
                className="py-2 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 flex items-center gap-1.5 font-bold cursor-pointer transition-all disabled:opacity-50"
                style={{ fontSize: '12px', minHeight: '36px' }}
              >
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Share Coordinates</span>
              </button>
            </div>

            <form onSubmit={handleTextSubmit} className="flex gap-3">
              <input
                type="text"
                disabled={!activeChannel || sending}
                placeholder={activeChannel ? "Type secure message..." : "Select a thread to chat..."}
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-primary placeholder-slate-400 disabled:bg-slate-50"
                style={{ fontSize: '15px', minHeight: '48px' }}
                required
              />
              <Button type="submit" variant="primary" icon={Send} loading={sending} isDisabled={!activeChannel || sending}>
                Send
              </Button>
            </form>
          </div>
        </main>

        {/* Column 3: Active Match Details & Action Console */}
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
                  <p className="text-slate-400" style={{ fontSize: '11px' }}>Items submitted by donor.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-primary border border-emerald-100 flex items-center justify-center font-mono font-bold" style={{ fontSize: '11px' }}>2</div>
                <div>
                  <p className="font-bold text-slate-800" style={{ fontSize: '13px' }}>Fulfillment Audited</p>
                  <p className="text-slate-400" style={{ fontSize: '11px' }}>Verification review certified by Admin.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-primary border border-emerald-100 flex items-center justify-center font-mono font-bold" style={{ fontSize: '11px' }}>3</div>
                <div>
                  <p className="font-bold text-slate-800" style={{ fontSize: '13px' }}>Smart Match Confirmed</p>
                  <p className="text-slate-400" style={{ fontSize: '11px' }}>Linked match parameters fulfilled.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start opacity-50">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center font-mono font-bold" style={{ fontSize: '11px' }}>4</div>
                <div>
                  <p className="font-bold text-slate-800" style={{ fontSize: '13px' }}>Courier Dispatched</p>
                  <p className="text-slate-400" style={{ fontSize: '11px' }}>Scheduled for pickup route tracking.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Eco info */}
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
