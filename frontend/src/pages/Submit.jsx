export default function Submit() {
  return (
    <div>
      <h1>🔥 Submit Your Work</h1>

      <form style={{ maxWidth: "500px", marginTop: "2rem" }}>
        <label>Project Title</label>
        <input style={{ width: "100%", marginBottom: "1rem" }} />

        <label>Repository / Project Link</label>
        <input
          placeholder="https://github.com/username/project"
          style={{ width: "100%", marginBottom: "1rem" }}
        />

        <label>Description</label>
        <textarea
          placeholder="Explain what this project does..."
          style={{ width: "100%", marginBottom: "1rem" }}
        />

        <label>Category</label>
        <select style={{ width: "100%", marginBottom: "1rem" }}>
          <option>Frontend</option>
          <option>Backend</option>
          <option>Blockchain</option>
          <option>Mobile</option>
          <option>AI / ML</option>
        </select>

        <label>Project Image (optional)</label>
        <input
          type="file"
          accept="image/*"
          style={{ marginBottom: "1rem" }}
        />

        <button disabled>Submit (Coming Soon)</button>
      </form>
    </div>
  );
}
