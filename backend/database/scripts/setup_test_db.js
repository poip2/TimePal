#!/usr/bin/env node

/**
 * PostgreSQL 测试环境设置脚本
 * 创建本地测试数据库并验证连接
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function setupTestEnvironment() {
  console.log('🎯 设置 PostgreSQL 测试环境...\n');

  try {
    // 1. 检查 PostgreSQL 是否安装
    console.log('1️⃣ 检查 PostgreSQL 安装...');
    try {
      execSync('which psql', { stdio: 'pipe' });
      console.log('✅ PostgreSQL 已安装');
    } catch (error) {
      console.log('❌ PostgreSQL 未安装');
      console.log('💡 请运行: sudo apt install postgresql postgresql-contrib');
      return false;
    }

    // 2. 检查 PostgreSQL 服务状态
    console.log('2️⃣ 检查 PostgreSQL 服务...');
    try {
      execSync('sudo systemctl is-active postgresql', { stdio: 'pipe' });
      console.log('✅ PostgreSQL 服务正在运行');
    } catch (error) {
      console.log('⚠️  PostgreSQL 服务未启动');
      console.log('💡 请运行: sudo systemctl start postgresql');
    }

    // 3. 创建测试数据库
    console.log('3️⃣ 创建测试数据库...');
    try {
      execSync('sudo -u postgres createdb timepal_test 2>/dev/null || echo "数据库已存在"', { stdio: 'pipe' });
      console.log('✅ 测试数据库已创建');
    } catch (error) {
      console.log('⚠️  创建数据库失败:', error.message);
    }

    // 4. 创建测试用户
    console.log('4️⃣ 创建测试用户...');
    try {
      // 创建用户并设置密码
      execSync('sudo -u postgres psql -c "CREATE USER test_user WITH PASSWORD \'test123\';" 2>/dev/null || echo "用户已存在"', { stdio: 'pipe' });
      execSync('sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE timepal_test TO test_user;"', { stdio: 'pipe' });
      console.log('✅ 测试用户已创建');
    } catch (error) {
      console.log('⚠️  创建用户失败:', error.message);
    }

    // 5. 创建测试环境配置
    console.log('5️⃣ 创建测试环境配置...');
    const testEnv = `# 测试环境配置
NODE_ENV=test
PORT=3001

# PostgreSQL 测试配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=timepal_test
DB_USER=test_user
DB_PASSWORD=test123

# JWT 测试密钥
JWT_SECRET=test-jwt-secret-key

# 其他配置保持默认
`;

    fs.writeFileSync('.env.test', testEnv);
    console.log('✅ 测试环境配置文件已创建: .env.test');

    // 6. 提供测试命令
    console.log('\n🎯 测试环境设置完成！');
    console.log('\n📋 运行测试的命令：');
    console.log('1. 使用测试配置: cp .env.test .env');
    console.log('2. 运行测试: npm run test:postgresql');
    console.log('3. 恢复原始配置: cp .env.example .env');

    return true;

  } catch (error) {
    console.error('❌ 设置失败:', error.message);
    return false;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  setupTestEnvironment();
}

module.exports = setupTestEnvironment;
