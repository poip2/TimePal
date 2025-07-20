const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Friend = sequelize.define('Friend', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  requesterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'requester_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  addresseeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'addressee_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
    defaultValue: 'pending',
    allowNull: false,
    validate: {
      isIn: [['pending', 'accepted', 'blocked']]
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'friendships',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['requester_id', 'addressee_id']
    },
    {
      fields: ['requester_id']
    },
    {
      fields: ['addressee_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    }
  ]
});

// 关联定义
Friend.associate = function (models) {
  Friend.belongsTo(models.User, {
    as: 'requester',
    foreignKey: 'requester_id'
  });
  Friend.belongsTo(models.User, {
    as: 'addressee',
    foreignKey: 'addressee_id'
  });
};

// 类方法：发送好友请求
Friend.sendFriendRequest = async function (requesterId, addresseeId) {
  // 检查是否为自己
  if (requesterId === addresseeId) {
    throw new Error('Cannot send friend request to yourself');
  }

  // 检查用户是否存在
  const [requester, addressee] = await Promise.all([
    User.findByPk(requesterId),
    User.findByPk(addresseeId)
  ]);

  if (!requester || !addressee) {
    throw new Error('User not found');
  }

  // 检查是否已存在好友关系（无论状态）
  const existingRelation = await this.findOne({
    where: {
      [Op.or]: [
        { requesterId, addresseeId },
        { requesterId: addresseeId, addresseeId: requesterId }
      ]
    }
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

  return await this.create({
    requesterId,
    addresseeId,
    status: 'pending'
  });
};

// 类方法：接受好友请求
Friend.acceptFriendRequest = async function (requestId, userId) {
  const friendRequest = await this.findByPk(requestId);
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
  await friendRequest.save();
  return friendRequest;
};

// 类方法：拒绝好友请求
Friend.rejectFriendRequest = async function (requestId, userId) {
  const friendRequest = await this.findByPk(requestId);
  if (!friendRequest) {
    throw new Error('Friend request not found');
  }

  if (friendRequest.addresseeId !== userId) {
    throw new Error('Unauthorized to reject this friend request');
  }

  if (friendRequest.status !== 'pending') {
    throw new Error('Friend request is not pending');
  }

  await friendRequest.destroy();
  return true;
};

// 类方法：获取用户的好友列表
Friend.getUserFriends = async function (userId, options = {}) {
  const { limit = 50, offset = 0 } = options;

  return await this.findAll({
    where: {
      status: 'accepted',
      [Op.or]: [
        { requesterId: userId },
        { addresseeId: userId }
      ]
    },
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
    ],
    order: [['updated_at', 'DESC']],
    limit,
    offset
  });
};

// 类方法：获取用户收到的好友请求
Friend.getReceivedFriendRequests = async function (userId, options = {}) {
  const { limit = 20, offset = 0 } = options;

  return await this.findAll({
    where: {
      addresseeId: userId,
      status: 'pending'
    },
    include: [
      {
        model: User,
        as: 'requester',
        attributes: ['id', 'username', 'avatarUrl', 'level']
      }
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset
  });
};

// 类方法：获取用户发送的好友请求
Friend.getSentFriendRequests = async function (userId, options = {}) {
  const { limit = 20, offset = 0 } = options;

  return await this.findAll({
    where: {
      requesterId: userId,
      status: 'pending'
    },
    include: [
      {
        model: User,
        as: 'addressee',
        attributes: ['id', 'username', 'avatarUrl', 'level']
      }
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset
  });
};

// 类方法：检查用户是否是好友
Friend.areFriends = async function (userId1, userId2) {
  const friendship = await this.findOne({
    where: {
      status: 'accepted',
      [Op.or]: [
        { requesterId: userId1, addresseeId: userId2 },
        { requesterId: userId2, addresseeId: userId1 }
      ]
    }
  });

  return !!friendship;
};

// 类方法：获取好友关系状态
Friend.getFriendshipStatus = async function (userId1, userId2) {
  if (userId1 === userId2) {
    return 'self';
  }

  const friendship = await this.findOne({
    where: {
      [Op.or]: [
        { requesterId: userId1, addresseeId: userId2 },
        { requesterId: userId2, addresseeId: userId1 }
      ]
    }
  });

  if (!friendship) {
    return 'none';
  }

  return friendship.status;
};

// 类方法：移除好友关系
Friend.removeFriend = async function (userId1, userId2) {
  const friendship = await this.findOne({
    where: {
      status: 'accepted',
      [Op.or]: [
        { requesterId: userId1, addresseeId: userId2 },
        { requesterId: userId2, addresseeId: userId1 }
      ]
    }
  });

  if (!friendship) {
    throw new Error('Friendship not found');
  }

  await friendship.destroy();
  return true;
};

// 类方法：获取好友数量
Friend.getFriendCount = async function (userId) {
  return await this.count({
    where: {
      status: 'accepted',
      [Op.or]: [
        { requesterId: userId },
        { addresseeId: userId }
      ]
    }
  });
};

// 类方法：获取待处理的好友请求数量
Friend.getPendingFriendRequestsCount = async function (userId) {
  return await this.count({
    where: {
      addresseeId: userId,
      status: 'pending'
    }
  });
};

module.exports = Friend;
