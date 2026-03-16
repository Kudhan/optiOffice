const Role = require('../models/Role');

// @desc    Get all roles
// @route   GET /roles
// @access  Private
const getRoles = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ detail: "Not authorized" });
    }
    const roles = await Role.find({ tenantId: req.user.tenantId });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create new role
// @route   POST /roles
// @access  Private
const createRole = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ detail: "Not authorized" });
    }
    
    const roleExists = await Role.findOne({ name: req.body.name, tenantId: req.user.tenantId });
    if (roleExists) {
       return res.status(400).json({ detail: "Role already exists" });
    }

    const roleData = {
      ...req.body,
      tenantId: req.user.tenantId
    };
    
    const role = await Role.create(roleData);
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update role
// @route   PUT /roles/:id
// @access  Private
const updateRole = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ detail: "Not authorized" });
    }
    
    const role = await Role.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      req.body,
      { new: true }
    );
    
    if (role) {
      res.json(true);
    } else {
      res.status(404).json({ detail: "Role not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete role
// @route   DELETE /roles/:id
// @access  Private
const deleteRole = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ detail: "Not authorized" });
    }
    
    const role = await Role.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    
    if (role) {
      res.json(true);
    } else {
      res.status(404).json({ detail: "Role not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole
};
