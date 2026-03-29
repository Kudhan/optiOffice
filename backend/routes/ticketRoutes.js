const express = require('express');
const router = express.Router();
const { 
  createTicket, 
  getTickets, 
  getTicketById,
  updateTicketStatus, 
  addComment 
} = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createTicket);
router.get('/', getTickets);
router.get('/:id', getTicketById);
router.put('/:id', updateTicketStatus);
router.post('/:id/comments', addComment);

module.exports = router;
