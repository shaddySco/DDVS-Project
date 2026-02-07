import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";

export default function CommentSection({ submissionId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchComments = () => {
    axios
      .get(`/submissions/${submissionId}/comments`)
      .then(res => {
        setComments(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComments();
  }, [submissionId]);

  const submitComment = async () => {
    if (!content.trim()) return;

    try {
      await axios.post("/comments", {
        submission_id: submissionId,
        content,
      });
      setContent("");
      fetchComments();
    } catch (err) {
      console.error("Comment failed", err);
    }
  };

  const likeComment = async (commentId) => {
    try {
      await axios.post(`/comments/${commentId}/like`);
      setComments(prev => prev.map(c =>
        c.id === commentId ? { ...c, likes_count: (c.likes_count || 0) + 1 } : c
      ));
    } catch (error) {
      console.error("Like failed:", error.response?.status);
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
        {comments.length} Comments
      </h4>

      {loading && (
        <div className="text-neon-blue text-xs font-mono animate-pulse">
          Loading comments...
        </div>
      )}

      {!loading && comments.length === 0 && (
        <p className="text-sm text-gray-500 italic">No comments yet. Be the first to share your thoughts.</p>
      )}

      <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
        {comments.map(comment => (
          <div key={comment.id} className="group border-b border-white/5 pb-6 last:border-0 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-white group-hover:text-neon-blue transition-colors">
                  {comment.user?.username || "Unknown"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                  Level {comment.user?.xp ? Math.floor(comment.user.xp / 100) + 1 : 1}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>

            <p className="text-gray-300 leading-relaxed text-sm mb-3">
              {comment.content}
            </p>

            <button
              onClick={() => likeComment(comment.id)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-neon-blue transition-colors"
            >
              <span className="text-sm">👍</span>
              <span>{comment.likes_count || 0} Likes</span>
            </button>
          </div>
        ))}
      </div>

      {/* ADD COMMENT */}
      {user ? (
        <div className="mt-8">
          <div className="relative group mb-3">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <textarea
              className="relative w-full bg-[#0F172A] border border-white/10 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue/50 transition-all resize-none"
              rows="3"
              placeholder="Write a comment..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={submitComment} size="sm" variant="secondary" className="px-6">
              Post Comment
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-white/5 border border-white/5 text-center mt-8">
          <p className="text-sm text-gray-400 mb-2">Please login to join the discussion.</p>
        </div>
      )}
    </div>
  );
}
