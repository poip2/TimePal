const express = require('express');
const router = express.Router();

// 用户相关路由
router.get('/', (req, res) => {
  res.json({ message: '获取用户列表' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `获取用户 ${req.params.id}` });
});

router.put('/:id', (req, res) => {
  res.json({ message: `更新用户 ${req.params.id}` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `删除用户 ${req.params.id}` });
});

module.exports = router;
