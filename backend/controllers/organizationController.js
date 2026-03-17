const Organization = require('../models/Organization');

// @desc    Get organization details
// @route   GET /organization
// @access  Private
const getOrganization = async (req, res) => {
  try {
    let org = await Organization.findOne({ tenantId: req.user.tenantId });
    if (!org) {
       // Create a default if it doesn't exist
       org = await Organization.create({ tenantId: req.user.tenantId, name: 'Default Company' });
    }
    res.json([org]); // Keeping array response if React expects it
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update organization settings
// @route   PUT /organization/:id
// @access  Private
const updateOrganization = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ detail: "Not authorized" });
    }
    
    const org = await Organization.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      req.body,
      { new: true }
    );
    res.json(org);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get organization tree (hierarchy)
// @route   GET /organization/tree
// @access  Private
const getOrgTree = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const users = await User.find({ tenantId }).select('username full_name designation role manager_id').lean();

    // Map users by their username for quick lookup
    const userMap = {};
    users.forEach(user => {
      user.children = [];
      userMap[user.username] = user;
    });

    const rootNodes = [];
    users.forEach(user => {
      if (user.manager_id && userMap[user.manager_id]) {
        userMap[user.manager_id].children.push(user);
      } else {
        rootNodes.push(user);
      }
    });

    res.json(rootNodes);
  } catch (error) {
    console.error('Org Tree Error:', error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getOrganization,
  updateOrganization,
  getOrgTree
};
