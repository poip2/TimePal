const express = require('express');
const router = express.Router();

// 游戏相关路由
router.get('/', (req, res) => {
  res.json({ message: '获取游戏列表' });
});

router.post('/', (req, res) => {
  res.json({ message: '创建游戏' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `获取游戏 ${req.params.id}` });
});

router.put('/:id', (req, res) => {
  res.json({ message: `更新游戏 ${req.params.id}` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `删除游戏 ${req.params.id}` });
});

module.exports = router;
