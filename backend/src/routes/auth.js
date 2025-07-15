const express = require('express');
const router = express.Router();

// 认证相关路由
router.post('/register', (req, res) => {
  res.json({ message: '用户注册' });
});

router.post('/login', (req, res) => {
  res.json({ message: '用户登录' });
});

router.post('/logout', (req, res) => {
  res.json({ message: '用户登出' });
});

module.exports = router;
