const express = require('express');
const router = express.Router();
const friendService = require('../services/friendService');
const auth = require('../middleware/auth');
const { body, param, query } = require('express-validator');

// 验证规则
const sendFriendRequestValidation = [
  body('userId')
    .isInt({ min: 1 })
    .withMessage('用户ID必须是正整数')
];

const friendIdValidation = [
  param('friendId')
    .isInt({ min: 1 })
    .withMessage('好友ID必须是正整数')
];

const requestIdValidation = [
  param('requestId')
    .isInt({ min: 1 })
    .withMessage('请求ID必须是正整数')
];

const paginationValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须在1-100之间'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('偏移量必须是非负整数')
];

const searchValidation = [
  query('q')
    .isLength({ min: 1, max: 100 })
    .withMessage('搜索关键词必须在1-100个字符之间'),
  ...paginationValidation
];

const leaderboardValidation = [
  query('sortBy')
    .optional()
    .isIn(['level', 'experience', 'coins', 'gold', 'totalTasksCompleted', 'streakHighest', 'loginStreak'])
    .withMessage('无效的排序字段'),
  query('order')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('排序顺序必须是ASC或DESC'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('每页数量必须在1-50之间')
];

// 需要认证的路由
router.use(auth.authenticateToken);

// 验证错误处理中间件
const handleValidationErrors = (req, res, next) => {
  const errors = require('express-validator').validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg
    });
  }
  next();
};

/**
 * @route   POST /api/friends/requests
 * @desc    发送好友请求
 * @access  Private
 */
router.post('/requests', [
  body('addresseeId')
    .isInt({ min: 1 })
    .withMessage('接收者ID必须是正整数')
], handleValidationErrors, async (req, res) => {
  try {
    const { addresseeId } = req.body;
    const requesterId = req.user.id;

    const friendRequest = await friendService.sendFriendRequest(requesterId, addresseeId);

    res.status(201).json({
      success: true,
      data: friendRequest
    });
  } catch (error) {
    console.error('发送好友请求失败:', error);

    let statusCode = 400;
    let message = error.message;

    // 根据错误类型设置合适的HTTP状态码
    if (error.message.includes('not found')) {
      statusCode = 404;
    } else if (error.message.includes('already') || error.message.includes('Cannot send')) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message: message
    });
  }
});

/**
 * @route   PUT /api/friends/requests/:id/accept
 * @desc    接受好友请求
 * @access  Private
 */
router.put('/requests/:id/accept', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('请求ID必须是正整数')
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const friendship = await friendService.acceptFriendRequest(id, userId);

    res.json({
      success: true,
      data: friendship
    });
  } catch (error) {
    console.error('接受好友请求失败:', error);

    let statusCode = 400;
    let message = error.message;

    if (error.message.includes('not found')) {
      statusCode = 404;
    } else if (error.message.includes('Unauthorized')) {
      statusCode = 403;
    }

    res.status(statusCode).json({
      success: false,
      message: message
    });
  }
});

/**
 * @route   DELETE /api/friends/requests/:id
 * @desc    拒绝好友请求
 * @access  Private
 */
router.delete('/requests/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('请求ID必须是正整数')
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await friendService.rejectFriendRequest(id, userId);

    res.json({
      success: true
    });
  } catch (error) {
    console.error('拒绝好友请求失败:', error);

    let statusCode = 400;
    let message = error.message;

    if (error.message.includes('not found')) {
      statusCode = 404;
    } else if (error.message.includes('Unauthorized')) {
      statusCode = 403;
    }

    res.status(statusCode).json({
      success: false,
      message: message
    });
  }
});

/**
 * @route   GET /api/friends
 * @desc    获取用户的好友列表
 * @access  Private
 */
router.get('/', paginationValidation, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const data = await friendService.getUserFriends(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('获取好友列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取好友列表失败'
    });
  }
});

/**
 * @route   GET /api/friends/requests/received
 * @desc    获取收到的好友请求
 * @access  Private
 */
router.get('/requests/received', paginationValidation, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const data = await friendService.getReceivedFriendRequests(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('获取收到的好友请求失败:', error);
    res.status(500).json({
      success: false,
      message: '获取收到的好友请求失败'
    });
  }
});

/**
 * @route   GET /api/friends/requests/sent
 * @desc    获取发送的好友请求
 * @access  Private
 */
router.get('/requests/sent', paginationValidation, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const data = await friendService.getSentFriendRequests(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('获取发送的好友请求失败:', error);
    res.status(500).json({
      success: false,
      message: '获取发送的好友请求失败'
    });
  }
});

/**
 * @route   DELETE /api/friends/:friendId
 * @desc    移除好友
 * @access  Private
 */
router.delete('/:friendId', friendIdValidation, handleValidationErrors, async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;

    await friendService.removeFriend(userId, parseInt(friendId));

    res.json({
      success: true,
      message: '好友已移除'
    });
  } catch (error) {
    console.error('移除好友失败:', error);

    let statusCode = 400;
    let message = error.message;

    if (error.message.includes('not found')) {
      statusCode = 404;
    }

    res.status(statusCode).json({
      success: false,
      message: message
    });
  }
});

/**
 * @route   GET /api/friends/status/:userId
 * @desc    获取与指定用户的好友关系状态
 * @access  Private
 */
router.get('/status/:userId', [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('用户ID必须是正整数')
], handleValidationErrors, async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user.id;

    const status = await friendService.getFriendshipStatus(currentUserId, parseInt(targetUserId));

    res.json({
      success: true,
      data: { status }
    });
  } catch (error) {
    console.error('获取好友关系状态失败:', error);
    res.status(500).json({
      success: false,
      message: '获取好友关系状态失败'
    });
  }
});

/**
 * @route   GET /api/friends/overview
 * @desc    获取好友概览信息
 * @access  Private
 */
router.get('/overview', async (req, res) => {
  try {
    const userId = req.user.id;

    const overview = await friendService.getFriendOverview(userId);

    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('获取好友概览失败:', error);
    res.status(500).json({
      success: false,
      message: '获取好友概览失败'
    });
  }
});

/**
 * @route   GET /api/friends/search
 * @desc    搜索好友
 * @access  Private
 */
router.get('/search', searchValidation, handleValidationErrors, async (req, res) => {
  try {
    const userId = req.user.id;
    const { q: query, limit = 20, offset = 0 } = req.query;

    const data = await friendService.searchFriends(userId, query, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('搜索好友失败:', error);
    res.status(500).json({
      success: false,
      message: '搜索好友失败'
    });
  }
});

/**
 * @route   GET /api/friends/leaderboard
 * @desc    获取好友排行榜
 * @access  Private
 */
router.get('/leaderboard', leaderboardValidation, handleValidationErrors, async (req, res) => {
  try {
    const userId = req.user.id;
    const { sortBy = 'level', order = 'DESC', limit = 10 } = req.query;

    const leaderboard = await friendService.getFriendsLeaderboard(userId, {
      sortBy,
      order,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('获取好友排行榜失败:', error);

    let statusCode = 400;
    let message = error.message;

    if (error.message.includes('Invalid')) {
      statusCode = 400;
    } else {
      statusCode = 500;
      message = '获取好友排行榜失败';
    }

    res.status(statusCode).json({
      success: false,
      message
    });
  }
});

module.exports = router;
