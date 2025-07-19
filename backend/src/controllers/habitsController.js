const Habit = require('../models/Habit');
const Joi = require('joi');

// 创建习惯验证schema
const createHabitSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  notes: Joi.string().max(1000).optional(),
  type: Joi.string().valid('good', 'bad').required(),
  difficulty: Joi.string().valid('trivial', 'easy', 'medium', 'hard').default('easy'),
  isPositive: Joi.boolean().default(true),
  isNegative: Joi.boolean().default(true),
  position: Joi.number().integer().min(0).default(0)
});

// 更新习惯验证schema
const updateHabitSchema = Joi.object({
  title: Joi.string().min(1).max(255).optional(),
  notes: Joi.string().max(1000).optional(),
  type: Joi.string().valid('good', 'bad').optional(),
  difficulty: Joi.string().valid('trivial', 'easy', 'medium', 'hard').optional(),
  isPositive: Joi.boolean().optional(),
  isNegative: Joi.boolean().optional(),
  position: Joi.number().integer().min(0).optional()
});

// 评分验证schema
const scoreSchema = Joi.object({
  action: Joi.string().valid('up', 'down').required()
});

// 获取所有习惯
const getAllHabits = async (req, res) => {
  try {
    const {
      type,
      difficulty,
      archived,
      page = 1,
      limit = 20,
      sortBy = 'position',
      sortOrder = 'ASC'
    } = req.query;

    const options = {
      archived: archived === 'true' ? true : archived === 'false' ? false : undefined,
      type,
      difficulty,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const habits = await Habit.findByUser(req.user.userId, options);

    // 获取总数用于分页
    const totalCount = await Habit.count({
      where: { userId: req.user.userId }
    });

    res.json({
      success: true,
      data: {
        habits,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取习惯列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取单个习惯
const getHabit = async (req, res) => {
  try {
    const { id } = req.params;

    const habit = await Habit.findOne({
      where: {
        id: parseInt(id),
        userId: req.user.userId
      }
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: '习惯不存在'
      });
    }

    res.json({
      success: true,
      data: { habit }
    });
  } catch (error) {
    console.error('获取习惯详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 创建新习惯
const createHabit = async (req, res) => {
  try {
    // 验证输入
    const { error } = createHabitSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: error.details.map(detail => detail.message)
      });
    }

    const habitData = {
      ...req.body,
      userId: req.user.userId
    };

    const habit = await Habit.create(habitData);

    res.status(201).json({
      success: true,
      message: '习惯创建成功',
      data: { habit }
    });
  } catch (error) {
    console.error('创建习惯错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 更新习惯
const updateHabit = async (req, res) => {
  try {
    const { id } = req.params;

    // 验证输入
    const { error } = updateHabitSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: error.details.map(detail => detail.message)
      });
    }

    const habit = await Habit.findOne({
      where: {
        id: parseInt(id),
        userId: req.user.userId
      }
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: '习惯不存在'
      });
    }

    // 更新字段
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        habit[key] = req.body[key];
      }
    });

    await habit.save();

    res.json({
      success: true,
      message: '习惯更新成功',
      data: { habit }
    });
  } catch (error) {
    console.error('更新习惯错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 删除习惯
const deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;

    const habit = await Habit.findOne({
      where: {
        id: parseInt(id),
        userId: req.user.userId
      }
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: '习惯不存在'
      });
    }

    await habit.destroy();

    res.json({
      success: true,
      message: '习惯删除成功'
    });
  } catch (error) {
    console.error('删除习惯错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 评分习惯（up/down投票）
const scoreHabit = async (req, res) => {
  try {
    const { id } = req.params;

    // 验证输入
    const { error } = scoreSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { action } = req.body;

    const habit = await Habit.findOne({
      where: {
        id: parseInt(id),
        userId: req.user.userId
      }
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: '习惯不存在'
      });
    }

    // 根据action执行相应操作
    if (action === 'up') {
      if (habit.isPositive) {
        await habit.upvote();
        await habit.incrementCounterUp();
      } else {
        return res.status(400).json({
          success: false,
          message: '该习惯不支持正向评分'
        });
      }
    } else if (action === 'down') {
      if (habit.isNegative) {
        await habit.downvote();
        await habit.incrementCounterDown();
      } else {
        return res.status(400).json({
          success: false,
          message: '该习惯不支持负向评分'
        });
      }
    }

    res.json({
      success: true,
      message: `习惯${action === 'up' ? '正向' : '负向'}评分成功`,
      data: {
        habit,
        action
      }
    });
  } catch (error) {
    console.error('评分习惯错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 归档/取消归档习惯
const archiveHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { archive = true } = req.body;

    const habit = await Habit.findOne({
      where: {
        id: parseInt(id),
        userId: req.user.userId
      }
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: '习惯不存在'
      });
    }

    if (archive) {
      await habit.archive();
    } else {
      await habit.unarchive();
    }

    res.json({
      success: true,
      message: `习惯${archive ? '归档' : '取消归档'}成功`,
      data: { habit }
    });
  } catch (error) {
    console.error('归档习惯错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取用户习惯统计
const getUserStats = async (req, res) => {
  try {
    const stats = await Habit.getUserStats(req.user.userId);

    // 格式化统计数据
    const formattedStats = {
      total: 0,
      byType: { good: 0, bad: 0 },
      byDifficulty: { trivial: 0, easy: 0, medium: 0, hard: 0 },
      archived: 0,
      active: 0,
      totalUpvotes: 0,
      totalDownvotes: 0,
      totalCounterUp: 0,
      totalCounterDown: 0
    };

    stats.forEach(stat => {
      const data = stat.get({ plain: true });

      formattedStats.total += parseInt(data.count) || 0;
      formattedStats.byType[data.type] = (formattedStats.byType[data.type] || 0) + parseInt(data.count);
      formattedStats.byDifficulty[data.difficulty] = (formattedStats.byDifficulty[data.difficulty] || 0) + parseInt(data.count);

      if (data.isArchived) {
        formattedStats.archived += parseInt(data.count) || 0;
      } else {
        formattedStats.active += parseInt(data.count) || 0;
      }

      formattedStats.totalUpvotes += parseInt(data.totalUpvotes) || 0;
      formattedStats.totalDownvotes += parseInt(data.totalDownvotes) || 0;
      formattedStats.totalCounterUp += parseInt(data.totalCounterUp) || 0;
      formattedStats.totalCounterDown += parseInt(data.totalCounterDown) || 0;
    });

    res.json({
      success: true,
      data: { stats: formattedStats }
    });
  } catch (error) {
    console.error('获取用户习惯统计错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

module.exports = {
  getAllHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  scoreHabit,
  archiveHabit,
  getUserStats
};
