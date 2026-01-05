export default function Dashboard() {
  const user = {
    username: "You",
    level: 3,
    xp: 620,
    votesRemaining: 5,
    followers: 12,
    following: 8,
    submissions: [
      { id: 1, title: "React Voting DApp", ownership_status: "verified" },
      { id: 2, title: "Node Auth API", ownership_status: "unverified" },
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

        {user.submissions.map((submission) => (
          <div
            key={submission.id}
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <strong>{submission.title}</strong>

            {submission.ownership_status === "verified" ? (
              <>
                <p>✅ Verified</p>

                <p>
                  Public Verification Link:
                  <br />
                  <a
                    href={`/verify/${submission.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {window.location.origin}/verify/{submission.id}
                  </a>
                </p>

                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${window.location.origin}/verify/${submission.id}`
                    )
                  }
                >
                  Copy Link
                </button>
              </>
            ) : (
              <p>⏳ Not yet verified</p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
