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
    const totalEmployeesAggr = await User.aggregate([
      { $match: { tenantId } },
      { $count: "count" }
    ]);
    const totalEmployees = totalEmployeesAggr.length > 0 ? totalEmployeesAggr[0].count : 0;
    
    // Aggregation: Count Active Tasks (not 'Done') in Tenant
    const activeTasksAggr = await Task.aggregate([
      { $match: { tenantId, status: { $ne: 'Done' } } },
      { $count: "count" }
    ]);
    const activeTasks = activeTasksAggr.length > 0 ? activeTasksAggr[0].count : 0;

    // Aggregation: Count Pending Leaves in Tenant
    const pendingLeavesAggr = await Leave.aggregate([
      { $match: { tenantId, status: 'Pending' } },
      { $count: "count" }
    ]);
    const pendingLeaves = pendingLeavesAggr.length > 0 ? pendingLeavesAggr[0].count : 0;
    
    if (role === 'admin') {
      dashboardResponse.menu = ["Users", "Roles", "Policies", "Assets", "Attendance", "Leaves", "Tasks", "Settings", "Reports", "Billing", "Organization Tree", "Holidays"];
      dashboardResponse.stats = {
        totalEmployees,
        activeTasks,
        pendingLeaves
      };
    } else if (role === 'manager') {
      dashboardResponse.menu = ["Projects", "My Team", "Assets", "Attendance", "Leaves", "Tasks", "Sprints", "Reports", "Organization Tree", "Holidays"];
      dashboardResponse.stats = {
        project_progress: "75%",
        active_sprints: 2,
        pendingLeaves,
        activeTasks
      };
    } else {
      dashboardResponse.menu = ["My Tasks", "Attendance", "Leaves", "Profile", "Organization Tree", "Holidays"];
      
      // Get user specific tasks
      const myTasks = await Task.find({ tenantId, assigned_to: req.user.sub, status: { $ne: 'Done' } }).limit(5);
      dashboardResponse.tasks = myTasks.map(t => t.title);
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
