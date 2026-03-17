const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.get('/', protect, getTasks);
router.post('/', protect, authorize('can_manage_tasks'), createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, authorize('can_manage_tasks'), deleteTask);

module.exports = router;
