const User = require('../models/User');
const Task = require('../models/Task');
const { Leave } = require('../models/Leave');
const Asset = require('../models/Asset');
const Attendance = require('../models/Attendance');
const { getScope, getTeamScope } = require('../middleware/getScope');

/**
 * @desc    Get dashboard metrics using Aggregation Pipelines
 * @route   GET /dashboard
 * @access  Private
 */
const getDashboardData = async (req, res) => {
  try {
    const role = req.user.role;
    const userFilter = await getScope(req);
    
    // Task 1: Fix - use 'assigned_to' for tasks and 'user' for leaves
    const taskScope = await getTeamScope(req, 'assigned_to');
    const leaveScope = await getTeamScope(req, 'user');
    
    // Base data to return based on the Python structure expectations
    let dashboardResponse = {
      message: `Welcome ${role.charAt(0).toUpperCase() + role.slice(1)} ${req.user.sub}`,
      menu: []
    };

    // Scoped Counts
    const totalEmployees = await User.countDocuments(userFilter);
    const activeTasks = await Task.countDocuments({ ...taskScope, status: { $nin: [/done/i, /completed/i] } });
    const completedTasks = await Task.countDocuments({ ...taskScope, status: { $in: [/done/i, /completed/i] } });
    const pendingLeavesCount = await Leave.countDocuments({ ...leaveScope, status: 'Pending' });
    
    // Attendance Rate (Today)
    const today = new Date().toISOString().split('T')[0];
    const todayAttendanceCount = await Attendance.countDocuments({ 
      tenantId: req.user.tenantId, 
      date: today 
    });
    const attendanceRate = totalEmployees > 0 ? Math.round((todayAttendanceCount / totalEmployees) * 100) : 0;

    // Recent Pending Leaves (Details)
    const pendingLeavesList = await Leave.find({ ...leaveScope, status: 'Pending' })
      .populate('user', 'full_name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Asset Valuation & Billing Pulse (Admin/Manager Only)
    let assetStats = { totalCount: 0, totalValue: 0 };
    if (role === 'admin' || role === 'super-admin' || role === 'manager') {
      const assets = await Asset.find({ tenantId: req.user.tenantId });
      assetStats.totalCount = assets.length;
      assetStats.totalValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);
    }

    // Scoped Department Stats
    const deptStats = await User.aggregate([
      { $match: userFilter },
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);
    
    if (role === 'admin' || role === 'super-admin') {
      dashboardResponse.menu = ["Users", "Roles", "Policies", "Assets", "Attendance", "Leaves", "Tasks", "Settings", "Reports", "Organization Tree", "Holidays"];
      dashboardResponse.stats = {
        total_employees: totalEmployees,
        active_tasks: activeTasks,
        completed_tasks: completedTasks,
        pending_leaves: pendingLeavesCount,
        pending_leaves_list: pendingLeavesList,
        attendance_rate: attendanceRate,
        asset_valuation: assetStats.totalValue,
        asset_count: assetStats.totalCount
      };
      
      dashboardResponse.tasks = await Task.find({ ...taskScope, status: { $nin: [/done/i, /completed/i] } })
        .populate('assigned_to', 'full_name profile_photo')
        .sort({ priority: 1 })
        .limit(10);
      dashboardResponse.dept_distribution = deptStats;

    } else if (role === 'manager') {
      dashboardResponse.menu = ["Projects", "My Team", "Assets", "Attendance", "Leaves", "Tasks", "Sprints", "Reports", "Organization Tree", "Holidays"];
      dashboardResponse.stats = {
        project_progress: "75%",
        active_sprints: 2,
        pending_leaves: pendingLeavesCount,
        pending_leaves_list: pendingLeavesList,
        attendance_rate: attendanceRate,
        active_tasks: activeTasks,
        completed_tasks: completedTasks,
        team_count: totalEmployees
      };
      // Tasks assigned to their team
      dashboardResponse.tasks = await Task.find(taskScope)
        .populate('assigned_to', 'full_name profile_photo')
        .limit(10);
      
    } else {
      dashboardResponse.menu = ["My Tasks", "Attendance", "Leaves", "Profile", "Organization Tree", "Holidays"];
      dashboardResponse.stats = {
        active_tasks: activeTasks,
        completed_tasks: completedTasks,
        pending_leaves: pendingLeavesCount
      };
      // Get user specific tasks
      dashboardResponse.tasks = await Task.find(taskScope)
        .populate('assigned_to', 'full_name profile_photo')
        .limit(10);
    }
    
    res.json(dashboardResponse);
  } catch (error) {
    console.error("Dashboard Sector Failure:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getDashboardData
};
