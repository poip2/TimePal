const request = require('supertest');
const app = require('../../src/server');
const { User, Habit } = require('../../src/models');
const sequelize = require('../../src/config/database');

// 测试数据库配置
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await User.destroy({ where: {} });
  await Habit.destroy({ where: {} });
});

describe('习惯管理API测试', () => {
  let token;
  let user;

  beforeEach(async () => {
    // 创建测试用户
    user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'password123'
    });

    // 获取认证令牌
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    token = loginResponse.body.data.token;
  });

  describe('POST /api/habits', () => {
    it('应该成功创建新习惯', async () => {
      const response = await request(app)
        .post('/api/habits')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '每日锻炼',
          notes: '每天锻炼30分钟',
          type: 'good',
          difficulty: 'medium'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.habit.title).toBe('每日锻炼');
      expect(response.body.data.habit.type).toBe('good');
      expect(response.body.data.habit.difficulty).toBe('medium');
    });

    it('应该拒绝无效的type值', async () => {
      const response = await request(app)
        .post('/api/habits')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '测试习惯',
          type: 'invalid'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('应该拒绝过长的标题', async () => {
      const longTitle = 'a'.repeat(256);
      const response = await request(app)
        .post('/api/habits')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: longTitle,
          type: 'good'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('应该拒绝空标题', async () => {
      const response = await request(app)
        .post('/api/habits')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '',
          type: 'good'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('应该拒绝未认证的请求', async () => {
      const response = await request(app)
        .post('/api/habits')
        .send({
          title: '测试习惯',
          type: 'good'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/habits', () => {
    beforeEach(async () => {
      // 创建测试习惯
      await Habit.create({
        title: '习惯1',
        type: 'good',
        difficulty: 'easy',
        userId: user.id
      });

      await Habit.create({
        title: '习惯2',
        type: 'bad',
        difficulty: 'hard',
        userId: user.id
      });
    });

    it('应该获取用户的所有习惯', async () => {
      const response = await request(app)
        .get('/api/habits')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.habits).toHaveLength(2);
    });

    it('应该支持按类型筛选', async () => {
      const response = await request(app)
        .get('/api/habits?type=good')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.habits).toHaveLength(1);
      expect(response.body.data.habits[0].type).toBe('good');
    });

    it('应该支持分页', async () => {
      const response = await request(app)
        .get('/api/habits?page=1&limit=1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.habits).toHaveLength(1);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(1);
    });
  });

  describe('GET /api/habits/:id', () => {
    let habit;

    beforeEach(async () => {
      habit = await Habit.create({
        title: '测试习惯',
        type: 'good',
        userId: user.id
      });
    });

    it('应该获取单个习惯详情', async () => {
      const response = await request(app)
        .get(`/api/habits/${habit.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.habit.title).toBe('测试习惯');
    });

    it('应该拒绝访问其他用户的习惯', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        passwordHash: 'password123'
      });

      const otherHabit = await Habit.create({
        title: '其他用户的习惯',
        type: 'good',
        userId: otherUser.id
      });

      const response = await request(app)
        .get(`/api/habits/${otherHabit.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('应该拒绝访问不存在的习惯', async () => {
      const response = await request(app)
        .get('/api/habits/999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/habits/:id', () => {
    let habit;

    beforeEach(async () => {
      habit = await Habit.create({
        title: '原始标题',
        type: 'good',
        difficulty: 'easy',
        userId: user.id
      });
    });

    it('应该成功更新习惯', async () => {
      const response = await request(app)
        .put(`/api/habits/${habit.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '更新后的标题',
          difficulty: 'medium'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.habit.title).toBe('更新后的标题');
      expect(response.body.data.habit.difficulty).toBe('medium');
    });

    it('应该拒绝更新不存在的习惯', async () => {
      const response = await request(app)
        .put('/api/habits/999')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '新标题'
        });

      expect(response.status).toBe(404);
    });

    it('应该拒绝无效的更新数据', async () => {
      const response = await request(app)
        .put(`/api/habits/${habit.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'invalid'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/habits/:id', () => {
    let habit;

    beforeEach(async () => {
      habit = await Habit.create({
        title: '待删除的习惯',
        type: 'good',
        userId: user.id
      });
    });

    it('应该成功删除习惯', async () => {
      const response = await request(app)
        .delete(`/api/habits/${habit.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const deletedHabit = await Habit.findByPk(habit.id);
      expect(deletedHabit).toBeNull();
    });

    it('应该拒绝删除不存在的习惯', async () => {
      const response = await request(app)
        .delete('/api/habits/999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/habits/:id/score', () => {
    let goodHabit;
    let badHabit;

    beforeEach(async () => {
      goodHabit = await Habit.create({
        title: '好习惯',
        type: 'good',
        isPositive: true,
        userId: user.id
      });

      badHabit = await Habit.create({
        title: '坏习惯',
        type: 'bad',
        isNegative: true,
        userId: user.id
      });
    });

    it('应该成功为好习惯upvote', async () => {
      const response = await request(app)
        .post(`/api/habits/${goodHabit.id}/score`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          action: 'up'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.habit.upCount).toBe(1);
      expect(response.body.data.habit.counterUp).toBe(1);
    });

    it('应该成功为坏习惯downvote', async () => {
      const response = await request(app)
        .post(`/api/habits/${badHabit.id}/score`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          action: 'down'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.habit.downCount).toBe(1);
      expect(response.body.data.habit.counterDown).toBe(1);
    });

    it('应该拒绝无效的评分动作', async () => {
      const response = await request(app)
        .post(`/api/habits/${goodHabit.id}/score`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          action: 'invalid'
        });

      expect(response.status).toBe(400);
    });

    it('应该拒绝对不支持评分的习惯进行评分', async () => {
      const neutralHabit = await Habit.create({
        title: '中性习惯',
        type: 'good',
        isPositive: false,
        isNegative: false,
        userId: user.id
      });

      const response = await request(app)
        .post(`/api/habits/${neutralHabit.id}/score`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          action: 'up'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/habits/:id/archive', () => {
    let habit;

    beforeEach(async () => {
      habit = await Habit.create({
        title: '待归档的习惯',
        type: 'good',
        userId: user.id
      });
    });

    it('应该成功归档习惯', async () => {
      const response = await request(app)
        .post(`/api/habits/${habit.id}/archive`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          archive: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.habit.isArchived).toBe(true);
    });

    it('应该成功取消归档习惯', async () => {
      await habit.archive();

      const response = await request(app)
        .post(`/api/habits/${habit.id}/archive`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          archive: false
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.habit.isArchived).toBe(false);
    });
  });

  describe('GET /api/habits/stats', () => {
    beforeEach(async () => {
      // 创建测试数据
      await Habit.create({
        title: '好习惯1',
        type: 'good',
        difficulty: 'easy',
        userId: user.id
      });

      await Habit.create({
        title: '好习惯2',
        type: 'good',
        difficulty: 'medium',
        userId: user.id
      });

      await Habit.create({
        title: '坏习惯',
        type: 'bad',
        difficulty: 'hard',
        userId: user.id
      });

      // 归档一个习惯
      const archivedHabit = await Habit.create({
        title: '已归档习惯',
        type: 'good',
        userId: user.id
      });
      await archivedHabit.archive();
    });

    it('应该获取用户习惯统计', async () => {
      const response = await request(app)
        .get('/api/habits/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stats.total).toBe(4);
      expect(response.body.data.stats.byType.good).toBe(3);
      expect(response.body.data.stats.byType.bad).toBe(1);
      expect(response.body.data.stats.active).toBe(3);
      expect(response.body.data.stats.archived).toBe(1);
    });
  });

  describe('Habit模型方法测试', () => {
    let habit;

    beforeEach(async () => {
      habit = await Habit.create({
        title: '测试习惯',
        type: 'good',
        userId: user.id
      });
    });

    it('应该正确增加counterUp', async () => {
      await habit.incrementCounterUp();
      expect(habit.counterUp).toBe(1);

      const updatedHabit = await Habit.findByPk(habit.id);
      expect(updatedHabit.counterUp).toBe(1);
    });

    it('应该正确增加counterDown', async () => {
      await habit.incrementCounterDown();
      expect(habit.counterDown).toBe(1);

      const updatedHabit = await Habit.findByPk(habit.id);
      expect(updatedHabit.counterDown).toBe(1);
    });

    it('应该正确归档和取消归档', async () => {
      await habit.archive();
      expect(habit.isArchived).toBe(true);

      await habit.unarchive();
      expect(habit.isArchived).toBe(false);
    });

    it('应该正确upvote和downvote', async () => {
      await habit.upvote();
      expect(habit.upCount).toBe(1);

      await habit.downvote();
      expect(habit.downCount).toBe(1);
    });
  });

  describe('Habit类方法测试', () => {
    beforeEach(async () => {
      await Habit.create({
        title: '习惯1',
        type: 'good',
        difficulty: 'easy',
        userId: user.id
      });

      await Habit.create({
        title: '习惯2',
        type: 'bad',
        difficulty: 'hard',
        userId: user.id
      });
    });

    it('应该正确获取用户的习惯', async () => {
      const habits = await Habit.findByUser(user.id);
      expect(habits).toHaveLength(2);
    });

    it('应该正确按类型筛选习惯', async () => {
      const habits = await Habit.findByUser(user.id, { type: 'good' });
      expect(habits).toHaveLength(1);
      expect(habits[0].type).toBe('good');
    });

    it('应该正确获取用户统计', async () => {
      const stats = await Habit.getUserStats(user.id);
      expect(stats).toHaveLength(2);
    });
  });
});
