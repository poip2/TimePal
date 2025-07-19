const Todo = require('../models/Todo');
const { validationResult } = require('express-validator');

const todosController = {
  async getAllTodos(req, res) {
    try {
      const userId = req.user.userId;
      const todos = await Todo.findByUser(userId);

      res.json({
        success: true,
        data: todos,
        count: todos.length
      });
    } catch (error) {
      console.error('获取待办事项失败:', error);
      res.status(500).json({
        success: false,
        message: '获取待办事项失败',
        error: error.message
      });
    }
  },

  async getTodoById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const todo = await Todo.findOne({
        where: { id, userId }
      });

      if (!todo) {
        return res.status(404).json({
          success: false,
          message: '待办事项不存在'
        });
      }

      res.json({
        success: true,
        data: todo
      });
    } catch (error) {
      console.error('获取待办事项失败:', error);
      res.status(500).json({
        success: false,
        message: '获取待办事项失败',
        error: error.message
      });
    }
  },

  async createTodo(req, res) {
    try {
      const userId = req.user.userId;
      const {
        title,
        notes,
        difficulty = 'easy',
        due_date,
        checklist = [],
        position = 0
      } = req.body;

      // 验证必填字段
      if (!title || title.trim() === '') {
        return res.status(400).json({
          success: false,
          message: '标题不能为空'
        });
      }

      // 验证难度等级
      const validDifficulties = ['trivial', 'easy', 'medium', 'hard'];
      if (difficulty && !validDifficulties.includes(difficulty)) {
        return res.status(400).json({
          success: false,
          message: '难度等级无效，可选值：trivial, easy, medium, hard'
        });
      }

      // 验证检查清单格式
      if (!Array.isArray(checklist)) {
        return res.status(400).json({
          success: false,
          message: '检查清单必须是数组格式'
        });
      }

      // 验证检查清单项格式
      const validChecklist = checklist.map(item => ({
        text: String(item.text || ''),
        completed: Boolean(item.completed || false),
        id: String(item.id || Date.now() + Math.random())
      }));

      const todoData = {
        userId,
        title: title.trim(),
        notes: notes ? notes.trim() : null,
        difficulty,
        dueDate: due_date || null,
        checklist: validChecklist,
        position
      };

      const todo = await Todo.create(todoData);

      res.status(201).json({
        success: true,
        data: todo,
        message: '待办事项创建成功'
      });
    } catch (error) {
      console.error('创建待办事项失败:', error);
      res.status(500).json({
        success: false,
        message: '创建待办事项失败',
        error: error.message
      });
    }
  },

  async updateTodo(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const updateData = {};

      // 允许更新的字段
      const allowedFields = ['title', 'notes', 'difficulty', 'dueDate', 'checklist', 'position'];

      for (const field of allowedFields) {
        const camelCaseField = field === 'dueDate' ? 'due_date' : field;
        if (req.body[camelCaseField] !== undefined || req.body[field] !== undefined) {
          const value = req.body[camelCaseField] !== undefined ? req.body[camelCaseField] : req.body[field];

          if (field === 'checklist' && !Array.isArray(value)) {
            return res.status(400).json({
              success: false,
              message: '检查清单必须是数组格式'
            });
          }
          if (field === 'title' && (!value || value.trim() === '')) {
            return res.status(400).json({
              success: false,
              message: '标题不能为空'
            });
          }
          if (field === 'difficulty') {
            const validDifficulties = ['trivial', 'easy', 'medium', 'hard'];
            if (!validDifficulties.includes(value)) {
              return res.status(400).json({
                success: false,
                message: '难度等级无效'
              });
            }
          }

          if (field === 'checklist') {
            updateData[field] = value.map(item => ({
              text: String(item.text || ''),
              completed: Boolean(item.completed || false),
              id: String(item.id || Date.now() + Math.random())
            }));
          } else if (field === 'title' || field === 'notes') {
            updateData[field] = value.trim();
          } else {
            updateData[field] = value;
          }
        }
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: '没有提供有效的更新字段'
        });
      }

      const [updatedRows] = await Todo.update(updateData, {
        where: { id, userId },
        returning: true
      });

      if (updatedRows === 0) {
        return res.status(404).json({
          success: false,
          message: '待办事项不存在'
        });
      }

      const todo = await Todo.findOne({ where: { id, userId } });

      res.json({
        success: true,
        data: todo,
        message: '待办事项更新成功'
      });
    } catch (error) {
      console.error('更新待办事项失败:', error);
      res.status(400).json({
        success: false,
        message: error.message || '更新待办事项失败'
      });
    }
  },

  async deleteTodo(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const deletedRows = await Todo.destroy({
        where: { id, userId }
      });

      if (deletedRows === 0) {
        return res.status(404).json({
          success: false,
          message: '待办事项不存在'
        });
      }

      res.json({
        success: true,
        message: '待办事项删除成功'
      });
    } catch (error) {
      console.error('删除待办事项失败:', error);
      res.status(500).json({
        success: false,
        message: '删除待办事项失败',
        error: error.message
      });
    }
  },

  async completeTodo(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const todo = await Todo.findOne({ where: { id, userId } });

      if (!todo) {
        return res.status(404).json({
          success: false,
          message: '待办事项不存在'
        });
      }

      await todo.complete();

      res.json({
        success: true,
        data: todo,
        message: '待办事项已完成'
      });
    } catch (error) {
      console.error('完成待办事项失败:', error);
      res.status(500).json({
        success: false,
        message: '完成待办事项失败',
        error: error.message
      });
    }
  },

  async uncompleteTodo(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const todo = await Todo.findOne({ where: { id, userId } });

      if (!todo) {
        return res.status(404).json({
          success: false,
          message: '待办事项不存在'
        });
      }

      await todo.uncomplete();

      res.json({
        success: true,
        data: todo,
        message: '待办事项已取消完成'
      });
    } catch (error) {
      console.error('取消完成待办事项失败:', error);
      res.status(500).json({
        success: false,
        message: '取消完成待办事项失败',
        error: error.message
      });
    }
  },

  async getTodoStats(req, res) {
    try {
      const userId = req.user.userId;
      const stats = await Todo.getStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('获取待办事项统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取待办事项统计失败',
        error: error.message
      });
    }
  },

  async reorderTodo(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { position } = req.body;

      if (position === undefined || typeof position !== 'number' || position < 0) {
        return res.status(400).json({
          success: false,
          message: '位置必须是大于等于0的数字'
        });
      }

      const todo = await Todo.reorder(userId, id, position);

      if (!todo) {
        return res.status(404).json({
          success: false,
          message: '待办事项不存在'
        });
      }

      res.json({
        success: true,
        data: todo,
        message: '待办事项排序成功'
      });
    } catch (error) {
      console.error('待办事项排序失败:', error);
      res.status(500).json({
        success: false,
        message: '待办事项排序失败',
        error: error.message
      });
    }
  }
};

module.exports = todosController;
