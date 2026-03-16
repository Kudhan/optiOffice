import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

function Roles({ token }) {
  const [roles, setRoles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] });
  const availablePermissions = ['create_user', 'delete_user', 'view_reports', 'manage_billing', 'approve_leave'];

  useEffect(() => {
    fetchRoles();
  }, [token]);

  const fetchRoles = async () => {
    try {
      const response = await apiClient.get('roles');
      setRoles(response.data);
    } catch (err) {
      console.error("Failed to fetch roles", err);
    }
  };

  const handlePermissionChange = (perm) => {
    if (newRole.permissions.includes(perm)) {
      setNewRole({ ...newRole, permissions: newRole.permissions.filter(p => p !== perm) });
    } else {
      setNewRole({ ...newRole, permissions: [...newRole.permissions, perm] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('roles', newRole);
      fetchRoles();
      setShowForm(false);
      setNewRole({ name: '', description: '', permissions: [] });
      toast.success("Role created successfully");
    } catch (err) {
      // apiClient handles toast
    }
  };

  return (
    <div className="roles-container">
      <div className="header-actions">
        <h2>Role Management</h2>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create Role'}
        </button>
      </div>

      {showForm && (
        <form className="role-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input placeholder="Role Name" value={newRole.name} onChange={(e) => setNewRole({...newRole, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <input placeholder="Description" value={newRole.description} onChange={(e) => setNewRole({...newRole, description: e.target.value})} />
          </div>
          <div className="permissions-group">
            <h4>Permissions:</h4>
            {availablePermissions.map(perm => (
              <label key={perm} className="perm-label">
                <input
                  type="checkbox"
                  checked={newRole.permissions.includes(perm)}
                  onChange={() => handlePermissionChange(perm)}
                />
                {perm.replace('_', ' ')}
              </label>
            ))}
          </div>
          <button type="submit" className="submit-btn">Save Role</button>
        </form>
      )}

      <div className="roles-grid">
        {roles.map(role => (
          <div key={role.id} className="role-card">
            <h3>{role.name}</h3>
            <p>{role.description}</p>
            <div className="perm-tags">
              {role.permissions.map(p => (
                <span key={p} className="perm-tag">{p.replace('_', ' ')}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Roles;
