export default function Dashboard() {
  const user = {
    username: "You",
    level: 3,
    xp: 620,
    votesRemaining: 5,
    followers: 12,
    following: 8,
    submissions: [
      { id: 1, title: "React Voting DApp" },
      { id: 2, title: "Node Auth API" },
    ],
  };

  return (
    <div>
      <h1>📊 Dashboard</h1>

      <section style={{ marginTop: "1.5rem" }}>
        <p>👤 {user.username}</p>
        <p>🏅 Level {user.level}</p>
        <p>⭐ XP: {user.xp}</p>
        <p>🗳️ Votes Remaining Today: {user.votesRemaining}</p>
        <p>👥 Followers: {user.followers}</p>
        <p>➡️ Following: {user.following}</p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h3>📦 My Submissions</h3>
        <ul>
          {user.submissions.map((sub) => (
            <li key={sub.id}>{sub.title}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
