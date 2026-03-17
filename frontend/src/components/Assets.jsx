import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

function Assets({ token }) {
  const [assets, setAssets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '', type: '', serial_number: '', assigned_to: '', status: 'Available'
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await apiClient.get('assets');
      setAssets(response.data);
    } catch (err) {
      console.error("Failed to fetch assets", err);
    }
  };

  const handleInputChange = (e) => {
    setNewAsset({ ...newAsset, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('assets', newAsset);
      fetchAssets();
      setShowForm(false);
      setNewAsset({ name: '', type: '', serial_number: '', assigned_to: '', status: 'Available' });
      toast.success("Asset added successfully");
    } catch (err) {
      // apiClient handles toast
    }
  };

  return (
    <div className="assets-container">
      <div className="header-actions">
        <h2>Asset Management</h2>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Asset'}
        </button>
      </div>

      {showForm && (
        <form className="asset-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <input name="name" placeholder="Asset Name" value={newAsset.name} onChange={handleInputChange} required />
            <input name="type" placeholder="Type (Laptop, Monitor...)" value={newAsset.type} onChange={handleInputChange} required />
            <input name="serial_number" placeholder="Serial Number" value={newAsset.serial_number} onChange={handleInputChange} />
            <input name="assigned_to" placeholder="Assigned To (Username)" value={newAsset.assigned_to} onChange={handleInputChange} />
            <select name="status" value={newAsset.status} onChange={handleInputChange}>
              <option value="Available">Available</option>
              <option value="Assigned">Assigned</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
          <button type="submit" className="submit-btn">Save Asset</button>
        </form>
      )}

      <table className="asset-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Serial #</th>
            <th>Assigned To</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {assets.map(asset => (
            <tr key={asset.id}>
              <td>{asset.name}</td>
              <td>{asset.type}</td>
              <td>{asset.serial_number}</td>
              <td>{asset.assigned_to || '-'}</td>
              <td><span className={`status-badge ${asset.status.toLowerCase()}`}>{asset.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Assets;
