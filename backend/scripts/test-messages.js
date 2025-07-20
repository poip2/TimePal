const { sequelize, User, Friend, Message, syncDatabase } = require('../src/models');
const messageService = require('../src/services/messageService');

async function testMessageSystem() {
  console.log('🚀 开始测试好友消息系统...\n');

  try {
    // 确保数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 同步数据库
    await syncDatabase();
    console.log('✅ 数据库同步完成');

    // 创建测试用户
    const user1 = await User.create({
      username: 'testuser1',
      email: 'test1@example.com',
      passwordHash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // bcrypt hash of 'password'
      avatarUrl: 'https://example.com/avatar1.jpg'
    });

    const user2 = await User.create({
      username: 'testuser2',
      email: 'test2@example.com',
      passwordHash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // bcrypt hash of 'password'
      avatarUrl: 'https://example.com/avatar2.jpg'
    });

    console.log(`✅ 创建测试用户: ${user1.username} (ID: ${user1.id}), ${user2.username} (ID: ${user2.id})`);

    // 创建好友关系
    await Friend.create({
      requesterId: user1.id,
      addresseeId: user2.id,
      status: 'accepted'
    });

    console.log('✅ 创建好友关系');

    // 测试1: 发送消息
    console.log('\n📧 测试1: 发送消息');
    const message1 = await messageService.sendMessage(user1.id, user2.id, '你好，这是第一条测试消息！');
    console.log(`✅ 消息发送成功: ${message1.content}`);

    const message2 = await messageService.sendMessage(user2.id, user1.id, '你好！收到你的消息了。');
    console.log(`✅ 回复消息发送成功: ${message2.content}`);

    const message3 = await messageService.sendMessage(user1.id, user2.id, '很高兴认识你！');
    console.log(`✅ 第三条消息发送成功: ${message3.content}`);

    // 测试2: 获取消息列表
    console.log('\n📋 测试2: 获取用户消息列表');
    const user1Messages = await messageService.getMessages(user1.id);
    console.log(`✅ 用户1消息数量: ${user1Messages.length}`);

    const user2Messages = await messageService.getMessages(user2.id);
    console.log(`✅ 用户2消息数量: ${user2Messages.length}`);

    // 测试3: 获取对话历史
    console.log('\n💬 测试3: 获取对话历史');
    const conversation = await messageService.getConversation(user1.id, user2.id);
    console.log(`✅ 对话消息数量: ${conversation.length}`);
    conversation.forEach(msg => {
      console.log(`  ${msg.sender.username}: ${msg.content}`);
    });

    // 测试4: 标记消息为已读
    console.log('\n👁️ 测试4: 标记消息为已读');
    const markedMessage = await messageService.markAsRead(message1.id, user2.id);
    console.log(`✅ 消息状态更新为: ${markedMessage.status}`);

    // 测试5: 获取未读消息数量
    console.log('\n📊 测试5: 获取未读消息数量');
    const unreadCount1 = await messageService.getUnreadCount(user1.id);
    console.log(`✅ 用户1未读消息: ${unreadCount1}`);

    const unreadCount2 = await messageService.getUnreadCount(user2.id);
    console.log(`✅ 用户2未读消息: ${unreadCount2}`);

    const unreadFromFriend = await messageService.getUnreadCountFromFriend(user1.id, user2.id);
    console.log(`✅ 用户1来自用户2的未读消息: ${unreadFromFriend}`);

    // 测试6: 标记对话为已读
    console.log('\n📖 测试6: 标记对话为已读');
    const markedCount = await messageService.markConversationAsRead(user2.id, user1.id);
    console.log(`✅ 标记了 ${markedCount} 条消息为已读`);

    // 测试7: 搜索消息
    console.log('\n🔍 测试7: 搜索消息');
    const searchResults = await messageService.searchMessages(user1.id, '测试');
    console.log(`✅ 搜索结果数量: ${searchResults.length}`);

    // 测试8: 获取消息概览
    console.log('\n📈 测试8: 获取消息概览');
    const overview = await messageService.getMessageOverview(user1.id);
    console.log(`✅ 消息概览 - 未读总数: ${overview.totalUnread}`);
    console.log(`✅ 最近对话数量: ${overview.recentConversations.length}`);

    // 测试9: 删除消息
    console.log('\n🗑️ 测试9: 删除消息');
    const deletedMessage = await messageService.deleteMessage(message3.id, user1.id);
    console.log(`✅ 消息已删除: ${deletedMessage.isDeleted}`);

    // 测试10: 验证删除后的查询
    console.log('\n✅ 测试10: 验证删除后的查询');
    const conversationAfterDelete = await messageService.getConversation(user1.id, user2.id);
    console.log(`✅ 删除后对话消息数量: ${conversationAfterDelete.length}`);

    console.log('\n🎉 所有测试完成！消息系统功能正常。');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    // 清理测试数据
    try {
      await Message.destroy({ where: {} });
      await Friend.destroy({ where: {} });
      await User.destroy({ where: { email: ['test1@example.com', 'test2@example.com'] } });
      console.log('🧹 测试数据已清理');
    } catch (cleanupError) {
      console.error('清理测试数据失败:', cleanupError);
    }

    await sequelize.close();
    console.log('🔒 数据库连接已关闭');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testMessageSystem();
}

module.exports = testMessageSystem;
