const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Habit = sequelize.define('Habit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [1, 255],
      notEmpty: true
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('good', 'bad'),
    allowNull: false,
    validate: {
      isIn: [['good', 'bad']]
    }
  },
  difficulty: {
    type: DataTypes.ENUM('trivial', 'easy', 'medium', 'hard'),
    defaultValue: 'easy',
    validate: {
      isIn: [['trivial', 'easy', 'medium', 'hard']]
    }
  },
  upCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'up_count',
    validate: {
      min: 0
    }
  },
  downCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'down_count',
    validate: {
      min: 0
    }
  },
  counterUp: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'counter_up',
    validate: {
      min: 0
    }
  },
  counterDown: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'counter_down',
    validate: {
      min: 0
    }
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  isPositive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_positive'
  },
  isNegative: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_negative'
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_archived'
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
  tableName: 'habits',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['difficulty']
    },
    {
      fields: ['is_archived']
    },
    {
      fields: ['position']
    }
  ]
});

// 实例方法：增加正向计数
Habit.prototype.incrementCounterUp = async function () {
  this.counterUp += 1;
  await this.save();
  return this;
};

// 实例方法：增加负向计数
Habit.prototype.incrementCounterDown = async function () {
  this.counterDown += 1;
  await this.save();
  return this;
};

// 实例方法：增加up投票
Habit.prototype.upvote = async function () {
  this.upCount += 1;
  await this.save();
  return this;
};

// 实例方法：增加down投票
Habit.prototype.downvote = async function () {
  this.downCount += 1;
  await this.save();
  return this;
};

// 实例方法：归档习惯
Habit.prototype.archive = async function () {
  this.isArchived = true;
  await this.save();
  return this;
};

// 实例方法：取消归档
Habit.prototype.unarchive = async function () {
  this.isArchived = false;
  await this.save();
  return this;
};

// 类方法：获取用户的所有习惯
Habit.findByUser = async function (userId, options = {}) {
  const whereClause = { userId };

  if (options.archived !== undefined) {
    whereClause.isArchived = options.archived;
  }

  if (options.type) {
    whereClause.type = options.type;
  }

  return await this.findAll({
    where: whereClause,
    order: [
      ['position', 'ASC'],
      ['createdAt', 'DESC']
    ],
    limit: options.limit,
    offset: options.offset
  });
};

// 类方法：获取用户的习惯统计
Habit.getUserStats = async function (userId) {
  const stats = await this.findAll({
    where: { userId },
    attributes: [
      'type',
      'difficulty',
      'isArchived',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('up_count')), 'totalUpvotes'],
      [sequelize.fn('SUM', sequelize.col('down_count')), 'totalDownvotes'],
      [sequelize.fn('SUM', sequelize.col('counter_up')), 'totalCounterUp'],
      [sequelize.fn('SUM', sequelize.col('counter_down')), 'totalCounterDown']
    ],
    group: ['type', 'difficulty', 'isArchived']
  });

  return stats;
};

// 类方法：获取排行榜（基于投票数）
Habit.getLeaderboard = async function (limit = 10) {
  return await this.findAll({
    attributes: [
      'id',
      'title',
      'type',
      'difficulty',
      'upCount',
      'downCount',
      'counterUp',
      'counterDown',
      'createdAt'
    ],
    where: { isArchived: false },
    order: [
      [sequelize.literal('(up_count - down_count)'), 'DESC'],
      ['upCount', 'DESC'],
      ['createdAt', 'DESC']
    ],
    limit: limit,
    include: [{
      model: require('./User'),
      attributes: ['id', 'username']
    }]
  });
};

module.exports = Habit;
