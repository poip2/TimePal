const { Daily, User } = require('../models');
const { validationResult } = require('express-validator');

// 获取所有每日任务
const getAllDailies = async (req, res) => {
  try {
    const userId = req.user.id;
    const { archived = 'false', limit, offset } = req.query;

    const options = {
      archived: archived === 'true',
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    };

    const dailies = await Daily.findByUser(userId, options);

    res.json({
      success: true,
      data: dailies,
      count: dailies.length
    });
  } catch (error) {
    console.error('Error fetching dailies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dailies',
      error: error.message
    });
  }
};

// 获取单个每日任务
const getDailyById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const daily = await Daily.findOne({
      where: {
        id,
        userId
      }
    });

    if (!daily) {
      return res.status(404).json({
        success: false,
        message: 'Daily task not found'
      });
    }

    res.json({
      success: true,
      data: daily
    });
  } catch (error) {
    console.error('Error fetching daily:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily task',
      error: error.message
    });
  }
};

// 创建每日任务
const createDaily = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const {
      title,
      notes,
      difficulty,
      repeatType,
      repeatDays,
      startDate,
      everyX,
      reminderTime,
      position
    } = req.body;

    const daily = await Daily.create({
      userId,
      title,
      notes,
      difficulty,
      repeatType,
      repeatDays: repeatDays || [],
      startDate: startDate || new Date(),
      everyX: everyX || 1,
      reminderTime,
      position: position || 0
    });

    res.status(201).json({
      success: true,
      data: daily,
      message: 'Daily task created successfully'
    });
  } catch (error) {
    console.error('Error creating daily:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create daily task',
      error: error.message
    });
  }
};

// 更新每日任务
const updateDaily = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const daily = await Daily.findOne({
      where: {
        id,
        userId
      }
    });

    if (!daily) {
      return res.status(404).json({
        success: false,
        message: 'Daily task not found'
      });
    }

    // 不允许直接更新streak和longestStreak
    delete updates.streak;
    delete updates.longestStreak;
    delete updates.lastCompletedDate;
    delete updates.isCompleted;

    await daily.update(updates);

    res.json({
      success: true,
      data: daily,
      message: 'Daily task updated successfully'
    });
  } catch (error) {
    console.error('Error updating daily:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update daily task',
      error: error.message
    });
  }
};

// 删除每日任务
const deleteDaily = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const daily = await Daily.findOne({
      where: {
        id,
        userId
      }
    });

    if (!daily) {
      return res.status(404).json({
        success: false,
        message: 'Daily task not found'
      });
    }

    await daily.destroy();

    res.json({
      success: true,
      message: 'Daily task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting daily:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete daily task',
      error: error.message
    });
  }
};

// 完成每日任务
const completeDaily = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const daily = await Daily.findOne({
      where: {
        id,
        userId
      }
    });

    if (!daily) {
      return res.status(404).json({
        success: false,
        message: 'Daily task not found'
      });
    }

    // 检查是否应该在今天执行
    if (!daily.shouldBeActiveToday()) {
      return res.status(400).json({
        success: false,
        message: 'This task is not scheduled for today'
      });
    }

    await daily.complete();

    res.json({
      success: true,
      data: daily,
      message: 'Daily task completed successfully'
    });
  } catch (error) {
    console.error('Error completing daily:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete daily task',
      error: error.message
    });
  }
};

// 取消完成每日任务
const uncompleteDaily = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const daily = await Daily.findOne({
      where: {
        id,
        userId
      }
    });

    if (!daily) {
      return res.status(404).json({
        success: false,
        message: 'Daily task not found'
      });
    }

    await daily.uncomplete();

    res.json({
      success: true,
      data: daily,
      message: 'Daily task uncompleted successfully'
    });
  } catch (error) {
    console.error('Error uncompleting daily:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to uncomplete daily task',
      error: error.message
    });
  }
};

// 获取用户今天的每日任务
const getTodaysDailies = async (req, res) => {
  try {
    const userId = req.user.id;

    const dailies = await Daily.findTodaysTasks(userId);

    res.json({
      success: true,
      data: dailies,
      count: dailies.length
    });
  } catch (error) {
    console.error('Error fetching today\'s dailies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s dailies',
      error: error.message
    });
  }
};

// 归档每日任务
const archiveDaily = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const daily = await Daily.findOne({
      where: {
        id,
        userId
      }
    });

    if (!daily) {
      return res.status(404).json({
        success: false,
        message: 'Daily task not found'
      });
    }

    await daily.archive();

    res.json({
      success: true,
      data: daily,
      message: 'Daily task archived successfully'
    });
  } catch (error) {
    console.error('Error archiving daily:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive daily task',
      error: error.message
    });
  }
};

// 取消归档每日任务
const unarchiveDaily = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const daily = await Daily.findOne({
      where: {
        id,
        userId
      }
    });

    if (!daily) {
      return res.status(404).json({
        success: false,
        message: 'Daily task not found'
      });
    }

    await daily.unarchive();

    res.json({
      success: true,
      data: daily,
      message: 'Daily task unarchived successfully'
    });
  } catch (error) {
    console.error('Error unarchiving daily:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unarchive daily task',
      error: error.message
    });
  }
};

// 获取用户每日任务统计
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Daily.getUserStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user stats',
      error: error.message
    });
  }
};

module.exports = {
  getAllDailies,
  getDailyById,
  createDaily,
  updateDaily,
  deleteDaily,
  completeDaily,
  uncompleteDaily,
  getTodaysDailies,
  archiveDaily,
  unarchiveDaily,
  getUserStats
};
