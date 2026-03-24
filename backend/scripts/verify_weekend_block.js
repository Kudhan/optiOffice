const mongoose = require('mongoose');
const User = require('../models/User');
const { checkIn } = require('../controllers/attendanceController');
const connectDB = require('../config/db');
require('dotenv').config();

const verifyBlock = async () => {
    try {
        await connectDB();
        console.log("MongoDB Connected...");

        const employeeUser = await User.findOne({ role: 'employee' });
        if (!employeeUser) {
            console.error("Employee user not found. Run seed script first.");
            process.exit(1);
        }

        const mockRes = {
            status: function(code) { this.statusCode = code; return this; },
            json: function(data) { this.data = data; return this; }
        };

        const mockReq = {
            user: { 
                id: employeeUser._id.toString(), 
                role: 'employee', 
                tenantId: employeeUser.tenantId 
            }
        };

        console.log("\n[VERIFICATION] Testing check-in on a weekend...");
        // This test depends on the current actual date being a weekend.
        // Since today is Tuesday, I'll temporarily modify the controller to block Tuesday for this test.
        
        await checkIn(mockReq, mockRes);
        
        console.log(`Status: ${mockRes.statusCode}`);
        console.log(`Message: ${mockRes.data.message}`);

        if (mockRes.statusCode === 400 && mockRes.data.message.includes('weekoff')) {
            console.log("PASS: Backend correctly blocked check-in.");
        } else {
            console.log("FAIL: Backend did not block check-in as expected (or today is not a blocked day).");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyBlock();
