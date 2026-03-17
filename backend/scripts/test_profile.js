const mongoose = require('mongoose');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const { getProfileData, updateProfile } = require('../controllers/profileController');
const connectDB = require('../config/db');
require('dotenv').config();

const testProfile = async () => {
    try {
        await connectDB();
        console.log("MongoDB Connected...");

        // 1. Setup Mock Users
        const adminUser = await User.findOne({ role: 'admin' });
        const employeeUser = await User.findOne({ role: 'employee' });

        if (!adminUser || !employeeUser) {
            console.error("Test users not found. Run seed script first.");
            process.exit(1);
        }

        console.log(`\nTesting as Admin: ${adminUser.username}`);
        console.log(`Testing as Employee: ${employeeUser.username}`);

        // Mock Express Req/Res
        const mockRes = {
            status: function(code) { this.statusCode = code; return this; },
            json: function(data) { this.data = data; return this; }
        };

        // --- TEST 1: Employee gets own profile (Should succeed) ---
        console.log("\n[TEST 1] Employee gets own profile...");
        await getProfileData(
            { user: { id: employeeUser._id.toString(), role: 'employee', tenantId: employeeUser.tenantId }, params: { id: employeeUser._id.toString() } },
            mockRes
        );
        console.log("Status:", mockRes.statusCode || 200);
        if (mockRes.data.user && mockRes.data.user.full_name === employeeUser.full_name) {
            console.log("PASS: Data stitched correctly.");
        } else {
            console.log("FAIL:", mockRes.data);
        }

        // --- TEST 2: Employee gets Admin profile (Should fail) ---
        console.log("\n[TEST 2] Employee gets Admin profile...");
        await getProfileData(
            { user: { id: employeeUser._id.toString(), role: 'employee', tenantId: employeeUser.tenantId }, params: { id: adminUser._id.toString() } },
            mockRes
        );
        console.log("Status (Expected 403):", mockRes.statusCode);
        if (mockRes.statusCode === 403) console.log("PASS: Security working.");

        // --- TEST 3: Admin gets Employee profile (Should succeed) ---
        console.log("\n[TEST 3] Admin gets Employee profile...");
        await getProfileData(
            { user: { id: adminUser._id.toString(), role: 'admin', tenantId: adminUser.tenantId }, params: { id: employeeUser._id.toString() } },
            mockRes
        );
        console.log("Status:", mockRes.statusCode || 200);
        if (mockRes.data.user && mockRes.data.user.full_name === employeeUser.full_name) {
            console.log("PASS: Admin access granted.");
        }

        // --- TEST 4: Employee updates own bio (Should succeed) ---
        console.log("\n[TEST 4] Employee updates own bio...");
        await updateProfile(
            { user: { id: employeeUser._id.toString(), role: 'employee' }, body: { bio: "New test bio", phone: "12345678" } },
            mockRes
        );
        console.log("Status:", mockRes.statusCode || 200);
        if (mockRes.data.message === "Profile updated successfully") console.log("PASS: Basic info updated.");

        // --- TEST 5: Employee updates own role (Should fail) ---
        console.log("\n[TEST 5] Employee updates own role...");
        await updateProfile(
            { user: { id: employeeUser._id.toString(), role: 'employee' }, body: { role: 'admin' } },
            mockRes
        );
        console.log("Status (Expected 403):", mockRes.statusCode);
        if (mockRes.statusCode === 403) console.log("PASS: Role restriction working.");

        console.log("\nVerification complete.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testProfile();
