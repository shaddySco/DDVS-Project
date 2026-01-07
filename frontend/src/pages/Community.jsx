import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../lib/axios";
import CommentSection from "../components/CommentSection";


export default function Community() {
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("following");
  const [expandedComments, setExpandedComments] = useState(null);
  const [loading, setLoading] = useState(true);
 const repostSubmission = async (id) => {
  try {
    await axios.post(`/api/submissions/${id}/repost`);

    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? {
              ...sub,
              reposts_count: (sub.reposts_count ?? 0) + 1,
            }
          : sub
      )
    );
  } catch (err) {
    if (err.response?.status === 401) {
      alert("You must be logged in to repost.");
    } else if (err.response?.status === 409) {
      alert("You already reposted this submission.");
    } else {
      console.error("Repost failed:", err);
    }
  }
};

const updateRepostCount = (id, newCount) => {
  setSubmissions((prev) =>
    prev.map((sub) =>
      sub.id === id
        ? { ...sub, reposts_count: newCount }
        : sub
    )
  );
};
const voteSubmission = async (id) => {
  try {
    const res = await axios.post("/api/votes", {
      submission_id: id,
      type: "up",
    });

    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? {
              ...sub,
              total_votes: res.data.total_votes,
              has_voted: true,
            }
          : sub
      )
    );
  } catch (err) {
    if (err.response?.status === 401) {
      alert("You must be logged in to vote.");
    } else if (err.response?.status === 409) {
      alert("You already voted on this submission.");
    } else {
      console.error("Vote failed:", err);
    }
  }
};




 useEffect(() => {
  setLoading(true);

  axios
    .get("/api/community", {
      params: {
        type: activeTab,
        search,
      },
    })
    .then((res) => {
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      setSubmissions(data);
    })
    .catch((err) => {
      console.error("Community feed error:", err);
      setSubmissions([]);
    })
    .finally(() => setLoading(false));
}, [activeTab, search]);

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1>🌍 Community</h1>
      <p>Discover verified work from the DDVS ecosystem</p>

      {/* SEARCH + TABS */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
        <input
          placeholder="Search developers or submissions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: "0.6rem" }}
        />

        <button
          onClick={() => setActiveTab("following")}
          disabled={activeTab === "following"}
        >
          Following
        </button>

        <button
          onClick={() => setActiveTab("global")}
          disabled={activeTab === "global"}
        >
          Global
        </button>
      </div>

      {/* FEED */}
      <div style={{ marginTop: "2rem" }}>
        {loading && <p>Loading feed…</p>}

        {!loading && submissions.length === 0 && (
          <p style={{ opacity: 0.7 }}>
            No submissions found for this feed.
          </p>
        )}

        {!loading &&
          submissions.map((sub) => (
            <div
            key={sub.feed_id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "1.2rem",
                marginBottom: "1.5rem",
              }}
            >
              {/* REPOST LABEL */}
              {sub.is_repost && (
                <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                  🔁 Reposted by {sub.reposted_by}
                </p>
              )}

              {/* TITLE */}
              <h3>
                <Link to={`/project/${sub.id}`}>{sub.title}</Link>
              </h3>

              {/* AUTHOR */}
             <p>
  by{" "}
  <Link to={`/profile/${sub.user_id}`}>
    User #{sub.user_id}
  </Link>
</p>

              {/* TAGS */}
              {Array.isArray(sub.tags) && (
                <div style={{ margin: "0.5rem 0" }}>
                  {sub.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: "0.75rem",
                        background: "#eee",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        marginRight: "0.4rem",
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

           {/* ACTION BAR */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    marginTop: "1rem",
    alignItems: "center",
  }}
>
  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
  <button
  onClick={() => voteSubmission(sub.id)}
  disabled={sub.has_voted}
  style={{
    background: sub.has_voted ? "#ffd966" : "#f3f3f3",
    border: "1px solid #ccc",
    padding: "0.3rem 0.6rem",
    borderRadius: "6px",
    cursor: sub.has_voted ? "not-allowed" : "pointer",
  }}
>
  👍 {sub.has_voted ? "Voted" : "Vote"}
</button>



    <button
      onClick={() =>
        setExpandedComments(
          expandedComments === sub.id ? null : sub.id
        )
      }
    >
      💬 Comment
    </button>

    <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
      💬 {sub.comments_count ?? 0}{" "}
      {sub.comments_count === 1 ? "comment" : "comments"}
    </span>

    <button onClick={() => repostSubmission(sub.id)}>
      🔁 {sub.reposts_count ?? 0}
    </button>
  </div>

  <strong>
    ⭐ Total Votes: {sub.total_votes ?? 0}
  </strong>
</div>


              {/* COMMENTS */}
              {expandedComments === sub.id && (
                <CommentSection submissionId={sub.id} />
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
