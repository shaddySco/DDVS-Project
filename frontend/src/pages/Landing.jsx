import { useEffect, useState } from "react";
import axios from "axios";

export default function Landing() {
  const [stats, setStats] = useState({
    totalDevelopers: 0,
    totalSubmissions: 0,
    totalVotes: 0,
  });

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  axios.get("/api/landing")
    .then(res => {
      console.log("LANDING API RESPONSE:", res.data);

      const safeStats = {
        totalDevelopers: res.data?.stats?.totalDevelopers ?? 0,
        totalSubmissions: res.data?.stats?.totalSubmissions ?? 0,
        totalVotes: res.data?.stats?.totalVotes ?? 0,
      };

      setStats(safeStats);
      setLeaderboard(res.data?.leaderboard ?? []);
    })
    .catch(err => {
      console.error("Landing API error:", err);
    })
    .finally(() => setLoading(false));
}, []);

  if (loading) {
    return <p style={{ padding: "2rem" }}>Loading platform stats…</p>;
  }
  return (
    <div style={{ padding: "2rem" }}>

      {/* HERO SECTION */}
      <section style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1 style={{ fontSize: "2.8rem", marginBottom: "1rem" }}>
          DDVS Arena
        </h1>
        <p style={{ fontSize: "1.2rem", maxWidth: "700px", margin: "0 auto" }}>
          A decentralized platform where developers prove skill through
          verified contributions and community voting.
        </p>
      </section>

      {/* LIVE STATS */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "4rem",
        }}
      >
        <StatCard label="👥 Developers" value={stats.totalDevelopers} />
        <StatCard label="📦 Submissions" value={stats.totalSubmissions} />
        <StatCard label="⭐ Votes Cast" value={stats.totalVotes} />
      </section>

      {/* HOW IT WORKS */}
      <section style={{ marginBottom: "4rem" }}>
        <h2>How DDVS Works</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.5rem",
            marginTop: "1.5rem",
          }}
        >
          <GameStep
            title="Submit Work"
            text="Submit a GitHub repository or project for verification."
          />
          <GameStep
            title="Community Review"
            text="Other developers vote based on quality and authenticity."
          />
          <GameStep
            title="Earn Reputation"
            text="Votes convert into XP and reputation points."
          />
          <GameStep
            title="Level Up"
            text="Grow your profile with verified progress."
          />
        </div>
      </section>

      {/* LEADERBOARD */}
      <section style={{ marginBottom: "4rem" }}>
        <h2>Top Developers</h2>

        <div style={{ marginTop: "1.5rem" }}>
          {leaderboard.map((user, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "1rem",
                borderBottom: "1px solid #ddd",
              }}
            >
              <strong>
                #{index + 1} {user.username}
              </strong>
              <span>Level {user.level}</span>
              <span>{user.xp} XP</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: "center" }}>
        <button
          disabled
          style={{
            padding: "1rem 2rem",
            fontSize: "1.1rem",
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "not-allowed",
          }}
        >
          Connect Wallet to Get Started
        </button>
        <p style={{ marginTop: "1rem", opacity: 0.7 }}>
          Wallet authentication required to participate
        </p>
      </section>

    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function StatCard({ label, value }) {
  return (
    <div
      style={{
        padding: "1.5rem",
        background: "#f4f4f4",
        borderRadius: "10px",
        textAlign: "center",
      }}
    >
      <h3>{label}</h3>
      <p style={{ fontSize: "1.6rem", marginTop: "0.5rem" }}>{value}</p>
    </div>
  );
}

function GameStep({ title, text }) {
  return (
    <div
      style={{
        padding: "1.5rem",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      <h3>{title}</h3>
      <p style={{ marginTop: "0.5rem" }}>{text}</p>
    </div>
  );
}
