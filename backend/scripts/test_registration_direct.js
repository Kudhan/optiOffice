const axios = require('axios');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function testRegistrationDirectly() {
  const BASE_URL = 'https://optiflow.backend.logybyte.in';
  const JWT_SECRET = process.env.JWT_SECRET || 'office_management_project_part_time';

  try {
    // Manually sign a token for admin
    console.log('[TEST] Manually signing JWT token for admin...');
    const token = jwt.sign(
      {
        id: '69c7fe101eeea0c8fb946dcf',
        sub: 'admin',
        role: 'admin',
        tenantId: 'default_tenant'
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('[TEST] Token signed.');

    // Create new user via API
    console.log('[TEST] Creating new user for: kudhanshaik01@gmail.com...');
    const createRes = await axios.post(`${BASE_URL}/users`, {
      full_name: 'Kudhan Test User',
      username: 'kudhanshaik_onboarding',
      email: 'kudhanshaik01@gmail.com',
      role: 'employee',
      department: 'Engineering',
      privateIdentity: {
        legalName: 'Kudhan Test User',
        panNumber: 'TEST-PAN-001',
        aadharNumber: '1234 5678 9012'
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('[TEST] User Creation Response:', createRes.data);
    console.log('\n[SUCCESS] Onboarding API called successfully.');
    console.log('[INFO] Email should be dispatched to kudhanshaik01@gmail.com via Logybyte API.');

  } catch (err) {
    console.error('[TEST ERROR]', err.response?.data || err.message);
  }
}

testRegistrationDirectly();
