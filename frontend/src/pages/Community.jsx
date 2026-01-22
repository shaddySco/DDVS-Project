import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../lib/axios";
import CommentSection from "../components/CommentSection";
import "./Community.css";

export default function Community() {
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("global");
  const [expandedComments, setExpandedComments] = useState(null);
  const [loading, setLoading] = useState(true);

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
    
    // We set loading to true inside the effect, but only if we aren't already loading
    // This satisfies the linter by keeping the logic inside the async flow
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
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        if (isMounted) setSubmissions([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; }; // Cleanup
  }, [activeTab, search]);

  return (
    <div className="community-container">
      <header className="community-header">
        <h1>🌍 Community</h1>
        <p>Discover verified work from the DDVS ecosystem</p>
      </header>

      <div className="controls-wrapper">
        <input
          className="search-input"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="tab-group">
          <button 
            className={`tab-btn ${activeTab === "following" ? "active" : ""}`}
            onClick={() => setActiveTab("following")}
          >Following</button>
          <button 
            className={`tab-btn ${activeTab === "global" ? "active" : ""}`}
            onClick={() => setActiveTab("global")}
          >Global</button>
        </div>
      </div>

      <div className="feed-list">
        {loading ? (
          <div className="loading-state">Loading amazing projects...</div>
        ) : submissions.length === 0 ? (
          <div className="empty-state">No projects found. Be the first to submit!</div>
        ) : (
          submissions.map((sub) => (
            <div key={sub.id} className="submission-card">
              <Link to={`/project/${sub.id}`} className="card-title">
                {sub.title}
              </Link>
              
              <div className="card-meta">
                <span className="field-badge">{sub.category}</span>
                <span className="dot">•</span>
                <span className="author-info">
                  by <Link to={`/profile/${sub.user_id}`} className="author-link">
                    {sub.author_name}
                  </Link>
                </span>
              </div>

              <div className="action-bar">
                <div className="action-btns">
                  <button onClick={() => voteSubmission(sub.id)} className={`btn-action ${sub.has_voted ? 'voted' : ''}`}>
                    👍 {sub.has_voted ? "Voted" : "Upvote"}
                  </button>
                  <button className="btn-action" onClick={() => setExpandedComments(expandedComments === sub.id ? null : sub.id)}>
                    💬 {sub.comments_count ?? 0}
                  </button>
                  <button className="btn-action" onClick={() => repostSubmission(sub.id)}>
                    🔁 {sub.reposts_count ?? 0}
                  </button>
                </div>
                <div className="vote-count">⭐ {sub.total_votes ?? 0} Votes</div>
              </div>

              {expandedComments === sub.id && (
                <div className="comments-dropdown">
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