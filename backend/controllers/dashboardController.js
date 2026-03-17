const User = require('../models/User');
const Task = require('../models/Task');
const Leave = require('../models/Leave');
const Asset = require('../models/Asset');

// @desc    Get dashboard metrics using Aggregation Pipelines
// @route   GET /dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const role = req.user.role;
    
    // Base data to return based on the Python structure expectations
    let dashboardResponse = {
      message: `Welcome ${role.charAt(0).toUpperCase() + role.slice(1)} ${req.user.sub}`,
      menu: []
    };
    
    // Aggregation: Count Total Employees in Tenant
    const totalEmployees = await User.countDocuments({ tenantId });
    
    // Aggregation: Count Active Tasks (not 'Done') in Tenant
    const activeTasks = await Task.countDocuments({ tenantId, status: { $ne: 'Done' } });

    // Aggregation: Count Pending Leaves in Tenant
    const pendingLeaves = await Leave.countDocuments({ tenantId, status: 'Pending' });

    // Aggregation: Department Stats
    const deptStats = await User.aggregate([
      { $match: { tenantId } },
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);
    
    if (role === 'admin' || role === 'super-admin') {
      dashboardResponse.menu = ["Users", "Roles", "Policies", "Assets", "Attendance", "Leaves", "Tasks", "Settings", "Reports", "Billing", "Organization Tree", "Holidays"];
      dashboardResponse.stats = {
        total_employees: totalEmployees,
        active_tasks: activeTasks,
        pending_leaves: pendingLeaves
      };
      
      // Get all active tasks for admin overview
      dashboardResponse.tasks = await Task.find({ tenantId, status: { $ne: 'Done' } }).sort({ priority: 1 }).limit(10);
      dashboardResponse.dept_distribution = deptStats;

    } else if (role === 'manager') {
      dashboardResponse.menu = ["Projects", "My Team", "Assets", "Attendance", "Leaves", "Tasks", "Sprints", "Reports", "Organization Tree", "Holidays"];
      dashboardResponse.stats = {
        project_progress: "75%",
        active_sprints: 2,
        pending_leaves: pendingLeaves,
        active_tasks: activeTasks
      };
      // Tasks assigned to their team (mocking team as those managed by them)
      dashboardResponse.tasks = await Task.find({ tenantId, assigned_to: { $in: [req.user.sub] } }).limit(10);
      
    } else {
      dashboardResponse.menu = ["My Tasks", "Attendance", "Leaves", "Profile", "Organization Tree", "Holidays"];
      
      // Get user specific tasks
      dashboardResponse.tasks = await Task.find({ tenantId, assigned_to: req.user.username }).limit(10);
    }
    
    res.json(dashboardResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getDashboardData
};
