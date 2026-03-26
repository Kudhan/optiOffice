const Billing = require('../models/Billing');
const User = require('../models/User');
const Invoice = require('../models/Invoice');

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
      billing = await Billing.create({
        tenantId: req.user.tenantId,
        planType: 'Free',
        status: 'Active',
        userLimit: 10
      });
    }

    // Include current usage and latest invoices
    const currentUserCount = await User.countDocuments({ tenantId: req.user.tenantId });
    const invoices = await Invoice.find({ tenantId: req.user.tenantId }).sort({ billingDate: -1 }).limit(5);

    res.json({
      ...billing.toObject(),
      currentUserCount,
      usageRemaining: billing.userLimit - currentUserCount,
      invoices
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all invoices
// @route   GET /billing/invoices
// @access  Private (Admin only)
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ tenantId: req.user.tenantId }).sort({ billingDate: -1 });
    res.json(invoices);
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

    const { planType, billingCycle = 'Monthly' } = req.body;
    
    let newLimit = 10;
    let price = 0;
    if (planType === 'Pro') { 
        newLimit = 50; 
        price = billingCycle === 'Monthly' ? 4999 : 49990; 
    }
    if (planType === 'Enterprise') { 
        newLimit = 500; 
        price = billingCycle === 'Monthly' ? 14999 : 149990; 
    }

    let nextDate = new Date();
    if (billingCycle === 'Annually') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
    }

    const billing = await Billing.findOneAndUpdate(
      { tenantId: req.user.tenantId },
      {
        planType: planType || 'Pro',
        status: 'Active',
        billingCycle,
        nextPaymentDate: nextDate,
        userLimit: newLimit
      },
      { new: true, upsert: true }
    );

    // Generate simulated invoice
    const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    await Invoice.create({
      tenantId: req.user.tenantId,
      invoiceNumber,
      amount: price,
      status: 'Paid',
      items: [{
        description: `OptiOffice ${planType} Subscription (${billingCycle})`,
        quantity: 1,
        amount: price
      }]
    });

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
  getInvoices,
  mockPayment
};
