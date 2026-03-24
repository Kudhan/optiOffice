const Department = require('../models/Department');
const User = require('../models/User');

// @desc    Get all departments for tenant
// @route   GET /departments
// @access  Private
const getDepartments = async (req, res) => {
  try {
    let departments = await Department.find({ tenantId: req.user.tenantId })
      .populate('head', 'full_name username email');

    // Auto-Provision "General" if missing
    const hasGeneral = departments.some(d => d.name?.toLowerCase() === 'general');
    if (!hasGeneral) {
      const generalDept = await Department.create({
        name: 'General',
        tenantId: req.user.tenantId,
        head: null
      });
      departments.push(generalDept);
      console.log(`[PROVISION] General Unit established for tenant: ${req.user.tenantId}`);
    }

    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create new department
// @route   POST /departments
// @access  Private (Admin Only)
const createDepartment = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ detail: "Not authorized" });
    }

    const { name, head } = req.body;
    
    const deptExists = await Department.findOne({ name, tenantId: req.user.tenantId });
    if (deptExists) {
      return res.status(400).json({ detail: "Department already exists" });
    }

    const department = await Department.create({
      name,
      head: head || null,
      tenantId: req.user.tenantId
    });

    res.json(department);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update department
// @route   PUT /departments/:id
// @access  Private (Admin Only)
const updateDepartment = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ detail: "Not authorized" });
    }

    const { name, head } = req.body;
    const department = await Department.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { name, head },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ detail: "Department not found" });
    }

    res.json(department);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete department
// @route   DELETE /departments/:id
// @access  Private (Admin Only)
const deleteDepartment = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ detail: "Not authorized" });
    }

    const department = await Department.findOneAndDelete({ 
      _id: req.params.id, 
      tenantId: req.user.tenantId 
    });

    if (!department) {
      return res.status(404).json({ detail: "Department not found" });
    }

    res.json({ message: "Department removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
