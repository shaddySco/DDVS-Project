import { useState, useEffect } from "react";
import axios from "../lib/axios";
import ChatModal from "./ChatModal";

export default function ChatsListModal({ isOpen, onClose }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchChats();
    }
  }, [isOpen]);

  const fetchChats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get('/messages/conversations');
      setChats(res.data || []);
    } catch (err) {
      console.error("Fetch chats error:", err);
      setError("Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // If a chat is selected, show the ChatModal
  if (selectedChat) {
    return (
      <ChatModal
        isOpen={true}
        onClose={() => setSelectedChat(null)}
        recipientId={selectedChat.id}
        recipientName={selectedChat.name}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md glass-panel overflow-hidden flex flex-col h-[600px] border-white/10 shadow-2xl">

        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue font-bold text-lg">
              💬
            </div>
            <h3 className="font-bold text-white text-sm">Secure Transmissions</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border-b border-red-500/30 text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="text-4xl mb-2 animate-pulse">⚙️</div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Initializing Link</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-xs font-black uppercase tracking-[0.2em]">No Active Transmissions</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue font-bold text-sm flex-shrink-0 ring-1 ring-neon-blue/30">
                    {chat.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">{chat.name}</h4>
                    <p className="text-xs text-gray-400 truncate">{chat.lastMessage || "No messages yet"}</p>
                  </div>
                  {chat.unread && (
                    <div className="w-2 h-2 rounded-full bg-neon-blue flex-shrink-0"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
