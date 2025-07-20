const express = require('express');
const router = express.Router();
const messageService = require('../services/messageService');
const auth = require('../middleware/auth');
const { body, param, query } = require('express-validator');

// 验证规则
const sendMessageValidation = [
  body('receiverId')
    .isInt({ min: 1 })
    .withMessage('接收者ID必须是正整数'),
  body('content')
    .isLength({ min: 1, max: 2000 })
    .withMessage('消息内容必须在1-2000个字符之间')
];

const messageIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('消息ID必须是正整数')
];

const friendIdValidation = [
  param('friendId')
    .isInt({ min: 1 })
    .withMessage('好友ID必须是正整数')
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

const conversationValidation = [
  ...friendIdValidation,
  ...paginationValidation,
  query('before')
    .optional()
    .isISO8601()
    .withMessage('before必须是有效的ISO8601时间格式'),
  query('after')
    .optional()
    .isISO8601()
    .withMessage('after必须是有效的ISO8601时间格式')
];

const searchValidation = [
  query('q')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('搜索关键词必须在1-100个字符之间'),
  ...paginationValidation
];

// 验证错误处理中间件
const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg
    });
  }
  next();
};

// 需要认证的路由
router.use(auth.authenticateToken);

/**
 * @route   POST /api/messages
 * @desc    发送消息
 * @access  Private
 */
router.post('/', sendMessageValidation, handleValidationErrors, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    const message = await messageService.sendMessage(senderId, receiverId, content);

    res.status(201).json({
      success: true,
      message: '消息发送成功',
      data: message
    });
  } catch (error) {
    console.error('发送消息失败:', error);

    let statusCode = 400;
    let message = error.message;

    // 根据错误类型设置合适的HTTP状态码
    if (error.message.includes('not found')) {
      statusCode = 404;
    } else if (error.message.includes('already')) {
      statusCode = 409;
    } else if (error.message.includes('Cannot send message to yourself')) {
      statusCode = 400;
    } else if (error.message.includes('friends')) {
      statusCode = 403;
    }

    res.status(statusCode).json({
      success: false,
      message: message
    });
  }
});

/**
 * @route   GET /api/messages
 * @desc    获取用户的消息列表
 * @access  Private
 */
router.get('/', paginationValidation, handleValidationErrors, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      limit = 50,
      offset = 0,
      status,
      isDeleted = false,
      sortBy = 'createdAt',
      order = 'DESC'
    } = req.query;

    const messages = await messageService.getMessages(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      status,
      isDeleted: isDeleted === 'true',
      sortBy,
      order
    });

    res.json({
      success: true,
      data: { messages },
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: messages.length
      }
    });
  } catch (error) {
    console.error('获取消息列表失败:', error);

    let statusCode = 400;
    let message = error.message;

    if (error.message.includes('not found')) {
      statusCode = 404;
    } else if (error.message.includes('friends')) {
      statusCode = 403;
    } else if (!error.message.includes('Invalid')) {
      statusCode = 500;
      message = '获取消息列表失败';
    }

    res.status(statusCode).json({
      success: false,
      message: message
    });
  }
});

/**
 * @route   GET /api/messages/conversation/:friendId
 * @desc    获取与特定好友的对话
 * @access  Private
 */
router.get('/conversation/:friendId', conversationValidation, handleValidationErrors, async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;
    const {
      limit = 50,
      offset = 0,
      before,
      after,
      isDeleted = false
    } = req.query;

    const conversation = await messageService.getConversation(userId, parseInt(friendId), {
      limit: parseInt(limit),
      offset: parseInt(offset),
      before,
      after,
      isDeleted: isDeleted === 'true'
    });

    res.json({
      success: true,
      data: { messages: conversation },
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: conversation.length
      }
    });
  } catch (error) {
    console.error('获取对话失败:', error);

    let statusCode = 400;
    let message = error.message;

    if (error.message.includes('not found')) {
      statusCode = 404;
    } else if (error.message.includes('friends')) {
      statusCode = 403;
    } else if (error.message.includes('Invalid')) {
      statusCode = 400;
    } else {
      statusCode = 500;
      message = '获取对话失败';
    }

    res.status(statusCode).json({
      success: false,
      message: message
    });
  }
});

/**
 * @route   PUT /api/messages/:id/read
 * @desc    标记消息为已读
 * @access  Private
 */
router.put('/:id/read', messageIdValidation, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await messageService.markAsRead(parseInt(id), userId);

    res.json({
      success: true,
      message: '消息已标记为已读',
      data: message
    });
  } catch (error) {
    console.error('标记消息已读失败:', error);

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
 * @route   PUT /api/messages/conversation/:friendId/read
 * @desc    标记与特定好友的所有消息为已读
 * @access  Private
 */
router.put('/conversation/:friendId/read', friendIdValidation, handleValidationErrors, async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;

    const updatedCount = await messageService.markConversationAsRead(userId, parseInt(friendId));

    res.json({
      success: true,
      message: `已将${updatedCount}条消息标记为已读`,
      data: { updatedCount }
    });
  } catch (error) {
    console.error('标记对话已读失败:', error);

    let statusCode = 400;
    let message = error.message;

    if (error.message.includes('not found')) {
      statusCode = 404;
    } else if (error.message.includes('friends')) {
      statusCode = 403;
    }

    res.status(statusCode).json({
      success: false,
      message: message
    });
  }
});

/**
 * @route   DELETE /api/messages/:id
 * @desc    删除消息（软删除）
 * @access  Private
 */
router.delete('/:id', messageIdValidation, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await messageService.deleteMessage(parseInt(id), userId);

    res.json({
      success: true,
      message: '消息已删除',
      data: message
    });
  } catch (error) {
    console.error('删除消息失败:', error);

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
 * @route   GET /api/messages/unread-count
 * @desc    获取未读消息数量
 * @access  Private
 */
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await messageService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('获取未读消息数量失败:', error);
    let statusCode = 400;
    let message = error.message;

    if (error.message.includes('not found')) {
      statusCode = 404;
    } else if (!error.message.includes('Invalid')) {
      statusCode = 500;
      message = '获取未读消息数量失败';
    }

    res.status(statusCode).json({
      success: false,
      message: message
    });
  }
});

/**
 * @route   GET /api/messages/unread-count/:friendId
 * @desc    获取与特定好友的未读消息数量
 * @access  Private
 */
router.get('/unread-count/:friendId', friendIdValidation, handleValidationErrors, async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;

    const unreadCount = await messageService.getUnreadCountFromFriend(userId, parseInt(friendId));

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('获取未读消息数量失败:', error);

    let statusCode = 400;
    let message = error.message;

    if (error.message.includes('not found')) {
      statusCode = 404;
    } else if (error.message.includes('friends')) {
      statusCode = 403;
    }

    res.status(statusCode).json({
      success: false,
      message: message
    });
  }
});

/**
 * @route   GET /api/messages/overview
 * @desc    获取消息概览
 * @access  Private
 */
router.get('/overview', async (req, res) => {
  try {
    const userId = req.user.id;

    const overview = await messageService.getMessageOverview(userId);

    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('获取消息概览失败:', error);
    let statusCode = 400;
    let message = error.message;

    if (error.message.includes('not found')) {
      statusCode = 404;
    } else if (!error.message.includes('Invalid')) {
      statusCode = 500;
      message = '获取消息概览失败';
    }

    res.status(statusCode).json({
      success: false,
      message: message
    });
  }
});

/**
 * @route   GET /api/messages/search
 * @desc    搜索消息
 * @access  Private
 */
router.get('/search', searchValidation, handleValidationErrors, async (req, res) => {
  try {
    const userId = req.user.id;
    const { q: query, limit = 20, offset = 0 } = req.query;

    const results = await messageService.searchMessages(userId, query, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: { messages: results },
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: results.length
      }
    });
  } catch (error) {
    console.error('搜索消息失败:', error);
    let statusCode = 400;
    let message = error.message;

    if (error.message.includes('not found')) {
      statusCode = 404;
    } else if (!error.message.includes('Invalid')) {
      statusCode = 500;
      message = '搜索消息失败';
    }

    res.status(statusCode).json({
      success: false,
      message: message
    });
  }
});

module.exports = router;
