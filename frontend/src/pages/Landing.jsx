import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import ChatModal from "../components/ChatModal";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { user } = useAuth();
  const [data, setData] = useState({
    stats: { totalDevelopers: 0, totalSubmissions: 0, totalVotes: 0 },
    leaderboard: [],
    latest: [],
    topVoted: [],
    topCommented: [],
    topReposted: [],
    featuredUser: null
  });
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  const categories = [
    "All Categories",
    "Machine Learning",
    "Web Development",
    "Blockchain / Web3",
    "Cybersecurity",
    "Mobile Apps",
    "AI / Data Science",
    "Other"
  ];

  useEffect(() => {
    axios.get("/landing")
      .then(res => setData(res.data))
      .catch(err => console.error("Landing error:", err))
      .finally(() => setLoading(false));
  }, []);
  const getRank = (level) => {
    if (level >= 200) return { name: "ORACLE", color: "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]" };
    if (level >= 100) return { name: "OVERSEER", color: "bg-neon-purple shadow-[0_0_15px_rgba(188,19,254,0.4)]" };
    if (level >= 60) return { name: "ARCHITECT", color: "bg-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.4)]" };
    if (level >= 30) return { name: "VANGUARD", color: "bg-neon-gold shadow-[0_0_15px_rgba(255,182,0,0.4)] shadow-neon-gold" };
    if (level >= 10) return { name: "SPECIALIST", color: "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]" };
    return { name: "INITIATE", color: "bg-gray-500" };
  };

  const getSubjectTier = (xp) => {
    if (xp >= 200) return { name: "MASTER SAGE", color: "text-neon-purple", bg: "bg-neon-purple/10", border: "border-neon-purple/50" };
    if (xp >= 50) return { name: "ARCHITECT", color: "text-neon-blue", bg: "bg-neon-blue/10", border: "border-neon-blue/50" };
    return { name: "BUILDER", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/50" };
  };

  const currentRank = data.featuredUser ? getRank(data.featuredUser.level ?? 1) : null;
  const subjectTier = data.featuredUser ? getSubjectTier(data.featuredUser.subject_xp ?? 0) : null;
  const focusSector = data.featuredUser?.focus_sector || "Generalist";

  const filteredWork = categoryFilter === "All Categories" 
    ? data.latest 
    : data.latest.filter(p => p.category === categoryFilter);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A]">
      <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white pt-24 pb-20 relative overflow-hidden">
      
      {/* BACKGROUND BLOBS */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-neon-purple/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-neon-blue/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* MARQUEE SECTOR - What is DDVS? */}
      <div className="w-full bg-white/5 border-y border-white/5 py-4 mb-20 overflow-hidden relative group">
        <div className="flex whitespace-nowrap animate-marquee group-hover:pause">
           {[...Array(10)].map((_, i) => (
             <div key={i} className="flex items-center gap-12 mx-10">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-neon-blue"></div>
                   <span className="text-[11px] font-black tracking-[0.4em] text-white uppercase">DDVS PROTOCOL</span>
                </div>
                <span className="text-[11px] font-black tracking-[0.4em] text-gray-500 uppercase">DECENTRALIZED VERIFIED CONTRIBUTION NETWORK</span>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-neon-purple"></div>
                   <span className="text-[11px] font-black tracking-[0.4em] text-white uppercase">PROVE SKILLS ON-CHAIN</span>
                </div>
                <span className="text-[11px] font-black tracking-[0.4em] text-gray-500 uppercase">COMMUNITY DRIVEN REPUTATION</span>
             </div>
           ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* HERO / FEATURED ARCHITECT */}
        {data.featuredUser && (
          <div className="relative mb-24 group">
             <div className="glass-panel p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-12 border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.4)] relative">
               
               {/* Large Rounded Avatar Area */}
               <div className="relative shrink-0">
                  <div className="w-48 h-48 md:w-64 md:h-64 rounded-[4rem] bg-gradient-to-br from-gray-700 to-black p-1.5 shadow-[0_0_50px_rgba(0,243,255,0.1)] group-hover:shadow-neon-blue/20 transition-all duration-700 overflow-hidden">
                    <div className="w-full h-full rounded-[3.8rem] bg-[#0F172A] flex items-center justify-center text-8xl font-black text-white relative">
                       {data.featuredUser?.username?.charAt(0).toUpperCase() || "?"}
                       <div className="absolute inset-0 bg-gradient-to-t from-neon-blue/20 to-transparent"></div>
                    </div>
                  </div>
                  {/* Badge syncing with rank data */}
                  <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${currentRank?.color || 'bg-gray-500'} flex flex-col items-center justify-center text-white shadow-2xl font-black text-[10px] border-[6px] border-[#0B0F1A] rotate-12 transition-transform group-hover:rotate-0`}>
                     <span className="opacity-70">LVL</span>
                     <span className="text-2xl leading-none">{data.featuredUser?.level ?? 1}</span>
                  </div>
               </div>

               {/* Bio and Info */}
               <div className="flex-1 text-center md:text-left pt-6">
                 <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-2xl">
                      {data.featuredUser?.username || "Anonymous"}
                    </h2>
                    <div className={`px-4 py-1.5 rounded-full ${currentRank?.color || 'bg-gray-500'} text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg`}>
                       {currentRank?.name || "INITIATE"}
                    </div>
                 </div>
                 <p className="text-gray-400 text-xl md:text-2xl max-w-2xl mb-10 font-medium leading-relaxed italic opacity-80">
                   "{data.featuredUser?.bio || "No bio available."}"
                 </p>
                 
                 {/* Only show buttons if NOT the logged-in user */}
                 {user?.id !== data.featuredUser.id ? (
                   <div className="flex flex-wrap gap-5 justify-center md:justify-start">
                      <Link to={`/profile/${data.featuredUser.id}`}>
                        <Button variant="primary" className="h-16 px-12 rounded-2xl shadow-neon-blue font-black uppercase tracking-widest text-xs">
                           Follow Architect
                        </Button>
                      </Link>
                      <Button 
                        variant="glass" 
                        className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-xs border-white/10 hover:bg-white/5"
                        onClick={() => setChatOpen(true)}
                      >
                         Get in touch
                      </Button>
                      
                      {/* Synergy Match Report */}
                      {data.featuredUser.match_report && (
                        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 animate-in fade-in slide-in-from-right-4 duration-700">
                           <div className="relative w-12 h-12 flex items-center justify-center">
                              <svg className="w-full h-full -rotate-90">
                                 <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                                 <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={125.6} strokeDashoffset={125.6 - (data.featuredUser.match_report.synergy / 100) * 125.6} className="text-neon-blue" />
                              </svg>
                              <span className="absolute text-[10px] font-black">{data.featuredUser.match_report.synergy}%</span>
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Synergy Match</p>
                              <p className="text-xs font-bold text-white uppercase">{data.featuredUser.match_report.message}</p>
                           </div>
                        </div>
                      )}
                   </div>
                 ) : (
                    <div className="flex items-center gap-3 p-4 bg-neon-blue/5 border border-neon-blue/20 rounded-2xl inline-flex shadow-[0_0_20px_rgba(0,243,255,0.05)]">
                       <span className="text-2xl">👤</span>
                       <div className="text-left">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neon-blue">Architect Dashboard</p>
                          <p className="text-xs font-bold text-gray-400">You are currently viewing your own profile spotlight</p>
                       </div>
                    </div>
                 )}
               </div>

                {/* Morphed Stats based on Focus Sector */}
                <div className="hidden lg:flex flex-col gap-10 justify-center min-w-[220px]">
                  <div className="text-center md:text-right group/morph">
                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${subjectTier?.color || 'text-gray-600'} transition-all group-hover/morph:scale-110`}>
                       {focusSector} Expertise
                    </p>
                    <p className="text-4xl font-black text-white tracking-tighter">
                       {subjectTier?.name || "BUILDER"}
                    </p>
                  </div>
                  <StatItem label={`${focusSector} XP`} value={data.featuredUser?.subject_xp ?? 0} color="text-neon-blue" />
                  <StatItem label="Global Trust XP" value={data.featuredUser?.xp ?? 0} color="text-neon-gold" />
               </div>

             </div>
          </div>
        )}

        {/* TOP CATEGORIES SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24 pt-10">
           {/* TOP VOTED */}
           <div className="space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[.4em] text-neon-gold flex items-center gap-4">
                 <span className="w-10 h-px bg-neon-gold/30"></span> MOST UPVOTED
              </h3>
              <div className="space-y-6">
                 {data.topVoted.map(project => (
                   <ProjectMiniCard key={project.id} project={project} icon="⚡" color="neon-gold" />
                 ))}
              </div>
           </div>
           {/* TOP COMMENTED */}
           <div className="space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[.4em] text-neon-blue flex items-center gap-4">
                 <span className="w-10 h-px bg-neon-blue/30"></span> MOST DISCUSSED
              </h3>
              <div className="space-y-6">
                 {data.topCommented.map(project => (
                   <ProjectMiniCard key={project.id} project={project} icon="💬" color="neon-blue" />
                 ))}
              </div>
           </div>
           {/* TOP REPOSTED */}
           <div className="space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[.4em] text-neon-purple flex items-center gap-4">
                 <span className="w-10 h-px bg-neon-purple/30"></span> TOP REPOSTS
              </h3>
              <div className="space-y-6">
                 {data.topReposted.map(project => (
                   <ProjectMiniCard key={project.id} project={project} icon="🔁" color="neon-purple" />
                 ))}
              </div>
           </div>
        </div>

         {/* DISCOVERY GRID */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
             <div className="flex items-center gap-10">
                <h3 className="text-xl font-black uppercase tracking-widest text-white">Discovery Feed</h3>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                   {data.stats.totalSubmissions} SIGNALS DETECTED
                </span>
             </div>
             <div className="hidden md:flex items-center gap-6">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Filter Sector</span>
                <select 
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-neon-blue/50 cursor-pointer shadow-xl"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                   {categories.map(c => <option key={c}>{c}</option>)}
                </select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredWork.length > 0 ? filteredWork.map(project => (
              <ProjectCard key={project.id} project={project} />
            )) : (
              <div className="col-span-full py-20 text-center glass-panel border-white/5 opacity-50">
                 <p className="text-xl font-black uppercase tracking-widest">No Signals in this sector</p>
              </div>
            )}
          </div>

          {/* LEADERBOARD TRANSITION */}
          <div className="mt-40">
             <div className="text-center mb-20">
                <h3 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-600">Leaderboard</h3>
                <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-[10px]">Ranked by Cryptographic Performance Consensus</p>
             </div>
             <div className="glass-panel p-2 shadow-2xl border-white/5 rounded-[2rem]">
                {data.leaderboard.map((u, idx) => (
                  <div key={idx} className="flex items-center justify-between p-8 hover:bg-white/5 transition-all group rounded-2xl border-b border-white/5 last:border-0 relative">
                     <div className="flex items-center gap-8">
                        <span className="font-mono text-3xl font-black text-gray-700 group-hover:text-neon-blue transition-colors w-12 text-center">{(idx + 1).toString().padStart(2, '0')}</span>
                        <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-white/10 flex items-center justify-center text-xl font-black group-hover:border-neon-blue group-hover:rotate-6 transition-all shadow-xl">
                           {u.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                           <div className="flex items-center gap-3 mb-1">
                              <p className="font-black text-2xl group-hover:text-neon-blue transition-colors tracking-tight">{u.username || "Anonymous"}</p>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black ${getRank(u.level ?? 1).color} text-white`}>{getRank(u.level ?? 1).name}</span>
                           </div>
                           <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none">NEXUS PROTOCOL STAGE {u.level ?? 1}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-4xl font-black text-white group-hover:text-neon-gold transition-colors tracking-tighter">{(u.xp ?? 0).toLocaleString()}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">TRUST XP</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* CTA at the bottom */}
          <div className="mt-40 text-center glass-panel p-20 border-white/5 relative overflow-hidden group rounded-[4rem]">
             <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <h3 className="text-4xl md:text-7xl font-black tracking-tighter mb-10 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 pb-2">Ready to showcase your progress?</h3>
             <p className="text-gray-400 text-2xl mb-14 max-w-3xl mx-auto font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                Join {data.stats.totalDevelopers}+ architects in the most trusted decentralized contribution network. Gain XP, climb the Nexus, and verify your legacy on the blockchain.
             </p>
             <Link to="/submit">
                <Button variant="primary" className="h-20 px-20 rounded-2xl shadow-neon-blue text-sm font-black uppercase tracking-[0.3em] hover:scale-105 transition-transform">
                   Start Your Deployment 🚀
                </Button>
             </Link>
          </div>

        </div>

      </div>

      <ChatModal 
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        recipientId={data.featuredUser?.id}
        recipientName={data.featuredUser?.username}
      />
    </div>
  );
}

function StatItem({ label, value, color = "text-white" }) {
   return (
    <div className="text-center md:text-right group/stat">
      <p className="text-gray-600 uppercase font-black text-[10px] tracking-[0.3em] mb-2 group-hover/stat:text-gray-400 transition-colors">{label}</p>
      <p className={`text-4xl font-black ${color} tracking-tighter group-hover/stat:scale-110 transition-transform origin-right`}>{value.toLocaleString()}</p>
    </div>
   );
}

function ProjectCard({ project }) {
   return (
      <Link to={`/project/${project.id}`} className="group/card block">
         <div className="flex flex-col">
            <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden bg-[#0A0E17] border border-white/5 group-hover/card:border-neon-blue/40 transition-all duration-700 shadow-2xl mb-8">
               {project.media_url ? (
                  <img src={project.media_url} alt={project.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl grayscale opacity-20">🛠️</div>
               )}
               <div className="absolute top-8 right-8 flex gap-3 z-20">
                  <div className="w-11 h-11 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-[10px] font-black text-neon-purple shadow-xl">UI</div>
                  <div className="w-11 h-11 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-[10px] font-black text-neon-blue shadow-xl">BR</div>
               </div>
               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-all duration-500 backdrop-blur-[2px] flex items-center justify-center gap-12 z-10">
                  <div className="flex flex-col items-center gap-2 -translate-y-4 group-hover/card:translate-y-0 transition-transform duration-500">
                     <span className="text-4xl drop-shadow-neon">⚡</span>
                     <span className="font-black text-sm text-neon-gold">{project.total_votes}</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 translate-y-4 group-hover/card:translate-y-0 transition-transform duration-500">
                     <span className="text-4xl">💬</span>
                     <span className="font-black text-sm text-white">{project.comments_count}</span>
                  </div>
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
            </div>
            <div className="flex items-center justify-between px-6">
               <div className="flex-1 min-w-0 pr-4">
                  <h4 className="font-black text-2xl tracking-tight text-white group-hover/card:text-neon-blue transition-colors mb-2 truncate">{project.title}</h4>
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{project.category}</span>
                     <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                     <span className="text-[10px] text-neon-purple font-black uppercase tracking-widest">{project.author_name}</span>
                  </div>
               </div>
               <div className="flex flex-col items-end opacity-50 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 text-[11px] font-black text-gray-300">
                     <span>👁️</span> {(project.id * 89) % 100}k
                  </div>
               </div>
            </div>
         </div>
      </Link>
   );
}

function ProjectMiniCard({ project, icon, color }) {
   const colorClass = color === 'neon-gold' ? 'text-neon-gold border-neon-gold/20 bg-neon-gold/5' : color === 'neon-blue' ? 'text-neon-blue border-neon-blue/20 bg-neon-blue/5' : 'text-neon-purple border-neon-purple/20 bg-neon-purple/5';
   
   return (
    <Link to={`/project/${project.id}`} className="block group/mini">
       <div className="glass-panel p-5 flex items-center gap-5 hover:border-white/20 transition-all group-hover/mini:-translate-y-1 bg-white/[0.02] border-white/5 shadow-xl">
          <div className="w-20 h-16 rounded-[1rem] overflow-hidden bg-gray-900 shrink-0 border border-white/5 relative">
             {project.media_url ? <img src={project.media_url} className="w-full h-full object-cover transition-transform group-hover/mini:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-xs opacity-20 font-black tracking-tighter">DATA</div>}
          </div>
          <div className="flex-1 min-w-0">
             <h4 className="text-base font-black text-white truncate group-hover/mini:text-neon-blue transition-colors mb-1">{project.title}</h4>
             <p className="text-[9px] text-gray-500 uppercase font-black tracking-[0.2em]">{project.author_name}</p>
          </div>
          <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border ${colorClass} transition-all group-hover/mini:scale-110 shadow-lg`}>
             <span className="text-lg leading-none mb-0.5">{icon}</span>
             <span className="font-black text-[10px] leading-none">
                {icon === '⚡' ? project.total_votes : icon === '💬' ? project.comments_count : project.reposts_count}
             </span>
          </div>
       </div>
    </Link>
   );
}

function Badge({ icon, title, color }) {
   return (
      <div className={`px-4 py-2 bg-black/40 border ${color} rounded-xl flex items-center gap-3 transition-transform hover:scale-105 cursor-default`}>
         <span className="text-lg">{icon}</span>
         <span className="text-[10px] font-black uppercase tracking-widest text-white">{title}</span>
      </div>
   );
}
