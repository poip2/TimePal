const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Party = sequelize.define('Party', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [1, 100],
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  leaderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'leader_id'
  },
  privacy: {
    type: DataTypes.STRING(10),
    defaultValue: 'private',
    validate: {
      isIn: [['private', 'public', 'invite_only']]
    }
  },
  maxMembers: {
    type: DataTypes.INTEGER,
    defaultValue: 4,
    validate: {
      min: 1,
      max: 4
    },
    field: 'max_members'
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    },
    field: 'image_url'
  },
  stats: {
    type: DataTypes.JSONB,
    defaultValue: {
      totalQuestsCompleted: 0,
      totalExpEarned: 0,
      totalMembers: 0,
      averageMemberLevel: 0,
      totalAchievements: 0
    },
    validate: {
      isValidStats(value) {
        if (typeof value !== 'object' || value === null) {
          throw new Error('stats must be an object');
        }
        const validStats = [
          'totalQuestsCompleted',
          'totalExpEarned',
          'totalMembers',
          'averageMemberLevel',
          'totalAchievements'
        ];
        for (const key of Object.keys(value)) {
          if (!validStats.includes(key)) {
            throw new Error(`Invalid stat: ${key}`);
          }
          if (typeof value[key] !== 'number' || value[key] < 0) {
            throw new Error(`Stat ${key} must be a non-negative number`);
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
  tableName: 'parties',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['leader_id']
    },
    {
      fields: ['privacy']
    },
    {
      fields: ['created_at']
    }
  ]
});

// 关联定义
Party.associate = function (models) {
  Party.belongsTo(models.User, {
    foreignKey: 'leader_id',
    as: 'leader'
  });

  Party.hasMany(models.PartyMember, {
    foreignKey: 'party_id',
    as: 'members',
    onDelete: 'CASCADE'
  });

  Party.hasMany(models.PartyInvitation, {
    foreignKey: 'party_id',
    as: 'invitations',
    onDelete: 'CASCADE'
  });

  Party.hasMany(models.PartyMessage, {
    foreignKey: 'party_id',
    as: 'messages',
    onDelete: 'CASCADE'
  });

  Party.hasMany(models.PartyActivity, {
    foreignKey: 'party_id',
    as: 'activities',
    onDelete: 'CASCADE'
  });
};

// 实例方法：获取当前成员数量
Party.prototype.getMemberCount = async function () {
  const { PartyMember } = sequelize.models;
  return await PartyMember.count({
    where: { partyId: this.id }
  });
};

// 实例方法：检查是否已满员
Party.prototype.isFull = async function () {
  const memberCount = await this.getMemberCount();
  return memberCount >= this.maxMembers;
};

// 实例方法：更新队伍统计信息
Party.prototype.updateStats = async function () {
  const { PartyMember, User } = sequelize.models;

  const members = await PartyMember.findAll({
    where: { partyId: this.id },
    include: [{
      model: User,
      as: 'user',
      attributes: ['level', 'experience']
    }]
  });

  const totalMembers = members.length;
  const totalExp = members.reduce((sum, member) => sum + (member.user?.experience || 0), 0);
  const averageMemberLevel = totalMembers > 0
    ? Math.round(members.reduce((sum, member) => sum + (member.user?.level || 1), 0) / totalMembers)
    : 0;

  this.stats = {
    ...this.stats,
    totalMembers,
    averageMemberLevel,
    totalExpEarned: totalExp
  };

  await this.save();
};

// 类方法：获取公开队伍
Party.findPublicParties = async function (options = {}) {
  const { limit = 20, offset = 0 } = options;

  return await this.findAll({
    where: { privacy: 'public' },
    include: [{
      model: sequelize.models.User,
      as: 'leader',
      attributes: ['id', 'username', 'avatarUrl']
    }, {
      model: sequelize.models.PartyMember,
      as: 'partyMembers',
      include: [{
        model: sequelize.models.User,
        as: 'user',
        attributes: ['id', 'username', 'avatarUrl', 'level']
      }]
    }],
    order: [['created_at', 'DESC']],
    limit,
    offset
  });
};

// 类方法：获取用户的队伍
Party.findUserParties = async function (userId) {
  const { PartyMember } = sequelize.models;

  return await this.findAll({
    include: [{
      model: PartyMember,
      as: 'partyMembers',
      where: { user_id: userId },
      required: true
    }, {
      model: sequelize.models.User,
      as: 'leader',
      attributes: ['id', 'username', 'avatarUrl']
    }, {
      model: sequelize.models.PartyMember,
      as: 'partyMembers',
      include: [{
        model: sequelize.models.User,
        as: 'user',
        attributes: ['id', 'username', 'avatarUrl', 'level']
      }]
    }],
    order: [['created_at', 'DESC']]
  });
};

// 类方法：获取用户创建的队伍
Party.findUserCreatedParties = async function (userId) {
  return await this.findAll({
    where: { leader_id: userId },
    include: [{
      model: sequelize.models.User,
      as: 'leader',
      attributes: ['id', 'username', 'avatarUrl']
    }, {
      model: sequelize.models.PartyMember,
      as: 'partyMembers',
      include: [{
        model: sequelize.models.User,
        as: 'user',
        attributes: ['id', 'username', 'avatarUrl', 'level']
      }]
    }],
    order: [['created_at', 'DESC']]
  });
};

// 类方法：搜索队伍
Party.searchParties = async function (query, options = {}) {
  const { limit = 20, offset = 0 } = options;

  return await this.findAll({
    where: {
      privacy: 'public',
      name: {
        [sequelize.Sequelize.Op.iLike]: `%${query}%`
      }
    },
    include: [{
      model: sequelize.models.User,
      as: 'leader',
      attributes: ['id', 'username', 'avatarUrl']
    }, {
      model: sequelize.models.PartyMember,
      as: 'partyMembers',
      include: [{
        model: sequelize.models.User,
        as: 'user',
        attributes: ['id', 'username', 'avatarUrl', 'level']
      }]
    }],
    order: [['created_at', 'DESC']],
    limit,
    offset
  });
};

module.exports = Party;
