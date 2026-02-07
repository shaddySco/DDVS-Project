import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import CommentSection from "../components/CommentSection";

export default function SubmissionDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [reposting, setReposting] = useState(false);

  useEffect(() => {
    axios
      .get(`/submissions/${id}`)
      .then((res) => setSubmission(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleVote = async () => {
    if (!user) return alert("Please login to vote.");
    setVoting(true);
    try {
      const res = await axios.post("/votes", { submission_id: submission.id, type: "up" });
      setSubmission(prev => ({
        ...prev,
        total_votes: res.data.total_votes,
        has_voted: true
      }));
    } catch (err) {
      alert(err.response?.status === 409 ? "Already voted!" : "Voting failed.");
    } finally {
      setVoting(false);
    }
  };

  const handleRepost = async () => {
    if (!user) return alert("Please login to repost.");
    setReposting(true);
    try {
      await axios.post(`/submissions/${submission.id}/repost`);
      setSubmission(prev => ({
        ...prev,
        reposts_count: (prev.reposts_count || 0) + 1
      }));
    } catch (err) {
      alert(err.response?.status === 409 ? "Already reposted!" : "Repost failed.");
    } finally {
      setReposting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-32 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-white/20 border-t-neon-blue rounded-full animate-spin mb-4"></div>
      <div className="text-gray-400 text-sm tracking-widest uppercase">Loading Project...</div>
    </div>
  );

  if (!submission) return (
    <div className="min-h-screen pt-32 flex items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Project Not Found</h2>
        <Link to="/community">
          <Button variant="outline">Return to Community</Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">

      {/* HEADER: TITLE & META */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-xs font-bold uppercase tracking-wider">
                {submission.category}
              </span>
              <span className="text-gray-500 text-xs uppercase tracking-widest">
                {submission.created_at}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
              {submission.title}
            </h1>
            <div className="flex items-center gap-2 text-gray-400">
              <span>by</span>
              <Link to={`/profile/${submission.user_id}`} className="text-white hover:text-neon-blue transition-colors font-medium">
                {submission.author?.username}
              </Link>
            </div>
          </div>

          <div className="flex gap-3">
            <a href={submission.repository_url} target="_blank" rel="noreferrer">
              <Button variant="outline" className="h-12 px-6 rounded-xl border-white/10 hover:border-white/30">
                View Code
              </Button>
            </a>
            {user?.id === submission.user_id && (
              <Button variant="secondary" className="h-12 px-6 rounded-xl">
                Edit Project
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* HERO: SCREENSHOT MASTER */}
      <div className="relative mb-12 rounded-2xl overflow-hidden bg-[#0A0F1C] border border-white/10 shadow-2xl aspect-video group">
        {submission.media_url ? (
          submission.media_url.match(/\.(mp4|webm)/) ? (
            <video src={submission.media_url} controls className="w-full h-full object-contain" />
          ) : (
            <img src={submission.media_url} alt={submission.title} className="w-full h-full object-cover" />
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
            <span className="text-4xl mb-4">🖼️</span>
            <span>No Preview Available</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* LEFT: DESCRIPTION & DISCUSSION */}
        <div className="lg:col-span-2 space-y-12">

          <div className="prose prose-invert max-w-none">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">About this Project</h3>
            <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
              {submission.description}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-2 flex items-center justify-between">
              <span>Discussion</span>
              <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-1 rounded-full">{submission.comments_count} Comments</span>
            </h3>
            <CommentSection submissionId={id} />
          </div>

        </div>

        {/* RIGHT: STATS & ACTION */}
        <div className="lg:col-span-1 space-y-8">

          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0F172A]/50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Engagement</h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="text-3xl font-bold text-white mb-1">{submission.total_votes}</div>
                <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Upvotes</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="text-3xl font-bold text-white mb-1">{submission.reposts_count}</div>
                <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Reposts</div>
              </div>
            </div>

            <Button
              variant={submission.has_voted ? "glass" : "primary"}
              className={`w-full py-4 text-lg font-bold rounded-xl mb-3 flex items-center justify-center gap-2 ${submission.has_voted ? 'text-neon-gold border-neon-gold/30' : ''}`}
              onClick={handleVote}
              disabled={voting || submission.has_voted}
            >
              {submission.has_voted ? "✓ Voted" : "▲ Upvote Project"}
            </Button>

            <Button
              variant="ghost"
              className="w-full py-3 text-sm font-medium rounded-xl text-gray-400 hover:text-white hover:bg-white/5"
              onClick={handleRepost}
              disabled={reposting}
            >
              ↻ Repost to Feed
            </Button>

          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0F172A]/50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">About the Creator</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-white border border-white/10">
                {submission.author?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-white">{submission.author?.username}</div>
                <div className="text-xs text-neon-blue">Level {Math.floor((submission.author?.xp || 0) / 100) + 1} • {submission.author?.developer_type || "Developer"}</div>
              </div>
            </div>
            <Link to={`/profile/${submission.user_id}`}>
              <Button variant="outline" size="sm" className="w-full mt-4 border-white/10 text-gray-400 hover:text-white">
                View Profile
              </Button>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
