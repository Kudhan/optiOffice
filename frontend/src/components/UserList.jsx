import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function UserList({ token, role }) {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '', password: '', full_name: '', email: '', role: 'employee',
    designation: '', department: '', manager_id: ''
  });
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`${API_URL}/users/${editingUser}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/users`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowForm(false);
      setEditingUser(null);
      setFormData({
        username: '', password: '', full_name: '', email: '', role: 'employee',
        designation: '', department: '', manager_id: ''
      });
      fetchUsers();
    } catch (err) {
      alert("Operation failed: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user.username);
    setFormData({
      username: user.username,
      password: '', // Password not editable directly here for simplicity or keep empty to not change
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      designation: user.designation || '',
      department: user.department || '',
      manager_id: user.manager_id || ''
    });
    setShowForm(true);
  };

  const handleResign = async (username) => {
    if (window.confirm(`Are you sure you want to mark ${username} as resigned?`)) {
      try {
        await axios.delete(`${API_URL}/users/${username}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchUsers();
      } catch (err) {
        alert("Failed to resign user");
      }
    }
  };

  return (
    <div className="user-list-container">
      <div className="header-actions">
        <h2>{role === 'admin' ? 'User Management' : 'My Team'}</h2>
        <button className="add-btn" onClick={() => {
          setEditingUser(null);
          setFormData({
            username: '', password: '', full_name: '', email: '', role: 'employee',
            designation: '', department: '', manager_id: ''
          });
          setShowForm(!showForm);
        }}>
          {showForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {showForm && (
        <form className="user-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <input name="username" placeholder="Username" value={formData.username} onChange={handleInputChange} required disabled={!!editingUser} />
            {!editingUser && <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required />}
            <input name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleInputChange} required />
            <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleInputChange} />
            <select name="role" value={formData.role} onChange={handleInputChange}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <input name="designation" placeholder="Designation" value={formData.designation} onChange={handleInputChange} />
            <input name="department" placeholder="Department" value={formData.department} onChange={handleInputChange} />
            <input name="manager_id" placeholder="Manager Username" value={formData.manager_id} onChange={handleInputChange} />
          </div>
          <button type="submit" className="submit-btn">{editingUser ? 'Update' : 'Create'}</button>
        </form>
      )}

      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Designation</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.username} className={user.status === 'Resigned' ? 'resigned' : ''}>
              <td>
                <div className="user-cell">
                  <span className="name">{user.full_name}</span>
                  <span className="email">{user.email}</span>
                </div>
              </td>
              <td>{user.role}</td>
              <td>{user.designation}</td>
              <td>
                <span className={`status-badge ${user.status?.toLowerCase()}`}>{user.status}</span>
              </td>
              <td>
                <button onClick={() => handleEdit(user)} className="action-btn edit">Edit</button>
                {role === 'admin' && user.status !== 'Resigned' && (
                  <button onClick={() => handleResign(user.username)} className="action-btn delete">Resign</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserList;
