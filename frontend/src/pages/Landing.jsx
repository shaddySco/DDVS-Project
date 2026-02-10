import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import ChatModal from "../components/ChatModal";
import ProjectCard from "../components/ProjectCard";
import ProjectMiniCard from "../components/ProjectMiniCard";
import NewsSection from "../components/NewsSection";
import { useAuth } from "../context/AuthContext";
import { getRankByXp, RANKS } from "../utils/ranks";

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
   const [searchQuery, setSearchQuery] = useState("");

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

   const focusSector = data.featuredUser?.focus_sector || "Generalist";
   const featuredRank = data.featuredUser ? getRankByXp(data.featuredUser.xp || 0) : RANKS[0];

   const filteredWork = data.latest.filter(p => {
      const matchesCategory = categoryFilter === "All Categories" || p.category === categoryFilter;
      const matchesSearch = (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
         (p.author_name || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
   });

   if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C]">
         <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
   );

   return (
      <div className="min-h-screen bg-[#0A0F1C] text-white pt-24 pb-20 relative overflow-hidden">

         {/* AMBIENT BACKGROUND EFFECTS */}
         <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#4F46E5]/10 blur-[150px] rounded-full animate-float"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#06B6D4]/10 blur-[150px] rounded-full animate-float" style={{ animationDelay: '-3s' }}></div>
         </div>

         <div className="max-w-7xl mx-auto px-6 relative z-10">

            {/* HERO HEADER */}
            {data.featuredUser && (
               <div className="relative mb-24 group animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <div className="glass-panel p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden rounded-[2rem]">

                     <div className="flex flex-col md:flex-row items-center md:items-start gap-12 relative z-10">

                        {/* AVATAR SECTION */}
                        <div className="relative shrink-0 group/avatar">
                           <div className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-slate-900 border-4 border-white/10 shadow-xl flex items-center justify-center text-7xl font-bold text-white overflow-hidden relative z-10">
                              <span className="relative z-10">{data.featuredUser?.username?.charAt(0).toUpperCase() || "?"}</span>
                           </div>

                           {/* Rank Badge */}
                           <div className={`absolute -top-2 -right-2 w-14 h-14 rounded-full ${featuredRank.bg} flex flex-col items-center justify-center text-white shadow-lg font-bold text-[10px] border-4 border-[#0A0F1C] z-20`}>
                              <span className="text-2xl">{featuredRank.icon}</span>
                           </div>
                        </div>

                        {/* INFO SECTION */}
                        <div className="flex-1 text-center md:text-left pt-2">
                           <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                              <div className="inline-block px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/5 text-yellow-500 text-[10px] font-bold uppercase tracking-widest shadow-sm flex items-center gap-2">
                                 <span>🏆</span> Global Top Contributor
                              </div>
                              <div className={`px-3 py-1 rounded-full ${featuredRank.bg} text-white text-[10px] font-bold uppercase tracking-widest shadow-sm border ${featuredRank.border}`}>
                                 {featuredRank.name}
                              </div>
                           </div>

                           <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-6">
                              {data.featuredUser?.username || "Anonymous"}
                           </h2>

                           <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 font-medium leading-relaxed border-l-2 border-white/10 pl-6 italic">
                              "{data.featuredUser?.bio || "No bio available."}"
                           </p>

                           {/* ACTION BUTTONS */}
                           {user?.id !== data.featuredUser.id ? (
                              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                 <Link to={`/profile/${data.featuredUser.id}`}>
                                    <Button variant="primary" size="lg">
                                       View Profile
                                    </Button>
                                 </Link>
                                 <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => setChatOpen(true)}
                                 >
                                    Message
                                 </Button>
                              </div>
                           ) : (
                              <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl inline-flex backdrop-blur-sm">
                                 <span className="text-xl">✨</span>
                                 <div className="text-left">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white">Your Profile</p>
                                    <p className="text-xs text-gray-400">You are currently featured globally.</p>
                                 </div>
                              </div>
                           )}
                        </div>

                        {/* STATS COLUMN */}
                        <div className="hidden lg:flex flex-col gap-8 justify-center min-w-[200px] border-l border-white/5 pl-12">
                           <StatItem label="Focus Sector" value={focusSector} color="text-white" isText />
                           <StatItem label="Projects" value={data.featuredUser?.submissions?.length || 0} color="text-white" />
                           <StatItem label="Reputation" value={data.featuredUser?.xp ?? 0} color="text-yellow-500" />
                        </div>

                     </div>
                  </div>
               </div>
            )}

            {/* ABOUT DDVS SECTION */}
            <div className="mb-32">
               <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">What is DDVS?</h2>
                  <p className="text-gray-400 text-lg leading-relaxed">
                     The <span className="text-white font-bold">Decentralized Developer Verification System</span> is a professional platform designed to validate skills through peer review and consensus.
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FeatureCard
                     icon="🔐"
                     title="Immutable Verification"
                     description="Every project submission is recorded on-chain, ensuring your portfolio remains tamper-proof and permanently accessible."
                  />
                  <FeatureCard
                     icon="👥"
                     title="Community Consensus"
                     description="Skill validation comes from the community, not a central authority. Earn trust by reviewing code and contributing value."
                  />
                  <FeatureCard
                     icon="⭐"
                     title="Merit-Based Reputation"
                     description="Your 'Trust Score' is built purely on contribution quality. No pay-to-win. Just pure, verifiable engineering impact."
                  />
               </div>
            </div>

            {/* SYSTEM LEVELS EXPLANATION */}
            <div className="mb-32">
               <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Developer Ranks</h2>
                  <p className="text-gray-400 text-lg">
                     Ascend the protocol hierarchy by earning XP through verified contributions.
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {RANKS.map((rank) => (
                     <div key={rank.name} className={`glass-panel p-6 border ${rank.border} bg-opacity-5 hover:scale-105 transition-transform duration-300 relative overflow-hidden group`}>
                        <div className={`absolute top-0 left-0 w-full h-1 ${rank.bg}`}></div>
                        <div className="text-4xl mb-4 text-center">{rank.icon}</div>
                        <h3 className={`text-sm font-bold text-center mb-1 ${rank.color}`}>{rank.name}</h3>
                        <p className="text-center text-[10px] font-mono text-gray-500 mb-3">{rank.minXp}+ XP</p>
                        <p className="text-center text-[10px] text-gray-400 leading-tight">
                           {rank.desc}
                        </p>
                     </div>
                  ))}
               </div>
            </div>

            {/* NEWS & UPDATES */}
            <NewsSection />

            {/* GLOBAL NEXUS (LIVE FEED) */}
            <div className="mb-32">
               <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 border-b border-white/5 pb-8">
                  <div>
                     <h3 className="text-2xl font-bold text-white mb-2">Global Nexus</h3>
                     <p className="text-sm text-gray-500">Live Network Feed - Discover all available projects.</p>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap justify-end">
                     {/* Search Input */}
                     <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <span className="text-gray-500 text-xs">🔍</span>
                        </div>
                        <input
                           type="text"
                           placeholder="Search projects..."
                           className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg pl-8 pr-4 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-neon-blue transition-all w-48"
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                        />
                     </div>

                     <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filter</span>
                        <select
                           className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-xs font-bold text-white focus:outline-none cursor-pointer transition-colors"
                           value={categoryFilter}
                           onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                           {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredWork.length > 0 ? filteredWork.map(project => (
                     <ProjectCard key={project.id} project={project} />
                  )) : (
                     <div className="col-span-full py-20 text-center glass-panel border border-dashed border-white/10">
                        <p className="text-4xl mb-4 text-gray-600">📭</p>
                        <p className="text-lg font-bold text-gray-500">No projects found matching your criteria.</p>
                     </div>
                  )}
               </div>

               <div className="mt-12 text-center">
                  <Link to="/community">
                     <Button variant="outline" size="lg" className="rounded-full px-8">
                        View All Projects →
                     </Button>
                  </Link>
               </div>
            </div>

            {/* LEADERBOARD SECTION */}
            <div className="mb-32">
               <div className="text-center mb-16">
                  <h3 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Top 10 Contributors</h3>
                  <p className="text-gray-400">Recognizing the most impactful developers in the network.</p>
               </div>

               <div className="glass-panel border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                           <th className="p-6 text-xs font-bold uppercase tracking-wider text-gray-500 w-24 text-center">Rank</th>
                           <th className="p-6 text-xs font-bold uppercase tracking-wider text-gray-500">Developer</th>
                           <th className="p-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Reputation</th>
                        </tr>
                     </thead>
                     <tbody>
                        {data.leaderboard.map((u, idx) => (
                           <tr key={idx} className="group hover:bg-white/[0.03] transition-colors border-b border-white/5 last:border-0">
                              <td className="p-6 text-center">
                                 <span className={`font-mono text-xl font-bold ${idx < 3 ? 'text-yellow-500' : 'text-gray-500'}`}>
                                    {(idx + 1).toString().padStart(2, '0')}
                                 </span>
                              </td>
                              <td className="p-6">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                                       {u.username?.charAt(0).toUpperCase() || "?"}
                                    </div>
                                    <div>
                                       <div className="flex items-center gap-3">
                                          <Link to={`/profile/${u.id}`} className="font-bold text-white hover:text-blue-400 font-bold transition-colors">
                                             {u.username || "Anonymous"}
                                          </Link>
                                          {idx < 3 && <span className="text-xs">🏆</span>}
                                       </div>
                                       <span className={`text-xs ${getRankByXp(u.xp ?? 0).color}`}>{getRankByXp(u.xp ?? 0).name}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="p-6 text-right">
                                 <span className="font-mono text-xl font-bold text-white">{(u.xp ?? 0).toLocaleString()}</span>
                                 <span className="text-xs text-gray-600 ml-2">XP</span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* FINAL CTA */}
            <div className="text-center mb-20">
               <div className="glass-panel p-16 md:p-20 border border-white/10 rounded-[3rem] relative overflow-hidden">
                  <div className="relative z-10">
                     <h3 className="text-4xl font-bold text-white mb-6">Start Building Your Reputation</h3>
                     <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
                        Join over {data.stats.totalDevelopers} developers showcasing their work on DDVS.
                     </p>
                     <Link to="/submit">
                        <Button variant="primary" size="lg" className="rounded-full px-12 py-4 text-lg">
                           Submit a Project
                        </Button>
                     </Link>
                  </div>
                  {/* Subtle Grid Background */}
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>
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
      <div className="text-left">
         <p className="text-gray-500 uppercase font-bold text-[10px] tracking-widest mb-1">{label}</p>
         <p className={`text-2xl font-bold ${color}`}>
            {isText ? value : value.toLocaleString()}
         </p>
      </div>
   );
}

function FeatureCard({ icon, title, description }) {
   return (
      <div className="glass-panel p-8 border border-white/5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
         <div className="text-4xl mb-6">{icon}</div>
         <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
         <p className="text-gray-400 leading-relaxed text-sm">
            {description}
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
