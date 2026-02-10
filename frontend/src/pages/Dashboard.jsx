import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../lib/axios";
import Button from "../components/ui/Button";
import AdminNewsManager from "../components/AdminNewsManager";
import { getRankByXp, getNextRank } from "../utils/ranks";

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [mySubmissions, setMySubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState("");

  const currentRank = user ? getRankByXp(user.xp || 0) : null;
  const nextRank = user ? getNextRank(user.xp || 0) : null;

  const [formData, setFormData] = useState({
    username: "",
    github_username: "",
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
          github_username: res.data.github_username || "",
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



  const fetchMySubmissions = useCallback(async () => {
    setSubmissionsLoading(true);
    setSubmissionsError("");
    try {
      const res = await axios.get("/submissions/mine");
      setMySubmissions(res.data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setSubmissionsError(err.response?.data?.message || "Failed to load submissions");
    } finally {
      setSubmissionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchMySubmissions(); // Load submissions for Overview too
  }, [fetchProfile, fetchMySubmissions]);

  // Fetch submissions when tab changes to "myProjects"
  useEffect(() => {
    if (activeTab === "myProjects") {
      fetchMySubmissions();
    }
  }, [activeTab, fetchMySubmissions]);

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
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                  {user?.username || "Anonymous User"}
                  {currentRank && (
                    <span 
                      className={`text-2xl w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 border-2 ${currentRank.border} shadow-lg`}
                      title={`Current Rank: ${currentRank.name}`}
                    >
                      {currentRank.icon}
                    </span>
                  )}
                </h1>
                
                {user?.verified_at && (
                    <span className="text-xl" title="Verified Expert">⭐</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {currentRank && (
                   <span className={`text-xs font-bold px-2 py-0.5 rounded border ${currentRank.color} border-current bg-white/5 uppercase tracking-widest`}>
                      {currentRank.name}
                   </span>
                )}
                <p className="text-gray-400 font-medium text-lg border-l border-white/10 pl-3">
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
            <span className={`flex items-center gap-1 bg-white/5 px-3 py-1 rounded ${user?.github_username ? 'text-green-400' : 'text-gray-500'}`}>
              <span className="text-lg">🐙</span>
              {user?.github_username ? `@${user.github_username} Verified` : 'GitHub Not Connected'}
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
              <div className={`text-xl font-bold ${currentRank?.color}`}>{currentRank?.name || "INITIATE"}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Protocol Rank</div>
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
        <button
          onClick={() => setActiveTab("myProjects")}
          className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === "myProjects" ? "text-neon-blue border-b-2 border-neon-blue" : "text-gray-500 hover:text-white"}`}
        >
          My Projects
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
                  <label className="block text-gray-400 text-sm mb-2">GitHub Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500">github.com/</span>
                    <input
                      className="w-full bg-[#0F172A] border border-white/10 rounded-lg pl-[100px] pr-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-all"
                      value={formData.github_username}
                      onChange={(e) => setFormData({ ...formData, github_username: e.target.value })}
                      placeholder="username"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">Connecting your GitHub allows for easier identity verification on submissions.</p>
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

                {user?.category_xp && Object.keys(user.category_xp).length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Skill Reputation (SP Points)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(user.category_xp).map(([cat, xp]) => (
                        <div key={cat} className="glass-panel p-4 border border-white/5 bg-white/[0.02]">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-gray-300">{cat}</span>
                            <span className="text-xs font-mono text-neon-blue">{xp} SP</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-neon-blue" 
                              style={{ width: `${Math.min(100, (xp % 100))}%` }}
                            ></div>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-tighter">Level {Math.floor(xp / 100) + 1}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* RECENT ACTIVITY / PROJECTS LIST */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      Recent Activity
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-500 font-mono">LATEST_WORK</span>
                    </h3>
                    <button 
                      onClick={() => setActiveTab("myProjects")}
                      className="text-xs text-neon-blue hover:underline font-bold"
                    >
                      View All →
                    </button>
                  </div>

                  {mySubmissions.length > 0 ? (
                    <div className="space-y-4">
                      {mySubmissions.slice(0, 3).map((sub) => (
                        <div key={sub.id} className="glass-panel p-4 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-xl">
                              {sub.category?.includes("Web") ? "🌐" : sub.category?.includes("Blockchain") ? "⛓️" : "📁"}
                            </div>
                            <div>
                              <h4 className="font-bold text-white group-hover:text-neon-blue transition-colors">{sub.title}</h4>
                              <p className="text-xs text-gray-500">{sub.category} • {new Date(sub.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {sub.ownership_status === "verified" ? (
                              <span className="text-[10px] px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded uppercase font-bold tracking-widest">
                                Verified
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded uppercase font-bold tracking-widest">
                                Unverified
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {mySubmissions.some(s => s.ownership_status !== 'verified') && (
                        <div className="mt-4 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex items-start gap-4 animate-pulse">
                          <span className="text-xl">⚠️</span>
                          <div>
                            <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-1">Action Required</p>
                            <p className="text-[10px] text-gray-400 leading-relaxed">
                              You have projects that are not yet verified. Only **Verified** projects appear in the Global Nexus and Community Hub. Click on "My Projects" to verify them via MetaMask.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 border border-dashed border-white/10 rounded-xl text-center">
                      <p className="text-gray-500 text-sm">No submissions found. Start by deploying your first project!</p>
                      <button 
                         onClick={() => window.location.href = "/submit"}
                         className="mt-4 text-xs font-bold text-neon-blue uppercase tracking-widest hover:text-white transition-colors"
                      >
                        + Submit Now
                      </button>
                    </div>
                  )}
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

      {activeTab === "myProjects" && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">My Projects</h2>
            <Button variant="primary" size="sm" onClick={() => window.location.href = '/submit'}>
              + New Project
            </Button>
          </div>

          {submissionsError && (
            <div className="p-4 rounded bg-red-500/10 border border-red-500/30 text-red-500">
              {submissionsError}
            </div>
          )}

          {submissionsLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading your projects...</p>
            </div>
          ) : mySubmissions.length === 0 ? (
            <div className="text-center py-12 border border-white/5 rounded-lg bg-black/30">
              <p className="text-gray-400 mb-4">You haven't submitted any projects yet.</p>
              <Button variant="primary" size="sm" onClick={() => window.location.href = '/submit'}>
                Submit Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mySubmissions.map((submission) => (
                <div 
                  key={submission.id} 
                  className="glass-panel p-6 rounded-lg border border-white/10 hover:border-neon-blue/50 transition-all cursor-pointer group hover:shadow-lg hover:shadow-neon-blue/20"
                  onClick={() => window.location.href = `/project/${submission.id}`}
                >
                  {/* Media Preview */}
                  {submission.media_url && (
                    <div className="relative w-full h-40 rounded mb-4 overflow-hidden bg-black/40">
                      <img 
                        src={submission.media_url} 
                        alt={submission.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-neon-blue transition-colors flex-1 break-words">
                        {submission.title}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
                        submission.ownership_status === 'verified' 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {submission.ownership_status === 'verified' ? '✓ Verified' : '⏳ Pending'}
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm">
                      {submission.category}
                    </p>

                    <p className="text-gray-300 text-sm line-clamp-2 break-words">
                      {submission.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-gray-500">
                      <span>👍 {submission.total_votes || 0}</span>
                      <span>💬 {submission.comments_count || 0}</span>
                      <span>🔄 {submission.reposts_count || 0}</span>
                    </div>

                    <p className="text-xs text-gray-600">
                      {submission.created_at}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "admin" && user?.role === 'admin' && (
        <AdminNewsManager />
      )}

    </div>
  );
}