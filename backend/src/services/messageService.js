const { Message, User, Friend } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

class MessageService {
  /**
   * 发送消息
   * @param {number} senderId - 发送者用户ID
   * @param {number} receiverId - 接收者用户ID
   * @param {string} content - 消息内容
   * @returns {Promise<Object>} 消息对象
   */
  async sendMessage(senderId, receiverId, content) {
    const transaction = await sequelize.transaction();

    try {
      // 验证参数
      if (!senderId || !receiverId || content === undefined || content === null) {
        throw new Error('senderId, receiverId, and content are required');
      }

      // 检查是否为自己
      if (senderId === receiverId) {
        throw new Error('Cannot send message to yourself');
      }

      // 检查用户是否存在
      const [sender, receiver] = await Promise.all([
        User.findByPk(senderId, { transaction }),
        User.findByPk(receiverId, { transaction })
      ]);

      if (!sender) {
        throw new Error('Sender user not found');
      }

      if (!receiver) {
        throw new Error('Receiver user not found');
      }

      // 检查是否是好友关系
      const areFriends = await Friend.areFriends(senderId, receiverId);
      if (!areFriends) {
        throw new Error('You can only send messages to friends');
      }

      // 验证消息内容
      if (!content || !content.trim()) {
        throw new Error('Message content cannot be empty');
      }

      if (content.length > 2000) {
        throw new Error('Message content is too long (max 2000 characters)');
      }

      // 创建消息
      const message = await Message.create({
        senderId,
        receiverId,
        content: content.trim(),
        status: 'sent'
      }, { transaction });

      await transaction.commit();

      // 返回包含用户信息的完整消息数据
      return await Message.findByPk(message.id, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'avatarUrl']
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['id', 'username', 'avatarUrl']
          }
        ]
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 获取用户的所有消息
   * @param {number} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 消息列表
   */
  async getMessages(userId, options = {}) {
    const {
      limit = 50,
      offset = 0,
      status,
      isDeleted = false,
      sortBy = 'createdAt',
      order = 'DESC'
    } = options;

    // 验证用户ID
    if (!userId) {
      throw new Error('User ID is required');
    }

    // 验证排序字段
    const validSortFields = ['createdAt', 'updatedAt', 'status'];
    if (!validSortFields.includes(sortBy)) {
      throw new Error(`Invalid sort field. Must be one of: ${validSortFields.join(', ')}`);
    }

    // 验证排序顺序
    const validOrders = ['ASC', 'DESC'];
    const sortOrder = order.toUpperCase();
    if (!validOrders.includes(sortOrder)) {
      throw new Error('Invalid order. Must be ASC or DESC');
    }

    return await Message.getUserMessages(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      status,
      isDeleted,
      sortBy,
      order: sortOrder
    });
  }

  /**
   * 获取与特定好友的对话
   * @param {number} userId - 当前用户ID
   * @param {number} friendId - 好友用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 对话消息列表
   */
  async getConversation(userId, friendId, options = {}) {
    const {
      limit = 50,
      offset = 0,
      isDeleted = false,
      before,
      after
    } = options;

    // 验证参数
    if (!userId || !friendId) {
      throw new Error('Both userId and friendId are required');
    }

    // 检查用户是否存在
    const [user, friend] = await Promise.all([
      User.findByPk(userId),
      User.findByPk(friendId)
    ]);

    if (!user || !friend) {
      throw new Error('User not found');
    }

    // 检查是否是好友关系
    const areFriends = await Friend.areFriends(userId, friendId);
    if (!areFriends) {
      throw new Error('You can only view conversations with friends');
    }

    // 构建查询条件
    const where = {
      [Op.or]: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId }
      ],
      isDeleted
    };

    // 添加时间范围过滤
    if (before) {
      where.createdAt = { [Op.lt]: new Date(before) };
    }
    if (after) {
      where.createdAt = { [Op.gt]: new Date(after) };
    }

    return await Message.findAll({
      where,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'avatarUrl']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'avatarUrl']
        }
      ],
      order: [['createdAt', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  }

  /**
   * 标记消息为已读
   * @param {number} messageId - 消息ID
   * @param {number} userId - 当前用户ID
   * @returns {Promise<Object>} 更新后的消息对象
   */
  async markAsRead(messageId, userId) {
    if (!messageId || !userId) {
      throw new Error('Both messageId and userId are required');
    }

    return await Message.markAsRead(messageId, userId);
  }

  /**
   * 标记与特定好友的所有消息为已读
   * @param {number} userId - 当前用户ID
   * @param {number} friendId - 好友用户ID
   * @returns {Promise<number>} 更新的消息数量
   */
  async markConversationAsRead(userId, friendId) {
    if (!userId || !friendId) {
      throw new Error('Both userId and friendId are required');
    }

    // 检查是否是好友关系
    const areFriends = await Friend.areFriends(userId, friendId);
    if (!areFriends) {
      throw new Error('You can only mark conversations with friends as read');
    }

    return await Message.markConversationAsRead(userId, friendId);
  }

  /**
   * 删除消息（软删除）
   * @param {number} messageId - 消息ID
   * @param {number} userId - 当前用户ID
   * @returns {Promise<Object>} 删除后的消息对象
   */
  async deleteMessage(messageId, userId) {
    if (!messageId || !userId) {
      throw new Error('Both messageId and userId are required');
    }

    return await Message.deleteMessage(messageId, userId);
  }

  /**
   * 获取未读消息数量
   * @param {number} userId - 用户ID
   * @returns {Promise<number>} 未读消息数量
   */
  async getUnreadCount(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return await Message.getUnreadCount(userId);
  }

  /**
   * 获取与特定好友的未读消息数量
   * @param {number} userId - 当前用户ID
   * @param {number} friendId - 好友用户ID
   * @returns {Promise<number>} 未读消息数量
   */
  async getUnreadCountFromFriend(userId, friendId) {
    if (!userId || !friendId) {
      throw new Error('Both userId and friendId are required');
    }

    // 检查是否是好友关系
    const areFriends = await Friend.areFriends(userId, friendId);
    if (!areFriends) {
      throw new Error('You can only check unread messages from friends');
    }

    return await Message.getUnreadCountFromFriend(userId, friendId);
  }

  /**
   * 获取消息概览
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 消息概览信息
   */
  async getMessageOverview(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const [totalUnread, recentMessages] = await Promise.all([
      this.getUnreadCount(userId),
      Message.findAll({
        where: {
          [Op.or]: [
            { senderId: userId },
            { receiverId: userId }
          ],
          isDeleted: false
        },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'avatarUrl']
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['id', 'username', 'avatarUrl']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10
      })
    ]);

    // 获取最近对话的好友列表
    const conversationPartners = new Map();
    recentMessages.forEach(message => {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      if (!conversationPartners.has(partnerId)) {
        conversationPartners.set(partnerId, {
          lastMessage: message,
          unreadCount: 0
        });
      }
    });

    // 获取每个对话的未读消息数量
    const partnerIds = Array.from(conversationPartners.keys());
    const unreadCounts = await Promise.all(
      partnerIds.map(partnerId => this.getUnreadCountFromFriend(userId, partnerId))
    );

    partnerIds.forEach((partnerId, index) => {
      if (conversationPartners.has(partnerId)) {
        conversationPartners.get(partnerId).unreadCount = unreadCounts[index];
      }
    });

    return {
      totalUnread,
      recentConversations: Array.from(conversationPartners.values()).slice(0, 5)
    };
  }

  /**
   * 搜索消息
   * @param {number} userId - 用户ID
   * @param {string} query - 搜索关键词
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 搜索结果
   */
  async searchMessages(userId, query, options = {}) {
    const { limit = 20, offset = 0 } = options;

    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!query || query.trim().length === 0) {
      return [];
    }

    return await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ],
        content: { [Op.iLike]: `%${query.trim()}%` },
        isDeleted: false
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'avatarUrl']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'avatarUrl']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  }
}

module.exports = new MessageService();
