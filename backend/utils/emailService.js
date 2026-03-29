const axios = require('axios');

const sendOnboardingEmail = async (user, token) => {
  const API_URL = 'https://mail-flow.logybyte.in/email/send';
  const FIXED_TEMPLATE_ID = '69c90d5963c446bc51a88930';
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  const setupUrl = `${FRONTEND_URL}/setup-password/${token}`;

  const payload = {
    template_id: FIXED_TEMPLATE_ID,
    to: user.email,
    context: {
      full_name: user.full_name,
      setup_url: setupUrl
    }
  };

  try {
    const response = await axios.post(API_URL, payload);
    console.log(`[MAIL-FLOW SERVICE] Onboarding email status: ${response.status}`, response.data);
    console.log(`[ONBOARDING] Invitation successfully dispatched to ${user.email}`);
  } catch (error) {
    console.error(`[MAIL-FLOW ERROR] Failed to send email via Logybyte:`, error.response?.data || error.message);
    
    // Fallback: Always log the URL for development testing
    console.warn(`[DEVELOPER ALERT] Registration for ${user.email} succeeded, but notification failed. Use this link manualy:`);
    console.log(`[DEBUG] SETUP URL: ${setupUrl}`);
  }
};

module.exports = {
  sendOnboardingEmail,
};
