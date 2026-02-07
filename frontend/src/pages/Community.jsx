import { useEffect, useState } from "react";
import axios from "../lib/axios";
import SubmissionCard from "../components/SubmissionCard";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Community() {
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("global"); // 'global' or 'connections'
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const categories = [
    "All Categories",
    "Social Media",
    "Decentralized Identity",
    "Finance / DeFi",
    "AI / ML",
    "Games / Metaverse",
    "Tooling / Infrastructure",
    "Cybersecurity",
    "NFT / Art",
    "Analytics",
    "Other"
  ];

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/community", {
        params: {
          type: activeTab,
          search: search,
          category: categoryFilter
        }
      });
      // The /community endpoint returns a paginated object or direct data depending on the implementation
      // Our recent backend change returns direct combined array
      setSubmissions(res.data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [activeTab, categoryFilter]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleVote = async (id) => {
    try {
      await axios.post("/votes", { submission_id: id });
      fetchProjects(); // Refresh to show new counts
    } catch (err) {
      alert(err.response?.data?.message || "Failed to vote");
    }
  };

  const handleRepost = async (id) => {
    try {
      await axios.post(`/submissions/${id}/repost`);
      fetchProjects();
      alert("Project reposted!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to repost");
    }
  };

  return (
    <div className="min-h-screen bg-gaming-bg text-white pt-24 pb-20 relative px-4 md:px-8">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Community <span className="text-neon-blue">Hub</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Discover projects and see what's trending.</p>
          </div>
          <Link
            to="/submit"
            className="px-6 py-2 bg-neon-blue hover:bg-neon-blue/90 text-black font-bold rounded-lg transition-all text-sm"
          >
            + New Submission
          </Link>
        </div>

        {/* Global / Your Connections Tabs */}
        <div className="flex items-center gap-6 mb-8 border-b border-white/5">
          <button
            onClick={() => setActiveTab("global")}
            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === "global" ? "text-neon-blue border-b-2 border-neon-blue" : "text-gray-400 hover:text-white"}`}
          >
            Global Feed
          </button>
          {user && (
            <button
              onClick={() => setActiveTab("connections")}
              className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === "connections" ? "text-neon-blue border-b-2 border-neon-blue" : "text-gray-400 hover:text-white"}`}
            >
              Your Connections
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by title or author..."
              className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-4 pr-10 text-white focus:outline-none focus:border-neon-blue/50 transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          </div>

          <select
            className="bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white appearance-none cursor-pointer focus:outline-none focus:border-neon-blue/50 min-w-[200px]"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="py-20 text-center animate-pulse text-neon-blue font-mono">
            SYNCING_NETWORK_DATA...
          </div>
        ) : (submissions && submissions.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((sub, idx) => (
              <SubmissionCard
                key={`${sub.id}-${sub.is_repost ? 'repost' : 'orig'}-${idx}`}
                submission={sub}
                onVote={handleVote}
                onRepost={handleRepost}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center glass-panel border border-dashed border-white/10 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-2">No activity found here.</h3>
            <p className="text-gray-400">Try changing your filters or follow more developers.</p>
          </div>
        )}
      </div>
    </div>
  );
}