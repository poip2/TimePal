const request = require('supertest');
const app = require('../../src/server');
const sequelize = require('../../src/config/database');
const Todo = require('../../src/models/Todo');
const User = require('../../src/models/User');

describe('待办事项API测试', () => {
  let authToken;
  let userId;
  let testTodoId;

  beforeAll(async () => {
    // 确保数据库连接
    await sequelize.authenticate();

    // 同步所有模型
    await sequelize.sync({ force: true });

    // 创建测试用户并获取token
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'todotestuser',
        email: 'todotest@example.com',
        password: 'testpassword123'
      });

    authToken = userResponse.body.data.token;
    userId = userResponse.body.data.user.id;
  });

  afterAll(async () => {
    // 清理测试数据
    await Todo.destroy({ where: { userId } });
    await User.destroy({ where: { id: userId } });
    await sequelize.close();
  });

  beforeEach(async () => {
    // 每个测试前清理待办事项
    await Todo.destroy({ where: { userId } });
  });

  describe('POST /api/todos', () => {
    it('应该创建新的待办事项', async () => {
      const todoData = {
        title: '测试待办事项',
        notes: '这是一个测试',
        difficulty: 'medium',
        due_date: '2024-12-31',
        checklist: [
          { text: '子任务1', completed: false },
          { text: '子任务2', completed: true }
        ],
        position: 1
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(todoData.title);
      expect(response.body.data.difficulty).toBe(todoData.difficulty);
      expect(response.body.data.checklist).toHaveLength(2);
      expect(response.body.data.userId).toBe(userId);

      testTodoId = response.body.data.id;
    });

    it('应该拒绝没有标题的待办事项', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: '没有标题' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('标题不能为空');
    });

    it('应该拒绝无效的难度等级', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '测试',
          difficulty: 'invalid'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/todos', () => {
    beforeEach(async () => {
      // 创建测试数据
      await Todo.create({
        userId,
        title: '待办1',
        position: 0
      });

      await Todo.create({
        userId,
        title: '待办2',
        position: 1
      });
    });

    it('应该获取用户的所有待办事项', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });
  });

  describe('GET /api/todos/:id', () => {
    beforeEach(async () => {
      const todo = await Todo.create({
        userId,
        title: '测试待办'
      });
      testTodoId = todo.id;
    });

    it('应该获取指定待办事项', async () => {
      const response = await request(app)
        .get(`/api/todos/${testTodoId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testTodoId);
      expect(response.body.data.title).toBe('测试待办');
    });

    it('应该返回404当待办事项不存在', async () => {
      const response = await request(app)
        .get('/api/todos/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/todos/:id', () => {
    beforeEach(async () => {
      const todo = await Todo.create({
        userId,
        title: '原始标题'
      });
      testTodoId = todo.id;
    });

    it('应该更新待办事项', async () => {
      const updateData = {
        title: '更新后的标题',
        notes: '更新后的描述',
        difficulty: 'hard',
        checklist: [{ text: '新子任务', completed: false }]
      };

      const response = await request(app)
        .put(`/api/todos/${testTodoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.notes).toBe(updateData.notes);
      expect(response.body.data.difficulty).toBe(updateData.difficulty);
    });

    it('应该拒绝没有有效更新字段的请求', async () => {
      const response = await request(app)
        .put(`/api/todos/${testTodoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ invalid_field: 'value' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    beforeEach(async () => {
      const todo = await Todo.create({
        userId,
        title: '待删除待办'
      });
      testTodoId = todo.id;
    });

    it('应该删除待办事项', async () => {
      const response = await request(app)
        .delete(`/api/todos/${testTodoId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // 验证已删除
      const getResponse = await request(app)
        .get(`/api/todos/${testTodoId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(getResponse.status).toBe(404);
    });
  });

  describe('POST /api/todos/:id/complete', () => {
    beforeEach(async () => {
      const todo = await Todo.create({
        userId,
        title: '待完成待办'
      });
      testTodoId = todo.id;
    });

    it('应该完成待办事项', async () => {
      const response = await request(app)
        .post(`/api/todos/${testTodoId}/complete`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isCompleted).toBe(true);
      expect(response.body.data.dateCompleted).toBeTruthy();
    });
  });

  describe('POST /api/todos/:id/uncomplete', () => {
    beforeEach(async () => {
      const todo = await Todo.create({
        userId,
        title: '待取消完成待办',
        isCompleted: true,
        dateCompleted: new Date()
      });
      testTodoId = todo.id;
    });

    it('应该取消完成待办事项', async () => {
      const response = await request(app)
        .post(`/api/todos/${testTodoId}/uncomplete`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isCompleted).toBe(false);
      expect(response.body.data.dateCompleted).toBeNull();
    });
  });

  describe('GET /api/todos/stats', () => {
    beforeEach(async () => {
      // 创建测试数据
      await Todo.create({
        userId,
        title: '待办1',
        isCompleted: true
      });

      await Todo.create({
        userId,
        title: '待办2',
        isCompleted: false,
        dueDate: '2024-01-01'
      });

      await Todo.create({
        userId,
        title: '待办3',
        isCompleted: false,
        dueDate: new Date().toISOString().split('T')[0]
      });
    });

    it('应该获取待办事项统计', async () => {
      const response = await request(app)
        .get('/api/todos/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalTodos');
      expect(response.body.data).toHaveProperty('completedTodos');
      expect(response.body.data).toHaveProperty('overdueTodos');
      expect(response.body.data).toHaveProperty('todayTodos');
      expect(response.body.data).toHaveProperty('upcomingTodos');
      expect(response.body.data.totalTodos).toBe(3);
      expect(response.body.data.completedTodos).toBe(1);
    });
  });

  describe('PUT /api/todos/:id/reorder', () => {
    let todo1, todo2, todo3;

    beforeEach(async () => {
      todo1 = await Todo.create({
        userId,
        title: '待办1',
        position: 0
      });

      todo2 = await Todo.create({
        userId,
        title: '待办2',
        position: 1
      });

      todo3 = await Todo.create({
        userId,
        title: '待办3',
        position: 2
      });
    });

    it('应该重新排序待办事项', async () => {
      const response = await request(app)
        .put(`/api/todos/${todo1.id}/reorder`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ position: 2 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.position).toBe(2);
    });

    it('应该拒绝无效的位置', async () => {
      const response = await request(app)
        .put(`/api/todos/${todo1.id}/reorder`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ position: -1 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('权限控制', () => {
    let otherUserToken;
    let otherTodoId;

    beforeAll(async () => {
      // 创建另一个用户
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'othertestuser',
          email: 'othertest@example.com',
          password: 'testpassword123'
        });
      otherUserToken = response.body.data.token;

      // 创建其他用户的待办事项
      const todo = await Todo.create({
        userId: response.body.data.user.id,
        title: '其他用户的待办'
      });
      otherTodoId = todo.id;
    });

    afterAll(async () => {
      // 清理其他用户数据
      await Todo.destroy({
        where: { userId: (await User.findOne({ where: { email: 'othertest@example.com' } })).id }
      });
      await User.destroy({ where: { email: 'othertest@example.com' } });
    });

    it('应该阻止访问其他用户的待办事项', async () => {
      const response = await request(app)
        .get(`/api/todos/${otherTodoId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('应该阻止更新其他用户的待办事项', async () => {
      const response = await request(app)
        .put(`/api/todos/${otherTodoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '尝试更新' });

      expect(response.status).toBe(404);
    });

    it('应该阻止删除其他用户的待办事项', async () => {
      const response = await request(app)
        .delete(`/api/todos/${otherTodoId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('认证控制', () => {
    it('应该拒绝没有token的请求', async () => {
      const response = await request(app)
        .get('/api/todos');

      expect(response.status).toBe(401);
    });

    it('应该拒绝无效的token', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.status).toBe(401);
    });
  });
});
