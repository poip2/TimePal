#!/usr/bin/env node

/**
 * PostgreSQL 连接测试脚本
 * 验证数据库连接和基本功能
 */

const { Sequelize } = require('sequelize');
const User = require('../../src/models/User');

async function testPostgreSQL() {
  console.log('🧪 开始 PostgreSQL 连接测试...\n');

  try {
    // 测试数据库连接
    console.log('1️⃣ 测试数据库连接...');
    const sequelize = require('../../src/config/database');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 测试模型同步
    console.log('2️⃣ 测试模型同步...');
    await sequelize.sync({ force: false });
    console.log('✅ 模型同步成功\n');

    // 测试创建用户
    console.log('3️⃣ 测试创建用户...');
    const testUser = await User.create({
      username: 'testuser' + Date.now(),
      email: `test${Date.now()}@example.com`,
      passwordHash: 'testpassword123'
    });
    console.log('✅ 用户创建成功:', testUser.toJSON());
    console.log('');

    // 测试查询用户
    console.log('4️⃣ 测试查询用户...');
    const foundUser = await User.findByPk(testUser.id);
    console.log('✅ 用户查询成功:', foundUser.toJSON());
    console.log('');

    // 测试验证密码
    console.log('5️⃣ 测试密码验证...');
    const isValid = await foundUser.validatePassword('testpassword123');
    console.log('✅ 密码验证结果:', isValid);
    console.log('');

    // 测试更新用户
    console.log('6️⃣ 测试更新用户...');
    await foundUser.update({ level: 2, coins: 100 });
    console.log('✅ 用户更新成功\n');

    // 测试删除用户
    console.log('7️⃣ 测试删除用户...');
    await testUser.destroy();
    console.log('✅ 用户删除成功\n');

    // 显示数据库统计
    console.log('8️⃣ 数据库统计...');
    const userCount = await User.count();
    console.log('📊 当前用户总数:', userCount);
    console.log('');

    // 关闭连接
    await sequelize.close();

    console.log('🎉 所有测试通过！PostgreSQL 配置正确。');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testPostgreSQL();
}

module.exports = testPostgreSQL;
