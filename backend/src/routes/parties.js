const express = require('express');
const router = express.Router();
const partyController = require('../controllers/partyController');
const auth = require('../middleware/auth');
const { body, param, query } = require('express-validator');

// 验证规则
const createPartyValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('队伍名称必须在1-100个字符之间'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('队伍描述不能超过500个字符'),
  body('privacy')
    .optional()
    .isIn(['private', 'public', 'invite_only'])
    .withMessage('隐私设置必须是 private、public 或 invite_only'),
  body('maxMembers')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('最大成员数必须在1-4之间'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('图片URL格式不正确')
];

const updatePartyValidation = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('队伍名称必须在1-100个字符之间'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('队伍描述不能超过500个字符'),
  body('privacy')
    .optional()
    .isIn(['private', 'public', 'invite_only'])
    .withMessage('隐私设置必须是 private、public 或 invite_only'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('图片URL格式不正确')
];

const inviteUserValidation = [
  body('userId')
    .isInt({ min: 1 })
    .withMessage('用户ID必须是正整数'),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('邀请消息不能超过500个字符')
];

const sendMessageValidation = [
  body('message')
    .isLength({ min: 1, max: 1000 })
    .withMessage('消息内容必须在1-1000个字符之间')
];

const updateMemberRoleValidation = [
  body('role')
    .isIn(['admin', 'member'])
    .withMessage('角色必须是 admin 或 member')
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

// 公开路由（不需要认证）
router.get('/public', paginationValidation, partyController.getPublicParties);
router.get('/search', searchValidation, partyController.searchParties);

// 需要认证的路由
router.use(auth.authenticateToken);

// 用户相关路由
router.get('/my-parties', partyController.getUserParties);
router.get('/invitations', partyController.getUserInvitations);

// 队伍管理路由
router.post('/', createPartyValidation, partyController.createParty);
router.get('/:id', partyController.getPartyDetails);
router.put('/:id', updatePartyValidation, partyController.updateParty);
router.delete('/:id', partyController.deleteParty);

// 成员管理路由
router.post('/:id/join', partyController.joinParty);
router.post('/:id/leave', partyController.leaveParty);
router.post('/:id/invite', inviteUserValidation, partyController.inviteUser);
router.post('/:id/kick/:userId', partyController.kickMember);
router.put('/:id/members/:userId/role', updateMemberRoleValidation, partyController.updateMemberRole);

// 邀请处理路由
router.post('/invitations/:invitationId/accept', partyController.acceptInvitation);
router.post('/invitations/:invitationId/decline', partyController.declineInvitation);

// 聊天功能路由
router.get('/:id/messages', paginationValidation, partyController.getPartyMessages);
router.post('/:id/messages', sendMessageValidation, partyController.sendMessage);

// 活动记录路由
router.get('/:id/activities', paginationValidation, partyController.getPartyActivities);

// 排行榜路由
router.get('/:id/leaderboard', partyController.getPartyLeaderboard);

module.exports = router;
