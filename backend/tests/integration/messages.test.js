const request = require('supertest');
const app = require('../../src/server');
const { sequelize, User, Friend, Message } = require('../../src/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('消息功能集成测试', () => {
  let user1, user2, user3;
  let token1, token2, token3;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // 创建测试用户
    user1 = await User.create({
      username: 'testuser1',
      email: 'test1@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      level: 10,
      experience: 1000,
      coins: 500,
      gold: 1000
    });

    user2 = await User.create({
      username: 'testuser2',
      email: 'test2@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      level: 15,
      experience: 1500,
      coins: 800,
      gold: 1500
    });

    user3 = await User.create({
      username: 'testuser3',
      email: 'test3@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      level: 8,
      experience: 800,
      coins: 300,
      gold: 800
    });

    // 生成token
    token1 = jwt.sign(
      { id: user1.id, username: user1.username },
      process.env.JWT_SECRET || 'test-secret'
    );

    token2 = jwt.sign(
      { id: user2.id, username: user2.username },
      process.env.JWT_SECRET || 'test-secret'
    );

    token3 = jwt.sign(
      { id: user3.id, username: user3.username },
      process.env.JWT_SECRET || 'test-secret'
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await Message.destroy({ where: {} });
    await Friend.destroy({ where: {} });
  });

  describe('POST /api/messages', () => {
    beforeEach(async () => {
      // 创建好友关系
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });
    });

    test('应该成功发送消息', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          receiverId: user2.id,
          content: 'Hello, friend!'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.content).toBe('Hello, friend!');
      expect(response.body.data.status).toBe('sent');
    });

    test('应该拒绝未认证的请求', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          receiverId: user2.id,
          content: 'Hello'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('应该拒绝向自己发送消息', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          receiverId: user1.id,
          content: 'Hello myself'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Cannot send message to yourself');
    });

    test('应该拒绝不存在的用户', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          receiverId: 99999,
          content: 'Hello'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('应该拒绝非好友之间的消息', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          receiverId: user3.id,
          content: 'Hello stranger'
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('You can only send messages to friends');
    });

    test('应该拒绝空消息内容', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          receiverId: user2.id,
          content: ''
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('应该拒绝过长的消息内容', async () => {
      const longContent = 'a'.repeat(2001);
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          receiverId: user2.id,
          content: longContent
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('应该拒绝缺少必需参数', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token1}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/messages', () => {
    beforeEach(async () => {
      // 创建好友关系
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      // 创建测试消息
      await Message.create({
        senderId: user1.id,
        receiverId: user2.id,
        content: 'Message 1',
        status: 'sent'
      });

      await Message.create({
        senderId: user2.id,
        receiverId: user1.id,
        content: 'Message 2',
        status: 'delivered'
      });
    });

    test('应该成功获取用户消息', async () => {
      const response = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(2);
    });

    test('应该支持按状态过滤', async () => {
      const response = await request(app)
        .get('/api/messages?status=sent')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(1);
      expect(response.body.data.messages[0].status).toBe('sent');
    });

    test('应该支持分页查询', async () => {
      const response = await request(app)
        .get('/api/messages?limit=1&offset=0')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(1);
    });

    test('应该支持排序', async () => {
      const response = await request(app)
        .get('/api/messages?sortBy=createdAt&order=ASC')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.messages)).toBe(true);
    });

    test('应该拒绝未认证的请求', async () => {
      const response = await request(app)
        .get('/api/messages')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('应该处理无效排序字段', async () => {
      const response = await request(app)
        .get('/api/messages?sortBy=invalidField')
        .set('Authorization', `Bearer ${token1}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/messages/conversation/:friendId', () => {
    beforeEach(async () => {
      // 创建好友关系
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      // 创建对话消息
      await Message.create({
        senderId: user1.id,
        receiverId: user2.id,
        content: 'Hello',
        status: 'sent'
      });

      await Message.create({
        senderId: user2.id,
        receiverId: user1.id,
        content: 'Hi there',
        status: 'delivered'
      });

      await Message.create({
        senderId: user1.id,
        receiverId: user2.id,
        content: 'How are you?',
        status: 'read'
      });
    });

    test('应该成功获取与好友的对话', async () => {
      const response = await request(app)
        .get(`/api/messages/conversation/${user2.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(3);
      expect(response.body.data.messages[0].content).toBe('Hello');
    });

    test('应该按创建时间升序排序', async () => {
      const response = await request(app)
        .get(`/api/messages/conversation/${user2.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      const messages = response.body.data.messages;
      expect(new Date(messages[0].createdAt).getTime()).toBeLessThanOrEqual(new Date(messages[1].createdAt).getTime());
    });

    test('应该支持分页查询', async () => {
      const response = await request(app)
        .get(`/api/messages/conversation/${user2.id}?limit=2`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(2);
    });

    test('应该支持时间范围过滤', async () => {
      const now = new Date();
      const past = new Date(now.getTime() - 1000);

      const response = await request(app)
        .get(`/api/messages/conversation/${user2.id}?after=${past.toISOString()}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(3);
    });

    test('应该拒绝未认证的请求', async () => {
      const response = await request(app)
        .get(`/api/messages/conversation/${user2.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('应该拒绝非好友之间的对话', async () => {
      const response = await request(app)
        .get(`/api/messages/conversation/${user3.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('应该拒绝不存在的用户', async () => {
      const response = await request(app)
        .get('/api/messages/conversation/99999')
        .set('Authorization', `Bearer ${token1}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/messages/:id/read', () => {
    let message;

    beforeEach(async () => {
      // 创建好友关系
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      // 创建消息
      message = await Message.create({
        senderId: user1.id,
        receiverId: user2.id,
        content: 'Test message',
        status: 'sent'
      });
    });

    test('应该成功标记消息为已读', async () => {
      const response = await request(app)
        .put(`/api/messages/${message.id}/read`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('read');
    });

    test('应该拒绝非接收者的标记请求', async () => {
      const response = await request(app)
        .put(`/api/messages/${message.id}/read`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('应该拒绝不存在的消息', async () => {
      const response = await request(app)
        .put('/api/messages/99999/read')
        .set('Authorization', `Bearer ${token2}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('应该拒绝未认证的请求', async () => {
      const response = await request(app)
        .put(`/api/messages/${message.id}/read`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/messages/conversation/:friendId/read', () => {
    beforeEach(async () => {
      // 创建好友关系
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      // 创建多条未读消息
      await Message.create({
        senderId: user2.id,
        receiverId: user1.id,
        content: 'Message 1',
        status: 'sent'
      });

      await Message.create({
        senderId: user2.id,
        receiverId: user1.id,
        content: 'Message 2',
        status: 'sent'
      });
    });

    test('应该成功标记对话中的所有消息为已读', async () => {
      const response = await request(app)
        .put(`/api/messages/conversation/${user2.id}/read`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.updatedCount).toBe(2);
    });

    test('应该拒绝非好友之间的对话', async () => {
      const response = await request(app)
        .put(`/api/messages/conversation/${user3.id}/read`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('应该拒绝未认证的请求', async () => {
      const response = await request(app)
        .put(`/api/messages/conversation/${user2.id}/read`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/messages/:id', () => {
    let message;

    beforeEach(async () => {
      // 创建好友关系
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      // 创建消息
      message = await Message.create({
        senderId: user1.id,
        receiverId: user2.id,
        content: 'Test message',
        status: 'sent'
      });
    });

    test('应该成功软删除消息（发送者）', async () => {
      const response = await request(app)
        .delete(`/api/messages/${message.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isDeleted).toBe(true);
    });

    test('应该成功软删除消息（接收者）', async () => {
      const response = await request(app)
        .delete(`/api/messages/${message.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isDeleted).toBe(true);
    });

    test('应该拒绝非相关用户的删除请求', async () => {
      const response = await request(app)
        .delete(`/api/messages/${message.id}`)
        .set('Authorization', `Bearer ${token3}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('应该拒绝不存在的消息', async () => {
      const response = await request(app)
        .delete('/api/messages/99999')
        .set('Authorization', `Bearer ${token1}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('应该拒绝未认证的请求', async () => {
      const response = await request(app)
        .delete(`/api/messages/${message.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/messages/unread-count', () => {
    beforeEach(async () => {
      // 创建好友关系
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      // 创建未读消息
      await Message.create({
        senderId: user2.id,
        receiverId: user1.id,
        content: 'Unread message 1',
        status: 'sent'
      });

      await Message.create({
        senderId: user2.id,
        receiverId: user1.id,
        content: 'Unread message 2',
        status: 'sent'
      });
    });

    test('应该成功获取未读消息数量', async () => {
      const response = await request(app)
        .get('/api/messages/unread-count')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.unreadCount).toBe(2);
    });

    test('应该拒绝未认证的请求', async () => {
      const response = await request(app)
        .get('/api/messages/unread-count')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/messages/unread-count/:friendId', () => {
    beforeEach(async () => {
      // 创建好友关系
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      // 创建未读消息
      await Message.create({
        senderId: user2.id,
        receiverId: user1.id,
        content: 'Unread from friend 2',
        status: 'sent'
      });

      await Message.create({
        senderId: user3.id,
        receiverId: user1.id,
        content: 'Unread from friend 3',
        status: 'sent'
      });
    });

    test('应该成功获取来自特定好友的未读消息数量', async () => {
      const response = await request(app)
        .get(`/api/messages/unread-count/${user2.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.unreadCount).toBe(1);
    });

    test('应该拒绝非好友之间的查询', async () => {
      const response = await request(app)
        .get(`/api/messages/unread-count/${user3.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('应该拒绝未认证的请求', async () => {
      const response = await request(app)
        .get(`/api/messages/unread-count/${user2.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/messages/overview', () => {
    beforeEach(async () => {
      // 创建好友关系
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      await Friend.create({
        requesterId: user1.id,
        addresseeId: user3.id,
        status: 'accepted'
      });

      // 创建消息
      await Message.create({
        senderId: user2.id,
        receiverId: user1.id,
        content: 'Hello from user2',
        status: 'sent'
      });

      await Message.create({
        senderId: user1.id,
        receiverId: user3.id,
        content: 'Hello to user3',
        status: 'sent'
      });
    });

    test('应该成功获取消息概览', async () => {
      const response = await request(app)
        .get('/api/messages/overview')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalUnread');
      expect(response.body.data).toHaveProperty('recentConversations');
      expect(response.body.data.totalUnread).toBe(1);
      expect(Array.isArray(response.body.data.recentConversations)).toBe(true);
    });

    test('应该拒绝未认证的请求', async () => {
      const response = await request(app)
        .get('/api/messages/overview')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/messages/search', () => {
    beforeEach(async () => {
      // 创建好友关系
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      // 创建消息
      await Message.create({
        senderId: user1.id,
        receiverId: user2.id,
        content: 'Hello world',
        status: 'sent'
      });

      await Message.create({
        senderId: user2.id,
        receiverId: user1.id,
        content: 'Goodbye world',
        status: 'delivered'
      });
    });

    test('应该成功搜索消息', async () => {
      const response = await request(app)
        .get('/api/messages/search?q=world')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(2);
    });

    test('应该支持模糊搜索', async () => {
      const response = await request(app)
        .get('/api/messages/search?q=hello')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(1);
      expect(response.body.data.messages[0].content).toBe('Hello world');
    });

    test('应该返回空数组当没有匹配的消息', async () => {
      const response = await request(app)
        .get('/api/messages/search?q=nonexistent')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(0);
    });

    test('应该支持分页查询', async () => {
      for (let i = 0; i < 10; i++) {
        await Message.create({
          senderId: user1.id,
          receiverId: user2.id,
          content: `Test message ${i}`,
          status: 'sent'
        });
      }

      const response = await request(app)
        .get('/api/messages/search?q=Test&limit=5')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(5);
    });

    test('应该拒绝空搜索词', async () => {
      const response = await request(app)
        .get('/api/messages/search?q=')
        .set('Authorization', `Bearer ${token1}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('应该拒绝未认证的请求', async () => {
      const response = await request(app)
        .get('/api/messages/search?q=test')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('边界条件和错误处理', () => {
    test('应该处理无效的参数类型', async () => {
      const response = await request(app)
        .get('/api/messages/conversation/invalid')
        .set('Authorization', `Bearer ${token1}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('应该处理数据库错误', async () => {
      // 模拟数据库错误
      jest.spyOn(Message, 'findAll').mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${token1}`)
        .expect(500);

      expect(response.body.success).toBe(false);

      // 恢复原始实现
      Message.findAll.mockRestore();
    });

    test('应该处理消息并发更新', async () => {
      // 创建好友关系
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      const message = await Message.create({
        senderId: user1.id,
        receiverId: user2.id,
        content: 'Test message',
        status: 'sent'
      });

      // 并发标记为已读
      const promises = [
        request(app)
          .put(`/api/messages/${message.id}/read`)
          .set('Authorization', `Bearer ${token2}`),
        request(app)
          .put(`/api/messages/${message.id}/read`)
          .set('Authorization', `Bearer ${token2}`)
      ];

      const results = await Promise.all(promises);

      // 至少一个应该成功
      const successCount = results.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('实时消息功能', () => {
    test('应该支持消息状态更新', async () => {
      // 创建好友关系
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      // 发送消息
      const sendResponse = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          receiverId: user2.id,
          content: 'Test message'
        });

      const messageId = sendResponse.body.data.id;

      // 标记为已读
      await request(app)
        .put(`/api/messages/${messageId}/read`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      // 验证状态更新
      const message = await Message.findByPk(messageId);
      expect(message.status).toBe('read');
    });

    test('应该支持批量标记已读', async () => {
      // 创建好友关系
      await Friend.create({
        requesterId: user1.id,
        addresseeId: user2.id,
        status: 'accepted'
      });

      // 创建多条消息
      await Message.create({
        senderId: user2.id,
        receiverId: user1.id,
        content: 'Message 1',
        status: 'sent'
      });

      await Message.create({
        senderId: user2.id,
        receiverId: user1.id,
        content: 'Message 2',
        status: 'sent'
      });

      // 批量标记为已读
      const response = await request(app)
        .put(`/api/messages/conversation/${user2.id}/read`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.updatedCount).toBe(2);

      // 验证所有消息状态
      const messages = await Message.findAll({
        where: { senderId: user2.id, receiverId: user1.id }
      });

      messages.forEach(msg => {
        expect(msg.status).toBe('read');
      });
    });
  });
});
