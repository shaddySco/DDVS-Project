import { useEffect, useState } from "react";
import axios from "../lib/axios";
import SubmissionCard from "../components/SubmissionCard";

export default function Community() {
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("global");
  const [loading, setLoading] = useState(true);

  const [topCreators, setTopCreators] = useState([
    { id: 1, name: "Satoshi_V", level: 42, role: "Architect" },
    { id: 2, name: "CodeNinja", level: 38, role: "Dev" },
    { id: 3, name: "Web3Wizard", level: 35, role: "Auditor" },
  ]); // Mock data for sidebar

  const repostSubmission = async (id) => {
    try {
      await axios.post(`/submissions/${id}/repost`);
      setSubmissions((prev) =>
        prev.map((sub) => sub.id === id ? { ...sub, reposts_count: (sub.reposts_count ?? 0) + 1 } : sub)
      );
    } catch (err) {
      alert(err.response?.status === 409 ? "Already reposted!" : "Action failed");
    }
  };

  const voteSubmission = async (id) => {
    try {
      const res = await axios.post("/votes", { submission_id: id, type: "up" });
      setSubmissions((prev) =>
        prev.map((sub) => sub.id === id ? { ...sub, total_votes: res.data.total_votes, has_voted: true } : sub)
      );
    } catch (err) {
      alert(err.response?.status === 409 ? "Already voted!" : "Login to vote");
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLoading(true); 
      try {
        const res = await axios.get("/community", { 
          params: { type: activeTab, search } 
        });
        if (isMounted) {
          const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          setSubmissions(data);
        }
      } catch (err) {
        if (isMounted) setSubmissions([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [activeTab, search]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
      
      {/* HEADER SECTION - Hero style */}
      <div className="mb-12 relative overflow-hidden rounded-2xl p-8 md:p-12 border border-white/10 bg-slate-900/50">
         <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10"></div>
         {/* Animated dots or grid bg could go here */}
         <div className="relative z-10 text-center md:text-left">
           <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-400">
             Global <span className="text-neon-blue drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]">Nexus</span>
           </h1>
           <p className="text-lg text-gray-400 max-w-2xl">
             The central hub for verified decentralized intelligence. Discover, validate, and collaborate.
           </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT SIDEBAR - FILTERS */}
        <div className="hidden lg:block lg:col-span-1 space-y-6">
           <div className="glass-panel p-6 sticky top-28">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
               <span>📡</span> Frequency
             </h3>
             <div className="flex flex-col gap-2">
               <button 
                 onClick={() => setActiveTab("global")}
                 className={`text-left px-4 py-3 rounded-lg transition-all border ${activeTab === 'global' ? 'bg-neon-blue/10 border-neon-blue/50 text-neon-blue' : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'}`}
               >
                 🌐 Global Feed
               </button>
               <button 
                 onClick={() => setActiveTab("following")}
                 className={`text-left px-4 py-3 rounded-lg transition-all border ${activeTab === 'following' ? 'bg-neon-purple/10 border-neon-purple/50 text-neon-purple' : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'}`}
               >
                 👥 Following
               </button>
             </div>

             <div className="mt-8">
               <h3 className="text-lg font-bold text-white mb-4">🏆 Top Agents</h3>
               <div className="space-y-3">
                 {topCreators.map(user => (
                   <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                     <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-gray-400 border border-white/10">
                       {user.name[0]}
                     </div>
                     <div className="flex-1">
                       <div className="text-sm font-bold text-gray-300">{user.name}</div>
                       <div className="text-xs text-neon-gold">LVL {user.level}</div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           </div>
        </div>

        {/* MAIN FEED */}
        <div className="lg:col-span-3">
           {/* MOBILE SEARCH & TABS */}
           <div className="lg:hidden mb-6 space-y-4">
             <input
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab("global")} 
                  className={`flex-1 py-2 rounded border ${activeTab === 'global' ? 'border-neon-blue text-neon-blue' : 'border-white/10 text-gray-400'}`}
                >Global</button>
                <button 
                  onClick={() => setActiveTab("following")}
                  className={`flex-1 py-2 rounded border ${activeTab === 'following' ? 'border-neon-purple text-neon-purple' : 'border-white/10 text-gray-400'}`}
                >Following</button>
              </div>
           </div>

           {/* DESKTOP SEARCH BAR */}
           <div className="hidden lg:block mb-8">
             <div className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
               <div className="relative">
                 <input
                   className="w-full bg-slate-900 border border-white/10 rounded-lg px-6 py-4 pl-12 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-lg"
                   placeholder="Search the nexus for projects..."
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">🔍</span>
               </div>
             </div>
           </div>

           {/* FEED LIST */}
           <div className="space-y-8">
             {loading ? (
               <div className="h-64 flex flex-col items-center justify-center gap-4 text-neon-blue animate-pulse">
                 <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
                 <div>Accessing Neural Network...</div>
               </div>
             ) : submissions.length === 0 ? (
               <div className="glass-panel p-16 text-center">
                 <div className="text-6xl mb-6 opacity-20">📡</div>
                 <h3 className="text-2xl font-bold text-white mb-2">No Signals Detected</h3>
                 <p className="text-gray-400">The feed is silent. Be the first to initiate a transmission.</p>
               </div>
             ) : (
               submissions.map((sub) => (
                 <SubmissionCard 
                   key={sub.id} 
                   submission={sub} 
                   onVote={voteSubmission} 
                   onRepost={repostSubmission}
                 />
               ))
             )}
           </div>
        </div>

      </div>
    </div>
  );
}