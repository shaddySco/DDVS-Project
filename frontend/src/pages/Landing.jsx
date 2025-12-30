export default function Landing() {
  // 🔹 Mock data (DB-ready)
  const stats = {
    totalDevelopers: 1240,
    totalSubmissions: 386,
    totalVotes: 8421,
  };

  const leaderboard = [
    { username: "Alice", level: 6, xp: 1420 },
    { username: "Bob", level: 5, xp: 1180 },
    { username: "Charlie", level: 4, xp: 940 },
  ];

  return (
    <div style={{ padding: "2rem" }}>

      {/* HERO SECTION */}
      <section style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1 style={{ fontSize: "2.8rem", marginBottom: "1rem" }}>
          🎮 DDVS Arena
        </h1>
        <p style={{ fontSize: "1.2rem", maxWidth: "700px", margin: "0 auto" }}>
          A decentralized arena where developers compete, collaborate,
          and earn reputation through community voting.
        </p>
      </section>

      {/* LIVE STATS BAR */}
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
        <h2>🕹️ How the Game Works</h2>

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
            text="Upload a project or GitHub repository to the arena."
          />
          <GameStep
            title="Community Votes"
            text="Other developers spend votes on quality work."
          />
          <GameStep
            title="Earn XP"
            text="Votes convert into XP. No votes, no XP."
          />
          <GameStep
            title="Level Up"
            text="Gain levels, prestige, and on-chain badges."
          />
        </div>
      </section>

      {/* LEADERBOARD */}
      <section style={{ marginBottom: "4rem" }}>
        <h2>🏆 Top Players</h2>

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

      {/* CALL TO ACTION */}
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
          🔐 Connect Wallet to Enter Arena
        </button>
        <p style={{ marginTop: "1rem", opacity: 0.7 }}>
          Wallet connection coming in Phase 4
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
