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

        // 2. Create Departments & Users
        console.log('Creating users across departments...');
        const departments = ['Engineering', 'Product', 'Design', 'Sales', 'HR'];
        const usernames = [
            'superadmin', 'admin', 'jdoe', 'asmith', 'rgreen', 
            'mwhite', 'kbrown', 'tblack', 'cgrey', 'pblue', 
            'spurple', 'yorange', 'fred', 'lyellow', 'gsilver'
        ];

        const userDocs = usernames.map((uname, idx) => ({
            username: uname,
            email: `${uname}@optioffice.com`,
            full_name: uname === 'superadmin' ? 'The Overlord' : `${uname.charAt(0).toUpperCase() + uname.slice(1)} Worker`,
            hashed_password: hashedPassword,
            role: uname === 'superadmin' ? 'super-admin' : (uname === 'admin' ? 'admin' : (idx < 6 ? 'manager' : 'employee')),
            tenantId: uname === 'superadmin' ? 'global' : tenantId,
            department: uname === 'superadmin' ? 'HQ' : departments[idx % departments.length],
            manager_id: (uname === 'superadmin' || uname === 'admin') ? null : 'admin'
        }));

        const users = await User.create(userDocs);

        // 3. Create Billing
        console.log('Creating billing record...');
        await Billing.create({
            tenantId: tenantId,
            planType: 'Pro',
            status: 'Active',
            billingCycle: 'Monthly',
            nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        // 4. Create Tasks (20+)
        console.log('Creating 20+ distributed tasks...');
        const taskTitles = [
            'Finalize Q3 Financial Report', 'Design New Landing Page', 'Setup Google Analytics',
            'Fix Authentication Bug', 'Refactor Middleware', 'Update Employee Handbook',
            'Prepare Board Meeting Slides', 'Review Pull Requests', 'Database Migration',
            'Patch Security Vulnerability', 'Client Onboarding', 'Sprint Planning',
            'Optimize Database Queries', 'Frontend Performance Audit', 'Unit Test Coverage',
            'API Documentation Update', 'Logo Redesign', 'Social Media Strategy',
            'Budget Allocation', 'server scaling', 'weekly sync'
        ];

        const taskDocs = taskTitles.map((title, idx) => ({
            tenantId: tenantId,
            title,
            description: `Automated task description for ${title}`,
            status: idx % 3 === 0 ? 'To Do' : (idx % 3 === 1 ? 'In Progress' : 'Done'),
            priority: idx % 4 === 0 ? 'High' : (idx % 4 === 1 ? 'Medium' : 'Low'),
            assigned_to: usernames[idx % usernames.length],
            due_date: new Date(Date.now() + (idx - 5) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }));
        await Task.create(taskDocs);

        // 5. Create Attendance (Last 5 days of history for Weekly presence)
        console.log('Creating historical attendance records...');
        const attendanceDocs = [];
        const last5Days = [0, 1, 2, 3, 4].map(d => {
            const date = new Date();
            date.setDate(date.getDate() - d);
            return date.toISOString().split('T')[0];
        });

        users.forEach(u => {
            if (u.tenantId === tenantId) {
                last5Days.forEach(day => {
                    // Randomize presence (80% chance)
                    if (Math.random() > 0.2) {
                        attendanceDocs.push({
                            tenantId: tenantId,
                            user: u._id,
                            date: day,
                            status: 'Present',
                            checkIn: new Date(`${day}T09:00:00Z`),
                            checkOut: new Date(`${day}T17:00:00Z`)
                        });
                    }
                });
            }
        });
        await Attendance.create(attendanceDocs);

        // 6. Create Leaves
        console.log('Creating pending leaves...');
        await Leave.create([
            { tenantId, username: 'asmith', type: 'Annual', start_date: '2024-03-25', end_date: '2024-03-28', status: 'Pending' },
            { tenantId, username: 'jdoe', type: 'Sick', start_date: '2024-03-18', end_date: '2024-03-19', status: 'Approved' },
            { tenantId, username: 'rgreen', type: 'Casual', start_date: '2024-03-20', end_date: '2024-03-21', status: 'Pending' }
        ]);

        // 7. Create Assets
        console.log('Creating assets...');
        await Asset.create([
            { tenantId, name: 'MacBook Pro M3', type: 'Laptop', assigned_to: 'jdoe', status: 'Assigned' },
            { tenantId, name: 'Dell UltraSharp', type: 'Monitor', assigned_to: 'asmith', status: 'Assigned' }
        ]);

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
