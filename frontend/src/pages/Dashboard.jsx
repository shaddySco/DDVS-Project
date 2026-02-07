import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../lib/axios";
import Button from "../components/ui/Button";
import AdminNewsManager from "../components/AdminNewsManager";

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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

      {/* HEADER PROFILE */}
      <div className="mb-8 flex flex-col md:flex-row items-start gap-8 border-b border-white/10 pb-8">
        {/* ... existing header code ... */}
        <div className="relative shrink-0">
          <div className="w-40 h-40 rounded-full bg-slate-800 border-4 border-[#0F172A] shadow-xl flex items-center justify-center text-5xl font-bold text-white relative z-10 overflow-hidden">
            {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
          </div>
        </div>

        <div className="flex-1 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  {user?.username || "Anonymous User"}
                </h1>
                <div className="flex gap-1">
                  <span title="Top Contributor" className="text-xl">🏆</span>
                  <span title="Verified Expert" className="text-xl">⭐</span>
                  <span title="Protocol Guardian" className="text-xl">🛡️</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-gray-400 font-medium text-lg">
                  {user?.developer_type || "Developer"}
                </p>
                {user?.role === 'admin' && (
                  <span className="bg-neon-blue/10 text-neon-blue text-[10px] font-bold px-2 py-1 rounded border border-neon-blue/20 uppercase tracking-wider">
                    Protocol Admin
                  </span>
                )}
              </div>
            </div>
            <Button
              variant={isEditing ? "outline" : "primary"}
              onClick={() => setIsEditing(!isEditing)}
              size="sm"
            >
              {isEditing ? "Cancel Editing" : "Edit Profile"}
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 font-mono mb-6">
            <span className="bg-white/5 px-3 py-1 rounded">
              {(user?.wallet_address || "").substring(0, 6)}...{(user?.wallet_address || "").substring(38)}
            </span>
            <span>•</span>
            <span>Joined {new Date(user?.created_at || Date.now()).toLocaleDateString()}</span>
          </div>

          {/* Impact Stats (6 Sections) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 border-t border-white/5 pt-6">
            <div>
              <div className="text-xl font-bold text-white">{user?.xp || 0}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Reputation</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">Lvl {user?.level || 1}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Growth</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">{user?.submissions_count || 0}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Projects</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">{user?.followers_count || 0}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Followers</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">{user?.following_count || 0}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Following</div>
            </div>
            <div>
              <div className="text-xl font-bold text-neon-blue">{user?.role === 'admin' ? 'S-Rank' : 'A-Rank'}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Tier</div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-6 mb-8 border-b border-white/5">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === "overview" ? "text-neon-blue border-b-2 border-neon-blue" : "text-gray-500 hover:text-white"}`}
        >
          Overview
        </button>
        {user?.role === 'admin' && (
          <button
            onClick={() => setActiveTab("admin")}
            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === "admin" ? "text-neon-blue border-b-2 border-neon-blue" : "text-gray-500 hover:text-white"}`}
          >
            Protocol Admin
          </button>
        )}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* LEFT: BIO & SKILLS */}
          <div className="md:col-span-2 space-y-12">
            {isEditing ? (
              <form className="glass-panel p-8" onSubmit={handleUpdate}>
                <h3 className="text-lg font-bold text-white mb-6">Edit Profile Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="group">
                    <label className="block text-gray-400 text-sm mb-2">Display Name</label>
                    <input
                      className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-all"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="e.g. Satoshi"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-gray-400 text-sm mb-2">Role / Title</label>
                    <input
                      className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-all"
                      value={formData.developer_type}
                      onChange={(e) => setFormData({ ...formData, developer_type: e.target.value })}
                      placeholder="e.g. Full Stack Developer"
                    />
                  </div>
                </div>

                <div className="mb-6 group">
                  <label className="block text-gray-400 text-sm mb-2">Bio</label>
                  <textarea
                    className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-all h-32 resize-none"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="mb-8 group">
                  <label className="block text-gray-400 text-sm mb-2">Skills (Comma separated)</label>
                  <textarea
                    className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-all h-24 resize-none"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="React, Solidity, Rust..."
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-white/5 pt-6">
                  <Button variant="ghost" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">About</h3>
                  <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                    {user?.bio || "No bio available."}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Skills & Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {user?.skills ? user.skills.split(',').map(s => (
                      <span key={s} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-medium">
                        {s.trim()}
                      </span>
                    )) : <span className="text-gray-500 italic">No skills listed.</span>}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT: ACCOUNT STATUS */}
          <div className="md:col-span-1">
            <div className="glass-panel p-6 rounded-2xl bg-[#0F172A]/50 border border-white/5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Account Status</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-400">Membership</span>
                  <span className="text-white font-medium">Active</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-400">Verification</span>
                  <span className="text-blue-400 font-medium">Verified</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-400">Projects</span>
                  <span className="text-white font-medium">{user?.submissions_count || 0}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-xs text-gray-500">Member since {new Date(user?.created_at || Date.now()).getFullYear()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "admin" && user?.role === 'admin' && (
        <AdminNewsManager />
      )}

    </div>
  );
}