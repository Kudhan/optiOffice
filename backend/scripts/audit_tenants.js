const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function audit() {
    try {
        const monURI = process.env.MONGO_URI;
        if (!monURI) throw new Error('MONGO_URI is missing');
        
        const uri = monURI.includes('?') 
          ? monURI.replace('?', 'optioffice_db?') 
          : `${monURI}/optioffice_db`;

        await mongoose.connect(uri);
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        
        // Find a sample user to get the tenantId
        const sample = await User.findOne({ email: /@/ });
        const tenantId = sample ? sample.tenantId : 'unknown';

        console.log(`AUDITING TENANT: ${tenantId}`);

        const users = await User.find({ tenantId }).select('full_name role status').lean();
        console.log(`FOUND ${users.length} USERS:`);
        users.forEach(u => {
            console.log(`- ${u.full_name} | Role: "${u.role}" | Status: ${u.status}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
audit();
