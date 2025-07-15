const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// 公开路由
router.post('/register', authController.register);
router.post('/login', authController.login);

// 受保护的路由
router.get('/me', auth.authenticateToken, authController.getCurrentUser);
router.put('/profile', auth.authenticateToken, authController.updateProfile);

module.exports = router;
