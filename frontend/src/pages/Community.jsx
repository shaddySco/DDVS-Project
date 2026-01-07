import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../lib/axios";
import CommentSection from "../components/CommentSection";
import "./Community.css"; // Import the fancy CSS

export default function Community() {
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("global"); // Default to global if following is empty
  const [expandedComments, setExpandedComments] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Functions ---
  const repostSubmission = async (id) => {
    try {
      await axios.post(`/api/submissions/${id}/repost`);
      setSubmissions((prev) =>
        prev.map((sub) => sub.id === id ? { ...sub, reposts_count: (sub.reposts_count ?? 0) + 1 } : sub)
      );
    } catch (err) {
      alert(err.response?.status === 409 ? "Already reposted!" : "Action failed");
    }
  };

  const voteSubmission = async (id) => {
    try {
      const res = await axios.post("/api/votes", { submission_id: id, type: "up" });
      setSubmissions((prev) =>
        prev.map((sub) => sub.id === id ? { ...sub, total_votes: res.data.total_votes, has_voted: true } : sub)
      );
    } catch (err) {
      alert(err.response?.status === 409 ? "Already voted!" : "Login to vote");
    }
  };

  useEffect(() => {
    setLoading(true);
    axios.get("/api/community", { params: { type: activeTab, search } })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setSubmissions(data);
      })
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, [activeTab, search]);

  return (
    <div className="community-container">
      <header className="community-header">
        <h1>🌍 Community</h1>
        <p>Discover verified work from the DDVS ecosystem</p>
      </header>

      {/* SEARCH + TABS */}
      <div className="controls-wrapper">
        <input
          className="search-input"
          placeholder="Search projects, categories or developers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button 
          className={`tab-btn ${activeTab === "following" ? "active" : ""}`}
          onClick={() => setActiveTab("following")}
        >Following</button>
        <button 
          className={`tab-btn ${activeTab === "global" ? "active" : ""}`}
          onClick={() => setActiveTab("global")}
        >Global</button>
      </div>

      {/* FEED */}
      <div className="feed-list">
        {loading ? (
          <div style={{textAlign: 'center', padding: '40px'}}>Loading amazing projects...</div>
        ) : submissions.length === 0 ? (
          <div style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
            No projects found. Be the first to submit!
          </div>
        ) : (
          submissions.map((sub) => (
            <div key={sub.feed_id || sub.id} className="submission-card">
              
              {/* Repost Header */}
              {sub.is_repost && (
                <div className="repost-indicator">
                  🔁 Reposted by {sub.reposted_by}
                </div>
              )}

              {/* Title & Category Row */}
              <Link to={`/project/${sub.id}`} className="card-title">
                {sub.title}
              </Link>
              
              <div className="card-meta">
                <span className="field-badge">{sub.category || "Machine Learning"}</span>
                <span style={{color: '#94a3b8'}}>•</span>
                <span style={{color: '#64748b', fontSize: '0.9rem'}}>
                  by <Link to={`/profile/${sub.user_id}`} className="author-link">
                    {sub.author_name || `User #${sub.user_id}`}
                  </Link>
                </span>
              </div>

              {/* Action Bar */}
              <div className="action-bar">
                <div className="action-btns">
                  <button 
                    onClick={() => voteSubmission(sub.id)}
                    className={`btn-action ${sub.has_voted ? 'voted' : ''}`}
                    disabled={sub.has_voted}
                  >
                    👍 {sub.has_voted ? "Voted" : "Upvote"}
                  </button>

                  <button 
                    className="btn-action"
                    onClick={() => setExpandedComments(expandedComments === sub.id ? null : sub.id)}
                  >
                    💬 {sub.comments_count ?? 0}
                  </button>

                  <button className="btn-action" onClick={() => repostSubmission(sub.id)}>
                    🔁 {sub.reposts_count ?? 0}
                  </button>
                </div>

                <div className="vote-count">
                  ⭐ {sub.total_votes ?? 0} Votes
                </div>
              </div>

              {/* Comments Section */}
              {expandedComments === sub.id && (
                <div style={{marginTop: '20px'}}>
                  <CommentSection submissionId={sub.id} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}