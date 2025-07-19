const request = require('supertest');
const app = require('../../src/server');
const { sequelize, User, Daily } = require('../../src/models');

describe('Dailies API', () => {
  let authToken;
  let user;
  let dailyId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // 创建测试用户
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = userResponse.body.token;
    user = userResponse.body.user;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Daily.destroy({ where: {} });
  });

  describe('POST /api/dailies', () => {
    it('应该创建一个新的每日任务', async () => {
      const response = await request(app)
        .post('/api/dailies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '每日阅读',
          notes: '阅读30分钟',
          difficulty: 'easy',
          repeatType: 'daily',
          startDate: new Date().toISOString().split('T')[0]
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('每日阅读');
      expect(response.body.data.userId).toBe(user.id);
      dailyId = response.body.data.id;
    });

    it('应该拒绝无效的重复类型', async () => {
      const response = await request(app)
        .post('/api/dailies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '测试任务',
          repeatType: 'invalid'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/dailies', () => {
    beforeEach(async () => {
      await Daily.create({
        userId: user.id,
        title: '测试任务1',
        difficulty: 'easy',
        repeatType: 'daily'
      });
      await Daily.create({
        userId: user.id,
        title: '测试任务2',
        difficulty: 'medium',
        repeatType: 'weekly',
        repeatDays: [1, 3, 5]
      });
    });

    it('应该获取用户的所有每日任务', async () => {
      const response = await request(app)
        .get('/api/dailies')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('应该支持归档过滤', async () => {
      const daily = await Daily.create({
        userId: user.id,
        title: '归档任务',
        isArchived: true
      });

      const response = await request(app)
        .get('/api/dailies?archived=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].isArchived).toBe(true);
    });
  });

  describe('GET /api/dailies/:id', () => {
    it('应该获取单个每日任务', async () => {
      const daily = await Daily.create({
        userId: user.id,
        title: '单个任务',
        difficulty: 'hard'
      });

      const response = await request(app)
        .get(`/api/dailies/${daily.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('单个任务');
    });

    it('应该返回404当任务不存在', async () => {
      const response = await request(app)
        .get('/api/dailies/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/dailies/:id', () => {
    it('应该更新每日任务', async () => {
      const daily = await Daily.create({
        userId: user.id,
        title: '原始标题',
        difficulty: 'easy'
      });

      const response = await request(app)
        .put(`/api/dailies/${daily.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '更新后的标题',
          difficulty: 'medium'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('更新后的标题');
      expect(response.body.data.difficulty).toBe('medium');
    });

    it('不应该允许更新streak字段', async () => {
      const daily = await Daily.create({
        userId: user.id,
        title: '测试任务',
        streak: 5
      });

      const response = await request(app)
        .put(`/api/dailies/${daily.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          streak: 10,
          title: '新标题'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('新标题');
      expect(response.body.data.streak).toBe(5); // 应该保持不变
    });
  });

  describe('DELETE /api/dailies/:id', () => {
    it('应该删除每日任务', async () => {
      const daily = await Daily.create({
        userId: user.id,
        title: '待删除任务'
      });

      const response = await request(app)
        .delete(`/api/dailies/${daily.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const deletedDaily = await Daily.findByPk(daily.id);
      expect(deletedDaily).toBeNull();
    });
  });

  describe('POST /api/dailies/:id/complete', () => {
    it('应该完成每日任务', async () => {
      const daily = await Daily.create({
        userId: user.id,
        title: '待完成任务',
        repeatType: 'daily'
      });

      const response = await request(app)
        .post(`/api/dailies/${daily.id}/complete`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isCompleted).toBe(true);
      expect(response.body.data.streak).toBe(1);
    });

    it('应该增加streak', async () => {
      const daily = await Daily.create({
        userId: user.id,
        title: '连续任务',
        streak: 3
      });

      const response = await request(app)
        .post(`/api/dailies/${daily.id}/complete`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data.streak).toBe(4);
    });
  });

  describe('POST /api/dailies/:id/uncomplete', () => {
    it('应该取消完成每日任务', async () => {
      const today = new Date().toISOString().split('T')[0];
      const daily = await Daily.create({
        userId: user.id,
        title: '已完成任务',
        isCompleted: true,
        streak: 5,
        lastCompletedDate: today
      });

      const response = await request(app)
        .post(`/api/dailies/${daily.id}/uncomplete`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isCompleted).toBe(false);
      expect(response.body.data.streak).toBe(4);
    });
  });

  describe('GET /api/dailies/today/tasks', () => {
    it('应该获取今天的每日任务', async () => {
      // 创建今天应该执行的任务
      await Daily.create({
        userId: user.id,
        title: '今天任务1',
        repeatType: 'daily'
      });

      await Daily.create({
        userId: user.id,
        title: '今天任务2',
        repeatType: 'weekly',
        repeatDays: [new Date().getDay()] // 今天
      });

      // 创建不应该在今天执行的任务
      await Daily.create({
        userId: user.id,
        title: '明天任务',
        repeatType: 'weekly',
        repeatDays: [(new Date().getDay() + 1) % 7] // 明天
      });

      const response = await request(app)
        .get('/api/dailies/today/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('POST /api/dailies/:id/archive', () => {
    it('应该归档每日任务', async () => {
      const daily = await Daily.create({
        userId: user.id,
        title: '待归档任务',
        isArchived: false
      });

      const response = await request(app)
        .post(`/api/dailies/${daily.id}/archive`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isArchived).toBe(true);
    });
  });

  describe('POST /api/dailies/:id/unarchive', () => {
    it('应该取消归档每日任务', async () => {
      const daily = await Daily.create({
        userId: user.id,
        title: '已归档任务',
        isArchived: true
      });

      const response = await request(app)
        .post(`/api/dailies/${daily.id}/unarchive`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isArchived).toBe(false);
    });
  });

  describe('GET /api/dailies/stats/overview', () => {
    it('应该获取用户统计信息', async () => {
      await Daily.create({
        userId: user.id,
        title: '简单任务',
        difficulty: 'easy',
        isCompleted: true
      });

      await Daily.create({
        userId: user.id,
        title: '困难任务',
        difficulty: 'hard',
        isCompleted: false
      });

      const response = await request(app)
        .get('/api/dailies/stats/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('重复规则测试', () => {
    it('应该正确判断每日重复任务', async () => {
      const daily = await Daily.create({
        userId: user.id,
        title: '每日任务',
        repeatType: 'daily',
        startDate: new Date(),
        everyX: 1
      });

      expect(daily.shouldBeActiveToday()).toBe(true);
    });

    it('应该正确判断每周重复任务', async () => {
      const today = new Date().getDay();
      const daily = await Daily.create({
        userId: user.id,
        title: '每周任务',
        repeatType: 'weekly',
        repeatDays: [today],
        startDate: new Date(),
        everyX: 1
      });

      expect(daily.shouldBeActiveToday()).toBe(true);
    });

    it('应该正确判断每月重复任务', async () => {
      const daily = await Daily.create({
        userId: user.id,
        title: '每月任务',
        repeatType: 'monthly',
        startDate: new Date(),
        everyX: 1
      });

      // 由于今天是创建日，应该激活
      expect(daily.shouldBeActiveToday()).toBe(true);
    });
  });
});
