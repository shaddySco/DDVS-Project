import { useParams } from "react-router-dom";

export default function Profile() {
  const { wallet } = useParams();

  return (
    <div>
      <h1>👤 Developer Profile</h1>
      <p>Wallet: {wallet}</p>

      <section style={{ marginTop: "1.5rem" }}>
        <p>🏅 Level 4</p>
        <p>⭐ Total XP: 940</p>
        <p>📦 Submissions: 6</p>
        <p>👥 Followers: 18</p>
        <p>➡️ Following: 11</p>
      </section>

      <button disabled style={{ marginTop: "1rem" }}>
        ➕ Follow Developer
      </button>
    </div>
  );
}
