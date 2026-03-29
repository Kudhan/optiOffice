const axios = require('axios');

async function testRegistration() {
  const BASE_URL = 'https://optiflow.backend.logybyte.in';

  try {
    // 1. Login as admin
    console.log('[TEST] Logging in as admin...');
    const loginRes = await axios.post(`${BASE_URL}/token`, {
      username: 'admin',
      password: 'admin123'
    });

    const token = loginRes.data.access_token;
    console.log('[TEST] Login successful. Token obtained.');

    // 2. Create new user via API
    console.log('[TEST] Creating new user for: kudhanshaik01@gmail.com...');
    const createRes = await axios.post(`${BASE_URL}/users`, {
      full_name: 'Test Onboarding User',
      username: 'kudhan_test',
      email: 'kudhanshaik01@gmail.com',
      role: 'employee',
      department: 'Engineering',
      privateIdentity: {
        legalName: 'Kudhan Shaik Test',
        panNumber: 'TEST-PAN-001'
      },
      secureVault: {
        bankDetails: {
          bankName: 'Test Bank',
          ifscCode: 'TEST0001',
          accountNumber: '1234567890'
        }
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('[TEST] User Creation Response:', createRes.data);
    console.log('\n[SUCCESS] The onboarding token has been generated and the email service should have been triggered.');
    console.log('[INFO] Check kudhanshaik01@gmail.com for the invitation email!');

  } catch (err) {
    console.error('[TEST ERROR]', err.response?.data || err.message);
  }
}

testRegistration();
