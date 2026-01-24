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

  const getSubjectTier = (xp) => {
    if (xp >= 200) return { name: "MASTER SAGE", color: "text-neon-purple", bg: "bg-neon-purple/10", border: "border-neon-purple/50" };
    if (xp >= 50) return { name: "ARCHITECT", color: "text-neon-blue", bg: "bg-neon-blue/10", border: "border-neon-blue/50" };
    return { name: "BUILDER", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/50" };
  };

  const subjectTier = profile ? getSubjectTier(profile.subject_xp ?? 0) : null;
  const focusSector = profile?.focus_sector || "Generalist";

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
      <div className="text-neon-blue animate-pulse text-xl">Loading Neural Link...</div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="glass-panel p-8 text-center text-gray-400">User not found.</div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-5xl mx-auto">
      
      {/* HEADER CARD */}
      <div className="glass-panel p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 to-neon-blue/5 pointer-events-none"></div>

        <div className="relative shrink-0">
          <div className="w-32 h-32 rounded-full bg-slate-900 border-4 border-white/10 shadow-neon-purple flex items-center justify-center text-4xl font-bold text-neon-purple relative z-10">
            {profile.username ? profile.username.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="absolute -inset-4 bg-neon-purple/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>

        <div className="flex-1 text-center md:text-left relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2">{profile.username}</h1>
          <p className="font-mono text-neon-blue mb-4 text-sm bg-black/30 inline-block px-3 py-1 rounded-md border border-white/5">
            {profile.wallet_address}
          </p>
          
          
           <div className="flex flex-wrap gap-3 justify-center md:justify-start items-center">
             {profile.developer_type && (
               <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/50 text-neon-purple text-xs font-black uppercase tracking-widest">
                 🚀 {profile.developer_type}
               </span>
             )}

             {subjectTier && (
               <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${subjectTier.bg} border ${subjectTier.border} ${subjectTier.color} text-xs font-black uppercase tracking-widest`}>
                 🛡️ {focusSector} {subjectTier.name}
               </span>
             )}
             
             {currentUser && currentUser.id !== profile.id && (
               <div className="flex gap-2">
                 <Button 
                   variant="primary" 
                   size="sm" 
                   className="h-8 rounded-full shadow-neon-blue font-black uppercase tracking-widest text-[9px] px-4"
                   onClick={() => setChatOpen(true)}
                 >
                    Get in touch
                 </Button>
               </div>
             )}
           </div>

           {/* SYNERGY MATCH POPUP */}
           {profile.match_report && (
             <div className="mt-6 flex items-center gap-4 bg-neon-blue/5 border border-neon-blue/20 rounded-2xl px-5 py-3 animate-in fade-in slide-in-from-top-2 duration-500 max-w-xs mx-auto md:mx-0 shadow-[0_0_20px_rgba(0,243,255,0.05)]">
               <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg className="w-10 h-10 -rotate-90">
                     <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/5" />
                     <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={113} strokeDashoffset={113 - (profile.match_report.synergy / 100) * 113} className="text-neon-blue" />
                  </svg>
                  <span className="absolute text-[8px] font-black">{profile.match_report.synergy}%</span>
               </div>
               <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Synergy Match Report</p>
                  <p className="text-[10px] font-black text-white uppercase tracking-tighter">{profile.match_report.message}</p>
               </div>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT: STATS & INFO */}
        <div className="md:col-span-1 flex flex-col gap-6">
           {/* STATS */}
            <div className="glass-panel p-6 border-white/5 relative overflow-hidden">
             {/* Morphing Background Tint */}
             <div className={`absolute inset-0 ${subjectTier?.bg || 'bg-white/5'} opacity-20 pointer-events-none`}></div>
             
             <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-6 border-b border-white/5 pb-2 relative z-10">Neural Stats</h3>
             <div className="space-y-5 relative z-10">
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Focus Sector</span>
                 <span className={`${subjectTier?.color || 'text-white'} font-black text-xs uppercase tracking-widest`}>{focusSector}</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Subject Mastery</span>
                 <span className={`${subjectTier?.color || 'text-white'} font-black text-xs uppercase tracking-widest`}>{subjectTier?.name || "BUILDER"}</span>
               </div>
               <div className="flex items-center justify-between pt-2 border-t border-white/5">
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Status level</span>
                 <span className="text-neon-gold font-black text-lg">🏆 {profile.level || 1}</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Global Trust XP</span>
                 <span className="text-neon-purple font-black text-lg">⭐ {profile.xp || 0}</span>
               </div>
             </div>
           </div>

           {/* RADAR CHART INTEGRATION */}
           <div className="glass-panel p-4 flex flex-col items-center border-white/5">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 mb-2">Capability Radar</p>
              <RadarChart data={radarData} size={220} />
           </div>

           {/* TECH STACK */}
           <div className="glass-panel p-6">
              <h4 className="text-lg font-bold text-gray-300 mb-4">🛠️ Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {profile.skills ? profile.skills.split(',').map(s => (
                  <span key={s} className="px-3 py-1 rounded bg-white/5 border border-white/10 text-neon-blue text-sm">
                    {s.trim()}
                  </span>
                )) : <span className="text-gray-500 italic">No skills listed.</span>}
              </div>
           </div>
        </div>

        {/* RIGHT: ABOUT & SUBMISSIONS */}
        <div className="md:col-span-2 flex flex-col gap-8">
          
          <div className="glass-panel p-8">
            <h4 className="text-lg font-bold text-gray-300 mb-4">📖 About</h4>
            <p className="text-gray-400 leading-relaxed text-lg">
              {profile.bio || "No bio added yet."}
            </p>
          </div>

          <div>
             <h3 className="text-2xl font-black text-white mb-6 pl-2 border-l-4 border-neon-blue uppercase tracking-tighter">
                {focusSector !== 'Generalist' ? `${focusSector} Protocols` : 'Verified Submissions'}
             </h3>
             
             {profile.submissions && profile.submissions.length > 0 ? (
               <div className="space-y-12">
                 {/* PRIMARY FOCUS WORK */}
                 <div className="grid gap-6">
                    {profile.submissions.filter(s => s.category === focusSector).map(sub => (
                      <SubmissionCard key={sub.id} submission={sub} onVote={() => {}} onRepost={() => {}} />
                    ))}
                 </div>

                 {/* SECONDARY OPERATIONS */}
                 {profile.submissions.some(s => s.category !== focusSector) && (
                   <div className="mt-12 pt-8 border-t border-white/5">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 mb-8">Secondary Operations</h4>
                      <div className="grid gap-6 opacity-60 hover:opacity-100 transition-opacity">
                        {profile.submissions.filter(s => s.category !== focusSector).map(sub => (
                          <SubmissionCard key={sub.id} submission={sub} onVote={() => {}} onRepost={() => {}} />
                        ))}
                      </div>
                   </div>
                 )}
               </div>
             ) : (
               <div className="glass-panel p-8 text-center text-gray-500 italic">
                 No active signals detected in this sector.
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
