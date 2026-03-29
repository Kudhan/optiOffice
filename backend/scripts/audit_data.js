const mongoose = require('mongoose');
require('dotenv').config();

async function audit() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Ticket = mongoose.model('Ticket', new mongoose.Schema({ tenantId: mongoose.Schema.Types.Mixed }, { strict: false }));
        
        const tickets = await Ticket.find({}).lean();
        console.log(`TOTAL TICKETS: ${tickets.length}`);
        
        tickets.forEach(t => {
            console.log(`ID: ${t._id} | Subject: ${t.subject} | TenantId: ${t.tenantId} | Type: ${typeof t.tenantId}`);
        });

        const users = await mongoose.model('User', new mongoose.Schema({}, { strict: false })).find({}).select('_id full_name tenantId').lean();
        console.log('\nTOTAL USERS: ' + users.length);
        users.forEach(u => {
            console.log(`UserID: ${u._id} | Name: ${u.full_name} | Tenant: ${u.tenantId} | Type: ${typeof u.tenantId}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
audit();
