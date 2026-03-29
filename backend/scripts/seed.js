const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const { Leave } = require('../models/Leave');
const Asset = require('../models/Asset');
const Department = require('../models/Department');
const Role = require('../models/Role');
const Holiday = require('../models/Holiday');
const Shift = require('../models/Shift');

// Connection
const connectDB = require('../config/db');

const seedDB = async () => {
    try {
        await connectDB();
        
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Role.deleteMany({});
        await Department.deleteMany({});
        await Attendance.deleteMany({});
        await Task.deleteMany({});
        await Leave.deleteMany({});
        await Asset.deleteMany({});
        await Holiday.deleteMany({});
        await Shift.deleteMany({});

        console.log('Inserting Mock Data for OptiFlow...');

        const tenantId = 'optiFlow_corp';
        const hashedPassword = await bcrypt.hash('password123', 10);

        // 1. Create Default Roles
        console.log('Creating default roles...');
        const roles = await Role.create([
            {
                tenantId: null, // Global Role
                name: 'super-admin',
                description: 'Global System Overlord',
                permissions: ['*', 'can_view_sensitive_data']
            },
            {
                tenantId: tenantId,
                name: 'admin',
                description: 'Full system access',
                permissions: ['can_manage_users', 'can_manage_tasks', 'can_manage_holidays', 'can_view_all_attendance', 'can_approve_leaves', 'can_view_sensitive_data']
            },
            {
                tenantId: tenantId,
                name: 'manager',
                description: 'Team management access',
                permissions: ['can_manage_tasks', 'can_view_all_attendance', 'can_approve_leaves']
            },
            {
                tenantId: tenantId,
                name: 'employee',
                description: 'Standard employee access',
                permissions: ['can_manage_tasks']
            }
        ]);

        // 2. Create Departments
        console.log('Creating departments...');
        const deptNames = ['Engineering', 'Product', 'Design', 'Sales', 'HR'];
        const departmentDocs = await Department.create(deptNames.map(name => ({ name, tenantId })));
        const deptMap = {};
        departmentDocs.forEach(d => deptMap[d.name] = d._id);

        // 2.5 Create Shift Templates
        console.log('Creating shift patterns...');
        const shifts = await Shift.create([
            {
                tenantId: tenantId,
                name: 'Alpha Core (General)',
                startTime: '09:00',
                endTime: '18:00',
                gracePeriod: 15,
                workDays: [1, 2, 3, 4, 5]
            },
            {
                tenantId: tenantId,
                name: 'Beta Morning Protocol',
                startTime: '07:30',
                endTime: '16:30',
                gracePeriod: 10,
                workDays: [1, 2, 3, 4, 5]
            },
            {
                tenantId: tenantId,
                name: 'Gamma Evening Watch',
                startTime: '16:00',
                endTime: '01:00',
                gracePeriod: 20,
                workDays: [1, 2, 3, 4, 5]
            },
            {
                tenantId: tenantId,
                name: 'Delta Night Command',
                startTime: '22:00',
                endTime: '07:00',
                gracePeriod: 30,
                workDays: [1, 2, 3, 4, 5]
            }
        ]);
        const shiftIds = shifts.map(s => s._id);

        // 3. Create Users (Hierarchical)
        console.log('Creating users with hierarchical links...');
        
        // CEO/Admin first
        const adminDoc = await User.create({
            username: 'admin',
            email: 'admin@optiflow.com',
            full_name: 'OptiFlow CEO',
            hashed_password: hashedPassword,
            role: 'admin',
            tenantId: tenantId,
            department_id: deptMap['Engineering'],
            department: 'Engineering',
            manager: null,
            shift_id: shiftIds[0],
            publicProfile: {
                preferredName: 'The CEO',
                bio: 'Strategic commander of OptiOffice operations.',
                skills: ['Leadership', 'Strategy', 'Innovation'],
                workEmail: 'ceo@optioffice.com'
            },
            privateIdentity: {
                legalName: 'Optimus Prime CEO',
                dob: '1980-01-01',
                gender: 'Male',
                nationality: 'Cybertronian',
                panNumber: 'CEO-PAN-777',
                aadharNumber: '1234 5678 9012'
            },
            secureVault: {
                bankDetails: {
                    accountNumber: '1234567890',
                    ifscCode: 'BANK001',
                    bankName: 'Global Reserve',
                    accountHolder: 'Optimus Prime'
                }
            }
        });

        // Managers
        const managerUsernames = ['jdoe', 'asmith', 'rgreen', 'bblack', 'wwhite'];
        const managers = await User.create(managerUsernames.map((uname, idx) => {
            const dept = departmentDocs[idx % departmentDocs.length];
            return {
                username: uname,
                email: `${uname}@optiflow.com`,
                full_name: `${uname.charAt(0).toUpperCase() + uname.slice(1)} Manager`,
                hashed_password: hashedPassword,
                role: 'manager',
                tenantId: tenantId,
                department_id: dept._id,
                department: dept.name,
                manager: adminDoc._id,
                shift_id: shiftIds[idx % shiftIds.length],
                publicProfile: {
                    preferredName: uname,
                    bio: `Departmental lead for ${dept.name}.`,
                    skills: ['Management', 'Coordination']
                },
                privateIdentity: {
                    legalName: `${uname.toUpperCase()} LEGAL NAME`,
                    panNumber: `PAN-${idx}-MGR`
                }
            };
        }));

        // Employees
        const employeeUsernames = [
            'mwhite', 'kbrown', 'tblack', 'cgrey', 'pblue', 'spurple', 'yorange', 'fred', 'lyellow', 'gsilver',
            'awilson', 'bcook', 'cdavis', 'dking', 'emiller', 'fclark', 'gharris', 'ityler', 'jmoore', 'kwright',
            'lrobinson', 'mwood', 'nhill', 'oevans', 'pwright', 'qscott', 'rtaylor', 'syoung', 'tallen', 'uwalker'
        ];
        const employees = await User.create(employeeUsernames.map((uname, idx) => {
            const dept = departmentDocs[idx % departmentDocs.length];
            return {
                username: uname,
                email: `${uname}@optiflow.com`,
                full_name: `${uname.charAt(0).toUpperCase() + uname.slice(1)} Worker`,
                hashed_password: hashedPassword,
                role: 'employee',
                tenantId: tenantId,
                department_id: dept._id,
                department: dept.name,
                manager: managers[idx % managers.length]._id,
                shift_id: shiftIds[Math.floor(Math.random() * shiftIds.length)],
                publicProfile: {
                    preferredName: uname,
                    skills: ['Operational Support']
                },
                privateIdentity: {
                    legalName: `${uname.toUpperCase()} WORKER NAME`,
                    panNumber: `PAN-${idx}-EMP`
                }
            };
        }));

        // Super Admin (Global)
        await User.create({
            username: 'superadmin',
            email: 'super@optiflow.com',
            full_name: 'The Overlord',
            hashed_password: hashedPassword, // Use the same 'password123' hash defined above
            role: 'super-admin',
            tenantId: 'global',
            department_id: null,
            manager: null
        });

        const users = [adminDoc, ...managers, ...employees];
        const allUsernames = ['admin', ...managerUsernames, ...employeeUsernames];


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
            assigned_to: [users[idx % users.length]._id],
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
                    // Randomize presence (90% chance for more data)
                    if (Math.random() > 0.1) {
                        // Random Check-in: 08:30 AM - 10:15 AM
                        const checkInHour = 8;
                        const checkInMin = Math.floor(Math.random() * 105); // 0 to 105 mins after 8:00
                        const checkInDate = new Date(`${day}T00:00:00Z`);
                        checkInDate.setUTCHours(checkInHour, checkInMin, 0, 0);

                        // Random Check-out: 05:00 PM - 06:30 PM
                        const checkOutHour = 17;
                        const checkOutMin = Math.floor(Math.random() * 90);
                        const checkOutDate = new Date(`${day}T00:00:00Z`);
                        checkOutDate.setUTCHours(checkOutHour, checkOutMin, 0, 0);

                        // Calculate workHours
                        const diffMs = checkOutDate - checkInDate;
                        const workHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

                        // Determine status
                        const threshold = new Date(`${day}T09:30:00Z`);
                        const status = checkInDate > threshold ? 'Late' : 'Present';

                        attendanceDocs.push({
                            tenantId: tenantId,
                            user: u._id,
                            date: day,
                            status,
                            checkIn: checkInDate,
                            checkOut: checkOutDate,
                            workHours
                        });
                    }
                });
            }
        });
        await Attendance.create(attendanceDocs);

        // 6. Create Leaves
        console.log('Creating pending leaves...');
        await Leave.create([
            { tenantId, username: 'asmith', type: 'EL', startDate: '2024-03-25', endDate: '2024-03-28', status: 'Pending', user: managers[1]._id },
            { tenantId, username: 'jdoe', type: 'SL', startDate: '2024-03-18', endDate: '2024-03-19', status: 'Approved', user: managers[0]._id },
            { tenantId, username: 'rgreen', type: 'CL', startDate: '2024-03-20', endDate: '2024-03-21', status: 'Pending', user: managers[2]._id }
        ]);

        // 7. Create Assets
        console.log('Creating assets...');
        await Asset.create([
            { tenantId, name: 'MacBook Pro M3', type: 'Laptop', assigned_to: managers[0]._id, status: 'Assigned', category: 'Electronics' },
            { tenantId, name: 'Dell UltraSharp', type: 'Monitor', assigned_to: managers[1]._id, status: 'Assigned', category: 'Electronics' }
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

        console.log('\n✅ Seeding Complete. OptiFlow is ready for testing.');
        console.log('----------------------------------------------------');
        console.log('TenantID        | Role        | Username    | Password');
        console.log('----------------------------------------------------');
        console.log('global          | Super Admin | superadmin  | password123');
        console.log('optiFlow_corp   | Admin       | admin       | password123');
        console.log('optiFlow_corp   | Employee    | jdoe        | password123');
        console.log('optiFlow_corp   | Employee    | asmith      | password123');
        console.log('----------------------------------------------------');
        process.exit();
    } catch (err) {
        const errorLog = `Error seeding data: ${err.stack || err}\n${err.errors ? JSON.stringify(err.errors, null, 2) : ''}`;
        require('fs').writeFileSync('seed_debug.log', errorLog);
        process.exit(1);
    }
};

seedDB();
