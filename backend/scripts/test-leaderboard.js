const { sequelize, User, Friend } = require('../src/models');
const friendService = require('../src/services/friendService');
const bcrypt = require('bcryptjs');

async function testLeaderboard() {
  try {
    console.log('🚀 开始测试好友排行榜功能...');

    // 创建测试用户
    console.log('创建测试用户...');
    const users = await Promise.all([
      User.create({
        username: 'leader1',
        email: 'leader1@test.com',
        passwordHash: await bcrypt.hash('test123', 10),
        level: 20,
        experience: 2000,
        coins: 1000,
        gold: 2000,
        totalTasksCompleted: 100,
        streakHighest: 50,
        loginStreak: 15
      }),
      User.create({
        username: 'leader2',
        email: 'leader2@test.com',
        passwordHash: await bcrypt.hash('test123', 10),
        level: 15,
        experience: 1500,
        coins: 800,
        gold: 1500,
        totalTasksCompleted: 80,
        streakHighest: 40,
        loginStreak: 10
      }),
      User.create({
        username: 'leader3',
        email: 'leader3@test.com',
        passwordHash: await bcrypt.hash('test123', 10),
        level: 25,
        experience: 2500,
        coins: 1200,
        gold: 2500,
        totalTasksCompleted: 120,
        streakHighest: 60,
        loginStreak: 20
      }),
      User.create({
        username: 'leader4',
        email: 'leader4@test.com',
        passwordHash: await bcrypt.hash('test123', 10),
        level: 10,
        experience: 1000,
        coins: 500,
        gold: 1000,
        totalTasksCompleted: 60,
        streakHighest: 30,
        loginStreak: 5
      })
    ]);

    console.log(`✅ 创建了 ${users.length} 个测试用户`);

    // 创建好友关系（用户1的好友）
    console.log('创建好友关系...');
    await Friend.create({
      requesterId: users[0].id,
      addresseeId: users[1].id,
      status: 'accepted'
    });

    await Friend.create({
      requesterId: users[2].id,
      addresseeId: users[0].id,
      status: 'accepted'
    });

    await Friend.create({
      requesterId: users[0].id,
      addresseeId: users[3].id,
      status: 'accepted'
    });

    console.log('✅ 创建了好友关系');

    // 测试按等级排序
    console.log('\n📊 测试按等级排序...');
    const levelLeaderboard = await friendService.getFriendsLeaderboard(users[0].id, {
      sortBy: 'level',
      order: 'DESC',
      limit: 10
    });

    console.log('按等级排序结果:');
    levelLeaderboard.leaderboard.forEach((entry, index) => {
      console.log(`  ${index + 1}. ${entry.user.username} - 等级 ${entry.stats.level}`);
    });

    // 测试按金币排序
    console.log('\n💰 测试按金币排序...');
    const coinsLeaderboard = await friendService.getFriendsLeaderboard(users[0].id, {
      sortBy: 'coins',
      order: 'DESC'
    });

    console.log('按金币排序结果:');
    coinsLeaderboard.leaderboard.forEach((entry, index) => {
      console.log(`  ${index + 1}. ${entry.user.username} - 金币 ${entry.stats.coins}`);
    });

    // 测试按任务完成数排序
    console.log('\n📋 测试按任务完成数排序...');
    const tasksLeaderboard = await friendService.getFriendsLeaderboard(users[0].id, {
      sortBy: 'totalTasksCompleted',
      order: 'DESC'
    });

    console.log('按任务完成数排序结果:');
    tasksLeaderboard.leaderboard.forEach((entry, index) => {
      console.log(`  ${index + 1}. ${entry.user.username} - 完成任务 ${entry.stats.totalTasksCompleted}`);
    });

    // 测试限制返回数量
    console.log('\n🔢 测试限制返回数量...');
    const limitedLeaderboard = await friendService.getFriendsLeaderboard(users[0].id, {
      sortBy: 'level',
      limit: 2
    });

    console.log(`限制返回2条结果: ${limitedLeaderboard.leaderboard.length} 条`);

    // 测试用户排名
    console.log('\n🏆 测试用户排名...');
    console.log(`总好友数: ${levelLeaderboard.totalFriends}`);
    console.log(`排序字段: ${levelLeaderboard.sortBy}`);
    console.log(`排序顺序: ${levelLeaderboard.order}`);

    console.log('\n✅ 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await sequelize.close();
  }
}

// 运行测试
if (require.main === module) {
  testLeaderboard();
}

module.exports = testLeaderboard;
