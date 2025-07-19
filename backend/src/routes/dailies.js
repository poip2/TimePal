const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken: auth } = require('../middleware/auth');
const dailiesController = require('../controllers/dailiesController');

// 验证规则
const dailyValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  body('difficulty')
    .optional()
    .isIn(['trivial', 'easy', 'medium', 'hard'])
    .withMessage('Difficulty must be one of: trivial, easy, medium, hard'),
  body('repeatType')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Repeat type must be one of: daily, weekly, monthly, yearly'),
  body('repeatDays')
    .optional()
    .isArray()
    .withMessage('Repeat days must be an array'),
  body('repeatDays.*')
    .isInt({ min: 0, max: 6 })
    .withMessage('Repeat day values must be between 0 (Sunday) and 6 (Saturday)'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('everyX')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Every X must be a positive integer'),
  body('reminderTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Reminder time must be in HH:MM format'),
  body('position')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Position must be a non-negative integer')
];

// 路由定义

// 获取所有每日任务
router.get('/', auth, dailiesController.getAllDailies);

// 获取用户今天的每日任务
router.get('/today/tasks', auth, dailiesController.getTodaysDailies);

// 获取单个每日任务
router.get('/:id', auth, dailiesController.getDailyById);

// 创建每日任务
router.post('/', auth, dailyValidation, dailiesController.createDaily);

// 更新每日任务
router.put('/:id', auth, dailyValidation, dailiesController.updateDaily);

// 删除每日任务
router.delete('/:id', auth, dailiesController.deleteDaily);

// 完成每日任务
router.post('/:id/complete', auth, dailiesController.completeDaily);

// 取消完成每日任务
router.post('/:id/uncomplete', auth, dailiesController.uncompleteDaily);

// 归档每日任务
router.post('/:id/archive', auth, dailiesController.archiveDaily);

// 取消归档每日任务
router.post('/:id/unarchive', auth, dailiesController.unarchiveDaily);

// 获取用户每日任务统计
router.get('/stats/overview', auth, dailiesController.getUserStats);

module.exports = router;
