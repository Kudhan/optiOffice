const express = require('express');
const router = express.Router();
const { 
  createTicket, 
  getTickets, 
  getTicketById,
  updateTicketStatus, 
  addComment,
  assignTicket,
  getEligibleAgents
} = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createTicket);
router.get('/', getTickets);
router.get('/agents/eligible', getEligibleAgents);
router.get('/:id', getTicketById);
router.put('/:id', updateTicketStatus);
router.put('/:id/assign', assignTicket);
router.post('/:id/comments', addComment);

module.exports = router;
