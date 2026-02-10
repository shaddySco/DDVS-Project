import { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

// Import the auto-generated files from your deployment script
import contractAddresses from "../contracts/contract-address.json";
import DDVSSubmissionsABI from "../contracts/DDVSSubmissions.json";

const CONTRACT_ADDRESS = contractAddresses.DDVSSubmissions;
const CONTRACT_ABI = DDVSSubmissionsABI.abi;

export default function Submit() {
  const { walletAddress, signer, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    category: "Machine Learning",
    description: "",
    repository_url: "",
    github_username: user?.github_username || "",
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

    // Check authentication before submitting
    const token = localStorage.getItem('ddvs_token');
    if (!token) {
      setError("Authentication required. Please connect your wallet first.");
      setLoading(false);
      return;
    }

    // Debug: Log token presence (first 20 chars only for security)
    console.log("🔑 Token found:", token.substring(0, 20) + "...");

    try {

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("repository_url", form.repository_url);
      if (form.github_username) {
        formData.append("github_username", form.github_username);
      }
      if (form.media) {
        formData.append("media", form.media);
      }

      console.log("Step 2: Sending to Laravel Backend...");
      console.log("📤 Form data:", {
        title: form.title,
        category: form.category,
        description: form.description.substring(0, 50) + "...",
        repository_url: form.repository_url,
        hasMedia: !!form.media
      });

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
      console.log("Saving to blockchain:", {
        id: projectId,
        title: form.title,
        category: form.category,
        repo: form.repository_url,
        description: form.description
      });

      const tx = await contract.registerProject(
        projectId, 
        form.title, 
        form.category, 
        form.repository_url, 
        form.description
      );
      console.log("Step 5: Transaction Sent! Hash:", tx.hash);

      await tx.wait();
      console.log("Step 6: Transaction Confirmed on Blockchain!");

      // ✅ Update backend with the transaction hash
      await axios.post(`/projects/${projectId}/verify`, { tx_hash: tx.hash });

      navigate("/dashboard");
    } catch (err) {
      console.error("DEBUG ERROR:", err); // Look for this in the Console!

      let errorMessage = "An unexpected error occurred.";

      if (err.response) {
        const { status, data } = err.response;
        
        if (status === 401) {
          errorMessage = "Authentication failed. Please reconnect your wallet and try again.\n\nYour session may have expired. Click 'Connect Wallet' in the navbar to refresh your authentication.";
        } else if (status === 422) {
          // Handle Laravel validation errors
          if (data.errors) {
            // Multiple validation errors
            const validationErrors = Object.entries(data.errors)
              .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
              .join('\n');
            errorMessage = `Validation Error:\n${validationErrors}`;
          } else if (data.details) {
            // Specific error details from backend
            errorMessage = `Validation Error: ${data.details}`;
          } else if (data.message) {
            errorMessage = data.message;
          } else {
            errorMessage = "Validation failed. Please check all required fields and ensure the repository URL is valid and accessible.";
          }
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.details) {
          errorMessage = data.details;
        }
      } else if (err.code === "ACTION_REJECTED") {
        errorMessage = "User rejected the transaction in MetaMask.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);

    } finally {
      setLoading(false);
    }
  };

  // Check for both wallet connection AND valid auth token
  const token = localStorage.getItem('ddvs_token');
  if (!walletAddress || !token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-panel p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Access Restricted</h2>
          <p className="text-gray-400 mb-6">
            {!walletAddress 
              ? "Please connect your wallet to submit a project to the decentralized registry."
              : "Your session has expired. Please reconnect your wallet to continue."}
          </p>
          {/* Wallet connection is handled in navbar, so we just show message */}
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          Submit your <span className="text-neon-purple text-glow">Masterpiece</span>
        </h1>
        <p className="text-gray-400">Your project will be stored in our database and verified on-chain.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: FORM INPUTS */}
        <div className="lg:col-span-2 glass-panel p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Project Title</label>
              <input
                name="title"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue focus:outline-none transition-all"
                placeholder="e.g. Neural Network Optimizer"
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-blue focus:outline-none appearance-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Repository URL</label>
                <input
                  name="repository_url"
                  type="url"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-blue focus:outline-none"
                  placeholder="https://github.com/..."
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">GitHub Username (for contribution verification)</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500">@</span>
                <input
                  name="github_username"
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-4 py-3 text-white focus:border-neon-blue focus:outline-none transition-all"
                  value={form.github_username}
                  onChange={handleChange}
                  placeholder="yourusername"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-2">Providing your GitHub username allows us to verify your specific contributions to this repository.</p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                name="description"
                rows="6"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-blue focus:outline-none resize-none"
                placeholder="What makes this project special?"
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MEDIA UPLOAD & SUBMIT */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-gray-300 mb-4">Project Visual (Optional)</h3>
            <div className="relative w-full aspect-video rounded-lg border-2 border-dashed border-white/20 bg-black/20 hover:border-neon-purple hover:bg-black/30 transition-all flex items-center justify-center overflow-hidden group">
              <input
                type="file"
                name="media"
                accept="image/*,video/*,.mkv,.mov,.avi,.wmv,.m4v,.flv,.webp"
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {preview ? (
                (form.media?.type.startsWith('video/') || /\.(mp4|webm|ogg|mov|avi|mkv|wmv|m4v|flv)$/i.test(form.media?.name)) ? (
                  <video src={preview} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                )
              ) : (
                <div className="text-center p-4">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📸 / 🎥</div>
                  <span className="text-sm text-gray-400">Add Image or Video</span>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel p-6">
            {error && (
              <div className="mb-4 p-4 rounded bg-red-500/10 border border-red-500/30 text-red-500 text-sm flex items-start gap-2">
                <span className="flex-shrink-0 text-lg">⚠️</span>
                <div className="flex-grow">
                  <p className="font-semibold mb-1">Submission Error</p>
                  <p className="text-red-400 whitespace-pre-wrap break-words">{error}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full py-4 text-lg shadow-neon-blue"
              disabled={loading}
            >
              {loading ? "Processing..." : "🚀 Publish Project"}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-3">
              Requires MetaMask signature
            </p>
          </div>
        </div>

      </form>
    </div>
  );
}
