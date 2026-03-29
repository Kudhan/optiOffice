const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkMe() {
    try {
        const monURI = process.env.MONGO_URI;
        const uri = monURI.includes('?') ? monURI.replace('?', 'optioffice_db?') : `${monURI}/optioffice_db`;
        await mongoose.connect(uri);
        const User = mongoose.model('User', new mongoose.Schema({}, { collection: 'users_collection', strict: false }));
        
        // Find the user with role "admin" (which I assume is the one I'm logged in as)
        const me = await User.findOne({ role: /Admin/i }).sort({ updatedAt: -1 }).lean();
        if (me) {
            console.log(`CURRENT USER: ${me.full_name} | Role: ${me.role} | Tenant: [${me.tenantId}]`);
            
            const colleagues = await User.find({ tenantId: me.tenantId }).select('full_name role').lean();
            console.log(`COLLEAGUES IN ${me.tenantId}:`, colleagues.map(c => `${c.full_name} (${c.role})`));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkMe();
