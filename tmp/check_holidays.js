const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

const Holiday = require('../backend/models/Holiday');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
        
        const count = await Holiday.countDocuments({});
        console.log("Total Holidays in DB:", count);
        
        const samples = await Holiday.find({}).limit(10);
        console.log("Sample Holidays:");
        samples.forEach(h => {
            console.log(`- ${h.name} | ${h.date.toISOString()} | Tenant: ${h.tenantId}`);
        });
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
