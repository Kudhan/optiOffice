const Billing = require('../models/Billing');
const User = require('../models/User');

// @desc    Get billing info
// @route   GET /billing
// @access  Private (Admin only)
const getBillingInfo = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ detail: "Not authorized" });
    }

    let billing = await Billing.findOne({ tenantId: req.user.tenantId });
    if (!billing) {
      // Create a default free plan
      billing = await Billing.create({
        tenantId: req.user.tenantId,
        planType: 'Free',
        status: 'Active',
        userLimit: 10
      });
    }

    // Include current usage in the response
    const currentUserCount = await User.countDocuments({ tenantId: req.user.tenantId });

    res.json({
      ...billing.toObject(),
      currentUserCount,
      usageRemaining: billing.userLimit - currentUserCount
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    MOCK endpoint: Upgrade plan/make payment
// @route   POST /billing/mock-payment
// @access  Private
const mockPayment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ detail: "Not authorized" });
    }

    const { planType } = req.body;
    
    // Set user limits based on plan
    let newLimit = 10;
    if (planType === 'Pro') newLimit = 50;
    if (planType === 'Enterprise') newLimit = 500;

    // Simulate next month payment date
    let nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);

    const billing = await Billing.findOneAndUpdate(
      { tenantId: req.user.tenantId },
      {
        planType: planType || 'Pro',
        status: 'Active',
        nextPaymentDate: nextDate,
        userLimit: newLimit
      },
      { new: true, upsert: true }
    );

    res.json({
      message: "Payment successful. Subscription upgraded.",
      billing
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getBillingInfo,
  mockPayment
};
