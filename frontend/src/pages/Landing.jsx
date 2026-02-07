import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import ChatModal from "../components/ChatModal";
import ProjectCard from "../components/ProjectCard";
import ProjectMiniCard from "../components/ProjectMiniCard";
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
      "All Categories", "Machine Learning", "Web Development", "Blockchain / Web3",
      "Cybersecurity", "Mobile Apps", "AI / Data Science", "Other"
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
      if (level >= 10) return { name: "SPECIALIST", color: "bg-neon-green shadow-[0_0_15px_rgba(34,197,94,0.4)]" };
      return { name: "INITIATE", color: "bg-slate-600" };
   };

   const getSubjectTier = (xp) => {
      // No color changes needed here, handled by Tailwind config
      if (xp >= 200) return { name: "MASTER SAGE" };
      if (xp >= 50) return { name: "ARCHITECT" };
      return { name: "BUILDER" };
   };

   const currentRank = data.featuredUser ? getRank(data.featuredUser.level ?? 1) : null;
   const subjectTier = data.featuredUser ? getSubjectTier(data.featuredUser.subject_xp ?? 0) : null;
   const focusSector = data.featuredUser?.focus_sector || "Generalist";

   const filteredWork = categoryFilter === "All Categories"
      ? data.latest
      : data.latest.filter(p => p.category === categoryFilter);

   if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-gaming-bg">
         <div className="relative">
            <div className="w-20 h-20 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center font-mono text-neon-blue text-xs animate-pulse">LOADING</div>
         </div>
      </div>
   );

   return (
      <div className="min-h-screen bg-gaming-bg text-white pt-24 pb-20 relative overflow-hidden">

         {/* AMBIENT BACKGROUND EFFECTS */}
         <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/10 blur-[150px] rounded-full animate-float"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-blue/10 blur-[150px] rounded-full animate-float" style={{ animationDelay: '-3s' }}></div>
            <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-neon-green/5 blur-[120px] rounded-full animate-pulse-slow"></div>
         </div>

         {/* FLOATING PARTICLES (CSS only) */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping"></div>
            <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-neon-blue rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-neon-purple rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
         </div>

         <div className="max-w-7xl mx-auto px-6 relative z-10">

            {/* HERO HEADER */}
            {data.featuredUser && (
               <div className="relative mb-32 group animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <div className="glass-panel p-8 md:p-12 border-glass-stroke shadow-[0_0_100px_rgba(0,240,255,0.1)] relative overflow-hidden">

                     {/* Decorative Lines */}
                     <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent"></div>
                     <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-purple/50 to-transparent"></div>

                     <div className="flex flex-col md:flex-row items-center md:items-start gap-12 relative z-10">

                        {/* AVATAR SECTION */}
                        <div className="relative shrink-0 group/avatar">
                           <div className="w-40 h-40 md:w-56 md:h-56 rounded-[3rem] bg-gradient-to-br from-slate-800 to-black p-1 shadow-[0_0_40px_rgba(0,240,255,0.2)] transition-all duration-500 group-hover/avatar:scale-105 group-hover/avatar:shadow-neon-blue/40 relative z-10">
                              <div className="w-full h-full rounded-[2.8rem] bg-gaming-bg flex items-center justify-center text-7xl font-black text-white relative overflow-hidden">
                                 <span className="relative z-10">{data.featuredUser?.username?.charAt(0).toUpperCase() || "?"}</span>
                                 <div className="absolute inset-0 bg-gradient-to-t from-neon-blue/20 to-transparent opacity-50"></div>
                              </div>
                           </div>

                           {/* Rank Badge */}
                           <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-2xl ${currentRank?.color || 'bg-slate-600'} flex flex-col items-center justify-center text-white shadow-xl font-black text-[10px] border-4 border-gaming-bg rotate-6 group-hover/avatar:rotate-12 transition-transform z-20`}>
                              <span className="opacity-80 text-[8px] uppercase tracking-wider">LVL</span>
                              <span className="text-2xl leading-none">{data.featuredUser?.level ?? 1}</span>
                           </div>

                           {/* Glitch Effect Behind */}
                           <div className="absolute inset-0 bg-neon-purple/0 rounded-[3rem] blur-xl -z-10 transition-all group-hover/avatar:bg-neon-purple/30 group-hover/avatar:blur-2xl"></div>
                        </div>

                        {/* INFO SECTION */}
                        <div className="flex-1 text-center md:text-left pt-2">
                           <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                              <div className="inline-block px-3 py-1 rounded-full border border-neon-blue/30 bg-neon-blue/5 text-neon-blue text-[10px] font-mono uppercase tracking-widest shadow-neon-blue/50">
                                 Featured Architect
                              </div>
                              <div className={`px-3 py-1 rounded-full ${currentRank?.color || 'bg-gray-500'} text-white text-[10px] font-black uppercase tracking-widest shadow-lg`}>
                                 {currentRank?.name || "INITIATE"}
                              </div>
                           </div>

                           <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-2xl mb-6">
                              {data.featuredUser?.username || "Anonymous"}
                           </h2>

                           <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 font-medium leading-relaxed border-l-2 border-neon-blue/30 pl-6 italic">
                              "{data.featuredUser?.bio || "No bio available."}"
                           </p>

                           {/* ACTION BUTTONS */}
                           {user?.id !== data.featuredUser.id ? (
                              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                 <Link to={`/profile/${data.featuredUser.id}`}>
                                    <Button variant="primary" size="lg" icon="⚡">
                                       Connect Profile
                                    </Button>
                                 </Link>
                                 <Button
                                    variant="glass"
                                    size="lg"
                                    icon="💬"
                                    onClick={() => setChatOpen(true)}
                                 >
                                    Message
                                 </Button>
                              </div>
                           ) : (
                              <div className="flex items-center gap-4 p-4 bg-neon-blue/5 border border-neon-blue/20 rounded-2xl inline-flex backdrop-blur-sm">
                                 <span className="text-2xl animate-pulse">💠</span>
                                 <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neon-blue">Dashboard Preview</p>
                                    <p className="text-xs font-mono text-gray-400">Viewing your own public spotlight.</p>
                                 </div>
                              </div>
                           )}
                        </div>

                        {/* STATS COLUMN */}
                        <div className="hidden lg:flex flex-col gap-8 justify-center min-w-[200px] border-l border-white/5 pl-12">
                           <StatItem label="Focus Sector" value={focusSector} color="text-white" isText />
                           <StatItem label={`${focusSector} XP`} value={data.featuredUser?.subject_xp ?? 0} color="text-neon-blue" />
                           <StatItem label="Global Trust" value={data.featuredUser?.xp ?? 0} color="text-neon-gold" />
                        </div>

                     </div>

                     {/* Background Grid */}
                     <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>
                  </div>
               </div>
            )}

            {/* TRENDING SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
               <TrendingColumn title="Most Upvoted" icon="⚡" color="neon-gold" data={data.topVoted} />
               <TrendingColumn title="Most Discussed" icon="💬" color="neon-blue" data={data.topCommented} />
               <TrendingColumn title="Top Reposts" icon="🔁" color="neon-purple" data={data.topReposted} />
            </div>

            {/* DISCOVERY SECTION */}
            <div className="relative">
               <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 border-b border-white/5 pb-8">
                  <div>
                     <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Discovery Feed</h3>
                     <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-gray-500">
                        <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></span>
                        Live Network Activity
                     </div>
                  </div>

                  <div className="flex items-center gap-4 bg-glass-light p-1.5 rounded-xl border border-white/5">
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3">Sector Filter</span>
                     <select
                        className="bg-black/40 hover:bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-xs font-mono uppercase text-white focus:outline-none focus:border-neon-blue/50 cursor-pointer transition-colors"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                     >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {filteredWork.length > 0 ? filteredWork.map(project => (
                     <ProjectCard key={project.id} project={project} />
                  )) : (
                     <div className="col-span-full py-32 text-center glass-panel border-dashed border-white/10 opacity-60">
                        <p className="text-4xl mb-4">📡</p>
                        <p className="text-xl font-black uppercase tracking-widest text-gray-500">No Signals Detected</p>
                        <p className="text-sm font-mono text-gray-600 mt-2">Try adjusting your sector filter.</p>
                     </div>
                  )}
               </div>

               {/* LOAD MORE */}
               <div className="mt-20 text-center">
                  <Link to="/community">
                     <Button variant="outline" size="lg" className="rounded-full px-12">
                        View Global Nexus
                     </Button>
                  </Link>
               </div>

               {/* LEADERBOARD SECTION */}
               <div className="mt-40">
                  <div className="text-center mb-16 relative">
                     <h3 className="text-5xl md:text-8xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent opacity-20 absolute top-[-50%] left-0 right-0 pointer-events-none">
                        LEADERBOARD
                     </h3>
                     <h3 className="text-3xl md:text-5xl font-black tracking-tight relative z-10">Consensus Rankings</h3>
                     <p className="text-neon-blue font-mono uppercase tracking-widest text-xs mt-4">Top Contributors by Trust Score</p>
                  </div>

                  <div className="glass-panel p-1 shadow-2xl border-white/5 rounded-3xl overflow-hidden">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="border-b border-white/5 bg-white/[0.02]">
                              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500 w-24 text-center">Rank</th>
                              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Architect</th>
                              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Trust Score</th>
                           </tr>
                        </thead>
                        <tbody>
                           {data.leaderboard.map((u, idx) => (
                              <tr key={idx} className="group hover:bg-white/[0.03] transition-colors border-b border-white/5 last:border-0 relative">
                                 <td className="p-6 text-center">
                                    <span className={`font-mono text-xl font-bold ${idx < 3 ? 'text-neon-gold drop-shadow-neon' : 'text-gray-600'}`}>
                                       {(idx + 1).toString().padStart(2, '0')}
                                    </span>
                                 </td>
                                 <td className="p-6">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-lg font-black group-hover:border-neon-blue/50 transition-colors">
                                          {u.username?.charAt(0).toUpperCase() || "?"}
                                       </div>
                                       <div>
                                          <div className="flex items-center gap-3">
                                             <span className="font-bold text-lg text-white group-hover:text-neon-blue transition-colors">{u.username || "Anonymous"}</span>
                                             <span className={`px-2 py-0.5 rounded text-[8px] font-black ${getRank(u.level ?? 1).color.split(' ')[0]} text-white/90`}>
                                                {getRank(u.level ?? 1).name}
                                             </span>
                                          </div>
                                          <span className="text-[10px] font-mono text-gray-500 uppercase">Level {u.level ?? 1}</span>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="p-6 text-right">
                                    <span className="font-mono text-2xl font-bold text-white tracking-tighter">{(u.xp ?? 0).toLocaleString()}</span>
                                    <span className="text-[10px] text-gray-600 ml-2 uppercase">XP</span>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* FINAL CTA */}
               <div className="mt-40 mb-20 text-center relative max-w-4xl mx-auto">
                  <div className="absolute inset-0 bg-neon-purple/20 blur-[100px] rounded-full pointer-events-none"></div>
                  <div className="glass-panel p-16 md:p-24 border-white/10 relative overflow-hidden group rounded-[3rem]">
                     <div className="relative z-10">
                        <h3 className="text-4xl md:text-6xl font-black tracking-tight mb-8">Ready to Deploy?</h3>
                        <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                           Join {data.stats.totalDevelopers}+ architects in the most trusted decentralized contribution network.
                        </p>
                        <Link to="/submit">
                           <Button variant="primary" size="lg" className="rounded-full px-16 py-6 text-lg shadow-neon-blue">
                              Initiate Sequence 🚀
                           </Button>
                        </Link>
                     </div>

                     {/* Background Grid Animation */}
                     <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 group-hover:scale-110 transition-transform duration-[3s]"></div>
                  </div>
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

function StatItem({ label, value, color = "text-white", isText = false }) {
   return (
      <div className="text-left group/stat">
         <p className="text-gray-500 uppercase font-mono font-bold text-[10px] tracking-widest mb-1 group-hover/stat:text-neon-blue transition-colors">{label}</p>
         <p className={`text-3xl font-black ${color} tracking-tighter`}>
            {isText ? value : value.toLocaleString()}
         </p>
      </div>
   );
}

function TrendingColumn({ title, icon, color, data }) {
   return (
      <div className="flex flex-col gap-6">
         <div className="flex items-center gap-4 pb-4 border-b border-white/5">
            <span className={`text-2xl p-2 rounded-lg bg-${color}/10 border border-${color}/20`}>{icon}</span>
            <h3 className="font-bold uppercase tracking-widest text-sm text-gray-300">{title}</h3>
         </div>
         <div className="flex flex-col gap-4">
            {data.map(project => (
               <ProjectMiniCard key={project.id} project={project} icon={icon} color={color} />
            ))}
         </div>
      </div>
   );
}
