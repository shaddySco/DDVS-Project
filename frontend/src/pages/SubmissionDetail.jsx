import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../lib/axios";
import { useAuth } from "../context/AuthContext";

export default function SubmissionDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get(`/api/submissions/${id}`)
      .then((res) => setSubmission(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleVote = async () => {
    if (!token) {
      setMessage("Connect your wallet to vote.");
      return;
    }

    setVoting(true);
    setMessage("");

    try {
      const res = await axios.post(
        "/api/votes",
        { submission_id: submission.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message);

      const updated = await axios.get(`/api/submissions/${id}`);
      setSubmission(updated.data);
    } catch (err) {
      if (err.response?.status === 409) {
        setMessage("You have already voted on this submission.");
      } else {
        setMessage("Voting failed.");
      }
    } finally {
      setVoting(false);
    }
  };

  if (loading) return <p>Loading project...</p>;
  if (!submission) return <p>Project not found.</p>;

  return (
    <div>
      <h1>{submission.title}</h1>

      <p style={{ marginTop: "0.5rem" }}>
        👤 {submission.author.wallet_address} · Level{" "}
        {Math.floor(submission.author.xp / 100) + 1}
      </p>

      <p style={{ marginTop: "1rem" }}>{submission.description}</p>

      <p style={{ marginTop: "1rem" }}>
        🔗{" "}
        <a href={submission.repository_url} target="_blank" rel="noreferrer">
          View Repository
        </a>
      </p>

      <p style={{ marginTop: "1rem" }}>
        ⭐ {submission.votes.length} Votes
      </p>

      <p style={{ fontSize: "0.9rem", color: "#666" }}>
        Ownership status: {submission.ownership_status}
      </p>

      <div style={{ marginTop: "1.5rem" }}>
        <button onClick={handleVote} disabled={voting}>
          {voting ? "Voting..." : "Vote for this project"}
        </button>
      </div>

      {message && (
        <p style={{ marginTop: "1rem", color: "#444" }}>{message}</p>
      )}

      {/* 🔐 PHASE 7.4 — VERIFICATION PROOF */}
      {submission.ownership_status === "verified" && (
        <div
          className="verification-proof"
          style={{
            marginTop: "2rem",
            padding: "1rem",
            border: "1px solid #ddd",
            borderRadius: "6px",
            background: "#fafafa",
          }}
        >
          <h3>Verification Proof</h3>

          <p><strong>Status:</strong> Verified</p>

          <p><strong>Attestation Hash:</strong></p>
          <code style={{ wordBreak: "break-all" }}>
            {submission.attestation_hash}
          </code>

          <p style={{ marginTop: "0.5rem" }}>
            <strong>Verified At:</strong> {submission.verified_at}
          </p>

          <p style={{ marginTop: "0.5rem" }}>
            <strong>How to verify:</strong>
          </p>
          <ol>
            <li>Recompute hash using wallet + submission ID + timestamp</li>
            <li>Confirm the hash matches this value</li>
            <li>Verify existence on the blockchain</li>
          </ol>
        </div>
      )}
    </div>
  );
}
