import { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Submit.css";

// Import the auto-generated files from your deployment script
import contractAddresses from "../contracts/contract-address.json";
import DDVSSubmissionsABI from "../contracts/DDVSSubmissions.json";

const CONTRACT_ADDRESS = contractAddresses.DDVSSubmissions;
const CONTRACT_ABI = DDVSSubmissionsABI.abi;

export default function Submit() {
  const { walletAddress, signer } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    category: "Machine Learning",
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

  // Handle Image Preview
  useEffect(() => {
    if (!form.media) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(form.media);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [form.media]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, [name]: files[0] }); // Store the actual File object
    } else {
      setForm({ ...form, [name]: value });
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  console.log("Step 1: Submit Started");

  try {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("category", form.category);
    formData.append("description", form.description);
    formData.append("repository_url", form.repository_url);
    formData.append("media", form.media);

    console.log("Step 2: Sending to Laravel Backend...");
    const res = await axios.post("/projects", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const projectId = res.data.id;
    console.log("Step 3: Backend Success! Project ID:", projectId);

    if (!signer) {
      throw new Error("Wallet not connected correctly. Please reconnect.");
    }

    console.log("Step 4: Opening MetaMask for Blockchain...");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    // Check if CONTRACT_ADDRESS is correct
    console.log("Using Contract Address:", CONTRACT_ADDRESS);

    const tx = await contract.registerProject(projectId, form.repository_url);
    console.log("Step 5: Transaction Sent! Hash:", tx.hash);

    await tx.wait();
    console.log("Step 6: Transaction Confirmed on Blockchain!");

    navigate("/dashboard");
  } catch (err) {
    console.error("DEBUG ERROR:", err); // Look for this in the Console!
    
    if (err.response && err.response.status === 422) {
      setError("Backend Validation Failed: Check your fields.");
    } else if (err.code === "ACTION_REJECTED") {
      setError("User rejected the transaction in MetaMask.");
    } else {
      setError(err.message || "An unexpected error occurred.");
    }
  } finally {
    setLoading(false);
  }
};

  if (!walletAddress) {
    return (
      <div className="submit-container" style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>Please connect your wallet to submit a project.</h2>
      </div>
    );
  }

  return (
    <div className="submit-container">
      <div className="submit-header">
        <h1>Submit your <span>Masterpiece</span></h1>
        <p>Your project will be stored in our database and verified on-chain.</p>
      </div>

      <form onSubmit={handleSubmit} className="submit-card">
        <div className="submit-form-section">
          <div className="form-group">
            <label>Project Title</label>
            <input 
              name="title" 
              placeholder="e.g. Neural Network Optimizer" 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Project Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Repository URL</label>
            <input 
              name="repository_url" 
              type="url" 
              placeholder="https://github.com/user/repo" 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description" 
              rows="5" 
              placeholder="What makes this project special?" 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>

        <div className="submit-media-section">
          <div className="form-group">
            <label>Project Thumbnail</label>
            <div className="upload-box">
              <input 
                type="file" 
                name="media" 
                accept="image/*" 
                onChange={handleChange} 
                style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }} 
              />
              {preview ? <img src={preview} alt="Preview" /> : <span>Click to upload image</span>}
            </div>
          </div>

          {error && (
            <div className="error-msg" style={{ 
              color: '#ff4d4d', 
              backgroundColor: '#ffe6e6', 
              padding: '10px', 
              borderRadius: '5px',
              marginBottom: '10px',
              fontSize: '14px' 
            }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "PROCESSING (Check Wallet)..." : "PUBLISH PROJECT"}
          </button>
        </div>
      </form>
    </div>
  );
}