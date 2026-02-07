import { useEffect, useState } from "react";
import axios from "../lib/axios";
import SubmissionCard from "../components/SubmissionCard";
import { Link } from "react-router-dom";

export default function Community() {
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("global"); // 'global' or 'following'
  const [loading, setLoading] = useState(true);

  // Mock data for sidebar - could be replaced by real API later
  const [topCreators] = useState([
    { id: 1, name: "Satoshi_V", level: 42, role: "Architect" },
    { id: 2, name: "CodeNinja", level: 38, role: "Dev" },
    { id: 3, name: "Web3Wizard", level: 35, role: "Auditor" },
  ]);

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
    <div className="min-h-screen bg-gaming-bg text-white pt-24 pb-20 relative overflow-hidden">

      {/* AMBIENT BACKGROUND EFFECTS */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-neon-purple/5 blur-[120px] rounded-full animate-float"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-neon-blue/5 blur-[100px] rounded-full animate-float" style={{ animationDelay: '-2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">

        {/* HEADER SECTION - Hero style */}
        <div className="mb-12 relative overflow-hidden rounded-3xl p-8 md:p-12 border border-white/10 bg-[#0A0F1C]/80 backdrop-blur-md shadow-2xl group">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 via-transparent to-neon-purple/10 opacity-50 group-hover:opacity-80 transition-opacity duration-1000"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-neon-blue/20 blur-[80px] rounded-full group-hover:bg-neon-blue/30 transition-all duration-1000"></div>

          <div className="relative z-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-[10px] font-black uppercase tracking-widest mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse"></span>
                Live Network Feed
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-none text-white">
                Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">Nexus</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-xl font-medium leading-relaxed">
                The central hub for verified decentralized intelligence. Discover, validate, and collaborate on the latest protocols.
              </p>
            </div>

            <div className="flex gap-4">
              <Link to="/submit" className="relative group/btn overflow-hidden rounded-xl bg-neon-blue px-8 py-4 font-bold text-black shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-105 transition-all">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                <span className="relative flex items-center gap-2">
                  <span>🚀</span> Initiate Launch
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* LEFT SIDEBAR - FILTERS */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="glass-panel p-6 sticky top-28 bg-[#0F172A]/60 border-white/5">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span>📡</span> Signal Frequency
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveTab("global")}
                  className={`text-left px-4 py-3 rounded-xl transition-all border group ${activeTab === 'global' ? 'bg-neon-blue/10 border-neon-blue/50 text-neon-blue' : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Global Feed</span>
                    {activeTab === 'global' && <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse"></span>}
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("following")}
                  className={`text-left px-4 py-3 rounded-xl transition-all border group ${activeTab === 'following' ? 'bg-neon-purple/10 border-neon-purple/50 text-neon-purple' : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Following</span>
                    {activeTab === 'following' && <span className="w-2 h-2 rounded-full bg-neon-purple animate-pulse"></span>}
                  </div>
                </button>
              </div>

              <div className="mt-10 pt-10 border-t border-white/5">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">🏆 Top Agents</h3>
                <div className="space-y-4">
                  {topCreators.map((user, i) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-white/10 group-hover:border-neon-gold/50 transition-colors">
                          {user.name[0]}
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black border border-white/10 flex items-center justify-center text-[8px] font-bold text-neon-gold shadow-sm">
                          {i + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-300 group-hover:text-white truncate">{user.name}</div>
                        <div className="text-[10px] text-neon-gold font-mono">LVL {user.level}</div>
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
              <div className="relative">
                <input
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-neon-blue"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
              </div>

              <div className="flex p-1 rounded-xl bg-black/40 border border-white/10">
                <button
                  onClick={() => setActiveTab("global")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'global' ? 'bg-neon-blue text-black shadow-lg' : 'text-gray-400'}`}
                >Global</button>
                <button
                  onClick={() => setActiveTab("following")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'following' ? 'bg-neon-purple text-white shadow-lg' : 'text-gray-400'}`}
                >Following</button>
              </div>
            </div>

            {/* DESKTOP SEARCH BAR */}
            <div className="hidden lg:block mb-8">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue/50 to-neon-purple/50 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative">
                  <input
                    className="w-full bg-[#0A0F1C] border border-white/10 rounded-xl px-6 py-4 pl-14 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-neon-blue/50 transition-all font-medium"
                    placeholder="Search the nexus for projects..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-xl group-focus-within:text-neon-blue transition-colors">🔍</span>
                </div>
              </div>
            </div>

            {/* FEED LIST */}
            <div className="space-y-6">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-6 text-neon-blue">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-neon-blue/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="font-mono text-xs uppercase tracking-[0.3em] animate-pulse">Accessing Neural Network...</div>
                </div>
              ) : submissions.length === 0 ? (
                <div className="glass-panel p-20 text-center border-dashed border-2 border-white/10">
                  <div className="text-6xl mb-6 opacity-20 filter grayscale">📡</div>
                  <h3 className="text-2xl font-black text-white mb-2">No Signals Detected</h3>
                  <p className="text-gray-400 max-w-md mx-auto">The frequency is silent. Be the first to initiate a transmission to the network.</p>
                </div>
              ) : (
                submissions.map((sub) => (
                  <SubmissionCard
                    key={sub.active_id || sub.id} // use a unique key if possible, feed might have duplicates if logic allows, but usually ids are unique
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
    </div>
  );
}