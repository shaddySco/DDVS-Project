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
         .catch(() => {});
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
        <div className="mt-4 rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-video flex items-center justify-center relative group/media">
          <video src={url} className="w-full h-full object-contain" controls preload="metadata" />
        </div>
      );
    }

    return (
      <div className="mt-4 rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-video flex items-center justify-center relative group/media">
        <img src={url} alt={submission.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-110" />
      </div>
    );
  };

  return (
    <div className="glass-card p-6 relative group overflow-hidden flex flex-col gap-4 border border-white/5 hover:border-neon-blue/30 transition-all duration-300">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-neon-blue/10 blur-[100px] pointer-events-none group-hover:bg-neon-blue/20 transition-all duration-500"></div>

      {/* 1. TOP BAR: Author Info & Follow */}
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${submission.user_id}`} className="shrink-0 relative">
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-neon-blue/20 flex items-center justify-center text-lg font-bold text-white shadow-[0_0_15px_rgba(0,243,255,0.1)] group-hover:border-neon-blue/50 transition-all">
              {submission.author_name?.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0F172A] shadow-sm"></div>
          </Link>
          <div>
             <Link to={`/profile/${submission.user_id}`} className="block font-bold text-white hover:text-neon-blue transition-colors leading-none mb-1 text-base">
               {submission.author_name}
             </Link>
             <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono flex items-center gap-2">
               <span className="w-1 h-1 rounded-full bg-gray-600"></span>
               {submission.created_at}
             </span>
          </div>
        </div>

        {user && user.id !== submission.user_id && (
          <Button 
            variant={isFollowing ? "glass" : "primary"} 
            size="sm" 
            onClick={handleFollow}
            disabled={followLoading}
            className={`text-xs h-8 px-5 rounded-full ${isFollowing ? 'border-neon-purple/50 text-neon-purple' : 'shadow-neon-blue shadow-[0_0_10px_rgba(0,243,255,0.3)]'}`}
          >
            {followLoading ? "..." : isFollowing ? "Unfollow" : "Follow"}
          </Button>
        )}
      </div>

      {/* 2. PROJECT INFO */}
      <div className="space-y-3 relative z-10">
         <Link to={`/project/${submission.id}`}>
          <h3 className="text-2xl font-bold text-white group-hover:text-neon-blue transition-all duration-300 tracking-tight leading-tight">
            {submission.title}
          </h3>
         </Link>
         <div className="flex gap-2">
           <span className="px-2.5 py-0.5 rounded-full bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-[10px] uppercase font-black tracking-widest">
              {submission.category}
           </span>
         </div>
         <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 italic opacity-80 group-hover:opacity-100 transition-opacity">
            "{submission.description}"
         </p>
      </div>

      {/* 3. MEDIA CONTENT */}
      {renderMedia()}

      {/* 4. ACTION BAR (Redesigned with Icons) */}
      <div className="flex items-center justify-between border-t border-white/5 pt-5 mt-2 relative z-10">
        <div className="flex items-center gap-6">
          {/* Vote Button */}
          <button 
            onClick={() => onVote(submission.id)}
            className={`flex items-center gap-2.5 transition-all group/btn ${submission.has_voted ? 'text-neon-gold' : 'text-gray-400 hover:text-neon-gold'}`}
          >
            <div className={`p-2 rounded-lg transition-all ${submission.has_voted ? 'bg-neon-gold/20' : 'bg-white/5 group-hover/btn:bg-neon-gold/10'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={submission.has_voted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(255,182,0,0.3)]"><path d="M7 10l5-6 5 6"></path><path d="M21 15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <span className="font-black text-sm">{submission.total_votes || 0}</span>
          </button>

          {/* Comment Button */}
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2.5 text-gray-400 hover:text-neon-blue transition-all group/btn"
          >
            <div className={`p-2 rounded-lg bg-white/5 transition-all ${showComments ? 'bg-neon-blue/20 text-neon-blue' : 'group-hover/btn:bg-neon-blue/10'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <span className="font-black text-sm">{submission.comments_count || 0}</span>
          </button>

          {/* Repost Button */}
          <button 
            onClick={() => onRepost(submission.id)}
            className="flex items-center gap-2.5 text-gray-400 hover:text-neon-purple transition-all group/btn"
          >
            <div className="p-2 rounded-lg bg-white/5 group-hover/btn:bg-neon-purple/10 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"></path><path d="M3 11v-1a4 4 0 0 1 4-4h14"></path><path d="m7 22-4-4 4-4"></path><path d="M21 13v1a4 4 0 0 1-4 4H3"></path></svg>
            </div>
            <span className="font-black text-sm">{submission.reposts_count || 0}</span>
          </button>
        </div>

        <Link to={`/project/${submission.id}`} className="group/details flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover/details:text-neon-purple transition-all">View Details</span>
          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover/details:bg-neon-purple/20 group-hover/details:text-neon-purple transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
          </div>
        </Link>
      </div>

      {/* 5. COMMENTS PREVIEW */}
      {showComments && (
        <div className="mt-2 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-500">
          <CommentSection submissionId={submission.id} />
        </div>
      )}
    </div>
  );
}
