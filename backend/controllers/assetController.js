const Asset = require('../models/Asset');

// @desc    Get assets mapping by tenantId
// @route   GET /assets
// @access  Private
const getAssets = async (req, res) => {
  try {
    const assets = await Asset.find({ tenantId: req.user.tenantId });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create new asset (Admin/Manager only)
// @route   POST /assets
// @access  Private
const createAsset = async (req, res) => {
  try {
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ detail: "Not authorized" });
    }
    
    const assetData = {
      ...req.body,
      tenantId: req.user.tenantId
    };
    
    const asset = await Asset.create(assetData);
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update asset (Admin/Manager only)
// @route   PUT /assets/:id
// @access  Private
const updateAsset = async (req, res) => {
  try {
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ detail: "Not authorized" });
    }
    
    const asset = await Asset.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      req.body,
      { new: true }
    );
    
    if (asset) {
      res.json(true);
    } else {
      res.status(404).json({ detail: "Asset not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete asset (Admin only)
// @route   DELETE /assets/:id
// @access  Private
const deleteAsset = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ detail: "Not authorized" });
    }
    
    const asset = await Asset.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    
    if (asset) {
      res.json(true);
    } else {
      res.status(404).json({ detail: "Asset not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset
};
