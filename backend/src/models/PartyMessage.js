const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PartyMessage = sequelize.define('PartyMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  partyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'parties',
      key: 'id'
    },
    field: 'party_id'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'user_id'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 1000],
      notEmpty: true
    }
  },
  messageType: {
    type: DataTypes.STRING(20),
    defaultValue: 'text',
    validate: {
      isIn: [['text', 'system', 'announcement']]
    },
    field: 'message_type'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    validate: {
      isValidMetadata(value) {
        if (typeof value !== 'object' || value === null) {
          throw new Error('metadata must be an object');
        }
      }
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'party_messages',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['party_id', 'created_at']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['message_type']
    }
  ]
});

// 关联定义
PartyMessage.associate = function (models) {
  PartyMessage.belongsTo(models.Party, {
    foreignKey: 'party_id',
    as: 'party'
  });

  PartyMessage.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
};

// 类方法：获取队伍的聊天记录
PartyMessage.findByParty = async function (partyId, options = {}) {
  const { limit = 50, offset = 0, before = null, after = null } = options;

  const where = { partyId };

  if (before) {
    where.createdAt = { [sequelize.Sequelize.Op.lt]: new Date(before) };
  }

  if (after) {
    where.createdAt = { [sequelize.Sequelize.Op.gt]: new Date(after) };
  }

  return await this.findAll({
    where,
    include: [{
      model: sequelize.models.User,
      as: 'user',
      attributes: ['id', 'username', 'avatar']
    }],
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
};

// 类方法：获取系统消息
PartyMessage.findSystemMessages = async function (partyId, limit = 20) {
  return await this.findAll({
    where: {
      partyId,
      messageType: 'system'
    },
    include: [{
      model: sequelize.models.User,
      as: 'user',
      attributes: ['id', 'username', 'avatar']
    }],
    order: [['createdAt', 'DESC']],
    limit
  });
};

// 类方法：创建系统消息
PartyMessage.createSystemMessage = async function (partyId, message, metadata = {}) {
  // 系统消息的用户ID设为0（系统用户）
  return await this.create({
    partyId,
    userId: 0,
    message,
    messageType: 'system',
    metadata
  });
};

// 类方法：创建公告消息
PartyMessage.createAnnouncement = async function (partyId, userId, message, metadata = {}) {
  return await this.create({
    partyId,
    userId,
    message,
    messageType: 'announcement',
    metadata
  });
};

// 类方法：创建用户消息
PartyMessage.createUserMessage = async function (partyId, userId, message) {
  return await this.create({
    partyId,
    userId,
    message,
    messageType: 'text'
  });
};

// 类方法：删除消息（仅消息发送者或管理员）
PartyMessage.deleteMessage = async function (messageId, userId, isAdmin = false) {
  const message = await this.findByPk(messageId);

  if (!message) {
    throw new Error('Message not found');
  }

  if (!isAdmin && message.userId !== userId) {
    throw new Error('Unauthorized to delete this message');
  }

  await message.destroy();
  return true;
};

// 类方法：清理旧消息（保留最近30天的消息）
PartyMessage.cleanupOldMessages = async function (days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const result = await this.destroy({
    where: {
      createdAt: {
        [sequelize.Sequelize.Op.lt]: cutoffDate
      }
    }
  });

  return result; // 返回删除的记录数
};

module.exports = PartyMessage;
