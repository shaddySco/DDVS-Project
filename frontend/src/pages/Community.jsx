import { Link } from "react-router-dom";

export default function Community() {
  const projects = [
    {
      id: 1,
      title: "React Voting DApp",
      author: "Alice",
      level: 6,
      votes: 124,
      tags: ["React", "Web3"],
      wallet: "0xABC",
    },
    {
      id: 2,
      title: "Rust API Engine",
      author: "Bob",
      level: 4,
      votes: 87,
      tags: ["Rust", "Backend"],
      wallet: "0xDEF",
    },
  ];

  return (
    <div>
      <h1>🌍 Community Feed</h1>

      <div style={{ marginTop: "2rem" }}>
        {projects.map((project) => (
          <div
            key={project.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            {/* Project title links to project page */}
            <h3>
              <Link to={`/project/${project.id}`}>
                {project.title}
              </Link>
            </h3>

            {/* Author links to profile */}
            <p>
              👤{" "}
              <Link to={`/profile/${project.wallet}`}>
                {project.author}
              </Link>{" "}
              · Level {project.level}
            </p>

            <p>⭐ {project.votes} Votes</p>

            <div>
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "0.8rem",
                    padding: "0.2rem 0.5rem",
                    marginRight: "0.5rem",
                    background: "#eee",
                    borderRadius: "4px",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
