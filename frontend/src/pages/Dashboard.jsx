import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../lib/axios";
import Button from "../components/ui/Button";

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: "",
    developer_type: "",
    bio: "",
    skills: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      const res = await axios.get("/auth/me");
      setUser(res.data);
      
      if (!isEditing) {
        setFormData({
          username: res.data.username || "",
          developer_type: res.data.developer_type || "",
          bio: res.data.bio || "",
          skills: res.data.skills || "",
        });
      }

      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("edit") === "true") {
        setIsEditing(true);
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    }
  }, [setUser, isEditing]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put("/user/profile", formData);
      setUser(res.data.user); 
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-5xl mx-auto">
      
      {/* HEADER CARD */}
      <div className="glass-panel p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden group">
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 to-neon-purple/5 pointer-events-none"></div>
        
        {/* Avatar Section */}
        <div className="relative shrink-0">
          <div className="w-32 h-32 rounded-full bg-slate-900 border-4 border-white/10 shadow-neon-blue flex items-center justify-center text-4xl font-bold text-neon-blue relative z-10 group-hover:scale-105 transition-transform duration-500">
            {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="absolute -inset-4 bg-neon-blue/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>

        {/* Identity Section */}
        <div className="flex-1 text-center md:text-left relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            {user?.username || "Anonymous User"}
          </h1>
          <p className="font-mono text-neon-blue mb-4 text-sm bg-black/30 inline-block px-3 py-1 rounded-md border border-white/5">
            {user?.wallet_address}
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {user?.developer_type && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/50 text-neon-purple text-sm font-medium shadow-[0_0_10px_rgba(188,19,254,0.2)]">
                🚀 {user.developer_type}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="relative z-10">
           <Button 
             variant={isEditing ? "glass" : "primary"}
             onClick={() => setIsEditing(!isEditing)}
             className="shadow-lg"
           >
             {isEditing ? "Cancel Edit" : "Edit Profile"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: STATS */}
        <div className="md:col-span-1 flex flex-col gap-6">
           <div className="glass-panel p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-neon-gold/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
             
             <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-6 border-b border-white/5 pb-2">
               Player Stats
             </h3>
             
             <div className="space-y-5">
               <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                 <span className="text-gray-300">Level</span>
                 <span className="text-neon-gold font-bold text-xl drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">
                   🏆 {user?.level || 1}
                 </span>
               </div>
               
               <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                 <span className="text-gray-300">XP</span>
                 <span className="text-neon-purple font-bold text-xl drop-shadow-[0_0_5px_rgba(188,19,254,0.5)]">
                   ⭐ {user?.xp || 0}
                 </span>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                 <div className="text-center p-3 rounded-lg bg-black/20">
                   <div className="text-white font-bold text-lg">{user?.followers_count || 0}</div>
                   <div className="text-xs text-gray-500 uppercase">Followers</div>
                 </div>
                 <div className="text-center p-3 rounded-lg bg-black/20">
                   <div className="text-white font-bold text-lg">{user?.following_count || 0}</div>
                   <div className="text-xs text-gray-500 uppercase">Following</div>
                 </div>
               </div>
             </div>
           </div>
        </div>

        {/* RIGHT COLUMN: DETAILS OR EDIT FORM */}
        <div className="md:col-span-2">
          {isEditing ? (
            <form className="glass-panel p-8 animate-in fade-in slide-in-from-bottom-4" onSubmit={handleUpdate}>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                ✏️ Edit Profile
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="group">
                  <label className="block text-gray-400 text-sm mb-2 group-focus-within:text-neon-blue transition-colors">Display Name</label>
                  <input 
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue focus:outline-none transition-all"
                    value={formData.username} 
                    onChange={(e) => setFormData({...formData, username: e.target.value})} 
                    placeholder="e.g. Satoshi"
                  />
                </div>
                <div className="group">
                  <label className="block text-gray-400 text-sm mb-2 group-focus-within:text-neon-blue transition-colors">Developer Role</label>
                  <input 
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue focus:outline-none transition-all"
                    value={formData.developer_type} 
                    onChange={(e) => setFormData({...formData, developer_type: e.target.value})} 
                    placeholder="e.g. Solidity Dev"
                  />
                </div>
              </div>

              <div className="mb-6 group">
                <label className="block text-gray-400 text-sm mb-2 group-focus-within:text-neon-blue transition-colors">Bio</label>
                <textarea 
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue focus:outline-none transition-all h-32 resize-none"
                  value={formData.bio} 
                  onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                  placeholder="Tell your story..."
                />
              </div>

              <div className="mb-8 group">
                <label className="block text-gray-400 text-sm mb-2 group-focus-within:text-neon-blue transition-colors">Skills (Comma separated)</label>
                <textarea 
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue focus:outline-none transition-all h-24 resize-none"
                  value={formData.skills} 
                  onChange={(e) => setFormData({...formData, skills: e.target.value})} 
                  placeholder="React, Rust, AI..."
                />
              </div>

              <div className="flex justify-end gap-4 border-t border-white/5 pt-6">
                <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={loading} className="shadow-neon-purple">
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="glass-panel p-8 min-h-[400px] flex flex-col gap-8">
              <div>
                <h4 className="text-lg font-bold text-gray-300 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📖</span> About
                </h4>
                <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                  <p className="text-gray-400 leading-relaxed text-lg">
                    {user?.bio || <span className="italic opacity-50">No bio added yet. Click edit to add your story!</span>}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-gray-300 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🛠️</span> Tech Stack
                </h4>
                <div className="flex flex-wrap gap-3">
                  {user?.skills ? user.skills.split(',').map(s => (
                    <span key={s} className="px-4 py-2 rounded-lg bg-linear-to-r from-slate-800 to-slate-900 border border-white/10 text-neon-blue font-medium hover:border-neon-blue/50 hover:shadow-[0_0_10px_rgba(0,243,255,0.1)] transition-all cursor-default">
                      {s.trim()}
                    </span>
                  )) : <span className="text-gray-500 italic px-4 py-2">No skills listed.</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>                
  );
}