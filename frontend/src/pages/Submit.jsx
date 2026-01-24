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
    if (form.media) {
      formData.append("media", form.media);
    }

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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-panel p-8 text-center max-w-md">
           <h2 className="text-2xl font-bold text-white mb-4">Access Restricted</h2>
           <p className="text-gray-400 mb-6">Please connect your wallet to submit a project to the decentralized registry.</p>
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
                accept="image/*,video/*" 
                onChange={handleChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {preview ? (
                form.media?.type.startsWith('video/') ? (
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
              <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-500 text-sm flex items-start gap-2">
                <span>⚠️</span>
                <span>{error}</span>
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