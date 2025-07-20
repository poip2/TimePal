const request = require('supertest');
const app = require('../../src/server');
const { sequelize, User, Friend } = require('../../src/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('好友排行榜功能测试', () => {
  let user1, user2, user3, user4;
  let token1;

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

    await Friend.create({
      requesterId: user4.id,
      addresseeId: user1.id,
      status: 'accepted'
    });

    // 生成token
    token1 = jwt.sign(
      { id: user1.id, username: user1.username },
      process.env.JWT_SECRET || 'test-secret'
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // 清理额外的测试数据，只保留基础数据
    await Friend.destroy({
      where: {
        id: {
          [sequelize.Sequelize.Op.notIn]: [
            sequelize.literal(`(SELECT id FROM friendships WHERE (requester_id = ${user1.id} AND addressee_id = ${user2.id}) OR (requester_id = ${user3.id} AND addressee_id = ${user1.id}) OR (requester_id = ${user4.id} AND addressee_id = ${user1.id}))`)
          ]
        }
      }
    });

    // 清理额外的用户
    await User.destroy({
      where: {
        id: {
          [sequelize.Sequelize.Op.notIn]: [user1.id, user2.id, user3.id, user4.id]
        }
      }
    });
  });

  describe('GET /api/friends/leaderboard', () => {
    test('应该返回按等级排序的好友排行榜', async () => {
      const response = await request(app)
        .get('/api/friends/leaderboard')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.leaderboard).toHaveLength(3);

      // 验证排序（按等级降序）
      const leaderboard = response.body.data.leaderboard;
      expect(leaderboard[0].stats.level).toBe(15); // user2
      expect(leaderboard[1].stats.level).toBe(12); // user4
      expect(leaderboard[2].stats.level).toBe(8);  // user3
    });

    test('应该支持按经验值排序', async () => {
      const response = await request(app)
        .get('/api/friends/leaderboard?sortBy=experience&order=ASC')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      const leaderboard = response.body.data.leaderboard;
      expect(leaderboard[0].stats.experience).toBe(800);  // user3
      expect(leaderboard[1].stats.experience).toBe(1200); // user4
      expect(leaderboard[2].stats.experience).toBe(1500); // user2
    });

    test('应该支持按金币排序', async () => {
      const response = await request(app)
        .get('/api/friends/leaderboard?sortBy=coins&order=DESC')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      const leaderboard = response.body.data.leaderboard;
      expect(leaderboard[0].stats.coins).toBe(800); // user2
      expect(leaderboard[1].stats.coins).toBe(600); // user4
      expect(leaderboard[2].stats.coins).toBe(300); // user3
    });

    test('应该支持限制返回数量', async () => {
      const response = await request(app)
        .get('/api/friends/leaderboard?limit=2')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.data.leaderboard).toHaveLength(2);
    });

    test('应该包含用户排名信息', async () => {
      // 创建新用户来测试用户排名
      const testUser = await User.create({
        username: 'testuser5',
        email: 'test5@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        level: 5,
        experience: 500,
        coins: 250,
        gold: 500,
        totalTasksCompleted: 25,
        streakHighest: 10,
        loginStreak: 2
      });

      const testToken = jwt.sign(
        { id: testUser.id, username: testUser.username },
        process.env.JWT_SECRET || 'test-secret'
      );

      // 初始状态下没有好友
      const response = await request(app)
        .get('/api/friends/leaderboard')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.data.userRank).toBeNull(); // 用户没有好友

      // 创建testUser和user1的好友关系
      await Friend.create({
        requesterId: user1.id,
        addresseeId: testUser.id,
        status: 'accepted'
      });

      const response2 = await request(app)
        .get('/api/friends/leaderboard?sortBy=level')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response2.body.data.userRank).toBeDefined();
      expect(response2.body.data.userRank.rank).toBeGreaterThan(0);
    });

    test('应该处理无效排序字段', async () => {
      const response = await request(app)
        .get('/api/friends/leaderboard?sortBy=invalidField')
        .set('Authorization', `Bearer ${token1}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('无效的排序字段');
    });

    test('应该处理无效排序顺序', async () => {
      const response = await request(app)
        .get('/api/friends/leaderboard?order=INVALID')
        .set('Authorization', `Bearer ${token1}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('排序顺序必须是ASC或DESC');
    });

    test('应该处理没有好友的情况', async () => {
      // 创建新用户
      const newUser = await User.create({
        username: 'newuser',
        email: 'new@example.com',
        passwordHash: await bcrypt.hash('password123', 10)
      });

      const newToken = jwt.sign(
        { id: newUser.id, username: newUser.username },
        process.env.JWT_SECRET || 'test-secret'
      );

      const response = await request(app)
        .get('/api/friends/leaderboard')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(200);

      expect(response.body.data.leaderboard).toHaveLength(0);
      expect(response.body.data.totalFriends).toBe(0);
      expect(response.body.data.userRank).toBeNull();
    });

    test('应该支持按总任务完成数排序', async () => {
      const response = await request(app)
        .get('/api/friends/leaderboard?sortBy=totalTasksCompleted&order=DESC')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      const leaderboard = response.body.data.leaderboard;
      expect(leaderboard[0].stats.totalTasksCompleted).toBe(80); // user2
      expect(leaderboard[1].stats.totalTasksCompleted).toBe(60); // user4
      expect(leaderboard[2].stats.totalTasksCompleted).toBe(40); // user3
    });

    test('应该支持按最高连击排序', async () => {
      const response = await request(app)
        .get('/api/friends/leaderboard?sortBy=streakHighest&order=DESC')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      const leaderboard = response.body.data.leaderboard;
      expect(leaderboard[0].stats.streakHighest).toBe(30); // user2
      expect(leaderboard[1].stats.streakHighest).toBe(25); // user4
      expect(leaderboard[2].stats.streakHighest).toBe(15); // user3
    });

    test('应该支持按登录连击排序', async () => {
      const response = await request(app)
        .get('/api/friends/leaderboard?sortBy=loginStreak&order=DESC')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      const leaderboard = response.body.data.leaderboard;
      expect(leaderboard[0].stats.loginStreak).toBe(10); // user2
      expect(leaderboard[1].stats.loginStreak).toBe(7);  // user4
      expect(leaderboard[2].stats.loginStreak).toBe(3);  // user3
    });

    test('应该支持按金币排序升序', async () => {
      const response = await request(app)
        .get('/api/friends/leaderboard?sortBy=coins&order=ASC')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      const leaderboard = response.body.data.leaderboard;
      expect(leaderboard[0].stats.coins).toBe(300); // user3
      expect(leaderboard[1].stats.coins).toBe(600); // user4
      expect(leaderboard[2].stats.coins).toBe(800); // user2
    });

    test('应该支持按经验值排序升序', async () => {
      const response = await request(app)
        .get('/api/friends/leaderboard?sortBy=experience&order=ASC')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      const leaderboard = response.body.data.leaderboard;
      expect(leaderboard[0].stats.experience).toBe(800);  // user3
      expect(leaderboard[1].stats.experience).toBe(1200); // user4
      expect(leaderboard[2].stats.experience).toBe(1500); // user2
    });

    test('应该支持按黄金排序', async () => {
      const response = await request(app)
        .get('/api/friends/leaderboard?sortBy=gold&order=DESC')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      const leaderboard = response.body.data.leaderboard;
      expect(leaderboard[0].stats.gold).toBe(1500); // user2
      expect(leaderboard[1].stats.gold).toBe(1200); // user4
      expect(leaderboard[2].stats.gold).toBe(800);  // user3
    });

    test('应该正确处理用户排名', async () => {
      // 创建user1和user2的好友关系，使user1出现在排行榜中
      await Friend.create({
        requesterId: user2.id,
        addresseeId: user1.id,
        status: 'accepted'
      });

      const response = await request(app)
        .get('/api/friends/leaderboard?sortBy=level&order=DESC')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.data.userRank).toBeDefined();
      expect(response.body.data.userRank.rank).toBe(3); // user1的等级是10，在user2(15)和user4(12)之后
      expect(response.body.data.userRank.totalFriends).toBe(4);
      expect(response.body.data.userRank.sortBy).toBe('level');
      expect(response.body.data.userRank.value).toBe(10);
    });

    test('应该处理边界值排序', async () => {
      // 创建具有相同值的用户
      const user5 = await User.create({
        username: 'testuser5',
        email: 'test5@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        level: 15, // 与user2相同
        experience: 1500,
        coins: 800,
        gold: 1500,
        totalTasksCompleted: 80,
        streakHighest: 30,
        loginStreak: 10
      });

      await Friend.create({
        requesterId: user5.id,
        addresseeId: user1.id,
        status: 'accepted'
      });

      const response = await request(app)
        .get('/api/friends/leaderboard?sortBy=level&order=DESC')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.data.leaderboard).toHaveLength(4);
      // 检查相同值的用户是否都被包含
      const level15Users = response.body.data.leaderboard.filter(u => u.stats.level === 15);
      expect(level15Users).toHaveLength(2);
    });

    test('应该处理零值和空值', async () => {
      // 创建具有零值的用户
      const userZero = await User.create({
        username: 'zeroUser',
        email: 'zero@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        level: 0,
        experience: 0,
        coins: 0,
        gold: 0,
        totalTasksCompleted: 0,
        streakHighest: 0,
        loginStreak: 0
      });

      await Friend.create({
        requesterId: userZero.id,
        addresseeId: user1.id,
        status: 'accepted'
      });

      const response = await request(app)
        .get('/api/friends/leaderboard?sortBy=level&order=ASC')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.data.leaderboard).toHaveLength(4);
      expect(response.body.data.leaderboard[0].stats.level).toBe(0);
    });

    test('应该处理大数值排序', async () => {
      // 创建具有大数值的用户
      const userBig = await User.create({
        username: 'bigUser',
        email: 'big@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        level: 999,
        experience: 999999,
        coins: 999999,
        gold: 999999,
        totalTasksCompleted: 9999,
        streakHighest: 999,
        loginStreak: 999
      });

      await Friend.create({
        requesterId: userBig.id,
        addresseeId: user1.id,
        status: 'accepted'
      });

      const response = await request(app)
        .get('/api/friends/leaderboard?sortBy=level&order=DESC')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.data.leaderboard).toHaveLength(4);
      expect(response.body.data.leaderboard[0].stats.level).toBe(999);
    });

    test('应该拒绝未认证的请求', async () => {
      const response = await request(app)
        .get('/api/friends/leaderboard')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('应该处理无效的limit参数', async () => {
      const response = await request(app)
        .get('/api/friends/leaderboard?limit=invalid')
        .set('Authorization', `Bearer ${token1}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('应该处理负数limit参数', async () => {
      const response = await request(app)
        .get('/api/friends/leaderboard?limit=-1')
        .set('Authorization', `Bearer ${token1}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('应该处理超大limit参数', async () => {
      const response = await request(app)
        .get('/api/friends/leaderboard?limit=1000')
        .set('Authorization', `Bearer ${token1}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('应该处理数据库错误', async () => {
      // 模拟数据库错误
      jest.spyOn(User, 'findAll').mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .get('/api/friends/leaderboard')
        .set('Authorization', `Bearer ${token1}`)
        .expect(500);

      expect(response.body.success).toBe(false);

      // 恢复原始实现
      User.findAll.mockRestore();
    });

    test('应该处理并发请求', async () => {
      const promises = Array(5).fill().map(() =>
        request(app)
          .get('/api/friends/leaderboard')
          .set('Authorization', `Bearer ${token1}`)
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.leaderboard).toHaveLength(3);
      });
    });
  });
});
