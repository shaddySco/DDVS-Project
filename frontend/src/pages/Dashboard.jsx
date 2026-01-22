import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../lib/axios";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: "",
    developer_type: "",
    bio: "",
    skills: "",
  });

  // 1. Fetch fresh profile data (XP, Level, etc.)
  const fetchProfile = useCallback(async () => {
    try {
      // Use /auth/me to match your AuthContext restore logic
      const res = await axios.get("/auth/me");
      setUser(res.data);
      
      // Update form fields only if not currently editing
      if (!isEditing) {
        setFormData({
          username: res.data.username || "",
          developer_type: res.data.developer_type || "",
          bio: res.data.bio || "",
          skills: res.data.skills || "",
        });
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    }
  }, [setUser, isEditing]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 2. Handle Profile Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put("/user/profile", formData);
      // Backend returns { user: {...} }
      setUser(res.data.user); 
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* HEADER SECTION */}
      <div className="profile-header-card">
        <div className="profile-avatar-section">
          <div className="avatar-circle">
            {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="profile-identity">
            <h1 className="user-name">{user?.username || "Anonymous User"}</h1>
            <p className="user-wallet">{user?.wallet_address}</p>
            {user?.developer_type && (
              <span className="dev-badge">🚀 {user.developer_type}</span>
            )}
          </div>
        </div>
        
        <button 
          className={`edit-toggle-btn ${isEditing ? "cancel" : ""}`} 
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* CONTENT SECTION: FORM VS DISPLAY */}
      {isEditing ? (
        <form className="profile-edit-form" onSubmit={handleUpdate}>
          <div className="form-grid">
            <div className="input-group">
              <label>Display Name</label>
              <input 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                placeholder="e.g. Satoshi_Nakamoto"
              />
            </div>
            <div className="input-group">
              <label>Role / Developer Type</label>
              <input 
                value={formData.developer_type} 
                onChange={(e) => setFormData({...formData, developer_type: e.target.value})} 
                placeholder="e.g. Fullstack Web3 Dev"
              />
            </div>
          </div>

          <div className="input-group">
            <label>Bio</label>
            <textarea 
              rows="3"
              value={formData.bio} 
              onChange={(e) => setFormData({...formData, bio: e.target.value})} 
              placeholder="Tell the community about your work..."
            />
          </div>

          <div className="input-group">
            <label>Tech Stack (Comma separated)</label>
            <textarea 
              rows="2"
              value={formData.skills} 
              onChange={(e) => setFormData({...formData, skills: e.target.value})} 
              placeholder="Solidity, React, Node.js..."
            />
          </div>

          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? "Saving Changes..." : "Update Profile"}
          </button>
        </form>
      ) : (
        <div className="profile-details-display">
          <div className="detail-box">
            <h4>📖 About</h4>
            <p>{user?.bio || "No bio added yet. Click edit to add your story!"}</p>
          </div>
          <div className="detail-box">
            <h4>🛠️ Tech Stack</h4>
            <div className="skills-tags">
              {user?.skills ? user.skills.split(',').map(s => (
                <span key={s} className="skill-tag">{s.trim()}</span>
              )) : "No skills listed."}
            </div>
          </div>
        </div>
      )}

      {/* STATS SECTION: DYNAMIC XP & LEVEL */}
      <div className="stats-container">
        <div className="stat-card">
           <div className="stat-value">🏆 {user?.level || 1}</div>
           <div className="stat-label">Current Level</div>
        </div>
        <div className="stat-card">
           <div className="stat-value">⭐ {user?.xp || 0}</div>
           <div className="stat-label">Total XP</div>
           {/* Visual XP bar could go here */}
        </div>
        <div className="stat-card">
           <div className="stat-value">👥 {user?.followers_count || 0}</div>
           <div className="stat-label">Followers</div>
        </div>
        <div className="stat-card">
           <div className="stat-value">➡️{user?.following_count || 0}</div>
           <div className="stat-label">Following</div>
        </div>
      </div>
    </div>                
  );
}