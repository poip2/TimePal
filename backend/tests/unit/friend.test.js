const { Friend, User } = require('../../src/models');
const { sequelize } = require('../../src/models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

describe('Friend Model Unit Tests', () => {
  let user1, user2, user3;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // 创建测试用户
    user1 = await User.create({
      username: 'testuser1',
      email: 'test1@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      level: 10,
      experience: 1000
    });

    user2 = await User.create({
      username: 'testuser2',
      email: 'test2@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      level: 15,
      experience: 1500
    });

    user3 = await User.create({
      username: 'testuser3',
      email: 'test3@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      level: 8,
      experience: 800
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
      const request = await Friend.sendFriendRequest(user1.id, user2.id);

      expect(request).toBeDefined();
      expect(request.requesterId).toBe(user1.id);
      expect(request.addresseeId).toBe(user2.id);
      expect(request.status).toBe('pending');
    });

    test('应该拒绝向自己发送好友请求', async () => {
      await expect(
        Friend.sendFriendRequest(user1.id, user1.id)
      ).rejects.toThrow('Cannot send friend request to yourself');
    });

    test('应该拒绝不存在的用户', async () => {
      await expect(
        Friend.sendFriendRequest(user1.id, 99999)
      ).rejects.toThrow('User not found');
    });

    test('应该拒绝重复的好友请求', async () => {
      await Friend.sendFriendRequest(user1.id, user2.id);

      await expect(
        Friend.sendFriendRequest(user1.id, user2.id)
      ).rejects.toThrow('Friend request already sent');
    });

    test('应该处理反向好友请求', async () => {
      await Friend.sendFriendRequest(user1.id, user2.id);

      await expect(
        Friend.sendFriendRequest(user2.id, user1.id)
      ).rejects.toThrow('You have already received a friend request from this user');
    });

    test('应该拒绝已存在好友关系的请求', async () => {
      const request = await Friend.sendFriendRequest(user1.id, user2.id);
      request.status = 'accepted';
      await request.save();

      await expect(
        Friend.sendFriendRequest(user1.id, user2.id)
      ).rejects.toThrow('You are already friends');
    });

    test('应该拒绝被屏蔽用户的好友请求', async () => {
      const request = await Friend.sendFriendRequest(user1.id, user2.id);
      request.status = 'blocked';
      await request.save();

      await expect(
        Friend.sendFriendRequest(user1.id, user2.id)
      ).rejects.toThrow('Cannot send friend request: user blocked');
    });
  });

  describe('acceptFriendRequest', () => {
    test('应该成功接受好友请求', async () => {
      const request = await Friend.sendFriendRequest(user1.id, user2.id);
      const accepted = await Friend.acceptFriendRequest(request.id, user2.id);

      expect(accepted.status).toBe('accepted');
    });

    test('应该拒绝不存在的请求', async () => {
      await expect(
        Friend.acceptFriendRequest(99999, user2.id)
      ).rejects.toThrow('Friend request not found');
    });

    test('应该拒绝非接收者的接受请求', async () => {
      const request = await Friend.sendFriendRequest(user1.id, user2.id);

      await expect(
        Friend.acceptFriendRequest(request.id, user3.id)
      ).rejects.toThrow('Unauthorized to accept this friend request');
    });

    test('应该拒绝非待处理状态的请求', async () => {
      const request = await Friend.sendFriendRequest(user1.id, user2.id);
      request.status = 'accepted';
      await request.save();

      await expect(
        Friend.acceptFriendRequest(request.id, user2.id)
      ).rejects.toThrow('Friend request is not pending');
    });
  });

  describe('rejectFriendRequest', () => {
    test('应该成功拒绝好友请求', async () => {
      const request = await Friend.sendFriendRequest(user1.id, user2.id);
      const result = await Friend.rejectFriendRequest(request.id, user2.id);

      expect(result).toBe(true);

      const deletedRequest = await Friend.findByPk(request.id);
      expect(deletedRequest).toBeNull();
    });

    test('应该拒绝不存在的请求', async () => {
      await expect(
        Friend.rejectFriendRequest(99999, user2.id)
      ).rejects.toThrow('Friend request not found');
    });

    test('应该拒绝非接收者的拒绝请求', async () => {
      const request = await Friend.sendFriendRequest(user1.id, user2.id);

      await expect(
        Friend.rejectFriendRequest(request.id, user3.id)
      ).rejects.toThrow('Unauthorized to reject this friend request');
    });

    test('应该拒绝非待处理状态的请求', async () => {
      const request = await Friend.sendFriendRequest(user1.id, user2.id);
      request.status = 'accepted';
      await request.save();

      await expect(
        Friend.rejectFriendRequest(request.id, user2.id)
      ).rejects.toThrow('Friend request is not pending');
    });
  });

  describe('getUserFriends', () => {
    test('应该返回用户的好友列表', async () => {
      // 创建好友关系
      const request1 = await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      const request2 = await Friend.create({
        requesterId: user3.id,
        addresseeId: user1.id,
        status: 'accepted'
      });

      const friends = await Friend.getUserFriends(user1.id);

      expect(friends).toHaveLength(2);
      expect(friends).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            status: 'accepted',
            requesterId: user1.id,
            addresseeId: user2.id
          }),
          expect.objectContaining({
            status: 'accepted',
            requesterId: user3.id,
            addresseeId: user1.id
          })
        ])
      );
    });

    test('应该支持分页查询', async () => {
      // 创建多个好友关系
      for (let i = 4; i < 10; i++) {
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

      const friends = await Friend.getUserFriends(user1.id, { limit: 3, offset: 0 });
      expect(friends).toHaveLength(3);
    });

    test('应该只返回已接受的好友', async () => {
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'pending'
      });

      const friends = await Friend.getUserFriends(user1.id);
      expect(friends).toHaveLength(0);
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

      const requests = await Friend.getReceivedFriendRequests(user1.id);

      expect(requests).toHaveLength(2);
      expect(requests[0].addresseeId).toBe(user1.id);
      expect(requests[0].status).toBe('pending');
    });

    test('应该支持分页查询', async () => {
      for (let i = 11; i < 17; i++) {
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

      const requests = await Friend.getReceivedFriendRequests(user1.id, { limit: 3 });
      expect(requests).toHaveLength(3);
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

      const requests = await Friend.getSentFriendRequests(user1.id);

      expect(requests).toHaveLength(2);
      expect(requests[0].requesterId).toBe(user1.id);
      expect(requests[0].status).toBe('pending');
    });
  });

  describe('areFriends', () => {
    test('应该正确判断好友关系', async () => {
      expect(await Friend.areFriends(user1.id, user2.id)).toBe(false);

      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      expect(await Friend.areFriends(user1.id, user2.id)).toBe(true);
    });

    test('应该正确处理非好友关系', async () => {
      expect(await Friend.areFriends(user1.id, user3.id)).toBe(false);
    });
  });

  describe('getFriendshipStatus', () => {
    test('应该返回正确的关系状态', async () => {
      expect(await Friend.getFriendshipStatus(user1.id, user1.id)).toBe('self');
      expect(await Friend.getFriendshipStatus(user1.id, user2.id)).toBe('none');

      const request = await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'pending'
      });

      expect(await Friend.getFriendshipStatus(user1.id, user2.id)).toBe('pending');

      request.status = 'accepted';
      await request.save();
      expect(await Friend.getFriendshipStatus(user1.id, user2.id)).toBe('accepted');

      request.status = 'blocked';
      await request.save();
      expect(await Friend.getFriendshipStatus(user1.id, user2.id)).toBe('blocked');
    });
  });

  describe('removeFriend', () => {
    test('应该成功移除好友关系', async () => {
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      const result = await Friend.removeFriend(user1.id, user2.id);
      expect(result).toBe(true);

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
      await expect(
        Friend.removeFriend(user1.id, user2.id)
      ).rejects.toThrow('Friendship not found');
    });
  });

  describe('getFriendCount', () => {
    test('应该正确统计好友数量', async () => {
      expect(await Friend.getFriendCount(user1.id)).toBe(0);

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

      expect(await Friend.getFriendCount(user1.id)).toBe(2);
    });
  });

  describe('getPendingFriendRequestsCount', () => {
    test('应该正确统计待处理请求数量', async () => {
      expect(await Friend.getPendingFriendRequestsCount(user1.id)).toBe(0);

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

      expect(await Friend.getPendingFriendRequestsCount(user1.id)).toBe(2);
    });
  });
});
