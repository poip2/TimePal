const express = require('express');
const router = express.Router();

// 成就相关路由
router.get('/', (req, res) => {
  res.json({ message: '获取成就列表' });
});

router.post('/', (req, res) => {
  res.json({ message: '创建成就' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `获取成就 ${req.params.id}` });
});

router.put('/:id', (req, res) => {
  res.json({ message: `更新成就 ${req.params.id}` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `删除成就 ${req.params.id}` });
});

module.exports = router;
