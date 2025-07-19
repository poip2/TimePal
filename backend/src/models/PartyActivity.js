const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PartyActivity = sequelize.define('PartyActivity', {
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
  activityType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [
        [
          'party_created',
          'member_joined',
          'member_left',
          'member_kicked',
          'role_changed',
          'quest_completed',
          'level_up',
          'achievement_unlocked',
          'party_updated',
          'quest_started'
        ]
      ]
    },
    field: 'activity_type'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
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
  tableName: 'party_activities',
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
      fields: ['activity_type']
    }
  ]
});

// 关联定义
PartyActivity.associate = function (models) {
  PartyActivity.belongsTo(models.Party, {
    foreignKey: 'party_id',
    as: 'party'
  });

  PartyActivity.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
};

// 类方法：记录活动
PartyActivity.logActivity = async function (partyId, userId, activityType, description = null, metadata = {}) {
  return await this.create({
    partyId,
    userId,
    activityType,
    description,
    metadata
  });
};

// 类方法：获取队伍的活动记录
PartyActivity.findByParty = async function (partyId, options = {}) {
  const { limit = 50, offset = 0, activityType = null, days = null } = options;

  const where = { partyId };

  if (activityType) {
    where.activityType = activityType;
  }

  if (days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    where.createdAt = { [sequelize.Sequelize.Op.gte]: cutoffDate };
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

// 类方法：获取用户的活动记录
PartyActivity.findByUser = async function (userId, options = {}) {
  const { limit = 50, offset = 0, days = 30 } = options;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return await this.findAll({
    where: {
      userId,
      createdAt: {
        [sequelize.Sequelize.Op.gte]: cutoffDate
      }
    },
    include: [{
      model: sequelize.models.Party,
      as: 'party',
      attributes: ['id', 'name']
    }],
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
};

// 类方法：获取活动统计
PartyActivity.getActivityStats = async function (partyId, days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const activities = await this.findAll({
    where: {
      partyId,
      createdAt: {
        [sequelize.Sequelize.Op.gte]: cutoffDate
      }
    }
  });

  const stats = {
    totalActivities: activities.length,
    byType: {},
    byUser: {},
    recentActivity: []
  };

  activities.forEach(activity => {
    // 按类型统计
    stats.byType[activity.activityType] = (stats.byType[activity.activityType] || 0) + 1;

    // 按用户统计
    if (!stats.byUser[activity.userId]) {
      stats.byUser[activity.userId] = {
        count: 0,
        username: activity.user?.username || 'Unknown'
      };
    }
    stats.byUser[activity.userId].count += 1;
  });

  // 获取最近的活动（最多10条）
  stats.recentActivity = activities.slice(0, 10).map(activity => ({
    id: activity.id,
    activityType: activity.activityType,
    description: activity.description,
    metadata: activity.metadata,
    createdAt: activity.createdAt,
    user: activity.user ? {
      id: activity.user.id,
      username: activity.user.username,
      avatar: activity.user.avatar
    } : null
  }));

  return stats;
};

// 类方法：清理旧活动记录
PartyActivity.cleanupOldActivities = async function (days = 90) {
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

// 预定义的活动模板
PartyActivity.TEMPLATES = {
  partyCreated: (userName, partyName) => ({
    activityType: 'party_created',
    description: `${userName} 创建了队伍 ${partyName}`,
    metadata: { partyName }
  }),

  memberJoined: (userName) => ({
    activityType: 'member_joined',
    description: `${userName} 加入了队伍`,
    metadata: { userName }
  }),

  memberLeft: (userName) => ({
    activityType: 'member_left',
    description: `${userName} 离开了队伍`,
    metadata: { userName }
  }),

  memberKicked: (userName, kickerName) => ({
    activityType: 'member_kicked',
    description: `${kickerName} 将 ${userName} 移出了队伍`,
    metadata: { userName, kickerName }
  }),

  roleChanged: (userName, oldRole, newRole, changerName) => ({
    activityType: 'role_changed',
    description: `${changerName} 将 ${userName} 的角色从 ${oldRole} 改为 ${newRole}`,
    metadata: { userName, oldRole, newRole, changerName }
  }),

  questCompleted: (userName, questName, expEarned) => ({
    activityType: 'quest_completed',
    description: `${userName} 完成了任务 ${questName}`,
    metadata: { userName, questName, expEarned }
  }),

  levelUp: (userName, oldLevel, newLevel) => ({
    activityType: 'level_up',
    description: `${userName} 升级了！从 ${oldLevel} 级升到 ${newLevel} 级`,
    metadata: { userName, oldLevel, newLevel }
  }),

  achievementUnlocked: (userName, achievementName) => ({
    activityType: 'achievement_unlocked',
    description: `${userName} 解锁了成就 ${achievementName}`,
    metadata: { userName, achievementName }
  }),

  partyUpdated: (userName, field, oldValue, newValue) => ({
    activityType: 'party_updated',
    description: `${userName} 更新了队伍信息`,
    metadata: { userName, field, oldValue, newValue }
  }),

  questStarted: (userName, questName) => ({
    activityType: 'quest_started',
    description: `${userName} 开始了任务 ${questName}`,
    metadata: { userName, questName }
  })
};

module.exports = PartyActivity;
