import { useEffect, useState } from "react";
import axios from "../lib/axios";


export default function CommentSection({ submissionId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchComments = () => {
    axios
      .get(`/api/submissions/${submissionId}/comments`)
      .then(res => {
        setComments(Array.isArray(res.data) ? res.data : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComments();
  }, [submissionId]);

  const submitComment = () => {
    if (!content.trim()) return;

    api.post("/api/comments", {
      submission_id: submissionId,
      content,
    }).then(() => {
      setContent("");
      fetchComments();
    });
  };

const token = localStorage.getItem('your_token_key'); // or however you store it

const likeComment = async (commentId) => {
  try {
    // Note: use the imported 'axios' instance, not the global one
    await axios.post(`/api/comments/${commentId}/like`);
    fetchComments(); // Refresh the UI after liking
  } catch (error) {
    console.error("Like failed:", error.response?.status);
  }
};


  return (
    <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #eee" }}>
      <h4>Comments</h4>

      {loading && <p>Loading comments…</p>}

      {!loading && comments.length === 0 && (
        <p style={{ opacity: 0.6 }}>No comments yet</p>
      )}

      {comments.map(comment => (
        <div
          key={comment.id}
          style={{
            padding: "0.8rem 0",
            borderBottom: "1px solid #eee",
          }}
        >
          <p style={{ fontWeight: "bold" }}>
            {comment.user.username} · Level {Math.floor(comment.user.xp / 500) + 1}
          </p>

          <p>{comment.content}</p>

          <button
            onClick={() => likeComment(comment.id)}
            style={{ fontSize: "0.8rem" }}
          >
            👍 {comment.likes_count}
          </button>
        </div>
      ))}

      {/* ADD COMMENT */}
      <div style={{ marginTop: "1rem" }}>
        <textarea
          placeholder="Write a comment..."
          value={content}
          onChange={e => setContent(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        />

        <button onClick={submitComment} style={{ marginTop: "0.5rem" }}>
          Post Comment
        </button>
      </div>
    </div>
  );
}
