const { sequelize, User, Equipment, UserEquipment } = require('../../src/models');
const equipmentController = require('../../src/controllers/equipmentController');
const request = require('supertest');
const express = require('express');
const auth = require('../../src/middleware/auth');

// 模拟认证中间件
jest.mock('../../src/middleware/auth', () => {
  return jest.fn((req, res, next) => {
    req.user = { id: 1 };
    next();
  });
});

describe('Equipment System', () => {
  let app;
  let user;
  let equipment;

  beforeAll(async () => {
    // 创建测试应用
    app = express();
    app.use(express.json());

    const equipmentRoutes = require('../../src/routes/equipment');
    app.use('/api/equipment', equipmentRoutes);

    // 同步数据库
    await sequelize.sync({ force: true });

    // 创建测试用户
    user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'password123',
      gold: 1000,
      gems: 100,
      level: 10,
      class: 'warrior'
    });

    // 创建测试装备
    equipment = await Equipment.create({
      key: 'test_sword',
      name: '测试剑',
      type: 'weapon',
      class: 'warrior',
      strengthBonus: 10,
      intelligenceBonus: 0,
      constitutionBonus: 5,
      perceptionBonus: 0,
      goldCost: 100,
      gemCost: 10,
      levelRequired: 5,
      description: '测试用剑',
      rarity: 'common'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // 清理测试数据
    await UserEquipment.destroy({ where: {} });
  });

  describe('Equipment Model', () => {
    test('应该创建装备', async () => {
      const newEquipment = await Equipment.create({
        key: 'new_sword',
        name: '新剑',
        type: 'weapon',
        strengthBonus: 15,
        goldCost: 200,
        levelRequired: 10
      });

      expect(newEquipment.key).toBe('new_sword');
      expect(newEquipment.name).toBe('新剑');
      expect(newEquipment.strengthBonus).toBe(15);
    });

    test('应该根据类型查找装备', async () => {
      const weapons = await Equipment.findByType('weapon');
      expect(weapons.length).toBeGreaterThan(0);
      expect(weapons.every(e => e.type === 'weapon')).toBe(true);
    });

    test('应该根据职业查找装备', async () => {
      const warriorEquipment = await Equipment.findByClass('warrior');
      expect(warriorEquipment.length).toBeGreaterThan(0);
      expect(warriorEquipment.every(e => !e.class || e.class === 'warrior')).toBe(true);
    });

    test('应该根据稀有度查找装备', async () => {
      const commonEquipment = await Equipment.findByRarity('common');
      expect(commonEquipment.length).toBeGreaterThan(0);
      expect(commonEquipment.every(e => e.rarity === 'common')).toBe(true);
    });

    test('应该查找可负担的装备', async () => {
      const affordable = await Equipment.findAffordable(500, 50);
      expect(affordable.length).toBeGreaterThan(0);
      expect(affordable.every(e => e.goldCost <= 500 && e.gemCost <= 50)).toBe(true);
    });
  });

  describe('UserEquipment Model', () => {
    test('应该创建用户装备关系', async () => {
      const userEquipment = await UserEquipment.create({
        userId: user.id,
        equipmentId: equipment.id,
        isOwned: true,
        isEquipped: false
      });

      expect(userEquipment.userId).toBe(user.id);
      expect(userEquipment.equipmentId).toBe(equipment.id);
      expect(userEquipment.isOwned).toBe(true);
      expect(userEquipment.isEquipped).toBe(false);
    });

    test('应该获取用户的已拥有装备', async () => {
      await UserEquipment.create({
        userId: user.id,
        equipmentId: equipment.id,
        isOwned: true
      });

      const owned = await UserEquipment.findOwnedByUser(user.id);
      expect(owned.length).toBe(1);
      expect(owned[0].equipmentId).toBe(equipment.id);
    });

    test('应该获取用户的已装备装备', async () => {
      await UserEquipment.create({
        userId: user.id,
        equipmentId: equipment.id,
        isOwned: true,
        isEquipped: true
      });

      const equipped = await UserEquipment.findEquippedByUser(user.id);
      expect(equipped.length).toBe(1);
      expect(equipped[0].isEquipped).toBe(true);
    });

    test('应该计算装备属性加成总和', async () => {
      await UserEquipment.create({
        userId: user.id,
        equipmentId: equipment.id,
        isOwned: true,
        isEquipped: true
      });

      const bonuses = await UserEquipment.getTotalBonuses(user.id);
      expect(bonuses.strength).toBe(10);
      expect(bonuses.constitution).toBe(5);
      expect(bonuses.intelligence).toBe(0);
      expect(bonuses.perception).toBe(0);
    });

    test('应该检查是否可以装备物品', async () => {
      await UserEquipment.create({
        userId: user.id,
        equipmentId: equipment.id,
        isOwned: true
      });

      const canEquip = await UserEquipment.canEquip(user.id, equipment.id);
      expect(canEquip.canEquip).toBe(true);
    });

    test('应该拒绝装备未拥有的物品', async () => {
      const canEquip = await UserEquipment.canEquip(user.id, equipment.id);
      expect(canEquip.canEquip).toBe(false);
      expect(canEquip.reason).toBe('未拥有该装备');
    });

    test('应该拒绝装备职业不符的物品', async () => {
      const mageEquipment = await Equipment.create({
        key: 'mage_staff',
        name: '法师法杖',
        type: 'weapon',
        class: 'mage',
        intelligenceBonus: 10,
        goldCost: 100,
        levelRequired: 5
      });

      const canEquip = await UserEquipment.canEquip(user.id, mageEquipment.id);
      expect(canEquip.canEquip).toBe(false);
      expect(canEquip.reason).toBe('职业不符');
    });

    test('应该拒绝装备等级不足的物品', async () => {
      const highLevelEquipment = await Equipment.create({
        key: 'high_level_sword',
        name: '高级剑',
        type: 'weapon',
        class: 'warrior',
        strengthBonus: 20,
        goldCost: 1000,
        levelRequired: 20
      });

      const canEquip = await UserEquipment.canEquip(user.id, highLevelEquipment.id);
      expect(canEquip.canEquip).toBe(false);
      expect(canEquip.reason).toBe('等级不足');
    });
  });

  describe('User Model - Equipment Integration', () => {
    test('应该获取装备属性加成', async () => {
      await UserEquipment.create({
        userId: user.id,
        equipmentId: equipment.id,
        isOwned: true,
        isEquipped: true
      });

      const bonuses = await user.getEquipmentBonuses();
      expect(bonuses.strength).toBe(10);
      expect(bonuses.constitution).toBe(5);
    });

    test('应该获取总属性值', async () => {
      await UserEquipment.create({
        userId: user.id,
        equipmentId: equipment.id,
        isOwned: true,
        isEquipped: true
      });

      const totalAttributes = await user.getTotalAttributes();
      expect(totalAttributes.strength).toBe(user.strength + 10);
      expect(totalAttributes.constitution).toBe(user.constitution + 5);
    });

    test('应该获取完整游戏状态', async () => {
      await UserEquipment.create({
        userId: user.id,
        equipmentId: equipment.id,
        isOwned: true,
        isEquipped: true
      });

      const fullStats = await user.getFullGameStats();
      expect(fullStats.totalAttributes.strength).toBe(user.strength + 10);
      expect(fullStats.equipmentBonuses.strength).toBe(10);
      expect(fullStats.baseAttributes.strength).toBe(user.strength);
    });
  });

  describe('Equipment Controller', () => {
    describe('GET /api/equipment', () => {
      test('应该获取所有装备', async () => {
        const response = await request(app)
          .get('/api/equipment')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });

      test('应该根据类型筛选装备', async () => {
        const response = await request(app)
          .get('/api/equipment?type=weapon')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.every(e => e.type === 'weapon')).toBe(true);
      });
    });

    describe('GET /api/equipment/:id', () => {
      test('应该获取单个装备详情', async () => {
        const response = await request(app)
          .get(`/api/equipment/${equipment.id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(equipment.id);
      });

      test('应该返回404当装备不存在', async () => {
        const response = await request(app)
          .get('/api/equipment/9999')
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('装备不存在');
      });
    });

    describe('GET /api/equipment/owned', () => {
      test('应该获取用户已拥有的装备', async () => {
        await UserEquipment.create({
          userId: user.id,
          equipmentId: equipment.id,
          isOwned: true
        });

        const response = await request(app)
          .get('/api/equipment/owned')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBe(1);
      });
    });

    describe('POST /api/equipment/:id/buy', () => {
      test('应该成功购买装备', async () => {
        const response = await request(app)
          .post(`/api/equipment/${equipment.id}/buy`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('购买成功');

        const userEquipment = await UserEquipment.findByUserAndEquipment(user.id, equipment.id);
        expect(userEquipment.isOwned).toBe(true);
      });

      test('应该拒绝金币不足的购买', async () => {
        await user.update({ gold: 50 });

        const response = await request(app)
          .post(`/api/equipment/${equipment.id}/buy`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('金币不足');
      });

      test('应该拒绝已拥有的装备', async () => {
        await UserEquipment.create({
          userId: user.id,
          equipmentId: equipment.id,
          isOwned: true
        });

        const response = await request(app)
          .post(`/api/equipment/${equipment.id}/buy`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('已拥有该装备');
      });
    });

    describe('POST /api/equipment/:id/equip', () => {
      beforeEach(async () => {
        await UserEquipment.create({
          userId: user.id,
          equipmentId: equipment.id,
          isOwned: true
        });
      });

      test('应该成功装备物品', async () => {
        const response = await request(app)
          .post(`/api/equipment/${equipment.id}/equip`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('装备成功');

        const userEquipment = await UserEquipment.findByUserAndEquipment(user.id, equipment.id);
        expect(userEquipment.isEquipped).toBe(true);
      });

      test('应该拒绝装备未拥有的物品', async () => {
        await UserEquipment.destroy({ where: {} });

        const response = await request(app)
          .post(`/api/equipment/${equipment.id}/equip`)
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/equipment/:id/unequip', () => {
      beforeEach(async () => {
        await UserEquipment.create({
          userId: user.id,
          equipmentId: equipment.id,
          isOwned: true,
          isEquipped: true
        });
      });

      test('应该成功卸下物品', async () => {
        const response = await request(app)
          .post(`/api/equipment/${equipment.id}/unequip`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('卸下成功');

        const userEquipment = await UserEquipment.findByUserAndEquipment(user.id, equipment.id);
        expect(userEquipment.isEquipped).toBe(false);
      });
    });

    describe('GET /api/equipment/stats', () => {
      test('应该获取装备统计信息', async () => {
        await UserEquipment.create({
          userId: user.id,
          equipmentId: equipment.id,
          isOwned: true,
          isEquipped: true
        });

        const response = await request(app)
          .get('/api/equipment/stats')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.totalOwned).toBe(1);
        expect(response.body.data.totalEquipped).toBe(1);
        expect(response.body.data.totalBonuses.strength).toBe(10);
      });
    });
  });
});
