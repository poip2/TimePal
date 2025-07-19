const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PartyMember = sequelize.define('PartyMember', {
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
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'member',
    validate: {
      isIn: [['leader', 'admin', 'member']]
    }
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'joined_at'
  },
  permissions: {
    type: DataTypes.JSONB,
    defaultValue: {
      canInvite: false,
      canKick: false,
      canEditParty: false,
      canManageMessages: false,
      canStartQuests: false
    },
    validate: {
      isValidPermissions(value) {
        if (typeof value !== 'object' || value === null) {
          throw new Error('permissions must be an object');
        }
        const validPermissions = [
          'canInvite',
          'canKick',
          'canEditParty',
          'canManageMessages',
          'canStartQuests'
        ];
        for (const key of Object.keys(value)) {
          if (!validPermissions.includes(key)) {
            throw new Error(`Invalid permission: ${key}`);
          }
          if (typeof value[key] !== 'boolean') {
            throw new Error(`Permission ${key} must be a boolean`);
          }
        }
      }
    }
  },
  stats: {
    type: DataTypes.JSONB,
    defaultValue: {
      questsCompleted: 0,
      expContributed: 0,
      lastActiveAt: null,
      consecutiveDays: 0
    },
    validate: {
      isValidStats(value) {
        if (typeof value !== 'object' || value === null) {
          throw new Error('stats must be an object');
        }
        const validStats = [
          'questsCompleted',
          'expContributed',
          'lastActiveAt',
          'consecutiveDays'
        ];
        for (const key of Object.keys(value)) {
          if (!validStats.includes(key)) {
            throw new Error(`Invalid stat: ${key}`);
          }
        }
      }
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
  tableName: 'party_members',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['party_id', 'user_id']
    },
    {
      fields: ['party_id', 'role']
    },
    {
      fields: ['user_id']
    }
  ]
});

// 关联定义
PartyMember.associate = function (models) {
  PartyMember.belongsTo(models.Party, {
    foreignKey: 'party_id',
    as: 'party'
  });

  PartyMember.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
};

// 实例方法：检查是否是队长
PartyMember.prototype.isLeader = function () {
  return this.role === 'leader';
};

// 实例方法：检查是否是管理员
PartyMember.prototype.isAdmin = function () {
  return this.role === 'admin' || this.role === 'leader';
};

// 实例方法：检查是否有特定权限
PartyMember.prototype.hasPermission = function (permission) {
  if (this.isLeader()) return true; // 队长拥有所有权限
  return this.permissions[permission] === true;
};

// 实例方法：更新成员统计信息
PartyMember.prototype.updateStats = async function (activity) {
  const now = new Date();

  switch (activity.type) {
    case 'quest_completed':
      this.stats.questsCompleted += 1;
      this.stats.expContributed += activity.exp || 0;
      break;
    case 'daily_checkin':
      this.stats.consecutiveDays += 1;
      break;
    default:
      break;
  }

  this.stats.lastActiveAt = now;
  await this.save();
};

// 实例方法：获取成员详细信息
PartyMember.prototype.getDetailedInfo = async function () {
  const user = await this.getUser();
  return {
    id: this.id,
    role: this.role,
    joinedAt: this.joinedAt,
    permissions: this.permissions,
    stats: this.stats,
    user: user ? {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      level: user.level,
      exp: user.exp
    } : null
  };
};

// 类方法：获取队伍的所有成员
PartyMember.findByParty = async function (partyId) {
  return await this.findAll({
    where: { partyId },
    include: [{
      model: sequelize.models.User,
      as: 'user',
      attributes: ['id', 'username', 'avatar', 'level', 'exp']
    }],
    order: [
      ['role', 'DESC'], // leader, admin, member
      ['joinedAt', 'ASC']
    ]
  });
};

// 类方法：获取用户的所有队伍成员关系
PartyMember.findByUser = async function (userId) {
  return await this.findAll({
    where: { userId },
    include: [{
      model: sequelize.models.Party,
      as: 'party',
      include: [{
        model: sequelize.models.User,
        as: 'leader',
        attributes: ['id', 'username', 'avatar']
      }]
    }]
  });
};

// 类方法：检查用户是否在队伍中
PartyMember.isUserInParty = async function (userId, partyId) {
  const member = await this.findOne({
    where: { userId, partyId }
  });
  return !!member;
};

// 类方法：获取用户的角色
PartyMember.getUserRole = async function (userId, partyId) {
  const member = await this.findOne({
    where: { userId, partyId }
  });
  return member ? member.role : null;
};

// 类方法：获取队伍成员数量
PartyMember.getMemberCount = async function (partyId) {
  return await this.count({
    where: { partyId }
  });
};

// 类方法：获取活跃成员
PartyMember.findActiveMembers = async function (partyId, days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return await this.findAll({
    where: {
      partyId,
      'stats.lastActiveAt': {
        [sequelize.Sequelize.Op.gte]: cutoffDate
      }
    },
    include: [{
      model: sequelize.models.User,
      as: 'user',
      attributes: ['id', 'username', 'avatar', 'level', 'exp']
    }],
    order: [['stats.lastActiveAt', 'DESC']]
  });
};

// 类方法：获取成员排行榜
PartyMember.getLeaderboard = async function (partyId, sortBy = 'expContributed') {
  const validSortFields = ['expContributed', 'questsCompleted', 'consecutiveDays'];
  if (!validSortFields.includes(sortBy)) {
    sortBy = 'expContributed';
  }

  return await this.findAll({
    where: { partyId },
    include: [{
      model: sequelize.models.User,
      as: 'user',
      attributes: ['id', 'username', 'avatar', 'level']
    }],
    order: [[`stats.${sortBy}`, 'DESC']],
    limit: 10
  });
};

module.exports = PartyMember;
