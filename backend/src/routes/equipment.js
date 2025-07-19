const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { authenticateToken } = require('../middleware/auth');

// 公开路由 - 获取装备信息
router.get('/', equipmentController.getAllEquipment);

// 需要认证的路由
router.use(authenticateToken);

// 获取用户已拥有的装备
router.get('/owned', equipmentController.getOwnedEquipment);

// 获取装备统计信息
router.get('/stats', equipmentController.getEquipmentStats);

// 获取单个装备详情 - 必须放在最后，避免覆盖其他路由
router.get('/:id', equipmentController.getEquipmentById);

// 购买装备
router.post('/:id/buy', equipmentController.buyEquipment);

// 装备物品
router.post('/:id/equip', equipmentController.equipItem);

// 卸下物品
router.post('/:id/unequip', equipmentController.unequipItem);

module.exports = router;
