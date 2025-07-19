const express = require('express');
const router = express.Router();
const petsController = require('../controllers/petsController');
const { authenticateToken } = require('../middleware/auth');

// 公共路由 - 获取所有宠物
router.get('/', petsController.getAllPets);

// 坐骑相关路由 - 放在参数路由之前
router.get('/mountable', authenticateToken, petsController.getMountablePets);
router.get('/mounts', authenticateToken, petsController.getUserMounts);
router.get('/mounts/stats', authenticateToken, petsController.getMountStats);
router.get('/mounts/tamable', authenticateToken, petsController.getTamablePets);
router.post('/mounts/tame', authenticateToken, petsController.tameMount);
router.post('/mounts/equip', authenticateToken, petsController.equipMount);
router.post('/mounts/unequip', authenticateToken, petsController.unequipMount);
router.post('/mounts/upgrade', authenticateToken, petsController.upgradeMount);
router.get('/mounts/:userPetId/check', authenticateToken, petsController.checkMountAction);

// 需要认证的路由
router.get('/owned', authenticateToken, petsController.getUserOwnedPets);
router.get('/active', authenticateToken, petsController.getUserActivePet);
router.get('/collection-progress', authenticateToken, petsController.getCollectionProgress);
router.get('/rarity-stats', authenticateToken, petsController.getUserRarityStats);
router.get('/materials', authenticateToken, petsController.getUserMaterials);
router.get('/:id', authenticateToken, petsController.getPetById);

// 宠物操作路由
router.post('/:id/hatch', authenticateToken, petsController.hatchPet);
router.post('/:userPetId/feed', authenticateToken, petsController.feedPet);
router.post('/equip', authenticateToken, petsController.equipPet);
router.post('/unequip', authenticateToken, petsController.unequipPet);

module.exports = router;
