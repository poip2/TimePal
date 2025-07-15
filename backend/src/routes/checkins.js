const express = require('express');
const router = express.Router();

// 打卡相关路由
router.get('/', (req, res) => {
  res.json({ message: '获取打卡记录' });
});

router.post('/', (req, res) => {
  res.json({ message: '创建打卡记录' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `获取打卡 ${req.params.id}` });
});

router.put('/:id', (req, res) => {
  res.json({ message: `更新打卡 ${req.params.id}` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `删除打卡 ${req.params.id}` });
});

module.exports = router;
