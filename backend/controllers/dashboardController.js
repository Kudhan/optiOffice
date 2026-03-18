const User = require('../models/User');
const Task = require('../models/Task');
const Leave = require('../models/Leave');
const Asset = require('../models/Asset');
const { getScope, getTeamScope } = require('../middleware/getScope');

// @desc    Get dashboard metrics using Aggregation Pipelines
// @route   GET /dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const role = req.user.role;
    const userFilter = getScope(req);
    const taskScope = await getTeamScope(req, 'username');
    // Note: Leave model likely uses 'user' field (ObjectId), building scope for it
    const idScope = await getTeamScope(req, 'id');
    
    // Base data to return based on the Python structure expectations
    let dashboardResponse = {
      message: `Welcome ${role.charAt(0).toUpperCase() + role.slice(1)} ${req.user.sub}`,
      menu: []
    };
    
    // Scoped Counts
    const totalEmployees = await User.countDocuments(userFilter);
    const activeTasks = await Task.countDocuments({ ...taskScope, status: { $ne: 'Done' } });
    const pendingLeaves = await Leave.countDocuments({ ...idScope, status: 'Pending' });

    // Scoped Department Stats
    const deptStats = await User.aggregate([
      { $match: userFilter },
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);
    
    if (role === 'admin' || role === 'super-admin') {
      dashboardResponse.menu = ["Users", "Roles", "Policies", "Assets", "Attendance", "Leaves", "Tasks", "Settings", "Reports", "Billing", "Organization Tree", "Holidays"];
      dashboardResponse.stats = {
        total_employees: totalEmployees,
        active_tasks: activeTasks,
        pending_leaves: pendingLeaves
      };
      
      dashboardResponse.tasks = await Task.find({ ...taskScope, status: { $ne: 'Done' } }).sort({ priority: 1 }).limit(10);
      dashboardResponse.dept_distribution = deptStats;

    } else if (role === 'manager') {
      dashboardResponse.menu = ["Projects", "My Team", "Assets", "Attendance", "Leaves", "Tasks", "Sprints", "Reports", "Organization Tree", "Holidays"];
      dashboardResponse.stats = {
        project_progress: "75%",
        active_sprints: 2,
        pending_leaves: pendingLeaves,
        active_tasks: activeTasks,
        team_count: totalEmployees
      };
      // Tasks assigned to their team
      dashboardResponse.tasks = await Task.find(taskScope).limit(10);
      
    } else {
      dashboardResponse.menu = ["My Tasks", "Attendance", "Leaves", "Profile", "Organization Tree", "Holidays"];
      dashboardResponse.stats = {
        active_tasks: activeTasks,
        pending_leaves: pendingLeaves
      };
      // Get user specific tasks
      dashboardResponse.tasks = await Task.find(taskScope).limit(10);
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
