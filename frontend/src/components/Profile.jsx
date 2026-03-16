import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Profile({ token }) {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setFormData(response.data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePreferenceChange = (e) => {
      setFormData({
          ...formData,
          preferences: {
              ...formData.preferences,
              [e.target.name]: e.target.value
          }
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/users/me`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditing(false);
      fetchProfile();
      alert("Profile updated successfully");
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-large">
            {user.full_name.charAt(0)}
        </div>
        <div className="profile-title">
            <h2>{user.full_name}</h2>
            <span className="profile-role">{user.designation || user.role}</span>
        </div>
        <button className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="profile-content">
        {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-section">
                    <h3>Personal Information</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input name="full_name" value={formData.full_name} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input name="email" value={formData.email} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input name="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="+1 234 567 890" />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Preferences</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Language</label>
                            <select name="language" value={formData.preferences?.language} onChange={handlePreferenceChange}>
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Timezone</label>
                            <select name="timezone" value={formData.preferences?.timezone} onChange={handlePreferenceChange}>
                                <option value="UTC">UTC</option>
                                <option value="EST">EST</option>
                                <option value="PST">PST</option>
                            </select>
                        </div>
                    </div>
                </div>
                <button type="submit" className="save-btn">Save Changes</button>
            </form>
        ) : (
            <div className="profile-details">
                <div className="detail-section">
                    <h3>Contact Info</h3>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Phone:</strong> {user.phone || 'Not set'}</p>
                </div>
                <div className="detail-section">
                    <h3>Work Info</h3>
                    <p><strong>Department:</strong> {user.department || 'Not assigned'}</p>
                    <p><strong>Manager:</strong> {user.manager_id || 'None'}</p>
                    <p><strong>Status:</strong> <span className={`status-badge ${user.status?.toLowerCase()}`}>{user.status}</span></p>
                </div>
                <div className="detail-section">
                    <h3>Preferences</h3>
                    <p><strong>Language:</strong> {user.preferences?.language === 'en' ? 'English' : user.preferences?.language}</p>
                    <p><strong>Timezone:</strong> {user.preferences?.timezone}</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
