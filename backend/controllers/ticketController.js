const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * @desc    Create new ticket
 * @route   POST /api/v1/tickets
 */
const createTicket = async (req, res) => {
  try {
    const { subject, description, category, priority } = req.body;
    
    // SLA Calculation
    let slaHours = 72;
    if (priority === 'Urgent') slaHours = 4;
    else if (priority === 'High') slaHours = 24;
    else if (priority === 'Medium') slaHours = 48;

    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + slaHours);

    const ticket = await Ticket.create({
      subject,
      description,
      category,
      priority,
      status: 'Pending',
      dueDate,
      createdBy: req.user.id,
      tenantId: req.user.tenantId
    });

    res.status(201).json(ticket);

    // Notify IT Department if applicable
    if (category === 'IT') {
        const itUsers = await User.find({ department: 'IT', tenantId: req.user.tenantId });
        const notifications = itUsers.map(u => ({
            recipient: u._id,
            message: `New IT Support Ticket: ${subject}`,
            type: 'NewTicket',
            relatedId: ticket._id,
            tenantId: req.user.tenantId
        }));
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }
    }
  } catch (error) {
    console.error('[TicketController] Create Error:', error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get tickets with departmental scoping
 * @route   GET /api/v1/tickets
 */
const getTickets = async (req, res) => {
  try {
    const { role, department, tenantId } = req.user;
    const userId = req.user._id.toString();

    if (!tenantId) return res.status(403).json({ message: "Access Denied: No Tenant Identity" });

    let query = { tenantId };
    if (role !== 'admin' && role !== 'super-admin') {
      if (role === 'agent') {
        if (department) query.category = department;
      } else {
        query.createdBy = userId;
      }
    }

    // Use .lean() for performance and to avoid Mongoose internal cloning bugs
    let tickets = await Ticket.find(query)
      .populate('createdBy', 'full_name username email role')
      .populate('assignedTo', 'full_name username email role')
      .populate('comments.sender', 'full_name username role profile_photo')
      .sort({ createdAt: -1 })
      .lean();

    const isAgentOrAdmin = role === 'agent' || role === 'admin' || role === 'super-admin';
    
    // Manual Serialization and Filtering
    const processedTickets = tickets.map(t => {
      // Ensure ID is present
      const id = t._id ? t._id.toString() : null;
      
      // Filter comments if not agent/admin
      let comments = t.comments || [];
      if (!isAgentOrAdmin) {
        comments = comments.filter(c => c && !c.isPrivate);
      }

      // Return clean POJO with consistent 'id'
      return {
        ...t,
        id,
        comments
      };
    });

    res.json(processedTickets);
  } catch (error) {
    console.error('[HelpDesk] getTickets Failure:', error.stack);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get single ticket
 */
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId, role } = req.user;
    
    const ticket = await Ticket.findOne({ _id: id, tenantId })
      .populate('createdBy', 'full_name username email role')
      .populate('assignedTo', 'full_name username email role')
      .populate('comments.sender', 'full_name username role profile_photo')
      .lean();

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const isAgentOrAdmin = role === 'agent' || role === 'admin' || role === 'super-admin';
    
    // Manual Serialization
    const ticketId = ticket._id ? ticket._id.toString() : null;
    let comments = ticket.comments || [];
    if (!isAgentOrAdmin) {
        comments = comments.filter(c => c && !c.isPrivate);
    }

    res.json({
        ...ticket,
        id: ticketId,
        comments
    });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: "Invalid Ticket ID format" });
    console.error('[HelpDesk] getTicketById Failure:', error.stack);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Update ticket status
 */
const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { tenantId } = req.user;

    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, tenantId },
      { status },
      { new: true }
    );

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (error) {
    console.error('[TicketController] Update Error:', error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Add comment
 */
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, isPrivate } = req.body;
    const { id: userId, tenantId, role } = req.user;

    const ticket = await Ticket.findOne({ _id: id, tenantId });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.comments.push({
      sender: userId,
      message,
      isPrivate: !!isPrivate,
      timestamp: new Date()
    });

    await ticket.save();
    res.json(ticket);

    // Notify employee on agent reply
    const isAgentOrAdmin = role === 'agent' || role === 'admin' || role === 'super-admin';
    if (isAgentOrAdmin && !isPrivate && ticket.createdBy.toString() !== userId) {
        try {
            await Notification.create({
                recipient: ticket.createdBy,
                message: `Support Team replied to: ${ticket.subject}`,
                type: 'TicketUpdate',
                relatedId: ticket._id,
                tenantId: tenantId
            });
        } catch (notifErr) {}
    }
  } catch (error) {
    console.error('[TicketController] Comment Error:', error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  addComment
};
