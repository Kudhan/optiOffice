const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const { Leave } = require('../models/Leave');
const Asset = require('../models/Asset');
const User = require('../models/User');

/**
 * @desc Get HR Analytics (Attendance & Leaves)
 * @route GET /api/v1/reports/hr
 */
exports.getHRAnalytics = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const isAdmin = req.user.role === 'admin';
        
        // Match query for isolation
        const match = { tenantId };
        if (!isAdmin) {
            match.user = new mongoose.Types.ObjectId(req.user.id);
        }

        // 1. Attendance Distribution
        const attendanceStats = await Attendance.aggregate([
            { $match: match },
            { $group: {
                _id: "$status",
                count: { $sum: 1 },
                avgHours: { $avg: "$workHours" }
            }}
        ]);

        // 2. Leave Trends
        const leaveStats = await Leave.aggregate([
            { $match: match },
            { $group: {
                _id: "$status",
                count: { $sum: 1 }
            }}
        ]);

        res.json({
            attendance: attendanceStats,
            leaves: leaveStats,
            summary: {
                totalAttendanceNodes: attendanceStats.reduce((acc, curr) => acc + curr.count, 0),
                totalLeaveRequests: leaveStats.reduce((acc, curr) => acc + curr.count, 0)
            }
        });
    } catch (error) {
        console.error("REPORT_HR_ERROR:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

/**
 * @desc Get Inventory Analytics (Assets)
 * @route GET /api/v1/reports/inventory
 */
exports.getInventoryAnalytics = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const isAdmin = req.user.role === 'admin';

        const match = { tenantId };
        if (!isAdmin) {
            match.assigned_to = new mongoose.Types.ObjectId(req.user.id);
        }

        const assetStats = await Asset.aggregate([
            { $match: match },
            { $group: {
                _id: "$category",
                count: { $sum: 1 },
                totalValue: { $sum: "$value" },
                avgCondition: { $first: "$condition" } // Placeholder for more complex logic
            }}
        ]);

        const statusStats = await Asset.aggregate([
            { $match: match },
            { $group: {
                _id: "$status",
                count: { $sum: 1 }
            }}
        ]);

        res.json({
            categories: assetStats,
            status: statusStats,
            valuation: assetStats.reduce((acc, curr) => acc + curr.totalValue, 0)
        });
    } catch (error) {
        console.error("REPORT_INVENTORY_ERROR:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

/**
 * @desc Get Organizational Snapshot (Users/Depts)
 * @route GET /api/v1/reports/org
 */
exports.getOrganizationalAnalytics = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ detail: "Security Restriction: Global organizational charts require Admin clearance." });
        }

        const { tenantId } = req.user;

        const deptStats = await User.aggregate([
            { $match: { tenantId } },
            { $group: {
                _id: "$department",
                count: { $sum: 1 }
            }}
        ]);

        const roleStats = await User.aggregate([
            { $match: { tenantId } },
            { $group: {
                _id: "$role",
                count: { $sum: 1 }
            }}
        ]);

        const activeUsers = await User.countDocuments({ tenantId, status: 'active' });

        res.json({
            departments: deptStats,
            roles: roleStats,
            activePersonnel: activeUsers
        });
    } catch (error) {
        console.error("REPORT_ORG_ERROR:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};
