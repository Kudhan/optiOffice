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
const Holiday = require('../models/Holiday');

// Connection
const connectDB = require('../config/db');

const seedDB = async () => {
    try {
        await connectDB();
        
        console.log('Clearing existing data from users_collection, attendances_collection, etc...');
        await User.deleteMany({});
        await Attendance.deleteMany({});
        await Task.deleteMany({});
        await Leave.deleteMany({});
        await Billing.deleteMany({});
        await Asset.deleteMany({});
        await Holiday.deleteMany({});

        console.log('Inserting Mock Data for OptiOffice...');

        const tenantId = 'acme_corp';
        const hashedPassword = await bcrypt.hash('password123', 10);

        // 1. Create Users
        console.log('Creating users...');
        await User.create([
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
                department: 'Engineering'
            },
            {
                username: 'asmith',
                email: 'asmith@acmecorp.com',
                full_name: 'Alice Smith',
                hashed_password: hashedPassword,
                role: 'employee',
                tenantId: tenantId,
                department: 'Marketing'
            }
        ]);

        // 2. Create Billing
        console.log('Creating billing record...');
        await Billing.create({
            tenantId: tenantId,
            planType: 'Pro',
            status: 'Active',
            billingCycle: 'Monthly',
            nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        // 3. Create Tasks
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

        // 4. Create Attendance
        console.log('Creating attendance records...');
        await Attendance.create({
            tenantId: tenantId,
            username: 'jdoe',
            date: new Date().toISOString().split('T')[0],
            status: 'Present',
            check_in: new Date(new Date().setHours(9, 0, 0)),
            check_out: new Date(new Date().setHours(17, 0, 0))
        });

        // 5. Create Leaves
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

        // 6. Create Assets
        console.log('Creating assets...');
        await Asset.create({
            tenantId: tenantId,
            name: 'MacBook Pro M3',
            type: 'Laptop',
            assigned_to: 'jdoe',
            status: 'Assigned'
        });

        // 7. Create Holidays
        console.log('Creating holidays...');
        await Holiday.create({
            tenantId: tenantId,
            name: 'Christmas',
            date: '2024-12-25',
            type: 'Public',
            description: 'Public Holiday'
        });

        console.log('\n✅ Seeding Complete. OptiOffice is ready for testing.');
        console.log('----------------------------------------------------');
        console.log('TenantID | acme_corp');
        console.log('Role     | Username | Password');
        console.log('----------------------------------------------------');
        console.log('Admin    | admin    | password123');
        console.log('Employee | jdoe     | password123');
        console.log('Employee | asmith   | password123');
        console.log('----------------------------------------------------');
        process.exit();
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedDB();
