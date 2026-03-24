// routes/migrate.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Role = require('../models/Role');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const Leave = require('../models/Leave');
const Billing = require('../models/Billing');
const Asset = require('../models/Asset');
const Holiday = require('../models/Holiday');
const Shift = require('../models/Shift');

const connectDB = async (dbName) => {
    if (!dbName) throw new Error("dbName is required");
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI not set in .env");

    const uri = process.env.MONGO_URI.includes('?') 
      ? process.env.MONGO_URI.replace('?', `${dbName}?`) 
      : `${process.env.MONGO_URI}/${dbName}`;

    const connection = await mongoose.createConnection(uri).asPromise();
    console.log(`✅ Connected to database: ${dbName}`);
    return connection;
};

router.post('/', async (req, res) => {
    const { db_name } = req.body;
    if (!db_name) return res.status(400).json({ error: 'db_name is required' });

    try {
        const conn = await connectDB(db_name);

        const UserModel = conn.model('User', User.schema);
        const RoleModel = conn.model('Role', Role.schema);
        const DepartmentModel = conn.model('Department', Department.schema);
        const AttendanceModel = conn.model('Attendance', Attendance.schema);
        const TaskModel = conn.model('Task', Task.schema);
        const LeaveModel = conn.model('Leave', Leave.schema);
        const BillingModel = conn.model('Billing', Billing.schema);
        const AssetModel = conn.model('Asset', Asset.schema);
        const HolidayModel = conn.model('Holiday', Holiday.schema);
        const ShiftModel = conn.model('Shift', Shift.schema);

        await Promise.all([
            UserModel.deleteMany({}),
            RoleModel.deleteMany({}),
            DepartmentModel.deleteMany({}),
            AttendanceModel.deleteMany({}),
            TaskModel.deleteMany({}),
            LeaveModel.deleteMany({}),
            BillingModel.deleteMany({}),
            AssetModel.deleteMany({}),
            HolidayModel.deleteMany({}),
            ShiftModel.deleteMany({}),
        ]);

        const tenantId = db_name;
        const hashedPassword = await bcrypt.hash('password123', 10);

        const roles = await RoleModel.create([
            { tenantId: null, name: 'super-admin', description: 'Global System Overlord', permissions: ['*'] },
            { tenantId, name: 'admin', description: 'Full system access', permissions: ['can_manage_users', 'can_manage_tasks', 'can_manage_holidays', 'can_manage_billing', 'can_view_all_attendance', 'can_approve_leaves'] },
            { tenantId, name: 'manager', description: 'Team management access', permissions: ['can_manage_tasks', 'can_view_all_attendance', 'can_approve_leaves'] },
            { tenantId, name: 'employee', description: 'Standard employee access', permissions: ['can_manage_tasks'] },
        ]);

        const deptNames = ['Engineering', 'Product', 'Design', 'Sales', 'HR'];
        const departments = await DepartmentModel.create(deptNames.map(name => ({ name, tenantId })));
        const deptMap = {};
        departments.forEach(d => (deptMap[d.name] = d._id));

        const shifts = await ShiftModel.create([
            { tenantId, name: 'Alpha Core (General)', startTime: '09:00', endTime: '18:00', gracePeriod: 15, workDays: [1, 2, 3, 4, 5] },
            { tenantId, name: 'Beta Morning Protocol', startTime: '07:30', endTime: '16:30', gracePeriod: 10, workDays: [1, 2, 3, 4, 5] },
            { tenantId, name: 'Gamma Evening Watch', startTime: '16:00', endTime: '01:00', gracePeriod: 20, workDays: [1, 2, 3, 4, 5] },
            { tenantId, name: 'Delta Night Command', startTime: '22:00', endTime: '07:00', gracePeriod: 30, workDays: [1, 2, 3, 4, 5] }
        ]);
        const shiftIds = shifts.map(s => s._id);

        const admin = await UserModel.create({
            username: 'admin',
            email: 'admin@company.com',
            full_name: 'Company CEO',
            hashed_password: hashedPassword,
            role: 'admin',
            tenantId,
            department_id: deptMap['Engineering'],
            department: 'Engineering',
            manager: null,
            shift_id: shiftIds[0],
        });

        const managerUsernames = ['jdoe', 'asmith', 'rgreen', 'bblack', 'wwhite'];
        const managers = await UserModel.create(managerUsernames.map((uname, idx) => {
            const dept = departments[idx % departments.length];
            return {
                username: uname,
                email: `${uname}@company.com`,
                full_name: `${uname.charAt(0).toUpperCase() + uname.slice(1)} Manager`,
                hashed_password: hashedPassword,
                role: 'manager',
                tenantId,
                department_id: dept._id,
                department: dept.name,
                manager: admin._id,
                shift_id: shiftIds[idx % shiftIds.length],
            };
        }));

        const employeeUsernames = ['mwhite', 'kbrown', 'tblack', 'cgrey', 'pblue'];
        const employees = await UserModel.create(employeeUsernames.map((uname, idx) => {
            const dept = departments[idx % departments.length];
            return {
                username: uname,
                email: `${uname}@company.com`,
                full_name: `${uname.charAt(0).toUpperCase() + uname.slice(1)} Worker`,
                hashed_password: hashedPassword,
                role: 'employee',
                tenantId,
                department_id: dept._id,
                department: dept.name,
                manager: managers[idx % managers.length]._id,
                shift_id: shiftIds[idx % shiftIds.length],
            };
        }));

        await BillingModel.create({ tenantId, planType: 'Pro', status: 'Active', billingCycle: 'Monthly', nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });

        res.json({ message: `Database ${db_name} created and seeded successfully!` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Migration failed', details: err.message });
    }
});

module.exports = router;