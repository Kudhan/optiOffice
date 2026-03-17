const Organization = require('../models/Organization');
const User = require('../models/User');
const Department = require('../models/Department');

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
    // Fetch all users for the tenant, populate department details
    const users = await User.find({ tenantId })
      .select('username full_name designation role manager department_id')
      .populate('department_id', 'name')
      .lean();

    // Map by _id for quick lookup
    const userMap = {};
    users.forEach(user => {
      user.id = user._id.toString();
      user.children = [];
      // Flatten department name for easier UI access
      user.departmentName = user.department_id ? user.department_id.name : 'Unassigned';
      userMap[user.id] = user;
    });

    const rootNodes = [];
    users.forEach(user => {
      if (user.manager && userMap[user.manager.toString()]) {
        userMap[user.manager.toString()].children.push(user);
      } else {
        // If no manager (or manager not in tenant), this is a root node (e.g. CEO)
        rootNodes.push(user);
      }
    });

    res.json(rootNodes);
  } catch (error) {
    console.error('Org Tree Recursive Error:', error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getDirectReports = async (req, res) => {
  try {
    const managerId = req.user.id;
    const tenantId = req.user.tenantId;

    const reports = await User.find({ 
      manager: managerId, 
      tenantId: tenantId 
    }).select('username full_name designation role department_id').populate('department_id', 'name');

    res.json(reports);
  } catch (error) {
    console.error('Direct Reports Error:', error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getOrganization,
  updateOrganization,
  getOrgTree,
  getDirectReports
};
