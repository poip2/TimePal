const supertest = require('supertest');
const app = require('../../src/server');
const { sequelize, User, Friend } = require('../../src/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

describe('好友功能集成测试', () => {
  let user1, user2, user3, user4;
  let token1, token2, token3;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // 创建测试用户
    user1 = await User.create({
      username: 'testuser1',
      email: 'test1@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      level: 10,
      experience: 1000,
      coins: 500,
      gold: 1000,
      totalTasksCompleted: 50,
      streakHighest: 20,
      loginStreak: 5
    });

    user2 = await User.create({
      username: 'testuser2',
      email: 'test2@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      level: 15,
      experience: 1500,
      coins: 800,
      gold: 1500,
      totalTasksCompleted: 80,
      streakHighest: 30,
      loginStreak: 10
    });

    user3 = await User.create({
      username: 'testuser3',
      email: 'test3@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      level: 8,
      experience: 800,
      coins: 300,
      gold: 800,
      totalTasksCompleted: 40,
      streakHighest: 15,
      loginStreak: 3
    });

    user4 = await User.create({
      username: 'testuser4',
      email: 'test4@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      level: 12,
      experience: 1200,
      coins: 600,
      gold: 1200,
      totalTasksCompleted: 60,
      streakHighest: 25,
      loginStreak: 7
    });

    // 生成token
    token1 = jwt.sign(
      { id: user1.id, username: user1.username },
      process.env.JWT_SECRET || 'test-secret'
    );

    token2 = jwt.sign(
      { id: user2.id, username: user2.username },
      process.env.JWT_SECRET || 'test-secret'
    );

    token3 = jwt.sign(
      { id: user3.id, username: user3.username },
      process.env.JWT_SECRET || 'test-secret'
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await Friend.destroy({ where: {} });
  });

  describe('POST /api/friends/requests', () => {
    test('应该成功发送好友请求', async () => {
      const response = await supertest(app)
        .post('/api/friends/requests')
        .set('Authorization', `Bearer ${token1}`)
        .send({ addresseeId: user2.id })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.status).toBe('pending');
    });

    test('应该拒绝未认证的请求', async () => {
      const response = await supertest(app)
        .post('/api/friends/requests')
        .send({ addresseeId: user2.id })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('应该拒绝向自己发送好友请求', async () => {
      const response = await supertest(app)
        .post('/api/friends/requests')
        .set('Authorization', `Bearer ${token1}`)
        .send({ addresseeId: user1.id })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Cannot send friend request to yourself');
    });

    test('应该拒绝不存在的用户', async () => {
      const response = await supertest(app)
        .post('/api/friends/requests')
        .set('Authorization', `Bearer ${token1}`)
        .send({ addresseeId: 99999 })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('应该拒绝重复的好友请求', async () => {
      await supertest(app)
        .post('/api/friends/requests')
        .set('Authorization', `Bearer ${token1}`)
        .send({ addresseeId: user2.id })
        .expect(201);

      const response = await supertest(app)
        .post('/api/friends/requests')
        .set('Authorization', `Bearer ${token1}`)
        .send({ addresseeId: user2.id })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Friend request already sent');
    });

    test('应该拒绝缺少addresseeId的请求', async () => {
      const response = await supertest(app)
        .post('/api/friends/requests')
        .set('Authorization', `Bearer ${token1}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/friends/requests/:id/accept', () => {
    test('应该成功接受好友请求', async () => {
      const friendRequest = await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'pending'
      });

      const response = await supertest(app)
        .put(`/api/friends/requests/${friendRequest.id}/accept`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('accepted');
    });

    test('应该拒绝非接收者的接受请求', async () => {
      const friendRequest = await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'pending'
      });

      const response = await supertest(app)
        .put(`/api/friends/requests/${friendRequest.id}/accept`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('应该拒绝不存在的请求', async () => {
      const response = await supertest(app)
        .put('/api/friends/requests/99999/accept')
        .set('Authorization', `Bearer ${token2}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('应该拒绝非待处理状态的请求', async () => {
      const friendRequest = await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      const response = await supertest(app)
        .put(`/api/friends/requests/${friendRequest.id}/accept`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/friends/requests/:id', () => {
    test('应该成功拒绝好友请求', async () => {
      const friendRequest = await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'pending'
      });

      const response = await supertest(app)
        .delete(`/api/friends/requests/${friendRequest.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      const deletedRequest = await Friend.findByPk(friendRequest.id);
      expect(deletedRequest).toBeNull();
    });

    test('应该拒绝非接收者的拒绝请求', async () => {
      const friendRequest = await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'pending'
      });

      const response = await supertest(app)
        .delete(`/api/friends/requests/${friendRequest.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/friends', () => {
    test('应该成功获取好友列表', async () => {
      // 创建好友关系
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      await Friend.create({
        requesterId: user3.id,
        addresseeId: user1.id,
        status: 'accepted'
      });

      const response = await supertest(app)
        .get('/api/friends')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.friends).toHaveLength(2);
      expect(response.body.data.friends[0]).toHaveProperty('friend');
      expect(response.body.data.friends[0].friend).toHaveProperty('username');
    });

    test('应该支持分页查询', async () => {
      // 创建多个好友关系
      const users = [];
      for (let i = 5; i < 15; i++) {
        const timestamp = Date.now() + i;
        const newUser = await User.create({
          username: `testuser${i}${timestamp}`,
          email: `test${i}${timestamp}@example.com`,
          passwordHash: await bcrypt.hash('password123', 10),
          level: 5,
          experience: 500
        });
        users.push(newUser);

        await Friend.create({
          requesterId: user1.id,
          addresseeId: newUser.id,
          status: 'accepted'
        });
      }

      const response = await supertest(app)
        .get('/api/friends?limit=5&offset=0')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.data.friends).toHaveLength(5);
    });

    test('应该拒绝未认证的请求', async () => {
      const response = await supertest(app)
        .get('/api/friends')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/friends/requests/received', () => {
    test('应该成功获取收到的待处理好友请求', async () => {
      await Friend.create({
        requesterId: user2.id,
        addresseeId: user1.id,
        status: 'pending'
      });

      await Friend.create({
        requesterId: user3.id,
        addresseeId: user1.id,
        status: 'pending'
      });

      const response = await supertest(app)
        .get('/api/friends/requests/received')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.requests).toHaveLength(2);
      expect(response.body.data.requests[0]).toHaveProperty('requester');
    });

    test('应该支持分页查询', async () => {
      for (let i = 5; i < 15; i++) {
        const newUser = await User.create({
          username: `testuser${i}`,
          email: `test${i}@example.com`,
          passwordHash: await bcrypt.hash('password123', 10),
          level: 5,
          experience: 500
        });

        await Friend.create({
          requesterId: newUser.id,
          addresseeId: user1.id,
          status: 'pending'
        });
      }

      const response = await supertest(app)
        .get('/api/friends/requests/received?limit=5')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.data.requests).toHaveLength(5);
    });
  });

  describe('GET /api/friends/requests/sent', () => {
    test('应该成功获取发送的待处理好友请求', async () => {
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'pending'
      });

      await Friend.create({
        requesterId: user1.id,
        addresseeId: user3.id,
        status: 'pending'
      });

      const response = await supertest(app)
        .get('/api/friends/requests/sent')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.requests).toHaveLength(2);
      expect(response.body.data.requests[0]).toHaveProperty('addressee');
    });
  });

  describe('DELETE /api/friends/:friendId', () => {
    test('应该成功移除好友关系', async () => {
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      const response = await supertest(app)
        .delete(`/api/friends/${user2.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      const friendship = await Friend.findOne({
        where: {
          status: 'accepted',
          [Op.or]: [
            { requesterId: user1.id, addresseeId: user2.id },
            { requesterId: user2.id, addresseeId: user1.id }
          ]
        }
      });
      expect(friendship).toBeNull();
    });

    test('应该拒绝移除不存在的好友关系', async () => {
      const response = await supertest(app)
        .delete(`/api/friends/${user2.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/friends/status/:userId', () => {
    test('应该返回好友关系状态', async () => {
      const response = await supertest(app)
        .get(`/api/friends/status/${user2.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('none');
    });

    test('应该返回pending状态', async () => {
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'pending'
      });

      const response = await supertest(app)
        .get(`/api/friends/status/${user2.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('pending');
    });

    test('应该返回accepted状态', async () => {
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      const response = await supertest(app)
        .get(`/api/friends/status/${user2.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('accepted');
    });

    test('应该返回self状态', async () => {
      const response = await supertest(app)
        .get(`/api/friends/status/${user1.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('self');
    });
  });

  describe('GET /api/friends/overview', () => {
    test('应该返回好友概览信息', async () => {
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      await Friend.create({
        requesterId: user3.id,
        addresseeId: user1.id,
        status: 'pending'
      });

      const response = await supertest(app)
        .get('/api/friends/overview')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('friendCount');
      expect(response.body.data).toHaveProperty('pendingRequestsCount');
      expect(response.body.data.friendCount).toBe(1);
      expect(response.body.data.pendingRequestsCount).toBe(1);
    });
  });

  describe('GET /api/friends/search', () => {
    test('应该搜索好友', async () => {
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      const response = await supertest(app)
        .get('/api/friends/search?q=testuser2')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.friends).toHaveLength(1);
      expect(response.body.data.friends[0].username).toBe('testuser2');
    });

    test('应该支持模糊搜索', async () => {
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      const response = await supertest(app)
        .get('/api/friends/search?q=user2')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.friends).toHaveLength(1);
    });

    test('应该返回空数组当没有匹配的好友', async () => {
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      const response = await supertest(app)
        .get('/api/friends/search?q=nonexistent')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.friends).toHaveLength(0);
    });

    test('应该支持分页查询', async () => {
      // 创建多个好友
      for (let i = 5; i < 15; i++) {
        const timestamp = Date.now() + i;
        const newUser = await User.create({
          username: `testuser${i}${timestamp}`,
          email: `test${i}${timestamp}@example.com`,
          passwordHash: await bcrypt.hash('password123', 10),
          level: 5,
          experience: 500
        });

        await Friend.create({
          requesterId: newUser.id,
          addresseeId: user1.id,
          status: 'accepted'
        });
      }

      const response = await supertest(app)
        .get('/api/friends/search?q=testuser&limit=5')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.friends).toHaveLength(5);
    });
  });

  describe('边界条件和错误处理', () => {
    test('应该处理无效的userId参数', async () => {
      const response = await supertest(app)
        .get('/api/friends/status/invalid')
        .set('Authorization', `Bearer ${token1}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('应该处理数据库错误', async () => {
      // 模拟数据库错误
      jest.spyOn(Friend, 'findAll').mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await supertest(app)
        .get('/api/friends')
        .set('Authorization', `Bearer ${token1}`)
        .expect(500);

      expect(response.body.success).toBe(false);

      // 恢复原始实现
      Friend.findAll.mockRestore();
    });
  });
});
