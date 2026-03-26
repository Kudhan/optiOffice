const mongoose = require('mongoose');
const Asset = require('../models/Asset');

// @desc    Get assets mapping by tenantId with advanced filtering
// @route   GET /assets
const getAssets = async (req, res) => {
  try {
    const { page = 1, limit = 12, search = '', category = '', status = '', sort = '-createdAt' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = { tenantId: req.user.tenantId };
    
    // Strict Isolation: Non-admins only see what they are allocated with
    if (req.user.role !== 'admin') {
      query.assigned_to = req.user.id;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { serial_number: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;
    if (status) query.status = status;

    const total = await Asset.countDocuments(query);
    const assets = await Asset.find(query)
      .populate('assigned_to', 'full_name role department')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      data: assets,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get asset analytics / stats
// @route   GET /assets/stats
const getAssetStats = async (req, res) => {
  try {
    // Strict isolation for stats
    const matchQuery = { tenantId: req.user.tenantId };
    if (req.user.role !== 'admin') {
      matchQuery.assigned_to = new mongoose.Types.ObjectId(req.user.id);
    }

    const stats = await Asset.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          assigned: { $sum: { $cond: [{ $eq: ["$status", "Assigned"] }, 1, 0] } },
          available: { $sum: { $cond: [{ $eq: ["$status", "Available"] }, 1, 0] } },
          maintenance: { $sum: { $cond: [{ $eq: ["$status", "Maintenance"] }, 1, 0] } },
          totalValue: { $sum: "$value" }
        }
      }
    ]);

    // Strict isolation for category breakdown
    const catMatchQuery = { tenantId: req.user.tenantId };
    if (req.user.role !== 'admin') {
      catMatchQuery.assigned_to = new mongoose.Types.ObjectId(req.user.id);
    }

    const categories = await Asset.aggregate([
      { $match: catMatchQuery },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    res.json({
      overview: stats[0] || { total: 0, assigned: 0, available: 0, maintenance: 0, totalValue: 0 },
      categories
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create new asset (Admin/Manager only)
// @route   POST /assets
const createAsset = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ detail: "Security Restriction: Asset provisioning requires absolute administrative clearance." });
    }
    
    const assetData = { ...req.body };
    delete assetData._id;
    delete assetData.id;
    delete assetData.tenantId;
    delete assetData.createdAt;
    delete assetData.updatedAt;
    
    assetData.tenantId = req.user.tenantId;

    if (assetData.assigned_to === '') {
      assetData.assigned_to = null;
    }
    
    const asset = await Asset.create(assetData);
    res.json(asset);
  } catch (error) {
    console.error("CREATE_ASSET_ERROR:", error);
    if (error.code === 11000) {
      return res.status(400).json({ detail: "Duplicate Asset Node: This serial number already exists." });
    }
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// @desc    Update asset (Admin/Manager only)
// @route   PUT /assets/:id
const updateAsset = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ detail: "Security Restriction: Asset modification requires absolute administrative clearance." });
    }
    
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.id;
    delete updateData.tenantId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    if (updateData.assigned_to === '') {
      updateData.assigned_to = null;
    }

    const asset = await Asset.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (asset) {
      res.json(asset);
    } else {
      res.status(404).json({ detail: "Asset node not found" });
    }
  } catch (error) {
    console.error("UPDATE_ASSET_ERROR:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// @desc    Delete asset (Admin only)
// @route   DELETE /assets/:id
const deleteAsset = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ detail: "Security Restriction: Asset decommissioning requires administrative clearance." });
    }
    
    const asset = await Asset.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    
    if (asset) {
      res.json({ message: "Asset node successfully decommissioned" });
    } else {
      res.status(404).json({ detail: "Asset node not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getAssets,
  getAssetStats,
  createAsset,
  updateAsset,
  deleteAsset
};
