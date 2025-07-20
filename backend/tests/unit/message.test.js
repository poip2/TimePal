const { Message, User, Friend } = require('../../src/models');
const { sequelize } = require('../../src/models');
const bcrypt = require('bcryptjs');

describe('Message Model Unit Tests', () => {
  let user1, user2, user3;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // 创建测试用户
    user1 = await User.create({
      username: 'testuser1',
      email: 'test1@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      level: 10,
      experience: 1000
    });

    user2 = await User.create({
      username: 'testuser2',
      email: 'test2@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      level: 15,
      experience: 1500
    });

    user3 = await User.create({
      username: 'testuser3',
      email: 'test3@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      level: 8,
      experience: 800
    });

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
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await Message.destroy({ where: {} });
  });

  describe('sendMessage', () => {
    test('应该成功发送消息', async () => {
      const message = await Message.sendMessage(user1.id, user2.id, 'Hello, friend!');

      expect(message).toBeDefined();
      expect(message.senderId).toBe(user1.id);
      expect(message.receiverId).toBe(user2.id);
      expect(message.content).toBe('Hello, friend!');
      expect(message.status).toBe('sent');
    });

    test('应该拒绝向自己发送消息', async () => {
      await expect(
        Message.sendMessage(user1.id, user1.id, 'Hello myself')
      ).rejects.toThrow('Cannot send message to yourself');
    });

    test('应该拒绝不存在的用户', async () => {
      await expect(
        Message.sendMessage(user1.id, 99999, 'Hello')
      ).rejects.toThrow('User not found');
    });

    test('应该拒绝非好友之间的消息', async () => {
      const newUser = await User.create({
        username: 'stranger',
        email: 'stranger@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        level: 5,
        experience: 500
      });

      await expect(
        Message.sendMessage(user1.id, newUser.id, 'Hello stranger')
      ).rejects.toThrow('You can only send messages to friends');
    });

    test('应该拒绝空消息内容', async () => {
      await expect(
        Message.sendMessage(user1.id, user2.id, '')
      ).rejects.toThrow('Message content cannot be empty');
    });

    test('应该拒绝过长的消息内容', async () => {
      const longContent = 'a'.repeat(2001);
      await expect(
        Message.sendMessage(user1.id, user2.id, longContent)
      ).rejects.toThrow('Message content is too long (max 2000 characters)');
    });

    test('应该处理包含特殊字符的消息', async () => {
      const specialContent = 'Hello! @#$%^&*()_+{}[]|\\:;"<>,.?/';
      const message = await Message.sendMessage(user1.id, user2.id, specialContent);

      expect(message.content).toBe(specialContent);
    });

    test('应该处理包含emoji的消息', async () => {
      const emojiContent = 'Hello! 😊🎉👍';
      const message = await Message.sendMessage(user1.id, user2.id, emojiContent);

      expect(message.content).toBe(emojiContent);
    });
  });

  describe('getUserMessages', () => {
    beforeEach(async () => {
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

      await Message.create({
        senderId: user1.id,
        receiverId: user3.id,
        content: 'Message 3',
        status: 'read'
      });
    });

    test('应该返回用户的所有消息', async () => {
      const messages = await Message.getUserMessages(user1.id);

      expect(messages).toHaveLength(3);
      expect(messages[0]).toHaveProperty('sender');
      expect(messages[0]).toHaveProperty('receiver');
    });

    test('应该支持按状态过滤', async () => {
      const sentMessages = await Message.getUserMessages(user1.id, { status: 'sent' });
      expect(sentMessages).toHaveLength(1);
      expect(sentMessages[0].status).toBe('sent');

      const deliveredMessages = await Message.getUserMessages(user1.id, { status: 'delivered' });
      expect(deliveredMessages).toHaveLength(1);
      expect(deliveredMessages[0].status).toBe('delivered');
    });

    test('应该支持分页查询', async () => {
      const messages = await Message.getUserMessages(user1.id, { limit: 2, offset: 0 });
      expect(messages).toHaveLength(2);
    });

    test('应该按创建时间降序排序', async () => {
      const messages = await Message.getUserMessages(user1.id);

      expect(messages[0].createdAt.getTime()).toBeGreaterThanOrEqual(
        messages[1].createdAt.getTime()
      );
    });

    test('应该支持排除已删除的消息', async () => {
      const message = await Message.findOne();
      message.isDeleted = true;
      await message.save();

      const messages = await Message.getUserMessages(user1.id);
      expect(messages).toHaveLength(2);
    });
  });

  describe('getConversation', () => {
    beforeEach(async () => {
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

    test('应该返回与特定好友的对话', async () => {
      const conversation = await Message.getConversation(user1.id, user2.id);

      expect(conversation).toHaveLength(3);
      expect(conversation[0].content).toBe('Hello');
      expect(conversation[1].content).toBe('Hi there');
      expect(conversation[2].content).toBe('How are you?');
    });

    test('应该按创建时间升序排序', async () => {
      const conversation = await Message.getConversation(user1.id, user2.id);

      expect(conversation[0].createdAt.getTime()).toBeLessThanOrEqual(
        conversation[1].createdAt.getTime()
      );
    });

    test('应该支持分页查询', async () => {
      const conversation = await Message.getConversation(user1.id, user2.id, { limit: 2 });
      expect(conversation).toHaveLength(2);
    });

    test('应该排除与其他用户的对话', async () => {
      await Message.create({
        senderId: user1.id,
        receiverId: user3.id,
        content: 'Different conversation',
        status: 'sent'
      });

      const conversation = await Message.getConversation(user1.id, user2.id);
      expect(conversation).toHaveLength(3);
      expect(conversation).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ content: 'Different conversation' })
        ])
      );
    });

    test('应该排除已删除的消息', async () => {
      const message = await Message.findOne({ where: { content: 'Hello' } });
      message.isDeleted = true;
      await message.save();

      const conversation = await Message.getConversation(user1.id, user2.id);
      expect(conversation).toHaveLength(2);
    });
  });

  describe('markAsRead', () => {
    test('应该成功标记消息为已读', async () => {
      const message = await Message.create({
        senderId: user1.id,
        receiverId: user2.id,
        content: 'Test message',
        status: 'sent'
      });

      const updatedMessage = await Message.markAsRead(message.id, user2.id);

      expect(updatedMessage.status).toBe('read');
    });

    test('应该拒绝不存在的消息', async () => {
      await expect(
        Message.markAsRead(99999, user2.id)
      ).rejects.toThrow('Message not found');
    });

    test('应该拒绝非接收者的标记请求', async () => {
      const message = await Message.create({
        senderId: user1.id,
        receiverId: user2.id,
        content: 'Test message',
        status: 'sent'
      });

      await expect(
        Message.markAsRead(message.id, user3.id)
      ).rejects.toThrow('Unauthorized to mark this message as read');
    });

    test('应该处理已经是已读状态的消息', async () => {
      const message = await Message.create({
        senderId: user1.id,
        receiverId: user2.id,
        content: 'Test message',
        status: 'read'
      });

      const updatedMessage = await Message.markAsRead(message.id, user2.id);
      expect(updatedMessage.status).toBe('read');
    });
  });

  describe('markAsDelivered', () => {
    test('应该成功标记消息为已送达', async () => {
      const message = await Message.create({
        senderId: user1.id,
        receiverId: user2.id,
        content: 'Test message',
        status: 'sent'
      });

      const updatedMessage = await Message.markAsDelivered(message.id, user2.id);

      expect(updatedMessage.status).toBe('delivered');
    });

    test('应该跳过非已发送状态的消息', async () => {
      const message = await Message.create({
        senderId: user1.id,
        receiverId: user2.id,
        content: 'Test message',
        status: 'read'
      });

      const updatedMessage = await Message.markAsDelivered(message.id, user2.id);
      expect(updatedMessage.status).toBe('read');
    });
  });

  describe('deleteMessage', () => {
    test('应该成功软删除消息', async () => {
      const message = await Message.create({
        senderId: user1.id,
        receiverId: user2.id,
        content: 'Test message',
        status: 'sent'
      });

      const deletedMessage = await Message.deleteMessage(message.id, user1.id);

      expect(deletedMessage.isDeleted).toBe(true);
      expect(deletedMessage.deletedAt).toBeDefined();
    });

    test('应该允许接收者删除消息', async () => {
      const message = await Message.create({
        senderId: user1.id,
        receiverId: user2.id,
        content: 'Test message',
        status: 'sent'
      });

      const deletedMessage = await Message.deleteMessage(message.id, user2.id);
      expect(deletedMessage.isDeleted).toBe(true);
    });

    test('应该拒绝非相关用户的删除请求', async () => {
      const message = await Message.create({
        senderId: user1.id,
        receiverId: user2.id,
        content: 'Test message',
        status: 'sent'
      });

      await expect(
        Message.deleteMessage(message.id, user3.id)
      ).rejects.toThrow('Unauthorized to delete this message');
    });

    test('应该拒绝不存在的消息', async () => {
      await expect(
        Message.deleteMessage(99999, user1.id)
      ).rejects.toThrow('Message not found');
    });
  });

  describe('getUnreadCount', () => {
    test('应该正确统计未读消息数量', async () => {
      expect(await Message.getUnreadCount(user1.id)).toBe(0);

      await Message.create({
        senderId: user2.id,
        receiverId: user1.id,
        content: 'Unread message 1',
        status: 'sent'
      });

      await Message.create({
        senderId: user3.id,
        receiverId: user1.id,
        content: 'Unread message 2',
        status: 'sent'
      });

      await Message.create({
        senderId: user1.id,
        receiverId: user2.id,
        content: 'Sent by me',
        status: 'sent'
      });

      expect(await Message.getUnreadCount(user1.id)).toBe(2);
    });

    test('应该排除已读和已删除的消息', async () => {
      await Message.create({
        senderId: user2.id,
        receiverId: user1.id,
        content: 'Read message',
        status: 'read'
      });

      const deletedMessage = await Message.create({
        senderId: user3.id,
        receiverId: user1.id,
        content: 'Deleted message',
        status: 'sent'
      });

      deletedMessage.isDeleted = true;
      await deletedMessage.save();

      expect(await Message.getUnreadCount(user1.id)).toBe(0);
    });
  });

  describe('getUnreadCountFromFriend', () => {
    test('应该正确统计来自特定好友的未读消息', async () => {
      expect(await Message.getUnreadCountFromFriend(user1.id, user2.id)).toBe(0);

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

      expect(await Message.getUnreadCountFromFriend(user1.id, user2.id)).toBe(1);
      expect(await Message.getUnreadCountFromFriend(user1.id, user3.id)).toBe(1);
    });
  });

  describe('markConversationAsRead', () => {
    test('应该成功标记对话中的所有消息为已读', async () => {
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

      await Message.create({
        senderId: user1.id,
        receiverId: user2.id,
        content: 'Message 3',
        status: 'sent'
      });

      const updatedCount = await Message.markConversationAsRead(user1.id, user2.id);
      expect(updatedCount).toBe(2);

      const messages = await Message.findAll({
        where: { senderId: user2.id, receiverId: user1.id }
      });

      messages.forEach(message => {
        expect(message.status).toBe('read');
      });
    });

    test('应该只标记未读的消息', async () => {
      await Message.create({
        senderId: user2.id,
        receiverId: user1.id,
        content: 'Already read',
        status: 'read'
      });

      await Message.create({
        senderId: user2.id,
        receiverId: user1.id,
        content: 'Unread',
        status: 'sent'
      });

      const updatedCount = await Message.markConversationAsRead(user1.id, user2.id);
      expect(updatedCount).toBe(1);
    });
  });
});
