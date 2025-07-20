const friendService = require('../../src/services/friendService');
const { Friend, User } = require('../../src/models');
const { sequelize } = require('../../src/models');
const bcrypt = require('bcryptjs');

describe('FriendService Unit Tests', () => {
  let user1, user2, user3, user4;
  let transaction;

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
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await Friend.destroy({ where: {} });
  });

  describe('sendFriendRequest', () => {
    test('应该成功发送好友请求', async () => {
      const request = await friendService.sendFriendRequest(user1.id, user2.id);

      expect(request).toBeDefined();
      expect(request.requesterId).toBe(user1.id);
      expect(request.addresseeId).toBe(user2.id);
      expect(request.status).toBe('pending');
      expect(request.requester).toBeDefined();
      expect(request.addressee).toBeDefined();
    });

    test('应该拒绝缺少参数的请求', async () => {
      await expect(
        friendService.sendFriendRequest(null, user2.id)
      ).rejects.toThrow('Both requesterId and addresseeId are required');

      await expect(
        friendService.sendFriendRequest(user1.id, null)
      ).rejects.toThrow('Both requesterId and addresseeId are required');
    });

    test('应该拒绝向自己发送好友请求', async () => {
      await expect(
        friendService.sendFriendRequest(user1.id, user1.id)
      ).rejects.toThrow('Cannot send friend request to yourself');
    });

    test('应该拒绝不存在的用户', async () => {
      await expect(
        friendService.sendFriendRequest(user1.id, 99999)
      ).rejects.toThrow('Target user not found');

      await expect(
        friendService.sendFriendRequest(99999, user1.id)
      ).rejects.toThrow('Requester user not found');
    });

    test('应该处理重复的好友请求', async () => {
      await friendService.sendFriendRequest(user1.id, user2.id);

      await expect(
        friendService.sendFriendRequest(user1.id, user2.id)
      ).rejects.toThrow('Friend request already sent');
    });

    test('应该处理反向好友请求', async () => {
      await friendService.sendFriendRequest(user1.id, user2.id);

      await expect(
        friendService.sendFriendRequest(user2.id, user1.id)
      ).rejects.toThrow('You have already received a friend request from this user');
    });
  });

  describe('acceptFriendRequest', () => {
    test('应该成功接受好友请求', async () => {
      const request = await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'pending'
      });

      const accepted = await friendService.acceptFriendRequest(request.id, user2.id);

      expect(accepted.status).toBe('accepted');
      expect(accepted.requester).toBeDefined();
      expect(accepted.addressee).toBeDefined();
    });

    test('应该拒绝不存在的请求', async () => {
      await expect(
        friendService.acceptFriendRequest(99999, user2.id)
      ).rejects.toThrow('Friend request not found');
    });

    test('应该拒绝非接收者的接受请求', async () => {
      const request = await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'pending'
      });

      await expect(
        friendService.acceptFriendRequest(request.id, user3.id)
      ).rejects.toThrow('Unauthorized to accept this friend request');
    });

    test('应该拒绝非待处理状态的请求', async () => {
      const request = await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      await expect(
        friendService.acceptFriendRequest(request.id, user2.id)
      ).rejects.toThrow('Friend request is not pending');
    });
  });

  describe('rejectFriendRequest', () => {
    test('应该成功拒绝好友请求', async () => {
      const request = await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'pending'
      });

      const result = await friendService.rejectFriendRequest(request.id, user2.id);

      expect(result).toBe(true);

      const deletedRequest = await Friend.findByPk(request.id);
      expect(deletedRequest).toBeNull();
    });

    test('应该拒绝不存在的请求', async () => {
      await expect(
        friendService.rejectFriendRequest(99999, user2.id)
      ).rejects.toThrow('Friend request not found');
    });

    test('应该拒绝非接收者的拒绝请求', async () => {
      const request = await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'pending'
      });

      await expect(
        friendService.rejectFriendRequest(request.id, user3.id)
      ).rejects.toThrow('Unauthorized to reject this friend request');
    });
  });

  describe('getUserFriends', () => {
    test('应该返回格式化的好友列表', async () => {
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

      const friends = await friendService.getUserFriends(user1.id);

      expect(friends).toHaveLength(2);
      expect(friends[0]).toHaveProperty('friend');
      expect(friends[0].friend).toHaveProperty('id');
      expect(friends[0].friend).toHaveProperty('username');
      expect(friends[0].friend).toHaveProperty('avatarUrl');
      expect(friends[0].friend).toHaveProperty('level');
    });

    test('应该支持分页查询', async () => {
      // 创建多个好友关系
      for (let i = 5; i < 15; i++) {
        const newUser = await User.create({
          username: `testuser${i}`,
          email: `test${i}@example.com`,
          passwordHash: await bcrypt.hash('password123', 10),
          level: 5,
          experience: 500
        });

        await Friend.create({
          requesterId: user1.id,
          addresseeId: newUser.id,
          status: 'accepted'
        });
      }

      const friends = await friendService.getUserFriends(user1.id, { limit: 5, offset: 0 });
      expect(friends).toHaveLength(5);
    });
  });

  describe('getReceivedFriendRequests', () => {
    test('应该返回收到的待处理好友请求', async () => {
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

      const requests = await friendService.getReceivedFriendRequests(user1.id);

      expect(requests).toHaveLength(2);
      expect(requests[0]).toHaveProperty('requester');
      expect(requests[0].requester).toHaveProperty('username');
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

      const requests = await friendService.getReceivedFriendRequests(user1.id, { limit: 5 });
      expect(requests).toHaveLength(5);
    });
  });

  describe('getSentFriendRequests', () => {
    test('应该返回发送的待处理好友请求', async () => {
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

      const requests = await friendService.getSentFriendRequests(user1.id);

      expect(requests).toHaveLength(2);
      expect(requests[0]).toHaveProperty('addressee');
      expect(requests[0].addressee).toHaveProperty('username');
    });
  });

  describe('removeFriend', () => {
    test('应该成功移除好友关系', async () => {
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      const result = await friendService.removeFriend(user1.id, user2.id);
      expect(result).toBe(true);

      const areFriends = await friendService.areFriends(user1.id, user2.id);
      expect(areFriends).toBe(false);
    });

    test('应该拒绝移除不存在的好友关系', async () => {
      await expect(
        friendService.removeFriend(user1.id, user2.id)
      ).rejects.toThrow('Friendship not found');
    });
  });

  describe('areFriends', () => {
    test('应该正确判断好友关系', async () => {
      expect(await friendService.areFriends(user1.id, user2.id)).toBe(false);

      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      expect(await friendService.areFriends(user1.id, user2.id)).toBe(true);
    });
  });

  describe('getFriendshipStatus', () => {
    test('应该返回正确的关系状态', async () => {
      expect(await friendService.getFriendshipStatus(user1.id, user1.id)).toBe('self');
      expect(await friendService.getFriendshipStatus(user1.id, user2.id)).toBe('none');

      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'pending'
      });

      expect(await friendService.getFriendshipStatus(user1.id, user2.id)).toBe('pending');
    });
  });

  describe('getFriendCount', () => {
    test('应该正确统计好友数量', async () => {
      expect(await friendService.getFriendCount(user1.id)).toBe(0);

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

      expect(await friendService.getFriendCount(user1.id)).toBe(2);
    });
  });

  describe('getPendingFriendRequestsCount', () => {
    test('应该正确统计待处理请求数量', async () => {
      expect(await friendService.getPendingFriendRequestsCount(user1.id)).toBe(0);

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

      expect(await friendService.getPendingFriendRequestsCount(user1.id)).toBe(2);
    });
  });

  describe('getFriendOverview', () => {
    test('应该返回好友概览信息', async () => {
      const overview = await friendService.getFriendOverview(user1.id);

      expect(overview).toHaveProperty('friendCount');
      expect(overview).toHaveProperty('pendingRequestsCount');
      expect(overview.friendCount).toBe(0);
      expect(overview.pendingRequestsCount).toBe(0);
    });

    test('应该正确统计好友和待处理请求', async () => {
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

      const overview = await friendService.getFriendOverview(user1.id);

      expect(overview.friendCount).toBe(1);
      expect(overview.pendingRequestsCount).toBe(1);
    });
  });

  describe('searchFriends', () => {
    test('应该搜索好友', async () => {
      // 创建好友关系
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      const results = await friendService.searchFriends(user1.id, 'testuser2');

      expect(results).toHaveLength(1);
      expect(results[0].username).toBe('testuser2');
    });

    test('应该支持模糊搜索', async () => {
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      const results = await friendService.searchFriends(user1.id, 'user2');

      expect(results).toHaveLength(1);
    });

    test('应该返回空数组当没有匹配的好友', async () => {
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      const results = await friendService.searchFriends(user1.id, 'nonexistent');

      expect(results).toHaveLength(0);
    });

    test('应该返回空数组当没有好友', async () => {
      const results = await friendService.searchFriends(user1.id, 'test');

      expect(results).toHaveLength(0);
    });

    test('应该支持分页查询', async () => {
      // 创建多个好友
      for (let i = 5; i < 15; i++) {
        const newUser = await User.create({
          username: `testuser${i}`,
          email: `test${i}@example.com`,
          passwordHash: await bcrypt.hash('password123', 10),
          level: 5,
          experience: 500
        });

        await Friend.create({
          requesterId: user1.id,
          addresseeId: newUser.id,
          status: 'accepted'
        });
      }

      const results = await friendService.searchFriends(user1.id, 'testuser', { limit: 5 });
      expect(results).toHaveLength(5);
    });
  });

  describe('getFriendsLeaderboard', () => {
    beforeEach(async () => {
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
    });

    test('应该返回按等级排序的排行榜', async () => {
      const leaderboard = await friendService.getFriendsLeaderboard(user1.id);

      expect(leaderboard).toHaveProperty('leaderboard');
      expect(leaderboard).toHaveProperty('totalFriends');
      expect(leaderboard).toHaveProperty('userRank');
      expect(leaderboard.leaderboard).toHaveLength(3);

      // 按等级降序排序
      expect(leaderboard.leaderboard[0].stats.level).toBe(15); // user2
      expect(leaderboard.leaderboard[1].stats.level).toBe(12); // user4
      expect(leaderboard.leaderboard[2].stats.level).toBe(8);  // user3
    });

    test('应该支持按经验值排序', async () => {
      const leaderboard = await friendService.getFriendsLeaderboard(user1.id, {
        sortBy: 'experience',
        order: 'ASC'
      });

      expect(leaderboard.leaderboard[0].stats.experience).toBe(800);  // user3
      expect(leaderboard.leaderboard[1].stats.experience).toBe(1200); // user4
      expect(leaderboard.leaderboard[2].stats.experience).toBe(1500); // user2
    });

    test('应该支持按金币排序', async () => {
      const leaderboard = await friendService.getFriendsLeaderboard(user1.id, {
        sortBy: 'coins',
        order: 'DESC'
      });

      expect(leaderboard.leaderboard[0].stats.coins).toBe(800); // user2
      expect(leaderboard.leaderboard[1].stats.coins).toBe(600); // user4
      expect(leaderboard.leaderboard[2].stats.coins).toBe(300); // user3
    });

    test('应该支持限制返回数量', async () => {
      const leaderboard = await friendService.getFriendsLeaderboard(user1.id, {
        limit: 2
      });

      expect(leaderboard.leaderboard).toHaveLength(2);
    });

    test('应该处理无效排序字段', async () => {
      await expect(
        friendService.getFriendsLeaderboard(user1.id, { sortBy: 'invalidField' })
      ).rejects.toThrow('Invalid sort field');
    });

    test('应该处理无效排序顺序', async () => {
      await expect(
        friendService.getFriendsLeaderboard(user1.id, { order: 'INVALID' })
      ).rejects.toThrow('Invalid order');
    });

    test('应该处理没有好友的情况', async () => {
      await Friend.destroy({ where: {} });

      const leaderboard = await friendService.getFriendsLeaderboard(user1.id);

      expect(leaderboard.leaderboard).toHaveLength(0);
      expect(leaderboard.totalFriends).toBe(0);
      expect(leaderboard.userRank).toBeNull();
    });

    test('应该正确计算用户排名', async () => {
      // 创建user1和user2的好友关系，使user1出现在排行榜中
      await Friend.create({
        requesterId: user2.id,
        addresseeId: user1.id,
        status: 'accepted'
      });

      const leaderboard = await friendService.getFriendsLeaderboard(user1.id, {
        sortBy: 'level',
        order: 'DESC'
      });

      expect(leaderboard.userRank).toBeDefined();
      // 根据实际数据计算排名：user2(15), user4(12), user1(10), user3(8)
      expect(leaderboard.userRank.rank).toBe(3); // user1的等级是10，排在user2(15)和user4(12)之后
      expect(leaderboard.userRank.totalFriends).toBe(4);
    });
  });
});
