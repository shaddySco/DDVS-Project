import { useState, useEffect, useRef } from "react";
import axios from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";

export default function ChatModal({ isOpen, onClose, recipientId, recipientName }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen && recipientId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [isOpen, recipientId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/messages/${recipientId}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post(`/messages/${recipientId}`, { content: newMessage });
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md glass-panel overflow-hidden flex flex-col h-[500px] border-white/10 shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue font-bold text-xs ring-1 ring-neon-blue/30">
                {recipientName?.charAt(0).toUpperCase()}
             </div>
             <div>
                <h3 className="font-bold text-white text-sm">Chat with {recipientName}</h3>
                <div className="flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                   <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none">Protocol Secure</span>
                </div>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
          </button>
        </div>

        {/* Messages Pool */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
               <div className="text-4xl mb-2">💬</div>
               <p className="text-xs font-black uppercase tracking-[0.2em]">Initiate Secure Transmission</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender_id === user?.id ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm font-medium ${
                    msg.sender_id === user?.id 
                    ? 'bg-neon-blue text-black rounded-tr-none shadow-[0_4px_15px_rgba(0,243,255,0.2)]' 
                    : 'bg-white/10 text-white rounded-tl-none border border-white/5'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[9px] text-gray-500 mt-1 font-black uppercase tracking-tighter">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white/5 border-t border-white/5">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue/50 to-neon-purple/50 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
            <div className="relative flex gap-2">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your signal..."
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-blue/50 transition-all font-medium"
              />
              <button 
                type="submit"
                className="w-12 h-12 rounded-xl bg-neon-blue flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-neon-blue"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
