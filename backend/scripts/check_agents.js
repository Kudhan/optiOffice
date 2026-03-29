const mongoose = require('mongoose');
require('dotenv').config();

async function checkAgents() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        
        // Find all roles to see what we have
        const roles = await User.distinct('role');
        console.log('ALL ROLES IN DB:', roles);

        const tenants = await User.distinct('tenantId');
        console.log('ALL TENANTS IN DB:', tenants);

        const agents = await User.find({
            role: { $in: ['agent', 'admin', 'super-admin', 'Agent', 'Admin', 'Super-Admin'] }
        }).select('full_name role tenantId').lean();

        console.log('\nPOTENTIAL AGENTS WORLDWIDE:', agents.length);
        agents.forEach(a => {
            console.log(`- ${a.full_name} | Role: ${a.role} | Tenant: ${a.tenantId}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkAgents();
