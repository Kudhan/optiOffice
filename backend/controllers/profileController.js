const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const mongoose = require('mongoose');

// @desc    Get aggregated profile data
// @route   GET /users/profile/:id
// @access  Private
const getProfileData = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUser = req.user;

    // Security & Privacy Check
    // Employee can only access their own profile.
    // Admin/Manager can access anyone within their tenantId.
    if (currentUser.role === 'employee' && currentUser.id !== targetUserId) {
      return res.status(403).json({ detail: "Not authorized to view this profile" });
    }

    const targetUser = await User.findById(targetUserId)
      .populate('department_id', 'department_name')
      .populate('manager', 'full_name designation')
      .select('-hashed_password');

    if (!targetUser) {
      return res.status(404).json({ detail: "User not found" });
    }

    if (currentUser.role !== 'admin' && targetUser.tenantId !== currentUser.tenantId) {
      return res.status(403).json({ detail: "User belongs to a different organization" });
    }

    // Monthly Attendance Stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    
    const monthlyAttendance = await Attendance.find({
      user: targetUserId,
      date: { $gte: startOfMonth }
    });

    const totalHours = monthlyAttendance.reduce((acc, curr) => acc + (curr.workHours || 0), 0);
    const monthlyLateCount = monthlyAttendance.filter(r => r.status === 'Late').length;

    // Recent Activity (Last 5 attendance records)
    const recentAttendance = await Attendance.find({ user: targetUserId })
      .sort({ date: -1 })
      .limit(5);

    // Recent Tasks (Last 5)
    const recentTasks = await Task.find({ assigned_to: targetUser.username })
      .sort({ updatedAt: -1 })
      .limit(5);

    // All-time Task Stats for Velocity
    const allTasks = await Task.find({ assigned_to: targetUser.username });
    const pendingTasks = allTasks.filter(t => !['Completed', 'Done'].includes(t.status)).length;
    const completedTasks = allTasks.filter(t => ['Completed', 'Done'].includes(t.status)).length;

    // Tenure Calculation
    let tenure = "Fresh recruit";
    if (targetUser.joining_date) {
        const joinDate = new Date(targetUser.joining_date);
        const diffTime = Math.abs(now - joinDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 365) tenure = `${Math.floor(diffDays/365)}y ${Math.floor((diffDays%365)/30)}m`;
        else if (diffDays > 30) tenure = `${Math.floor(diffDays/30)} months`;
        else tenure = `${diffDays} days`;
    }

    res.json({
      user: {
        id: targetUser._id,
        full_name: targetUser.full_name,
        email: targetUser.email,
        designation: targetUser.designation,
        department: targetUser.department_id ? targetUser.department_id.department_name : 'N/A',
        phone: targetUser.phone,
        bio: targetUser.bio,
        profile_photo: targetUser.profile_photo,
        role: targetUser.role,
        status: targetUser.status,
        leave_balance: targetUser.leave_balance || 20,
        joining_date: targetUser.joining_date,
        tenure
      },
      hierarchy: {
        manager: targetUser.manager ? {
          full_name: targetUser.manager.full_name,
          designation: targetUser.manager.designation
        } : null
      },
      stats: {
        total_hours_this_month: Math.round(totalHours * 100) / 100,
        late_count_this_month: monthlyLateCount,
        task_velocity: allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0,
        punctuality_score: monthlyAttendance.length > 0 ? Math.round(((monthlyAttendance.length - monthlyLateCount) / monthlyAttendance.length) * 100) : 100
      },
      task_overview: {
        pending: pendingTasks,
        completed: completedTasks
      },
      recent_activity: [
        ...recentAttendance.map(a => ({
            type: 'attendance',
            date: a.date,
            title: a.status === 'Late' ? 'Late Arrival' : 'Punctual Check-in',
            description: `${a.workHours}h logged`,
            status: a.status
        })),
        ...recentTasks.map(t => ({
            type: 'task',
            date: t.updatedAt,
            title: `Task: ${t.title}`,
            description: `Moved to ${t.status}`,
            status: t.status
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update profile basic info
// @route   PUT /users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { phone, bio, profile_photo, role, department_id } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }

    // Restriction: Users CANNOT change their own 'Role' or 'Department' (Admin only)
    if (req.user.role !== 'admin') {
        if (role && role !== user.role) {
            return res.status(403).json({ detail: "Only admins can change roles" });
        }
        if (department_id && department_id.toString() !== user.department_id?.toString()) {
            return res.status(403).json({ detail: "Only admins can change departments" });
        }
    }

    // Apply allowed updates
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (profile_photo !== undefined) user.profile_photo = profile_photo;

    // Admin-only updates
    if (req.user.role === 'admin') {
        if (role) user.role = role;
        if (department_id) user.department_id = department_id;
    }

    await user.save();
    res.json({ message: "Profile updated successfully", user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getProfileData,
  updateProfile
};
