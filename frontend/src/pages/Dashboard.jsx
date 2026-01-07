import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../lib/axios";
import "./Dashboard.css"; // Ensure you create this CSS file

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Initialize form with current user data
  const [formData, setFormData] = useState({
    username: user?.username || "",
    developer_type: user?.developer_type || "",
    bio: user?.bio || "",
    skills: user?.skills || "",
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put("/user/profile", formData);
      setUser(res.data.user); // Update global auth state
      setIsEditing(false);
      alert("Profile updated!");
    } catch (err) {
      alert("Error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="profile-header-card">
        <div className="profile-avatar-section">
          <div className="avatar-circle">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="user-name">{user?.username || "Anonymous User"}</h1>
            <p className="user-wallet">{user?.wallet_address}</p>
            {user?.developer_type && <span className="dev-badge">{user.developer_type}</span>}
          </div>
        </div>
        
        <button className="edit-toggle-btn" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {isEditing ? (
        <form className="profile-edit-form" onSubmit={handleUpdate}>
          <div className="form-row">
            <div className="input-group">
              <label>Username / Display Name</label>
              <input 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                placeholder="How should we call you?"
              />
            </div>
            <div className="input-group">
              <label>What do you do?</label>
              <input 
                value={formData.developer_type} 
                onChange={(e) => setFormData({...formData, developer_type: e.target.value})} 
                placeholder="e.g. Machine Learning Engineer"
              />
            </div>
          </div>

          <div className="input-group">
            <label>Bio (Short description about you)</label>
            <textarea 
              rows="3"
              value={formData.bio} 
              onChange={(e) => setFormData({...formData, bio: e.target.value})} 
              placeholder="Tell us about your journey..."
            />
          </div>

          <div className="input-group">
            <label>Developer Stack / Skills (Known things for devs)</label>
            <textarea 
              rows="3"
              value={formData.skills} 
              onChange={(e) => setFormData({...formData, skills: e.target.value})} 
              placeholder="React, PyTorch, Solidity, AWS..."
            />
          </div>

          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? "Saving..." : "Save Profile Details"}
          </button>
        </form>
      ) : (
        <div className="profile-details-display">
          <div className="detail-box">
            <h4>About</h4>
            <p>{user?.bio || "No bio added yet. Click edit to add one!"}</p>
          </div>
          <div className="detail-box">
            <h4>Tech Stack & Skills</h4>
            <p>{user?.skills || "No skills listed yet."}</p>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="stats-container">
        <div className="stat-card">🏆 Level: 3</div>
        <div className="stat-card">⭐ XP: {user?.xp}</div>
        <div className="stat-card">👥 Followers: 12</div>
      </div>

      {/* Your Existing "My Submissions" Section goes here */}
    </div>
  );
}