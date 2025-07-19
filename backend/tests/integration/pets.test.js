const request = require('supertest');
const app = require('../../src/server');
const { sequelize, User, Pet, UserPet, PetMaterial } = require('../../src/models');
const bcrypt = require('bcryptjs');

describe('Pets API Integration Tests', () => {
  let authToken;
  let testUser;
  let testPet;

  beforeAll(async () => {
    // 同步数据库
    await sequelize.sync({ force: true });

    // 创建测试用户
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'password123'
    });

    // 创建测试宠物
    testPet = await Pet.create({
      key: 'test_cat',
      name: '测试猫',
      type: 'cat',
      eggType: 'egg_common',
      potionType: 'potion_common',
      rarity: 'common',
      baseStats: { strength: 5, intelligence: 3 },
      maxLevel: 20
    });

    // 登录获取token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // 清理测试数据
    await UserPet.destroy({ where: {} });
    await PetMaterial.destroy({ where: {} });
  });

  describe('GET /api/pets', () => {
    it('应该返回所有宠物列表', async () => {
      const response = await request(app)
        .get('/api/pets')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pets).toBeInstanceOf(Array);
      expect(response.body.data.pets.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/pets/owned', () => {
    it('应该返回用户已拥有的宠物', async () => {
      // 先创建一个用户宠物
      await UserPet.create({
        userId: testUser.id,
        petId: testPet.id,
        isOwned: true,
        level: 1,
        currentExp: 0
      });

      const response = await request(app)
        .get('/api/pets/owned')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pets).toBeInstanceOf(Array);
      expect(response.body.data.pets.length).toBe(1);
      expect(response.body.data.pets[0].petId).toBe(testPet.id);
    });
  });

  describe('GET /api/pets/collection-progress', () => {
    it('应该返回宠物图鉴收集进度', async () => {
      const response = await request(app)
        .get('/api/pets/collection-progress')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.progress).toHaveProperty('total');
      expect(response.body.data.progress).toHaveProperty('owned');
      expect(response.body.data.progress).toHaveProperty('percentage');
    });
  });

  describe('POST /api/pets/:id/hatch', () => {
    it('应该成功孵化宠物', async () => {
      // 先添加孵化材料
      await PetMaterial.create({
        userId: testUser.id,
        materialType: 'egg_common',
        quantity: 1
      });

      const response = await request(app)
        .post(`/api/pets/${testPet.id}/hatch`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ petId: testPet.id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('宠物孵化成功');

      // 验证宠物已被创建
      const userPet = await UserPet.findOne({
        where: { userId: testUser.id, petId: testPet.id }
      });
      expect(userPet).toBeTruthy();
      expect(userPet.isOwned).toBe(true);
    });

    it('应该返回400当缺少孵化材料', async () => {
      const response = await request(app)
        .post(`/api/pets/${testPet.id}/hatch`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ petId: testPet.id })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('缺少孵化材料');
    });

    it('应该返回409当已经拥有该宠物', async () => {
      // 先添加孵化材料
      await PetMaterial.create({
        userId: testUser.id,
        materialType: 'egg_common',
        quantity: 1
      });

      // 先孵化一次
      await request(app)
        .post(`/api/pets/${testPet.id}/hatch`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ petId: testPet.id });

      // 再次尝试孵化
      const response = await request(app)
        .post(`/api/pets/${testPet.id}/hatch`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ petId: testPet.id })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('已经拥有该宠物');
    });
  });

  describe('POST /api/pets/:userPetId/feed', () => {
    it('应该成功喂养宠物', async () => {
      // 创建用户宠物
      const userPet = await UserPet.create({
        userId: testUser.id,
        petId: testPet.id,
        isOwned: true,
        level: 1,
        currentExp: 0
      });

      // 添加喂养材料
      await PetMaterial.create({
        userId: testUser.id,
        materialType: 'potion_common',
        quantity: 1
      });

      const response = await request(app)
        .post(`/api/pets/${userPet.id}/feed`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ foodAmount: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.result).toHaveProperty('leveledUp');
    });

    it('应该返回404当宠物不存在', async () => {
      const response = await request(app)
        .post('/api/pets/999/feed')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ foodAmount: 10 })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/pets/equip', () => {
    it('应该成功装备宠物', async () => {
      // 创建用户宠物
      const userPet = await UserPet.create({
        userId: testUser.id,
        petId: testPet.id,
        isOwned: true,
        level: 1,
        currentExp: 0
      });

      const response = await request(app)
        .post('/api/pets/equip')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ userPetId: userPet.id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('宠物装备成功');

      // 验证宠物已激活
      const updatedUserPet = await UserPet.findByPk(userPet.id);
      expect(updatedUserPet.isActive).toBe(true);
    });
  });

  describe('POST /api/pets/unequip', () => {
    it('应该成功卸下宠物', async () => {
      // 创建并激活用户宠物
      const userPet = await UserPet.create({
        userId: testUser.id,
        petId: testPet.id,
        isOwned: true,
        isActive: true,
        level: 1,
        currentExp: 0
      });

      const response = await request(app)
        .post('/api/pets/unequip')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('宠物卸下成功');

      // 验证宠物已取消激活
      const updatedUserPet = await UserPet.findByPk(userPet.id);
      expect(updatedUserPet.isActive).toBe(false);
    });
  });

  describe('GET /api/pets/materials', () => {
    it('应该返回用户的材料列表', async () => {
      // 添加测试材料
      await PetMaterial.create({
        userId: testUser.id,
        materialType: 'egg_common',
        quantity: 5
      });

      const response = await request(app)
        .get('/api/pets/materials')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.materials).toBeInstanceOf(Array);
      expect(response.body.data.materials.length).toBe(1);
      expect(response.body.data.materials[0].materialType).toBe('egg_common');
    });
  });
});
