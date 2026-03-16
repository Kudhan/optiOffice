const Policy = require('../models/Policy');

// @desc    Get system policies
// @route   GET /policies
// @access  Private
const getPolicies = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ detail: "Not authorized" });
    }
    
    let policy = await Policy.findOne({ tenantId: req.user.tenantId });
    if (!policy) {
      // Create empty/default policy object if it doesn't exist
      policy = await Policy.create({ tenantId: req.user.tenantId });
    }
    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update system policies
// @route   PUT /policies
// @access  Private
const updatePolicies = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ detail: "Not authorized" });
    }
    
    // We update the document by merging the incoming object directly
    const policy = await Policy.findOneAndUpdate(
      { tenantId: req.user.tenantId },
      { $set: req.body },
      { new: true, upsert: true } // Upsert ensures it's created if it somehow doesn't exist
    );
    
    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getPolicies,
  updatePolicies
};
