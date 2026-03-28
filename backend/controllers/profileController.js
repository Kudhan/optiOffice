const stripSensitiveData = (user, viewer) => {
  const isSelf = String(user._id) === String(viewer.id || viewer._id);
  const isAdmin = viewer.role === 'admin';
  const isHR = viewer.role === 'hr' || viewer.department === 'HR';
  const hasPermission = viewer.permissions?.includes('can_view_sensitive_data');

  const userObj = user.toObject ? user.toObject() : user;

  if (isSelf || isAdmin || isHR || hasPermission) {
    if (user.decryptVault) user.decryptVault();
    return user.toObject ? user.toObject() : user;
  }

  const { privateIdentity, secureVault, hashed_password, ...publicData } = userObj;
  return publicData;
};

// @desc    Get aggregated profile data
// @route   GET /users/profile/:id
const getProfileData = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUser = req.user;

    if (!mongoose.isValidObjectId(targetUserId)) {
        return res.status(400).json({ detail: "Invalid Profile Identifier" });
    }

    const targetUser = await User.findById(targetUserId)
      .populate('department_id', 'name')
      .populate('manager', 'full_name designation')
      .select('-hashed_password');

    if (!targetUser) return res.status(404).json({ detail: "User not found" });

    // Security: Organization check
    if (currentUser.role !== 'admin' && targetUser.tenantId !== currentUser.tenantId) {
      return res.status(403).json({ detail: "User belongs to a different organization" });
    }

    // Apply security filter to user object
    const strippedUser = stripSensitiveData(targetUser, currentUser);

    // Stats and Activity (same as before)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    
    const [monthlyAttendance, recentAttendance, recentTasks, allTasks] = await Promise.all([
      Attendance.find({ user: targetUserId, date: { $gte: startOfMonth } }),
      Attendance.find({ user: targetUserId }).sort({ date: -1 }).limit(5),
      Task.find({ assigned_to: targetUserId }).sort({ updatedAt: -1 }).limit(5),
      Task.find({ assigned_to: targetUserId })
    ]);

    const totalHours = monthlyAttendance.reduce((acc, curr) => acc + (curr.workHours || 0), 0);
    const monthlyLateCount = monthlyAttendance.filter(r => r.status === 'Late').length;
    const pendingTasks = allTasks.filter(t => !['Completed', 'Done'].includes(t.status)).length;
    const completedTasks = allTasks.filter(t => ['Completed', 'Done'].includes(t.status)).length;

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
        ...strippedUser,
        id: targetUser._id,
        department: targetUser.department_id ? targetUser.department_id.name : 'N/A',
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
      task_overview: { pending: pendingTasks, completed: completedTasks },
      recent_activity: [
        ...recentAttendance.map(a => ({ type: 'attendance', date: a.date, title: a.status === 'Late' ? 'Late Arrival' : 'Punctual Check-in', description: `${a.workHours}h logged`, status: a.status })),
        ...recentTasks.map(t => ({ type: 'task', date: t.updatedAt, title: `Task: ${t.title}`, description: `Moved to ${t.status}`, status: t.status }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update profile basic info
const updateProfile = async (req, res) => {
  try {
    const { userId, publicProfile, privateIdentity, secureVault, full_name, phone, bio } = req.body;
    const targetUserId = (req.user.role === 'admin' && userId) ? userId : req.user.id;
    const user = await User.findById(targetUserId);

    if (!user) return res.status(404).json({ detail: "User not found" });

    // Security: Admin can only update users in their own tenant
    if (req.user.role === 'admin' && req.user.id !== targetUserId && user.tenantId !== req.user.tenantId) {
      return res.status(403).json({ detail: "Unauthorized: User belongs to another organization" });
    }

    const isAdmin = req.user.role === 'admin';
    const isSelf = String(req.user.id || req.user._id) === String(targetUserId);

    // Apply updates (legacy fields and new buckets)
    if (full_name) user.full_name = full_name;
    if (phone) user.phone = phone;
    if (bio) user.bio = bio;

    if (publicProfile) user.publicProfile = { ...user.publicProfile, ...publicProfile };
    
    if (isAdmin || isSelf) {
      if (privateIdentity) user.privateIdentity = { ...user.privateIdentity, ...privateIdentity };
      if (secureVault) user.secureVault = { ...user.secureVault, ...secureVault };
    }

    await user.save();
    res.json({ message: "Identity updated successfully", user: stripSensitiveData(user, req.user) });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getProfileData,
  updateProfile
};
