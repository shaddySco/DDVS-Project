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
      // Optimistic update or refresh
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
        Encrypted Transmission ({comments.length})
      </h4>

      {loading && (
        <div className="flex items-center gap-2 text-neon-blue text-xs font-mono animate-pulse">
          <span>Loading stream...</span>
        </div>
      )}

      {!loading && comments.length === 0 && (
        <p className="text-sm text-gray-600 italic">No signals detected yet.</p>
      )}

      <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
        {comments.map(comment => (
          <div key={comment.id} className="group border-b border-white/5 pb-4 last:border-0">
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white group-hover:text-neon-blue transition-colors">
                  {comment.user?.username || "Unknown"}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                  LVL {comment.user?.xp ? Math.floor(comment.user.xp / 500) + 1 : 1}
                </span>
              </div>
              <span className="text-[9px] text-gray-600 font-mono">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed mb-2 opacity-90">
              {comment.content}
            </p>

            <button
              onClick={() => likeComment(comment.id)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-neon-gold transition-colors"
            >
              <span className="text-sm">👍</span>
              <span className="font-mono">{comment.likes_count || 0}</span>
            </button>
          </div>
        ))}
      </div>

      {/* ADD COMMENT */}
      {user ? (
        <div className="space-y-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <textarea
              className="relative w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue/50 focus:bg-black/60 transition-all resize-none"
              rows="2"
              placeholder="Transmit your thoughts..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={submitComment} size="sm" variant="secondary" className="text-xs uppercase tracking-widest">
              Transmit
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-white/5 border border-white/5 text-center">
          <p className="text-xs text-gray-400 mb-2">Connect your neural link to transmit.</p>
        </div>
      )}
    </div>
  );
}
