const express = require('express');
const router = express.Router();

// 习惯相关路由
router.get('/', (req, res) => {
  res.json({ message: '获取习惯列表' });
});

router.post('/', (req, res) => {
  res.json({ message: '创建新习惯' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `获取习惯 ${req.params.id}` });
});

router.put('/:id', (req, res) => {
  res.json({ message: `更新习惯 ${req.params.id}` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `删除习惯 ${req.params.id}` });
});

module.exports = router;
