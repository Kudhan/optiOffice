const Task = require('../models/Task');

// @desc    Get tasks mapping by tenantId
// @route   GET /tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    let tasks;
    if (['admin', 'manager'].includes(req.user.role)) {
      tasks = await Task.find({ tenantId: req.user.tenantId });
    } else {
      tasks = await Task.find({ tenantId: req.user.tenantId, assigned_to: req.user.sub });
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create new task
// @route   POST /tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      tenantId: req.user.tenantId
    };
    
    const task = await Task.create(taskData);
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update task
// @route   PUT /tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      req.body,
      { new: true }
    );
    
    if (task) {
      res.json(true);
    } else {
      res.status(404).json({ detail: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete task (Admin/Manager only)
// @route   DELETE /tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ detail: "Not authorized" });
    }
    
    const task = await Task.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    
    if (task) {
      res.json(true);
    } else {
      res.status(404).json({ detail: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
