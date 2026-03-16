const Billing = require('../models/Billing');

const checkActiveSubscription = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    
    // Admins might always need access to billing page even if past due
    if (req.originalUrl.includes('/billing') && req.user.role === 'admin') {
      return next();
    }

    const billing = await Billing.findOne({ tenantId });
    
    // If no record exists, assume they are on the default free plan initially
    if (!billing) {
      return next();
    }

    // Block write requests if subscription is unpaid or canceled
    if (['Unpaid', 'Canceled', 'Past Due'].includes(billing.status)) {
      if (req.method !== 'GET') {
        return res.status(402).json({ 
          detail: "Payment Required. Your subscription is currently " + billing.status 
        });
      }
    }

    next();
  } catch (error) {
    console.error("Billing Check Error", error);
    res.status(500).json({ detail: "Server Error verifying subscription" });
  }
};

module.exports = { checkActiveSubscription };
