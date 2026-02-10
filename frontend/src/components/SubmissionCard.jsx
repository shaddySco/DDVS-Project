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
    const isVid = url.toLowerCase().match(/\.(mp4|webm|ogg|mov|avi|mkv|wmv|m4v|flv)/);

    if (isVid) {
      return (
        <div className="mt-4 rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-video flex items-center justify-center relative shadow-lg">
          <video src={url} className="w-full h-full object-contain" controls preload="metadata" />
        </div>
      );
    }

      return (
        <div className="mt-4 rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-video flex items-center justify-center relative shadow-lg group-hover:border-white/20 transition-colors">
          <img src={url} alt={submission.title} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" />
        </div>
      );
  };

  return (
    <div className="glass-panel p-6 relative group overflow-hidden flex flex-col gap-4 border border-white/5 hover:bg-[#0F172A]/80 transition-all duration-300">

      {/* 0. REPOST INDICATOR */}
      {submission.is_repost && (
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-400 bg-white/5 py-1 px-3 rounded-full w-fit">
          <span className="text-base leading-none">🔁</span>
          <span>{submission.reposted_by_name} reposted {submission.reposted_at}</span>
        </div>
      )}

      {/* 1. TOP BAR: Author Info & Follow */}
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${submission.user_id}`} className="shrink-0">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm font-bold text-white shadow-md overflow-hidden">
              {submission.author_name?.charAt(0).toUpperCase()}
            </div>
          </Link>
          <div>
            <Link to={`/profile/${submission.user_id}`} className="block font-bold text-white hover:text-blue-400 transition-colors leading-tight text-sm">
              {submission.author_name}
            </Link>
            <span className="text-xs text-gray-500 flex items-center gap-2">
              {new Date(submission.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {user && user.id !== submission.user_id && (
          <Button
            variant={isFollowing ? "outline" : "secondary"}
            size="sm"
            onClick={handleFollow}
            disabled={followLoading}
            className="text-xs h-8 px-4 font-medium"
          >
            {followLoading ? "..." : isFollowing ? "Unfollow" : "Follow"}
          </Button>
        )}
      </div>

      {/* 2. PROJECT INFO */}
      <div className="space-y-2 relative z-10 mt-1">
        <Link to={`/project/${submission.id}`} className="block">
          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">
            {submission.title}
          </h3>
        </Link>

        <span className="inline-block px-2 py-0.5 rounded bg-white/5 border border-white/10 text-blue-300 text-xs font-medium">
          {submission.category}
        </span>

        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mt-2">
          {submission.description}
        </p>
      </div>

      {/* 3. MEDIA CONTENT */}
      {renderMedia()}

      {/* 4. ACTION BAR */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2 relative z-10">
        <div className="flex items-center gap-4">
          {/* Vote Button */}
          <button
            onClick={() => onVote(submission.id)}
            className={`flex items-center gap-1.5 transition-all text-sm group/btn ${submission.has_voted ? 'text-neon-gold' : 'text-gray-400 hover:text-white'}`}
          >
            <span className="text-base">⚡</span>
            <span className="font-medium">{submission.total_votes || 0}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 transition-all text-sm ${showComments ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            <span className="text-base">💬</span>
            <span className="font-medium">{submission.comments_count || 0}</span>
          </button>

          {/* Repost Button */}
          <button
            onClick={() => onRepost(submission.id)}
            className="flex items-center gap-1.5 transition-all text-sm text-gray-400 hover:text-white"
          >
            <span className="text-base">🔁</span>
            <span className="font-medium">{submission.reposts_count || 0}</span>
          </button>
        </div>

        <Link to={`/project/${submission.id}`}>
          <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-white">
            View Project →
          </Button>
        </Link>
      </div>

      {/* 5. COMMENTS PREVIEW */}
      {showComments && (
        <div className="mt-4 pt-6 border-t border-white/5">
          <CommentSection submissionId={submission.id} />
        </div>
      )}
    </div>
  );
}
