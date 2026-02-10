import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "../lib/axios";
import { useAuth } from "../context/AuthContext";

export default function Chat() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("conversations"); // conversations, following, followers
  const scrollRef = useRef(null);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await axios.get('/messages/conversations');
      setConversations(res.data || []);
      setError("");
    } catch (err) {
      console.error("Fetch conversations error:", err);
      setError("Failed to load conversations");
    }
  }, []);

  // Fetch followers and following
  const fetchFollowersFollowing = useCallback(async () => {
    try {
      const followerRes = await axios.get('/users/followers');
      const followingRes = await axios.get('/users/following');
      setFollowers(followerRes.data || []);
      setFollowing(followingRes.data || []);
    } catch (err) {
      console.error("Fetch followers/following error:", err);
    }
  }, []);

  // Fetch messages for selected chat
  const fetchMessages = useCallback(async () => {
    if (!selectedChat) return;
    try {
      const res = await axios.get(`/messages/${selectedChat.id}`);
      setMessages(res.data);
      setError("");
    } catch (err) {
      console.error("Fetch messages error:", err);
      if (err.response?.status === 401) {
        setError("Authentication required. Please reconnect your wallet.");
      }
    }
  }, [selectedChat]);

  // Load conversations and followers/following on mount
  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchFollowersFollowing();
      const interval = setInterval(() => {
        fetchConversations();
        fetchFollowersFollowing();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [user, fetchConversations, fetchFollowersFollowing]);

  // Handle query parameter for direct messaging
  useEffect(() => {
    const userId = searchParams.get('user');
    if (userId && conversations.length > 0) {
      const chat = conversations.find(c => c.id === parseInt(userId));
      if (chat) {
        setSelectedChat(chat);
        setActiveTab("conversations");
      }
    }
  }, [searchParams, conversations]);

  // Load/refresh messages for selected chat
  useEffect(() => {
    if (selectedChat) {
      setLoading(true);
      (async () => {
        await fetchMessages();
        setLoading(false);
      })();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedChat, fetchMessages]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const token = localStorage.getItem('ddvs_token');
    if (!token) {
      setError("Authentication required. Please connect your wallet.");
      return;
    }

    try {
      const res = await axios.post(`/messages/${selectedChat.id}`, { content: newMessage });
      setMessages(prev => [...prev, res.data]);
      setNewMessage("");
      setError("");
      await fetchConversations();
    } catch (err) {
      console.error("Send message error:", err);
      if (err.response?.status === 401) {
        setError("Authentication failed. Please reconnect your wallet.");
      } else {
        setError("Failed to send message. Please try again.");
      }
    }
  };

  const handleSelectUser = (user) => {
    const chat = {
      id: user.id,
      name: user.username,
      lastMessage: user.lastMessage || "No messages yet",
      unread: false
    };
    setSelectedChat(chat);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] pt-20">
      <div className="h-[calc(100vh-80px)] flex gap-4 p-4">

        {/* LEFT SIDEBAR - CONVERSATIONS & CONTACTS LIST */}
        <div className="w-full md:w-80 bg-white/5 border border-white/10 rounded-2xl flex flex-col overflow-hidden">

          {/* Header */}
          <div className="p-4 border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue font-bold text-lg">
                💬
              </div>
              <h2 className="font-bold text-white text-sm">Secure Transmissions</h2>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/5 px-4">
            {[
              { id: "conversations", label: "Chats", icon: "💬" },
              { id: "following", label: "Following", icon: "👥" },
              { id: "followers", label: "Followers", icon: "📋" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-neon-blue text-neon-blue'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border-b border-red-500/30 text-red-500 text-xs text-center">
              {error}
            </div>
          )}

          {/* List Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === "conversations" && (
              conversations.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-xs font-black uppercase tracking-[0.2em]">No Active Transmissions</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {conversations.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => {
                        setSelectedChat(chat);
                        setMessages([]);
                      }}
                      className={`w-full p-4 flex items-center gap-3 transition-all text-left ${
                        selectedChat?.id === chat.id
                          ? 'bg-neon-blue/20 border-l-2 border-neon-blue'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue font-bold text-sm flex-shrink-0 ring-1 ring-neon-blue/30">
                        {chat.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">{chat.name}</h4>
                        <p className="text-xs text-gray-400 truncate">{chat.lastMessage || "No messages yet"}</p>
                      </div>
                      {chat.unread && (
                        <div className="w-2 h-2 rounded-full bg-neon-blue flex-shrink-0 animate-pulse"></div>
                      )}
                    </button>
                  ))}
                </div>
              )
            )}

            {activeTab === "following" && (
              following.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                  <div className="text-4xl mb-2">👥</div>
                  <p className="text-xs font-black uppercase tracking-[0.2em]">Not Following Anyone</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {following.map((person) => (
                    <button
                      key={person.id}
                      onClick={() => handleSelectUser(person)}
                      className={`w-full p-4 flex items-center gap-3 transition-all text-left ${
                        selectedChat?.id === person.id
                          ? 'bg-neon-blue/20 border-l-2 border-neon-blue'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue font-bold text-sm flex-shrink-0 ring-1 ring-neon-blue/30">
                        {person.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">{person.username}</h4>
                        <p className="text-xs text-gray-400 truncate">{person.developer_type || "Developer"}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )
            )}

            {activeTab === "followers" && (
              followers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-xs font-black uppercase tracking-[0.2em]">No Followers Yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {followers.map((person) => (
                    <button
                      key={person.id}
                      onClick={() => handleSelectUser(person)}
                      className={`w-full p-4 flex items-center gap-3 transition-all text-left ${
                        selectedChat?.id === person.id
                          ? 'bg-neon-blue/20 border-l-2 border-neon-blue'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue font-bold text-sm flex-shrink-0 ring-1 ring-neon-blue/30">
                        {person.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">{person.username}</h4>
                        <p className="text-xs text-gray-400 truncate">{person.developer_type || "Developer"}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* RIGHT PANEL - CHAT WINDOW */}
        <div className="hidden md:flex flex-1 bg-white/5 border border-white/10 rounded-2xl flex-col overflow-hidden">

          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue font-bold text-xs ring-1 ring-neon-blue/30">
                    {selectedChat.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Chat with {selectedChat.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Protocol Secure</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {loading && messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="text-4xl mb-2 animate-pulse">⚙️</div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Loading Messages</p>
                  </div>
                ) : messages.length === 0 ? (
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
                        className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm font-medium ${
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

              {/* Message Input */}
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
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
              <div className="text-6xl mb-4">👈</div>
              <p className="text-sm font-black uppercase tracking-[0.2em]">Select a Conversation</p>
              <p className="text-xs text-gray-400 mt-2">Choose a chat from the left to start messaging</p>
            </div>
          )}
        </div>

        {/* MOBILE: Full Chat Window */}
        <div className="flex md:hidden flex-1 bg-white/5 border border-white/10 rounded-2xl flex-col overflow-hidden">

          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ←
                  </button>
                  <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue font-bold text-xs ring-1 ring-neon-blue/30">
                    {selectedChat.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{selectedChat.name}</h3>
                    <span className="text-[10px] text-gray-400 uppercase font-black">Online</span>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {loading && messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-2xl animate-pulse">⚙️</div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
                    <div className="text-4xl mb-2">💬</div>
                    <p className="text-xs font-black uppercase tracking-[0.2em]">Start conversation</p>
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
                            ? 'bg-neon-blue text-black rounded-tr-none'
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

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white/5 border-t border-white/5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type message..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-blue/50 transition-all"
                  />
                  <button
                    type="submit"
                    className="w-12 h-12 rounded-xl bg-neon-blue flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
              <div className="text-4xl mb-2">👆</div>
              <p className="text-xs font-black uppercase tracking-[0.2em]">Select a Chat</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
