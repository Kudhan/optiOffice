const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function audit() {
    try {
        const monURI = process.env.MONGO_URI;
        if (!monURI) throw new Error('MONGO_URI is missing');
        
        const uri = monURI.includes('?') 
          ? monURI.replace('?', 'optiflow_db?') 
          : `${monURI}/optiflow_db`;

        await mongoose.connect(uri);
        
        // Use the specific collection name from User.js
        const User = mongoose.model('User', new mongoose.Schema({
            tenantId: String,
            role: String,
            full_name: String
        }, { collection: 'users_collection' }));
        
        const roles = await User.distinct('role');
        console.log('ALL UNIQUE ROLES IN DB:', roles);

        const counts = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);
        console.log('ROLE COUNTS:', counts);

        // Sample users with "manager" related roles
        const managers = await User.find({ 
            role: { $regex: /manage/i } 
        }).select('full_name role tenantId').limit(10).lean();
        
        console.log('SAMPLE MANAGERS FOUND:', managers.length);
        managers.forEach(m => {
            console.log(`- ${m.full_name} | Role: "${m.role}" | Tenant: [${m.tenantId}]`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
audit();
