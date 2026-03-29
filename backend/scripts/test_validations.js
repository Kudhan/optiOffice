const axios = require('axios');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function testValidations() {
  const BASE_URL = 'http://localhost:8000';
  const JWT_SECRET = process.env.JWT_SECRET || 'office_management_project_part_time';
  
  // Manually sign a token for admin
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

  const testCases = [
    {
      name: 'Invalid PAN',
      data: {
        username: 'v_pan_fail',
        email: 'v_pan_fail@test.com',
        full_name: 'PAN Fail',
        privateIdentity: { panNumber: '12345ABCDE' } // Invalid format
      },
      expectedError: 'Invalid PAN Card Format'
    },
    {
        name: 'Invalid Aadhar',
        data: {
          username: 'v_aadhar_fail',
          email: 'v_aadhar_fail@test.com',
          full_name: 'Aadhar Fail',
          privateIdentity: { aadharNumber: '123-456-789' } // Invalid digit count
        },
        expectedError: 'Invalid Aadhar Number'
    },
    {
        name: 'Invalid IFSC',
        data: {
          username: 'v_ifsc_fail',
          email: 'v_ifsc_fail@test.com',
          full_name: 'IFSC Fail',
          secureVault: { bankDetails: { ifscCode: 'BANK123' } } // Invalid format
        },
        expectedError: 'Invalid IFSC Code'
    }
  ];

  console.log('--- STARTING VALIDATION TESTS ---');

  for (const tc of testCases) {
    try {
      console.log(`[TEST] ${tc.name}...`);
      await axios.post(`${BASE_URL}/users`, tc.data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.error(`[FAIL] ${tc.name} should have failed!`);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      if (msg.includes(tc.expectedError)) {
        console.log(`[SUCCESS] ${tc.name} rejected correctly: ${msg}`);
      } else {
        console.error(`[FAIL] ${tc.name} rejected with wrong error: ${msg}`);
      }
    }
  }

  console.log('--- VALIDATION TESTS COMPLETE ---');
}

testValidations();
