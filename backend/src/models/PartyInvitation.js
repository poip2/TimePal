const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PartyInvitation = sequelize.define('PartyInvitation', {
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
  inviterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'inviter_id'
  },
  inviteeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'invitee_id'
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'accepted', 'declined', 'expired']]
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  expiresAt: {
    type: DataTypes.DATE,
    defaultValue: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    field: 'expires_at'
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
  tableName: 'party_invitations',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['party_id', 'invitee_id']
    },
    {
      fields: ['invitee_id', 'status']
    },
    {
      fields: ['party_id', 'status']
    },
    {
      fields: ['expires_at']
    }
  ]
});

// 关联定义
PartyInvitation.associate = function (models) {
  PartyInvitation.belongsTo(models.Party, {
    foreignKey: 'party_id',
    as: 'party'
  });

  PartyInvitation.belongsTo(models.User, {
    foreignKey: 'inviter_id',
    as: 'inviter'
  });

  PartyInvitation.belongsTo(models.User, {
    foreignKey: 'invitee_id',
    as: 'invitee'
  });
};

// 实例方法：检查邀请是否过期
PartyInvitation.prototype.isExpired = function () {
  return new Date() > this.expiresAt;
};

// 实例方法：接受邀请
PartyInvitation.prototype.accept = async function () {
  if (this.status !== 'pending') {
    throw new Error('Invitation is not pending');
  }

  if (this.isExpired()) {
    this.status = 'expired';
    await this.save();
    throw new Error('Invitation has expired');
  }

  this.status = 'accepted';
  await this.save();
  return this;
};

// 实例方法：拒绝邀请
PartyInvitation.prototype.decline = async function () {
  if (this.status !== 'pending') {
    throw new Error('Invitation is not pending');
  }

  this.status = 'declined';
  await this.save();
  return this;
};

// 类方法：获取用户的待处理邀请
PartyInvitation.findPendingInvitations = async function (userId) {
  return await this.findAll({
    where: {
      inviteeId: userId,
      status: 'pending',
      expiresAt: {
        [sequelize.Sequelize.Op.gt]: new Date()
      }
    },
    include: [{
      model: sequelize.models.Party,
      as: 'party',
      include: [{
        model: sequelize.models.User,
        as: 'leader',
        attributes: ['id', 'username', 'avatar']
      }]
    }, {
      model: sequelize.models.User,
      as: 'inviter',
      attributes: ['id', 'username', 'avatar']
    }],
    order: [['createdAt', 'DESC']]
  });
};

// 类方法：获取用户发送的邀请
PartyInvitation.findSentInvitations = async function (userId) {
  return await this.findAll({
    where: { inviterId: userId },
    include: [{
      model: sequelize.models.Party,
      as: 'party',
      attributes: ['id', 'name']
    }, {
      model: sequelize.models.User,
      as: 'invitee',
      attributes: ['id', 'username', 'avatar']
    }],
    order: [['createdAt', 'DESC']]
  });
};

// 类方法：获取队伍的邀请列表
PartyInvitation.findByParty = async function (partyId) {
  return await this.findAll({
    where: { partyId },
    include: [{
      model: sequelize.models.User,
      as: 'inviter',
      attributes: ['id', 'username', 'avatar']
    }, {
      model: sequelize.models.User,
      as: 'invitee',
      attributes: ['id', 'username', 'avatar']
    }],
    order: [['createdAt', 'DESC']]
  });
};

// 类方法：创建邀请
PartyInvitation.createInvitation = async function (partyId, inviterId, inviteeId, message = null) {
  // 检查被邀请者是否已经在队伍中
  const { PartyMember } = sequelize.models;
  const isAlreadyMember = await PartyMember.isUserInParty(inviteeId, partyId);
  if (isAlreadyMember) {
    throw new Error('User is already a member of this party');
  }

  // 检查是否有待处理的邀请
  const existingInvitation = await this.findOne({
    where: {
      partyId,
      inviteeId,
      status: 'pending',
      expiresAt: {
        [sequelize.Sequelize.Op.gt]: new Date()
      }
    }
  });

  if (existingInvitation) {
    throw new Error('Pending invitation already exists');
  }

  return await this.create({
    partyId,
    inviterId,
    inviteeId,
    message
  });
};

// 类方法：清理过期邀请
PartyInvitation.cleanupExpired = async function () {
  const result = await this.update(
    { status: 'expired' },
    {
      where: {
        status: 'pending',
        expiresAt: {
          [sequelize.Sequelize.Op.lt]: new Date()
        }
      }
    }
  );
  return result[0]; // 返回更新的记录数
};

module.exports = PartyInvitation;
