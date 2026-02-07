import { Link } from "react-router-dom";
import Button from "./ui/Button";
import { useState, useEffect } from "react";
import CommentSection from "./CommentSection";
import axios from "../lib/axios";
import { useAuth } from "../context/AuthContext";

export default function SubmissionCard({ submission, onVote, onRepost }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Check follow status if logged in and not looking at own profile
  useEffect(() => {
    if (user && user.id !== submission.user_id) {
      axios.get(`/users/${submission.user_id}/follow-status`)
        .then(res => setIsFollowing(res.data.is_following))
        .catch(() => { });
    }
  }, [user, submission.user_id]);

  const handleFollow = async () => {
    if (!user) return alert("Please login to follow");
    setFollowLoading(true);
    try {
      const res = await axios.post(`/users/${submission.user_id}/follow`);
      setIsFollowing(res.data.followed);
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  const renderMedia = () => {
    if (!submission.media_url) return null;

    const url = submission.media_url;
    const isVid = url.toLowerCase().match(/\.(mp4|webm|ogg|mov|avi)/);

    if (isVid) {
      return (
        <div className="mt-4 rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-video flex items-center justify-center relative group/media shadow-lg">
          <video src={url} className="w-full h-full object-contain" controls preload="metadata" />
        </div>
      );
    }

    return (
      <div className="mt-4 rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-video flex items-center justify-center relative group/media shadow-lg">
        <img src={url} alt={submission.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-110" />
        {/* Overlay for glass reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity"></div>
      </div>
    );
  };

  return (
    <div className="glass-panel p-6 relative group overflow-hidden flex flex-col gap-4 border border-white/5 hover:border-neon-blue/30 transition-all duration-500 hover:shadow-neon-blue/10">

      {/* 1. TOP BAR: Author Info & Follow */}
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${submission.user_id}`} className="shrink-0 relative group/avatar">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-lg font-black text-white shadow-lg overflow-hidden relative">
              {/* Avatar Glitch Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 to-blue-500/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity"></div>
              <span className="relative z-10">{submission.author_name?.charAt(0).toUpperCase()}</span>
            </div>
          </Link>
          <div>
            <Link to={`/profile/${submission.user_id}`} className="block font-black text-white hover:text-neon-blue transition-colors leading-none mb-1 text-base tracking-tight">
              {submission.author_name}
            </Link>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse"></span>
              {new Date(submission.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {user && user.id !== submission.user_id && (
          <Button
            variant={isFollowing ? "outline" : "primary"}
            size="sm"
            onClick={handleFollow}
            disabled={followLoading}
            className="text-[10px] h-8 px-4 uppercase tracking-widest font-black"
          >
            {followLoading ? "..." : isFollowing ? "Unfollow" : "Follow"}
          </Button>
        )}
      </div>

      {/* 2. PROJECT INFO */}
      <div className="space-y-3 relative z-10 mt-2">
        <Link to={`/project/${submission.id}`} className="group/title block">
          <h3 className="text-2xl font-black text-white group-hover/title:text-neon-blue transition-all duration-300 tracking-tight leading-none mb-2">
            {submission.title}
          </h3>
        </Link>

        <div className="flex gap-2">
          <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-neon-blue text-[9px] uppercase font-black tracking-widest shadow-sm">
            {submission.category}
          </span>
        </div>

        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
          {submission.description}
        </p>
      </div>

      {/* 3. MEDIA CONTENT */}
      {renderMedia()}

      {/* 4. ACTION BAR */}
      <div className="flex items-center justify-between border-t border-white/5 pt-5 mt-2 relative z-10">
        <div className="flex items-center gap-2">
          {/* Vote Button */}
          <button
            onClick={() => onVote(submission.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all group/btn ${submission.has_voted ? 'bg-neon-gold/10 text-neon-gold border border-neon-gold/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <span className="text-lg">⚡</span>
            <span className="font-mono font-bold text-xs">{submission.total_votes || 0}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${showComments ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <span className="text-lg">💬</span>
            <span className="font-mono font-bold text-xs">{submission.comments_count || 0}</span>
          </button>

          {/* Repost Button */}
          <button
            onClick={() => onRepost(submission.id)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-gray-400 hover:bg-white/5 hover:text-neon-purple hover:border-neon-purple/30 group/btn"
          >
            <span className="text-lg group-hover/btn:rotate-180 transition-transform duration-500">🔁</span>
            <span className="font-mono font-bold text-xs">{submission.reposts_count || 0}</span>
          </button>
        </div>

        <Link to={`/project/${submission.id}`}>
          <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white">
            View Specs →
          </Button>
        </Link>
      </div>

      {/* 5. COMMENTS PREVIEW */}
      {showComments && (
        <div className="mt-4 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
          <CommentSection submissionId={submission.id} />
        </div>
      )}
    </div>
  );
}
