const express = require('express');
const router = express.Router();
const habitsController = require('../controllers/habitsController');
const { authenticateToken } = require('../middleware/auth');

// 所有习惯路由都需要认证
router.use(authenticateToken);

// 习惯相关路由
// GET /api/habits - 获取所有习惯
router.get('/', habitsController.getAllHabits);

// GET /api/habits/stats - 获取用户习惯统计
router.get('/stats', habitsController.getUserStats);

// POST /api/habits - 创建新习惯
router.post('/', habitsController.createHabit);

// GET /api/habits/:id - 获取单个习惯
router.get('/:id', habitsController.getHabit);

// PUT /api/habits/:id - 更新习惯
router.put('/:id', habitsController.updateHabit);

// DELETE /api/habits/:id - 删除习惯
router.delete('/:id', habitsController.deleteHabit);

// POST /api/habits/:id/score - 评分习惯
router.post('/:id/score', habitsController.scoreHabit);

// POST /api/habits/:id/archive - 归档/取消归档习惯
router.post('/:id/archive', habitsController.archiveHabit);

module.exports = router;
