const { Friend, User } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

class FriendService {
  /**
   * 发送好友请求
   * @param {number} requesterId - 发送请求的用户ID
   * @param {number} addresseeId - 接收请求的用户ID
   * @returns {Promise<Object>} 好友请求对象
   */
  async sendFriendRequest(requesterId, addresseeId) {
    // 使用事务确保数据一致性
    const transaction = await sequelize.transaction();

    try {
      // 验证用户ID
      if (!requesterId || !addresseeId) {
        throw new Error('Both requesterId and addresseeId are required');
      }

      // 检查是否为自己
      if (requesterId === addresseeId) {
        throw new Error('Cannot send friend request to yourself');
      }

      // 检查用户是否存在
      const [requester, addressee] = await Promise.all([
        User.findByPk(requesterId, { transaction }),
        User.findByPk(addresseeId, { transaction })
      ]);

      if (!requester) {
        throw new Error('Requester user not found');
      }

      if (!addressee) {
        throw new Error('Target user not found');
      }

      // 检查是否已存在好友关系（无论状态）
      const existingRelation = await Friend.findOne({
        where: {
          [Op.or]: [
            { requesterId, addresseeId },
            { requesterId: addresseeId, addresseeId: requesterId }
          ]
        },
        transaction
      });

      if (existingRelation) {
        if (existingRelation.status === 'pending') {
          if (existingRelation.requesterId === requesterId) {
            throw new Error('Friend request already sent');
          } else {
            throw new Error('You have already received a friend request from this user');
          }
        } else if (existingRelation.status === 'accepted') {
          throw new Error('You are already friends');
        } else if (existingRelation.status === 'blocked') {
          throw new Error('Cannot send friend request: user blocked');
        }
      }

      // 创建好友请求
      const friendRequest = await Friend.create({
        requesterId,
        addresseeId,
        status: 'pending'
      }, { transaction });

      // 提交事务
      await transaction.commit();

      // 返回包含用户信息的完整数据
      return await Friend.findByPk(friendRequest.id, {
        include: [
          {
            model: User,
            as: 'requester',
            attributes: ['id', 'username', 'avatarUrl', 'level']
          },
          {
            model: User,
            as: 'addressee',
            attributes: ['id', 'username', 'avatarUrl', 'level']
          }
        ]
      });

    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 接受好友请求
   * @param {number} requestId - 好友请求ID
   * @param {number} userId - 当前用户ID（接收者）
   * @returns {Promise<Object>} 更新后的好友关系
   */
  async acceptFriendRequest(requestId, userId) {
    const transaction = await sequelize.transaction();

    try {
      const friendRequest = await Friend.findByPk(requestId, { transaction });

      if (!friendRequest) {
        throw new Error('Friend request not found');
      }

      if (friendRequest.addresseeId !== userId) {
        throw new Error('Unauthorized to accept this friend request');
      }

      if (friendRequest.status !== 'pending') {
        throw new Error('Friend request is not pending');
      }

      friendRequest.status = 'accepted';
      await friendRequest.save({ transaction });

      await transaction.commit();

      return await Friend.findByPk(requestId, {
        include: [
          {
            model: User,
            as: 'requester',
            attributes: ['id', 'username', 'avatarUrl', 'level']
          },
          {
            model: User,
            as: 'addressee',
            attributes: ['id', 'username', 'avatarUrl', 'level']
          }
        ]
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 拒绝好友请求
   * @param {number} requestId - 好友请求ID
   * @param {number} userId - 当前用户ID（接收者）
   * @returns {Promise<boolean>} 操作结果
   */
  async rejectFriendRequest(requestId, userId) {
    const transaction = await sequelize.transaction();

    try {
      const friendRequest = await Friend.findByPk(requestId, { transaction });

      if (!friendRequest) {
        throw new Error('Friend request not found');
      }

      if (friendRequest.addresseeId !== userId) {
        throw new Error('Unauthorized to reject this friend request');
      }

      if (friendRequest.status !== 'pending') {
        throw new Error('Friend request is not pending');
      }

      await friendRequest.destroy({ transaction });
      await transaction.commit();

      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 获取用户的好友列表
   * @param {number} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 好友列表数据
   */
  async getUserFriends(userId, options = {}) {
    const { limit = 50, offset = 0 } = options;

    const friendships = await Friend.getUserFriends(userId, { limit, offset });

    // 处理返回格式，确保每个好友对象都包含用户信息
    const friends = friendships.map(friendship => {
      const friend = friendship.requesterId === userId ? friendship.addressee : friendship.requester;
      return {
        id: friendship.id,
        friend: {
          id: friend.id,
          username: friend.username,
          avatarUrl: friend.avatarUrl,
          level: friend.level
        },
        createdAt: friendship.createdAt,
        updatedAt: friendship.updatedAt
      };
    });

    return {
      friends,
      pagination: {
        limit,
        offset,
        total: friends.length
      }
    };
  }

  /**
   * 获取用户收到的好友请求
   * @param {number} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 收到的好友请求数据
   */
  async getReceivedFriendRequests(userId, options = {}) {
    const { limit = 20, offset = 0 } = options;

    const requests = await Friend.getReceivedFriendRequests(userId, { limit, offset });

    return {
      requests,
      pagination: {
        limit,
        offset,
        total: requests.length
      }
    };
  }

  /**
   * 获取用户发送的好友请求
   * @param {number} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 发送的好友请求数据
   */
  async getSentFriendRequests(userId, options = {}) {
    const { limit = 20, offset = 0 } = options;

    const requests = await Friend.getSentFriendRequests(userId, { limit, offset });

    return {
      requests,
      pagination: {
        limit,
        offset,
        total: requests.length
      }
    };
  }

  /**
   * 移除好友关系
   * @param {number} userId - 当前用户ID
   * @param {number} friendId - 好友用户ID
   * @returns {Promise<boolean>} 操作结果
   */
  async removeFriend(userId, friendId) {
    const transaction = await sequelize.transaction();

    try {
      await Friend.removeFriend(userId, friendId);
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 检查用户是否是好友
   * @param {number} userId1 - 用户1ID
   * @param {number} userId2 - 用户2ID
   * @returns {Promise<boolean>} 是否是好友
   */
  async areFriends(userId1, userId2) {
    return await Friend.areFriends(userId1, userId2);
  }

  /**
   * 获取好友关系状态
   * @param {number} userId1 - 用户1ID
   * @param {number} userId2 - 用户2ID
   * @returns {Promise<string>} 好友关系状态
   */
  async getFriendshipStatus(userId1, userId2) {
    return await Friend.getFriendshipStatus(userId1, userId2);
  }

  /**
   * 获取好友数量
   * @param {number} userId - 用户ID
   * @returns {Promise<number>} 好友数量
   */
  async getFriendCount(userId) {
    return await Friend.getFriendCount(userId);
  }

  /**
   * 获取待处理的好友请求数量
   * @param {number} userId - 用户ID
   * @returns {Promise<number>} 待处理的好友请求数量
   */
  async getPendingFriendRequestsCount(userId) {
    return await Friend.getPendingFriendRequestsCount(userId);
  }

  /**
   * 获取用户好友概览
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 好友概览信息
   */
  async getFriendOverview(userId) {
    const [friendCount, pendingCount] = await Promise.all([
      this.getFriendCount(userId),
      this.getPendingFriendRequestsCount(userId)
    ]);

    return {
      friendCount,
      pendingRequestsCount: pendingCount
    };
  }

  /**
   * 搜索好友
   * @param {number} userId - 当前用户ID
   * @param {string} query - 搜索关键词
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 搜索结果数据
   */
  async searchFriends(userId, query, options = {}) {
    const { limit = 20, offset = 0 } = options;

    if (!query || query.trim().length === 0) {
      return {
        friends: [],
        pagination: {
          limit,
          offset,
          total: 0
        }
      };
    }

    // 获取用户的好友ID列表
    const friendships = await Friend.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [
          { requesterId: userId },
          { addresseeId: userId }
        ]
      },
      attributes: ['requesterId', 'addresseeId']
    });

    const friendIds = friendships.map(f =>
      f.requesterId === userId ? f.addresseeId : f.requesterId
    );

    if (friendIds.length === 0) {
      return {
        friends: [],
        pagination: {
          limit,
          offset,
          total: 0
        }
      };
    }

    // 在好友中搜索匹配的用户
    const friends = await User.findAll({
      where: {
        id: { [Op.in]: friendIds },
        [Op.or]: [
          { username: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } }
        ]
      },
      attributes: ['id', 'username', 'avatarUrl', 'level', 'is_active'],
      limit,
      offset,
      order: [['username', 'ASC']]
    });

    return {
      friends,
      pagination: {
        limit,
        offset,
        total: friends.length
      }
    };
  }

  /**
   * 获取好友排行榜
   * @param {number} userId - 当前用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 排行榜数据
   */
  async getFriendsLeaderboard(userId, options = {}) {
    const {
      sortBy = 'level',
      order = 'DESC',
      limit = 10
    } = options;

    // 验证排序字段
    const validSortFields = [
      'level', 'experience', 'coins', 'gold',
      'totalTasksCompleted', 'streakHighest', 'loginStreak'
    ];

    if (!validSortFields.includes(sortBy)) {
      throw new Error(`Invalid sort field. Must be one of: ${validSortFields.join(', ')}`);
    }

    // 验证排序顺序
    const validOrders = ['ASC', 'DESC'];
    const sortOrder = order.toUpperCase();
    if (!validOrders.includes(sortOrder)) {
      throw new Error('Invalid order. Must be ASC or DESC');
    }

    // 获取用户的好友ID列表
    const friendships = await Friend.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [
          { requesterId: userId },
          { addresseeId: userId }
        ]
      },
      attributes: ['requesterId', 'addresseeId']
    });

    const friendIds = friendships.map(f =>
      f.requesterId === userId ? f.addresseeId : f.requesterId
    );

    if (friendIds.length === 0) {
      return {
        leaderboard: [],
        totalFriends: 0,
        userRank: null
      };
    }

    // 获取好友的详细信息和统计数据
    const friendsData = await User.findAll({
      where: {
        id: { [Op.in]: friendIds }
      },
      attributes: [
        'id', 'username', 'avatarUrl', 'level', 'experience',
        'coins', 'gold', 'totalTasksCompleted', 'streakHighest',
        'loginStreak', 'class', 'createdAt'
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit)
    });

    // 获取所有好友的排名（用于计算当前用户排名）
    const allFriendsRanked = await User.findAll({
      where: {
        id: { [Op.in]: friendIds }
      },
      attributes: ['id', sortBy],
      order: [[sortBy, sortOrder]]
    });

    // 计算当前用户在好友中的排名
    let userRank = null;

    // 将当前用户也加入到排名中
    const allUserIds = [...friendIds, userId];
    const uniqueUserIds = [...new Set(allUserIds)];

    // 获取所有相关用户的排名
    const allUsersRanked = await User.findAll({
      where: {
        id: { [Op.in]: uniqueUserIds }
      },
      attributes: ['id', sortBy],
      order: [[sortBy, sortOrder]]
    });

    const userIndex = allUsersRanked.findIndex(f => f.id === userId);
    if (userIndex !== -1) {
      userRank = {
        rank: userIndex + 1,
        totalFriends: allUsersRanked.length,
        sortBy,
        value: allUsersRanked[userIndex][sortBy] || 0
      };
    }

    // 格式化排行榜数据
    const leaderboard = friendsData.map((friend, index) => ({
      rank: index + 1,
      user: {
        id: friend.id,
        username: friend.username,
        avatarUrl: friend.avatarUrl,
        class: friend.class
      },
      stats: {
        level: friend.level,
        experience: friend.experience,
        coins: friend.coins,
        gold: friend.gold,
        totalTasksCompleted: friend.totalTasksCompleted,
        streakHighest: friend.streakHighest,
        loginStreak: friend.loginStreak
      },
      score: friend[sortBy]
    }));

    return {
      leaderboard,
      totalFriends: friendIds.length,
      userRank,
      sortBy,
      order: sortOrder
    };
  }
}

module.exports = new FriendService();
