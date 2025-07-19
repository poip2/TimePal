const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Daily = sequelize.define('Daily', {
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
  difficulty: {
    type: DataTypes.ENUM('trivial', 'easy', 'medium', 'hard'),
    defaultValue: 'easy',
    validate: {
      isIn: [['trivial', 'easy', 'medium', 'hard']]
    }
  },
  repeatType: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
    defaultValue: 'daily',
    field: 'repeat_type',
    validate: {
      isIn: [['daily', 'weekly', 'monthly', 'yearly']]
    }
  },
  repeatDays: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'repeat_days',
    validate: {
      isValidRepeatDays(value) {
        if (!Array.isArray(value)) {
          throw new Error('repeatDays must be an array');
        }
        if (this.repeatType === 'weekly') {
          const validDays = [0, 1, 2, 3, 4, 5, 6]; // 0 = Sunday, 6 = Saturday
          if (!value.every(day => validDays.includes(day))) {
            throw new Error('Invalid day values for weekly repeat');
          }
        }
      }
    }
  },
  startDate: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
    field: 'start_date'
  },
  everyX: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'every_x',
    validate: {
      min: 1
    }
  },
  streak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  longestStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'longest_streak',
    validate: {
      min: 0
    }
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_completed'
  },
  lastCompletedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'last_completed_date'
  },
  reminderTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'reminder_time'
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
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
  tableName: 'dailies',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['is_archived']
    },
    {
      fields: ['is_completed']
    },
    {
      fields: ['streak']
    },
    {
      fields: ['position']
    },
    {
      fields: ['user_id', 'is_archived']
    }
  ]
});

// 实例方法：完成每日任务
Daily.prototype.complete = async function () {
  const today = new Date().toISOString().split('T')[0];

  // 如果今天已经完成，不重复计算
  if (this.lastCompletedDate === today) {
    return this;
  }

  this.isCompleted = true;
  this.lastCompletedDate = today;
  this.streak += 1;

  if (this.streak > this.longestStreak) {
    this.longestStreak = this.streak;
  }

  await this.save();
  return this;
};

// 实例方法：取消完成每日任务
Daily.prototype.uncomplete = async function () {
  const today = new Date().toISOString().split('T')[0];

  // 只有今天完成的任务才能取消
  if (this.lastCompletedDate !== today) {
    return this;
  }

  this.isCompleted = false;
  this.lastCompletedDate = null;
  this.streak = Math.max(0, this.streak - 1);

  await this.save();
  return this;
};

// 实例方法：重置streak（用于错过任务时）
Daily.prototype.resetStreak = async function () {
  this.streak = 0;
  this.isCompleted = false;
  await this.save();
  return this;
};

// 实例方法：归档每日任务
Daily.prototype.archive = async function () {
  this.isArchived = true;
  await this.save();
  return this;
};

// 实例方法：取消归档
Daily.prototype.unarchive = async function () {
  this.isArchived = false;
  await this.save();
  return this;
};

// 实例方法：检查是否应该在今天执行
Daily.prototype.shouldBeActiveToday = function () {
  const today = new Date();
  const startDate = new Date(this.startDate);

  // 如果开始日期在未来，不应该激活
  if (startDate > today) {
    return false;
  }

  switch (this.repeatType) {
    case 'daily':
      return this.isDailyActive(today);
    case 'weekly':
      return this.isWeeklyActive(today);
    case 'monthly':
      return this.isMonthlyActive(today);
    case 'yearly':
      return this.isYearlyActive(today);
    default:
      return false;
  }
};

// 检查每日重复
Daily.prototype.isDailyActive = function (today) {
  const startDate = new Date(this.startDate);
  const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  return daysDiff % this.everyX === 0;
};

// 检查每周重复
Daily.prototype.isWeeklyActive = function (today) {
  const startDate = new Date(this.startDate);
  const currentDay = today.getDay();

  // 检查今天是否在指定的星期几中
  if (this.repeatDays.length > 0 && !this.repeatDays.includes(currentDay)) {
    return false;
  }

  // 计算从start_date开始的周数
  const weeksDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24 * 7));
  return weeksDiff % this.everyX === 0;
};

// 检查每月重复
Daily.prototype.isMonthlyActive = function (today) {
  const startDate = new Date(this.startDate);
  const monthsDiff = (today.getFullYear() - startDate.getFullYear()) * 12 +
    today.getMonth() - startDate.getMonth();
  return monthsDiff % this.everyX === 0;
};

// 检查每年重复
Daily.prototype.isYearlyActive = function (today) {
  const startDate = new Date(this.startDate);
  const yearsDiff = today.getFullYear() - startDate.getFullYear();
  return yearsDiff % this.everyX === 0;
};

// 类方法：获取用户的所有每日任务
Daily.findByUser = async function (userId, options = {}) {
  const whereClause = { userId };

  if (options.archived !== undefined) {
    whereClause.isArchived = options.archived;
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

// 类方法：获取用户今天需要完成的每日任务
Daily.findTodaysTasks = async function (userId) {
  const dailies = await this.findByUser(userId, { archived: false });
  return dailies.filter(daily => daily.shouldBeActiveToday());
};

// 类方法：获取用户的每日任务统计
Daily.getUserStats = async function (userId) {
  const stats = await this.findAll({
    where: { userId },
    attributes: [
      'difficulty',
      'isArchived',
      'isCompleted',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('AVG', sequelize.col('streak')), 'avgStreak'],
      [sequelize.fn('MAX', sequelize.col('longest_streak')), 'maxStreak']
    ],
    group: ['difficulty', 'isArchived', 'isCompleted']
  });

  return stats;
};

// 类方法：重置所有过期的每日任务
Daily.resetExpiredTasks = async function () {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const expiredTasks = await this.findAll({
    where: {
      isArchived: false,
      isCompleted: true,
      lastCompletedDate: {
        [sequelize.Sequelize.Op.ne]: new Date().toISOString().split('T')[0]
      }
    }
  });

  for (const task of expiredTasks) {
    task.isCompleted = false;
    await task.save();
  }

  return expiredTasks.length;
};

// 类方法：获取排行榜（基于最长streak）
Daily.getLeaderboard = async function (limit = 10) {
  return await this.findAll({
    attributes: [
      'id',
      'title',
      'difficulty',
      'streak',
      'longestStreak',
      'createdAt'
    ],
    where: { isArchived: false },
    order: [
      ['longestStreak', 'DESC'],
      ['streak', 'DESC'],
      ['createdAt', 'DESC']
    ],
    limit: limit,
    include: [{
      model: require('./User'),
      attributes: ['id', 'username']
    }]
  });
};

module.exports = Daily;
