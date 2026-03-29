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
    const tenantIdStr = req.user.tenantId ? req.user.tenantId.toString() : null;
    if (!tenantIdStr) return res.status(403).json({ message: "No Tenant Identity" });

    // Find first available Admin for default assignment
    const defaultAdmin = await User.findOne({ 
      tenantId: tenantIdStr, 
      role: { $in: ['admin', 'Admin'] },
      disabled: { $ne: true }
    }).select('_id').lean();

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
      status: 'Open',
      dueDate,
      createdBy: req.user._id,
      tenantId: tenantIdStr,
      assignedTo: defaultAdmin ? defaultAdmin._id : null
    });

    res.status(201).json(ticket);

    // Notify IT Department if applicable
    if (category === 'IT') {
        try {
            const itUsers = await User.find({ department: 'IT', tenantId: tenantIdStr });
            const notifications = itUsers.map(u => ({
                recipient: u._id,
                message: `New IT Support Ticket: ${subject}`,
                type: 'NewTicket',
                relatedId: ticket._id,
                tenantId: tenantIdStr
            }));
            if (notifications.length > 0) {
                await Notification.create(notifications);
            }
        } catch (notifErr) {
            console.error('[HelpDesk] IT Notification Failure:', notifErr);
        }
    }
  } catch (error) {
    console.error('[HelpDesk] Create Error:', error.stack);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get tickets with departmental scoping
 * @route   GET /api/v1/tickets
 */
const getTickets = async (req, res) => {
  try {
    const tenantId = req.user.tenantId ? req.user.tenantId.toString() : null;
    const { role, department } = req.user;
    const userId = req.user._id.toString();

    if (!tenantId) return res.status(403).json({ message: "Access Denied: No Tenant Identity" });

    const isAdmin = ['admin', 'Admin'].includes(role);
    const isAgent = ['agent', 'Agent'].includes(role);

    let query = {};

    if (isAdmin) {
      // Admins see everything in their tenant (plus any specifically assigned to them from elsewhere)
      query = {
        $or: [
          { tenantId: tenantId },
          { assignedTo: userId }
        ]
      };
    } else if (isAgent) {
      // Agents see department category in their tenant OR assigned to them
      query = {
        $or: [
          { tenantId: tenantId, category: department },
          { assignedTo: userId },
          { createdBy: userId }
        ]
      };
    } else {
      // Managers/Employees see what they created OR what is assigned to them
      query = {
        $or: [
          { createdBy: userId },
          { assignedTo: userId }
        ]
      };
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
    // Safely extract tenantId as string
    const tenantId = req.user.tenantId ? req.user.tenantId.toString() : null;
    const { role } = req.user;
    
    if (!tenantId) return res.status(403).json({ message: "Identity Error: Tenant ID missing" });

    // Use string-based query to match the Ticket model's String type
    const ticket = await Ticket.findOne({ _id: id, tenantId })
      .populate('createdBy', 'full_name username email role')
      .populate('assignedTo', 'full_name username email role')
      .populate('comments.sender', 'full_name username role profile_photo')
      .lean();

    if (!ticket) {
        // Detailed logging for debugging
        console.warn(`[HelpDesk] Ticket ${id} not found. Search params: { _id: ${id}, tenantId: "${tenantId}" }`);
        return res.status(404).json({ message: "Ticket not found" });
    }

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
    const tenantIdStr = req.user.tenantId ? req.user.tenantId.toString() : null;
    const { role } = req.user;
    const userId = req.user._id.toString();

    // Find ticket first to check assignment
    const ticket = await Ticket.findOne({ _id: id });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // Authorization: Admin OR Assigned User OR Creator (if within tenant)
    const isAdmin = ['admin', 'Admin'].includes(role);
    const isAssigned = ticket.assignedTo?.toString() === userId;
    const isCreator = ticket.createdBy?.toString() === userId;

    if (!isAdmin && !isAssigned && !isCreator) {
        return res.status(403).json({ message: "Not authorized to update this ticket" });
    }

    ticket.status = status;
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    console.error('[HelpDesk] Status Update Error:', error.stack);
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
    const tenantIdStr = req.user.tenantId ? req.user.tenantId.toString() : null;
    const { role } = req.user;
    const userId = req.user._id;

    const ticket = await Ticket.findOne({ _id: id, tenantId: tenantIdStr });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // Block comments on resolved/closed tickets
    if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
        return res.status(400).json({ message: "Cannot comment on a deactivated thread. Reopen it first." });
    }

    ticket.comments.push({
      sender: userId,
      message,
      isPrivate: !!isPrivate,
      timestamp: new Date()
    });

    await ticket.save();
    res.json(ticket);

    // Notify employee on agent reply
    const isAgentOrAdmin = ['agent', 'admin', 'Agent', 'Admin'].includes(role);
    if (isAgentOrAdmin && !isPrivate && ticket.createdBy.toString() !== userId.toString()) {
        try {
            await Notification.create({
                recipient: ticket.createdBy,
                message: `Support Team replied to: ${ticket.subject}`,
                type: 'TicketUpdate',
                relatedId: ticket._id,
                tenantId: tenantIdStr
            });
        } catch (notifErr) {}
    }
  } catch (error) {
    console.error('[HelpDesk] Comment Error:', error.stack);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Assign ticket to a manager (ADMIN ONLY)
 * @route   PUT /api/v1/tickets/:id/assign
 */
const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigneeId } = req.body;
    const { role } = req.user;
    const tenantIdStr = req.user.tenantId ? req.user.tenantId.toString() : null;

    // ADMINS can assign
    const isAdmin = ['admin', 'Admin'].includes(role);
    if (!isAdmin) return res.status(403).json({ message: "Only Admins can delegate tickets" });

    // Verify assignee role (Managers only)
    if (assigneeId) {
        const targetQuery = { 
            _id: assigneeId, 
            role: { $in: ['manager', 'Manager', 'Dept-Manager'] } 
        };
        // Admins now have global assignment capability as per request
        const target = await User.findOne(targetQuery).lean();
        if (!target) return res.status(400).json({ message: "Tickets can only be assigned to Managers" });
    }

    // Update Ticket - Admins now ignore tenant scoping (Global Controls)
    const ticket = await Ticket.findOneAndUpdate(
      { _id: id },
      { assignedTo: assigneeId },
      { new: true }
    ).populate('assignedTo', 'full_name username email role');

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // Notify the assignee
    if (assigneeId) {
        try {
            await Notification.create({
                recipient: assigneeId,
                message: `Admin has assigned you to ticket: ${ticket.subject}`,
                type: 'TicketUpdate',
                relatedId: ticket._id,
                tenantId: 'global'
            });
        } catch (notifErr) {}
    }

    res.json(ticket);
  } catch (error) {
    console.error('[HelpDesk] assignTicket Failure:', error.stack);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get list of potential assignees (MANAGERS ONLY)
 * @route   GET /api/v1/tickets/agents/eligible
 */
const getEligibleAgents = async (req, res) => {
    try {
        // Discovery is now GLOBAL for Admins
        const agents = await User.find({
            role: { $in: ['manager', 'Manager', 'Dept-Manager'] },
            disabled: { $ne: true }
        }).select('full_name username role').lean();
        
        // Ensure IDs are strings for React keys and selection values
        const processedManagers = agents.map(a => ({
            ...a,
            id: a._id.toString()
        }));

        res.json(processedManagers);
    } catch (error) {
        console.error('[HelpDesk] getEligibleAgents Failure:', error.stack);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  addComment,
  assignTicket,
  getEligibleAgents
};
