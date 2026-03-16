const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController');

// The Python API has exactly @router.post("/token") on the root app
router.post('/token', loginUser);

module.exports = router;
