import { useState, useEffect, useCallback } from "react";
import axios from "../lib/axios";

export default function NotificationsModal({ isOpen, onClose, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper to safely notify parent about unread count
  const updateUnreadCount = useCallback((count) => {
    if (typeof onUnreadCountChange === 'function') {
      try { onUnreadCountChange(count); } catch { /* swallow */ }
    }
  }, [onUnreadCountChange]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/notifications');
      setNotifications(res.data);
      const unread = Array.isArray(res.data) ? res.data.filter(n => !n.is_read).length : 0;
      updateUnreadCount(unread);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
    }
  }, [updateUnreadCount]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => {
        const updated = prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n);
        const unread = updated.filter(n => !n.is_read).length;
        updateUnreadCount(unread);
        return updated;
      });
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      updateUnreadCount(0);
    } catch (err) {
      console.error("Mark all as read error:", err);
    }
  };

  // Close on Escape key when open
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    // Only close if clicking directly on the backdrop, not on the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div className="w-full max-w-md glass-panel overflow-hidden flex flex-col h-[500px] border-white/10 shadow-2xl">

        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue font-bold text-xs">
              🔔
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Notifications</h3>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none">System Alerts</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.is_read) && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-neon-blue hover:text-white transition-colors px-2 py-1 rounded"
              >
                Mark All Read
              </button>
            )}
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white hover:bg-white/10 transition-all p-2 rounded-lg"
              title="Close notifications"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/20">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-white/20 border-t-neon-blue rounded-full animate-spin"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
              <div className="text-4xl mb-2">🔔</div>
              <p className="text-xs font-black uppercase tracking-[0.2em]">No Notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  notification.is_read
                    ? 'bg-white/5 border-white/5 opacity-60'
                    : 'bg-neon-blue/10 border-neon-blue/30 shadow-neon-blue/20'
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2 font-mono">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-neon-blue rounded-full flex-shrink-0 mt-1"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
