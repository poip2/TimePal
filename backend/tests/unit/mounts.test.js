const request = require('supertest');
const app = require('../../src/server');
const sequelize = require('../../src/config/database');
const User = require('../../src/models/User');
const Pet = require('../../src/models/Pet');
const UserPet = require('../../src/models/UserPet');
const PetMaterial = require('../../src/models/PetMaterial');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('坐骑系统单元测试', () => {
  let user;
  let userId;
  let token;
  let pet;
  let userPet;

  beforeAll(async () => {
    // 确保数据库连接
    await sequelize.authenticate();

    // 同步所有模型
    await sequelize.sync({ force: true });

    // 创建测试用户
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: hashedPassword
    });
    userId = user.id;
    token = jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret');

    // 创建测试宠物
    pet = await Pet.create({
      key: 'test_dragon',
      name: '测试龙',
      type: 'dragon',
      canBeMount: true,
      mountType: 'flying',
      baseMountSpeed: 150,
      rarity: 'rare'
    });

    // 创建用户宠物关联
    userPet = await UserPet.create({
      userId: userId,
      petId: pet.id,
      isOwned: true,
      level: 5
    });

    // 添加测试材料
    await PetMaterial.bulkCreate([
      {
        userId: userId,
        materialType: 'mount_taming_scroll',
        quantity: 10
      },
      {
        userId: userId,
        materialType: 'mount_essence',
        quantity: 5
      }
    ]);
  });

  afterAll(async () => {
    // 清理测试数据
    await UserPet.destroy({ where: { userId } });
    await Pet.destroy({ where: { key: 'test_dragon' } });
    await PetMaterial.destroy({ where: { userId } });
    await User.destroy({ where: { id: userId } });
    await sequelize.close();
  });

  describe('GET /api/pets/mountable', () => {
    it('应该返回可成为坐骑的宠物列表', async () => {
      const response = await request(app)
        .get('/api/pets/mountable')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.pets)).toBe(true);
      expect(response.body.data.pets.some(p => p.key === 'test_dragon')).toBe(true);
    });
  });

  describe('POST /api/pets/mounts/tame', () => {
    it('应该成功驯服宠物为坐骑', async () => {
      const response = await request(app)
        .post('/api/pets/mounts/tame')
        .set('Authorization', `Bearer ${token}`)
        .send({ userPetId: userPet.id });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('successfully tamed');

      // 验证数据库更新
      const updatedPet = await UserPet.findByPk(userPet.id);
      expect(updatedPet.isTamedAsMount).toBe(true);
      expect(updatedPet.mountLevel).toBe(1);
    });
  });

  describe('POST /api/pets/mounts/equip', () => {
    beforeEach(async () => {
      await UserPet.update(
        { isTamedAsMount: true },
        { where: { id: userPet.id } }
      );
    });

    it('应该成功装备坐骑', async () => {
      const response = await request(app)
        .post('/api/pets/mounts/equip')
        .set('Authorization', `Bearer ${token}`)
        .send({ userPetId: userPet.id });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // 验证数据库更新
      const equippedMount = await UserPet.findByPk(userPet.id);
      expect(equippedMount.mountEquipped).toBe(true);
    });
  });

  describe('POST /api/pets/mounts/unequip', () => {
    beforeEach(async () => {
      await UserPet.update(
        {
          isTamedAsMount: true,
          mountEquipped: true
        },
        { where: { id: userPet.id } }
      );
    });

    it('应该成功卸下坐骑', async () => {
      const response = await request(app)
        .post('/api/pets/mounts/unequip')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // 验证数据库更新
      const unequippedMount = await UserPet.findByPk(userPet.id);
      expect(unequippedMount.mountEquipped).toBe(false);
    });
  });

  describe('GET /api/pets/mounts/stats', () => {
    it('应该返回用户的坐骑统计', async () => {
      const response = await request(app)
        .get('/api/pets/mounts/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toHaveProperty('totalMounts');
      expect(response.body.data.stats).toHaveProperty('byType');
    });
  });
});
