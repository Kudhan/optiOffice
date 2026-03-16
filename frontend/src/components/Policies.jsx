import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

function Policies({ token }) {
  const [policy, setPolicy] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchPolicies();
  }, [token]);

  const fetchPolicies = async () => {
    try {
      const response = await apiClient.get('policies');
      setPolicy(response.data);
    } catch (err) {
      console.error("Failed to fetch policies", err);
    }
  };

  const handleNestedChange = (section, field, value) => {
    setPolicy({
      ...policy,
      [section]: {
        ...policy[section],
        [field]: value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put('policies', policy);
      setIsEditing(false);
      toast.success("Policies updated successfully");
    } catch (err) {
      // apiClient handles toast
    }
  };

  if (!policy) return <div>Loading...</div>;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <>
            <div className="policy-section">
              <h3>Password Policy</h3>
              <div className="policy-grid">
                <div className="policy-item">
                  <label>Min Length</label>
                  <input type="number" value={policy.password_policy.min_length} onChange={(e) => handleNestedChange('password_policy', 'min_length', parseInt(e.target.value))} disabled={!isEditing} />
                </div>
                <div className="policy-item checkbox">
                  <label><input type="checkbox" checked={policy.password_policy.require_uppercase} onChange={(e) => handleNestedChange('password_policy', 'require_uppercase', e.target.checked)} disabled={!isEditing} /> Require Uppercase</label>
                </div>
              </div>
            </div>
            <div className="policy-section">
              <h3>Login Policy</h3>
              <div className="policy-grid">
                <div className="policy-item">
                  <label>Max Attempts</label>
                  <input type="number" value={policy.login_policy.max_attempts} onChange={(e) => handleNestedChange('login_policy', 'max_attempts', parseInt(e.target.value))} disabled={!isEditing} />
                </div>
              </div>
            </div>
          </>
        );
      case 'work':
        return (
          <>
            <div className="policy-section">
              <h3>Attendance Policy</h3>
              <div className="policy-grid">
                <div className="policy-item">
                  <label>Start Time</label>
                  <input type="time" value={policy.attendance_policy.office_start_time} onChange={(e) => handleNestedChange('attendance_policy', 'office_start_time', e.target.value)} disabled={!isEditing} />
                </div>
                <div className="policy-item">
                  <label>Grace Period (Mins)</label>
                  <input type="number" value={policy.attendance_policy.grace_period_minutes} onChange={(e) => handleNestedChange('attendance_policy', 'grace_period_minutes', parseInt(e.target.value))} disabled={!isEditing} />
                </div>
              </div>
            </div>
            <div className="policy-section">
              <h3>Leave Policy</h3>
              <div className="policy-grid">
                <div className="policy-item">
                  <label>Annual Quota</label>
                  <input type="number" value={policy.leave_policy.annual_leave_quota} onChange={(e) => handleNestedChange('leave_policy', 'annual_leave_quota', parseInt(e.target.value))} disabled={!isEditing} />
                </div>
                <div className="policy-item checkbox">
                  <label><input type="checkbox" checked={policy.leave_policy.allow_negative_balance} onChange={(e) => handleNestedChange('leave_policy', 'allow_negative_balance', e.target.checked)} disabled={!isEditing} /> Allow Negative Balance</label>
                </div>
              </div>
            </div>
            <div className="policy-section">
              <h3>Task Policy</h3>
              <div className="policy-grid">
                <div className="policy-item">
                  <label>Who can assign tasks</label>
                  <select value={policy.task_policy.who_can_assign_tasks} onChange={(e) => handleNestedChange('task_policy', 'who_can_assign_tasks', e.target.value)} disabled={!isEditing}>
                    <option value="manager">Managers Only</option>
                    <option value="everyone">Everyone</option>
                  </select>
                </div>
                <div className="policy-item">
                  <label>Daily Task Limit</label>
                  <input type="number" value={policy.task_policy.daily_task_limit} onChange={(e) => handleNestedChange('task_policy', 'daily_task_limit', parseInt(e.target.value))} disabled={!isEditing} />
                </div>
              </div>
            </div>
          </>
        );
      case 'advanced':
        return (
          <>
            <div className="policy-section">
              <h3>Document Policy</h3>
              <div className="policy-grid">
                <div className="policy-item">
                  <label>Max File Size (MB)</label>
                  <input type="number" value={policy.document_policy.max_file_size_mb} onChange={(e) => handleNestedChange('document_policy', 'max_file_size_mb', parseInt(e.target.value))} disabled={!isEditing} />
                </div>
                <div className="policy-item checkbox">
                  <label><input type="checkbox" checked={policy.document_policy.allow_external_sharing} onChange={(e) => handleNestedChange('document_policy', 'allow_external_sharing', e.target.checked)} disabled={!isEditing} /> Allow External Sharing</label>
                </div>
              </div>
            </div>
            <div className="policy-section">
              <h3>Security Policy</h3>
              <div className="policy-grid">
                <div className="policy-item checkbox">
                  <label><input type="checkbox" checked={policy.security_policy.enable_mfa} onChange={(e) => handleNestedChange('security_policy', 'enable_mfa', e.target.checked)} disabled={!isEditing} /> Enable MFA</label>
                </div>
                <div className="policy-item checkbox">
                  <label><input type="checkbox" checked={policy.security_policy.ip_whitelisting_enabled} onChange={(e) => handleNestedChange('security_policy', 'ip_whitelisting_enabled', e.target.checked)} disabled={!isEditing} /> IP Whitelisting</label>
                </div>
              </div>
            </div>
            <div className="policy-section">
              <h3>Customization</h3>
              <div className="policy-grid">
                <div className="policy-item">
                  <label>Company Name</label>
                  <input value={policy.customization_policy.company_name} onChange={(e) => handleNestedChange('customization_policy', 'company_name', e.target.value)} disabled={!isEditing} />
                </div>
                <div className="policy-item">
                  <label>Primary Color</label>
                  <input type="color" value={policy.customization_policy.primary_color} onChange={(e) => handleNestedChange('customization_policy', 'primary_color', e.target.value)} disabled={!isEditing} />
                </div>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="policies-container">
      <div className="header-actions">
        <h2>System Policies</h2>
        <button className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Edit Policies'}
        </button>
      </div>

      <div className="policy-tabs">
        <button className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>General</button>
        <button className={`tab-btn ${activeTab === 'work' ? 'active' : ''}`} onClick={() => setActiveTab('work')}>Work & Attendance</button>
        <button className={`tab-btn ${activeTab === 'advanced' ? 'active' : ''}`} onClick={() => setActiveTab('advanced')}>Advanced & Security</button>
      </div>

      <form onSubmit={handleSubmit} className={isEditing ? 'editing' : 'view-only'}>
        {renderTabContent()}
        {isEditing && <button type="submit" className="save-btn">Save Policies</button>}
      </form>
    </div>
  );
}

export default Policies;
