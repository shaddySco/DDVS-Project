import { useParams, Link } from "react-router-dom";

export default function Project() {
  const { id } = useParams();

  const project = {
    title: "React Voting DApp",
    author: "Alice",
    wallet: "0xABC",
    description:
      "A decentralized voting system for developer verification.",
  };

  return (
    <div>
      <h1>📦 {project.title}</h1>

      <p>
        By{" "}
        <Link to={`/profile/${project.wallet}`}>
          {project.author}
        </Link>
      </p>

      <section style={{ marginTop: "1.5rem" }}>
        <h3>📄 Description</h3>
        <p>{project.description}</p>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h3>💻 Code Preview</h3>
        <div style={{ background: "#f4f4f4", padding: "1rem" }}>
          <code>// Code preview coming soon</code>
        </div>
      </section>

      <button disabled style={{ marginTop: "1rem" }}>
        ⭐ Boost Project
      </button>
    </div>
  );
}
