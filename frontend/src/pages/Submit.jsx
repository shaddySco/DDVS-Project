import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Submit.css"; // Import the CSS file we just created

export default function Submit() {
  const { walletAddress } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    category: "Machine Learning", // New Field added
    description: "",
    repository_url: "",
    media: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    "Machine Learning",
    "Web Development",
    "Blockchain / Web3",
    "Cybersecurity",
    "Mobile Apps",
    "AI / Data Science",
    "Other"
  ];

  useEffect(() => {
    if (!form.media) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(form.media);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [form.media]);

  if (!walletAddress) {
    return (
      <div className="submit-container" style={{textAlign: 'center', marginTop: '100px'}}>
        <h2>Please connect your wallet to submit a project.</h2>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v) data.append(k, v);
    });

    try {
      await axios.post("/submissions", data);
      navigate("/community");
    } catch (err) {
      setError("Submission failed. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-container">
      <div className="submit-header">
        <h1>Submit your <span>Masterpiece</span></h1>
        <p>Share your verified work with the DDVS ecosystem.</p>
      </div>

      <form onSubmit={handleSubmit} className="submit-card">
        {/* Left Side: Text Details */}
        <div className="submit-form-section">
          <div className="form-group">
            <label>Project Title</label>
            <input name="title" placeholder="e.g. Neural Network Optimizer" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Project Category</label>
            <select name="category" onChange={handleChange}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Repository URL</label>
            <input name="repository_url" type="url" placeholder="https://github.com/user/repo" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" rows="5" placeholder="What makes this project special?" onChange={handleChange} required />
          </div>
        </div>

        {/* Right Side: Media & Button */}
        <div className="submit-media-section">
          <div className="form-group">
            <label>Project Thumbnail</label>
            <div className="upload-box">
              <input 
                type="file" 
                name="media" 
                accept="image/*" 
                onChange={handleChange} 
                style={{opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer'}} 
              />
              {preview ? <img src={preview} alt="Preview" /> : <span>Click to upload image</span>}
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button className="submit-btn" disabled={loading}>
            {loading ? "PUBLISHING..." : "PUBLISH PROJECT"}
          </button>
        </div>
      </form>
    </div>
  );
}