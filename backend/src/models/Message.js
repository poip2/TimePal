const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sender_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'receiver_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 2000] // 限制消息长度1-2000字符
    }
  },
  status: {
    type: DataTypes.ENUM('sent', 'delivered', 'read'),
    defaultValue: 'sent',
    allowNull: false,
    validate: {
      isIn: [['sent', 'delivered', 'read']]
    }
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_deleted'
  },
  deletedAt: {
    type: DataTypes.DATE,
    field: 'deleted_at'
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
  tableName: 'messages',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['sender_id']
    },
    {
      fields: ['receiver_id']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['status']
    },
    {
      fields: ['is_deleted']
    }
  ]
});

// 关联定义
Message.associate = function (models) {
  Message.belongsTo(models.User, {
    as: 'sender',
    foreignKey: 'sender_id'
  });
  Message.belongsTo(models.User, {
    as: 'receiver',
    foreignKey: 'receiver_id'
  });
};

// 类方法：发送消息
Message.sendMessage = async function (senderId, receiverId, content) {
  // 检查是否向自己发送消息
  if (senderId === receiverId) {
    throw new Error('Cannot send message to yourself');
  }

  // 验证用户是否存在
  const [sender, receiver] = await Promise.all([
    User.findByPk(senderId),
    User.findByPk(receiverId)
  ]);

  if (!sender || !receiver) {
    throw new Error('User not found');
  }

  // 检查是否是好友关系
  const Friend = require('./Friend');
  const areFriends = await Friend.areFriends(senderId, receiverId);
  if (!areFriends) {
    throw new Error('You can only send messages to friends');
  }

  try {
    return await this.create({
      senderId,
      receiverId,
      content,
      status: 'sent'
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      if (error.errors.some(e => e.validatorName === 'notEmpty')) {
        throw new Error('Message content cannot be empty');
      }
      if (error.errors.some(e => e.validatorName === 'len')) {
        throw new Error('Message content is too long (max 2000 characters)');
      }
    }
    throw error;
  }
};

// 类方法：获取用户的所有消息
Message.getUserMessages = async function (userId, options = {}) {
  const { limit = 50, offset = 0, status, isDeleted = false } = options;

  const where = {
    [Op.or]: [
      { senderId: userId },
      { receiverId: userId }
    ],
    isDeleted
  };

  if (status) {
    where.status = status;
  }

  return await this.findAll({
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
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
};

// 类方法：获取与特定好友的对话
Message.getConversation = async function (userId, friendId, options = {}) {
  const { limit = 50, offset = 0, isDeleted = false } = options;

  return await this.findAll({
    where: {
      [Op.or]: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId }
      ],
      isDeleted
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
    order: [['createdAt', 'ASC']],
    limit,
    offset
  });
};

// 类方法：标记消息为已读
Message.markAsRead = async function (messageId, userId) {
  const message = await this.findByPk(messageId);
  if (!message) {
    throw new Error('Message not found');
  }

  // 确保用户是消息的接收者
  if (message.receiverId !== userId) {
    throw new Error('Unauthorized to mark this message as read');
  }

  if (message.status === 'read') {
    return message; // 已经是已读状态
  }

  message.status = 'read';
  await message.save();
  return message;
};

// 类方法：标记消息为已送达
Message.markAsDelivered = async function (messageId, userId) {
  const message = await this.findByPk(messageId);
  if (!message) {
    throw new Error('Message not found');
  }

  // 确保用户是消息的接收者
  if (message.receiverId !== userId) {
    throw new Error('Unauthorized to mark this message as delivered');
  }

  if (message.status === 'sent') {
    message.status = 'delivered';
    await message.save();
  }

  return message;
};

// 类方法：软删除消息
Message.deleteMessage = async function (messageId, userId) {
  const message = await this.findByPk(messageId);
  if (!message) {
    throw new Error('Message not found');
  }

  // 确保用户是消息的发送者或接收者
  if (message.senderId !== userId && message.receiverId !== userId) {
    throw new Error('Unauthorized to delete this message');
  }

  message.isDeleted = true;
  message.deletedAt = new Date();
  await message.save();
  return message;
};

// 类方法：获取未读消息数量
Message.getUnreadCount = async function (userId) {
  return await this.count({
    where: {
      receiverId: userId,
      status: 'sent',
      isDeleted: false
    }
  });
};

// 类方法：获取与特定好友的未读消息数量
Message.getUnreadCountFromFriend = async function (userId, friendId) {
  return await this.count({
    where: {
      senderId: friendId,
      receiverId: userId,
      status: 'sent',
      isDeleted: false
    }
  });
};

// 类方法：批量标记消息为已读
Message.markConversationAsRead = async function (userId, friendId) {
  const result = await this.update(
    { status: 'read' },
    {
      where: {
        senderId: friendId,
        receiverId: userId,
        status: { [Op.ne]: 'read' },
        isDeleted: false
      }
    }
  );

  return result[0]; // 返回更新的消息数量
};

module.exports = Message;
