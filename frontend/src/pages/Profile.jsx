import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../lib/axios";
import SubmissionCard from "../components/SubmissionCard";
import ChatModal from "../components/ChatModal";
import Button from "../components/ui/Button";
import RadarChart from "../components/RadarChart";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/users/${id}`);
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  // Mock radar data if not provided by backend
  const radarData = {
    Security: profile?.focus_sector === 'Cybersecurity' ? 95 : 60,
    Innovation: 75,
    Scalability: profile?.focus_sector === 'Blockchain' ? 90 : 70,
    UI_UX: profile?.focus_sector === 'Web Development' ? 85 : 55,
    Consistency: 80
  };

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-white/20 border-t-neon-blue rounded-full animate-spin"></div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
        <p className="text-gray-400">The requested profile does not exist.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-5xl mx-auto">

      {/* HEADER PROFILE */}
      <div className="mb-12 flex flex-col md:flex-row items-start gap-8 border-b border-white/10 pb-12">
        <div className="relative shrink-0">
          <div className="w-40 h-40 rounded-full bg-slate-800 border-4 border-[#0F172A] shadow-xl flex items-center justify-center text-5xl font-bold text-white relative z-10 overflow-hidden">
            {profile.username ? profile.username.charAt(0).toUpperCase() : "U"}
          </div>
        </div>

        <div className="flex-1 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  {profile.username || "Anonymous User"}
                </h1>
                <div className="flex gap-1">
                  <span title="Top Contributor" className="text-xl">🏆</span>
                  <span title="Verified Expert" className="text-xl">⭐</span>
                  <span title="Protocol Guardian" className="text-xl">🛡️</span>
                </div>
              </div>
              <p className="text-gray-400 font-medium text-lg">
                {profile.developer_type || "Developer"}
              </p>
            </div>

            {currentUser && currentUser.id !== profile.id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChatOpen(true)}
              >
                Contact Developer
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 font-mono mb-6">
            <span className="bg-white/5 px-3 py-1 rounded">
              {(profile.wallet_address || "").substring(0, 6)}...{(profile.wallet_address || "").substring(38)}
            </span>
            <span>•</span>
            <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
          </div>

          {/* Impact Stats (6 Sections Grid) - Match Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 border-t border-white/5 pt-6">
            <div>
              <div className="text-xl font-bold text-white">{profile.xp || 0}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Reputation</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">Lvl {profile.level || 1}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Growth</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">{profile.submissions?.length || 0}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Projects</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">{profile.followers_count || 0}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Followers</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">{profile.following_count || 0}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Following</div>
            </div>
            <div>
              <div className="text-xl font-bold text-neon-blue">{profile.role === 'admin' ? 'S-Rank' : 'A-Rank'}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Tier</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* LEFT: STATS & INFO */}
        <div className="md:col-span-1 flex flex-col gap-12">

          {/* RADAR CHART INTEGRATION */}
          <div className="glass-panel p-6 flex flex-col items-center border border-white/5 bg-[#0F172A]/50">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 w-full text-left">Skill Matrix</h4>
            <RadarChart data={radarData} size={220} />
          </div>

          {/* TECH STACK */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {profile.skills ? profile.skills.split(',').map(s => (
                <span key={s} className="px-3 py-1 rounded bg-white/5 border border-white/10 text-gray-300 text-sm font-medium">
                  {s.trim()}
                </span>
              )) : <span className="text-gray-500 italic text-sm">No skills listed.</span>}
            </div>
          </div>
        </div>

        {/* RIGHT: ABOUT & SUBMISSIONS */}
        <div className="md:col-span-2 flex flex-col gap-10">

          <div>
            <h3 className="text-xl font-bold text-white mb-4">About</h3>
            <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
              {profile.bio || "No bio added yet."}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/5 pb-2">
              Verified Projects
            </h3>

            {profile.submissions && profile.submissions.length > 0 ? (
              <div className="space-y-6">
                {profile.submissions.map(sub => (
                  <SubmissionCard key={sub.id} submission={sub} onVote={() => { }} onRepost={() => { }} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 italic bg-white/5 rounded-xl border border-white/5">
                No projects published yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <ChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        recipientId={profile.id}
        recipientName={profile.username}
      />
    </div>
  );
}
