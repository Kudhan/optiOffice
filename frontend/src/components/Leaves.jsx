import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Leaves({ token }) {
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newLeave, setNewLeave] = useState({
    type: 'Annual', start_date: '', end_date: '', reason: ''
  });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchLeaves();
    checkRole();
  }, [token]);

  const checkRole = async () => {
    try {
        const userRes = await axios.get(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setIsAdmin(['admin', 'manager'].includes(userRes.data.role));
    } catch (e) {}
  };

  const fetchLeaves = async () => {
    try {
      const response = await axios.get(`${API_URL}/leaves`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaves(response.data);
    } catch (err) {
      console.error("Failed to fetch leaves", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/leaves`, newLeave, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLeaves();
      setShowForm(false);
      setNewLeave({ type: 'Annual', start_date: '', end_date: '', reason: '' });
    } catch (err) {
      alert("Failed to apply leave");
    }
  };

  const handleAction = async (id, action) => {
    try {
      await axios.put(`${API_URL}/leaves/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLeaves();
    } catch (err) {
      alert(`Failed to ${action} leave`);
    }
  };

  return (
    <div className="leaves-container">
      <div className="header-actions">
        <h2>Leave Management</h2>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Apply Leave'}
        </button>
      </div>

      {showForm && (
        <form className="leave-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <select name="type" value={newLeave.type} onChange={(e) => setNewLeave({...newLeave, type: e.target.value})}>
              <option value="Annual">Annual Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Casual">Casual Leave</option>
            </select>
            <input type="date" value={newLeave.start_date} onChange={(e) => setNewLeave({...newLeave, start_date: e.target.value})} required />
            <input type="date" value={newLeave.end_date} onChange={(e) => setNewLeave({...newLeave, end_date: e.target.value})} required />
            <input placeholder="Reason" value={newLeave.reason} onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})} />
          </div>
          <button type="submit" className="submit-btn">Submit Request</button>
        </form>
      )}

      <div className="leaves-list">
        {leaves.map(leave => (
          <div key={leave.id} className="leave-card">
            <div className="leave-info">
              <div className="leave-header">
                <span className="leave-type">{leave.type}</span>
                <span className={`status-badge ${leave.status.toLowerCase()}`}>{leave.status}</span>
              </div>
              <div className="leave-dates">
                {leave.start_date} to {leave.end_date}
              </div>
              <div className="leave-reason">{leave.reason}</div>
              {isAdmin && <div className="applicant">Applied by: {leave.username}</div>}
            </div>
            {isAdmin && leave.status === 'Pending' && (
              <div className="leave-actions">
                <button className="approve-btn" onClick={() => handleAction(leave.id, 'approve')}>Approve</button>
                <button className="reject-btn" onClick={() => handleAction(leave.id, 'reject')}>Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leaves;
