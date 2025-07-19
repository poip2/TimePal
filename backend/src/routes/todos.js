const express = require('express');
const router = express.Router();
const todosController = require('../controllers/todosController');
const authenticateToken = require('../middleware/auth').authenticateToken;

// 所有路由都需要认证
router.use(authenticateToken);

// 获取所有待办事项
router.get('/', todosController.getAllTodos);

// 获取待办事项统计
router.get('/stats', todosController.getTodoStats);

// 获取单个待办事项
router.get('/:id', todosController.getTodoById);

// 创建待办事项
router.post('/', todosController.createTodo);

// 更新待办事项
router.put('/:id', todosController.updateTodo);

// 删除待办事项
router.delete('/:id', todosController.deleteTodo);

// 完成待办事项
router.post('/:id/complete', todosController.completeTodo);

// 取消完成待办事项
router.post('/:id/uncomplete', todosController.uncompleteTodo);

// 重新排序待办事项
router.put('/:id/reorder', todosController.reorderTodo);

module.exports = router;
