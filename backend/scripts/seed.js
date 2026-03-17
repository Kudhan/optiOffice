require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const Leave = require('../models/Leave');
const Billing = require('../models/Billing');
const Asset = require('../models/Asset');
const Role = require('../models/Role');
const Holiday = require('../models/Holiday');

// Connection
const connectDB = require('../config/db');

const seedDB = async () => {
    try {
        await connectDB();
        
        console.log('Clearing existing data from users_collection, roles_collection, etc...');
        await User.deleteMany({});
        await Role.deleteMany({});
        await Attendance.deleteMany({});
        await Task.deleteMany({});
        await Leave.deleteMany({});
        await Billing.deleteMany({});
        await Asset.deleteMany({});
        await Holiday.deleteMany({});

        console.log('Inserting Mock Data for OptiOffice...');

        const tenantId = 'optiOffice_corp';
        const hashedPassword = await bcrypt.hash('password123', 10);

        // 1. Create Default Roles
        console.log('Creating default roles...');
        const roles = await Role.create([
            {
                tenantId: null, // Global Role
                name: 'super-admin',
                description: 'Global System Overlord',
                permissions: ['*'] // Bypasses anyway, but for completeness
            },
            {
                tenantId: tenantId,
                name: 'admin',
                description: 'Full system access',
                permissions: [
                    'can_manage_users', 
                    'can_manage_tasks', 
                    'can_manage_holidays', 
                    'can_manage_billing', 
                    'can_view_all_attendance',
                    'can_approve_leaves'
                ]
            },
            {
                tenantId: tenantId,
                name: 'manager',
                description: 'Team management access',
                permissions: [
                    'can_manage_tasks', 
                    'can_view_all_attendance',
                    'can_approve_leaves'
                ]
            },
            {
                tenantId: tenantId,
                name: 'employee',
                description: 'Standard employee access',
                permissions: [
                    'can_manage_tasks'
                ]
            }
        ]);

        // 2. Create Users
        console.log('Creating users...');
        const users = await User.create([
            {
                username: 'superadmin',
                email: 'super@optioffice.com',
                full_name: 'The Overlord',
                hashed_password: hashedPassword,
                role: 'super-admin',
                tenantId: 'global',
                department: 'HQ'
            },
            {
                username: 'admin',
                email: 'admin@acmecorp.com',
                full_name: 'OptiOffice Admin',
                hashed_password: hashedPassword,
                role: 'admin',
                tenantId: tenantId,
                department: 'Management'
            },
            {
                username: 'jdoe',
                email: 'jdoe@acmecorp.com',
                full_name: 'John Doe',
                hashed_password: hashedPassword,
                role: 'employee',
                tenantId: tenantId,
                department: 'Engineering',
                manager_id: 'admin'
            },
            {
                username: 'asmith',
                email: 'asmith@acmecorp.com',
                full_name: 'Alice Smith',
                hashed_password: hashedPassword,
                role: 'employee',
                tenantId: tenantId,
                department: 'Marketing',
                manager_id: 'admin'
            }
        ]);

        const adminUser = users.find(u => u.username === 'admin');
        const jdoeUser = users.find(u => u.username === 'jdoe');
        const asmithUser = users.find(u => u.username === 'asmith');

        // 3. Create Billing
        console.log('Creating billing record...');
        await Billing.create({
            tenantId: tenantId,
            planType: 'Pro',
            status: 'Active',
            billingCycle: 'Monthly',
            nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        // 4. Create Tasks
        console.log('Creating tasks...');
        await Task.create([
            {
                tenantId: tenantId,
                title: 'Finalize Q3 Financial Report',
                description: 'Compile the spreadsheet data and send to the board.',
                status: 'In Progress',
                priority: 'High',
                assigned_to: 'admin',
                due_date: new Date().toISOString().split('T')[0]
            },
            {
                tenantId: tenantId,
                title: 'Design New Landing Page',
                description: 'Implement the Bento-box style Tailwind grid.',
                status: 'To Do',
                priority: 'Medium',
                assigned_to: 'jdoe',
                due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                tenantId: tenantId,
                title: 'Setup Google Analytics',
                description: 'Make sure tracking pixels are live on production.',
                status: 'Done',
                priority: 'Low',
                assigned_to: 'asmith',
                due_date: new Date().toISOString().split('T')[0]
            }
        ]);

        // 5. Create Attendance
        console.log('Creating attendance records...');
        await Attendance.create({
            tenantId: tenantId,
            user: jdoeUser._id,
            date: new Date().toISOString().split('T')[0],
            status: 'Present',
            checkIn: new Date(new Date().setHours(9, 0, 0)),
            checkOut: new Date(new Date().setHours(17, 0, 0))
        });

        // 6. Create Leaves
        console.log('Creating leaves...');
        await Leave.create({
            tenantId: tenantId,
            username: 'asmith',
            type: 'Annual',
            start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            reason: 'Vacation',
            status: 'Pending'
        });

        // 7. Create Assets
        console.log('Creating assets...');
        await Asset.create({
            tenantId: tenantId,
            name: 'MacBook Pro M3',
            type: 'Laptop',
            assigned_to: 'jdoe',
            status: 'Assigned'
        });

        // 8. Create Holidays
        console.log('Creating holidays...');
        await Holiday.create({
            tenantId: tenantId,
            name: 'Christmas',
            date: new Date('2024-12-25'),
            type: 'Public',
            description: 'Public Holiday'
        });

        console.log('\n✅ Seeding Complete. OptiOffice is ready for testing.');
        console.log('----------------------------------------------------');
        console.log('TenantID        | Role        | Username    | Password');
        console.log('----------------------------------------------------');
        console.log('global          | Super Admin | superadmin  | password123');
        console.log('optiOffice_corp | Admin       | admin       | password123');
        console.log('optiOffice_corp | Employee    | jdoe        | password123');
        console.log('optiOffice_corp | Employee    | asmith      | password123');
        console.log('----------------------------------------------------');
        process.exit();
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedDB();
