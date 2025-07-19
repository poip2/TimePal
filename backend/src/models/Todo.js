const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Todo = sequelize.define('Todo', {
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
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'due_date'
  },
  dateCompleted: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_completed'
  },
  checklist: {
    type: DataTypes.JSONB,
    defaultValue: [],
    validate: {
      isArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('Checklist must be an array');
        }
      }
    }
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_completed'
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
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
  tableName: 'todos',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['is_completed']
    },
    {
      fields: ['due_date']
    },
    {
      fields: ['position']
    }
  ]
});

// 实例方法：完成待办事项
Todo.prototype.complete = async function () {
  this.isCompleted = true;
  this.dateCompleted = new Date();
  await this.save();
  return this;
};

// 实例方法：取消完成待办事项
Todo.prototype.uncomplete = async function () {
  this.isCompleted = false;
  this.dateCompleted = null;
  await this.save();
  return this;
};

// 类方法：获取用户的所有待办事项
Todo.findByUser = async function (userId, options = {}) {
  const whereClause = { userId };

  if (options.completed !== undefined) {
    whereClause.isCompleted = options.completed;
  }

  return await this.findAll({
    where: whereClause,
    order: [
      ['position', 'ASC'],
      ['createdAt', 'ASC']
    ],
    limit: options.limit,
    offset: options.offset
  });
};

// 类方法：获取用户待办事项统计
Todo.getStats = async function (userId) {
  const stats = await this.findAll({
    where: { userId },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalTodos'],
      [sequelize.fn('COUNT', sequelize.literal('CASE WHEN is_completed = true THEN 1 END')), 'completedTodos'],
      [sequelize.fn('COUNT', sequelize.literal('CASE WHEN is_completed = false AND due_date < CURRENT_DATE THEN 1 END')), 'overdueTodos'],
      [sequelize.fn('COUNT', sequelize.literal('CASE WHEN due_date = CURRENT_DATE THEN 1 END')), 'todayTodos'],
      [sequelize.fn('COUNT', sequelize.literal('CASE WHEN due_date > CURRENT_DATE THEN 1 END')), 'upcomingTodos']
    ],
    raw: true
  });

  const result = stats[0] || {
    totalTodos: '0',
    completedTodos: '0',
    overdueTodos: '0',
    todayTodos: '0',
    upcomingTodos: '0'
  };

  // 确保返回数字类型
  return {
    totalTodos: parseInt(result.totalTodos) || 0,
    completedTodos: parseInt(result.completedTodos) || 0,
    overdueTodos: parseInt(result.overdueTodos) || 0,
    todayTodos: parseInt(result.todayTodos) || 0,
    upcomingTodos: parseInt(result.upcomingTodos) || 0
  };
};

// 类方法：重新排序待办事项
Todo.reorder = async function (userId, todoId, newPosition) {
  const transaction = await sequelize.transaction();

  try {
    const todo = await this.findOne({
      where: { id: todoId, userId },
      transaction
    });

    if (!todo) {
      throw new Error('待办事项不存在');
    }

    const currentPosition = todo.position;

    if (currentPosition === newPosition) {
      await transaction.commit();
      return todo;
    }

    // 调整其他待办事项的位置
    let updateQuery;
    let updateWhere;

    if (newPosition < currentPosition) {
      // 向上移动
      updateQuery = 'UPDATE todos SET position = position + 1 WHERE user_id = :userId AND position >= :newPosition AND position < :currentPosition';
      updateWhere = { userId, newPosition, currentPosition };
    } else {
      // 向下移动
      updateQuery = 'UPDATE todos SET position = position - 1 WHERE user_id = :userId AND position > :currentPosition AND position <= :newPosition';
      updateWhere = { userId, currentPosition, newPosition };
    }

    await sequelize.query(updateQuery, {
      replacements: updateWhere,
      transaction
    });

    // 更新目标待办事项的位置
    todo.position = newPosition;
    await todo.save({ transaction });

    await transaction.commit();
    return todo;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = Todo;
