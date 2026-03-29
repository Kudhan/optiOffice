const express = require('express');
const router = express.Router();
const { loginUser, setupPassword } = require('../controllers/authController');

// The Python API has exactly @router.post("/token") on the root app
router.post('/token', loginUser);
router.post('/setup-password', setupPassword);

module.exports = router;
