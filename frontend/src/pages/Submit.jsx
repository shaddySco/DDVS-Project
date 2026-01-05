import { useState } from "react";

export default function Submit() {
  const [title, setTitle] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title,
          repository_url: repositoryUrl,
          description,
        }),
      });

      if (!res.ok) {
        throw new Error("Submission failed");
      }

      alert("Submission created successfully");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>🔥 Submit Your Work</h1>

      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: "500px", marginTop: "2rem" }}
      >
        <label>Project Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "1rem" }}
        />

        <label>Repository / Project Link</label>
        <input
          value={repositoryUrl}
          onChange={(e) => setRepositoryUrl(e.target.value)}
          required
          placeholder="https://github.com/username/project"
          style={{ width: "100%", marginBottom: "1rem" }}
        />

        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "1rem" }}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
