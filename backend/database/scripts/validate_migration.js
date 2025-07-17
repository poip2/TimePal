#!/usr/bin/env node

/**
 * 数据库迁移验证脚本
 * 验证 PostgreSQL 配置和迁移文件的正确性
 */

const fs = require('fs');
const path = require('path');

async function validateMigration() {
  console.log('🔍 开始验证 PostgreSQL 迁移配置...\n');

  try {
    // 1. 验证配置文件
    console.log('1️⃣ 验证数据库配置文件...');
    const dbConfigPath = path.join(__dirname, '../../src/config/database.js');
    if (!fs.existsSync(dbConfigPath)) {
      throw new Error('数据库配置文件不存在');
    }

    const dbConfig = fs.readFileSync(dbConfigPath, 'utf8');
    if (!dbConfig.includes('dialect: \'postgres\'')) {
      throw new Error('PostgreSQL 配置未正确设置');
    }
    console.log('✅ 数据库配置文件验证通过');

    // 2. 验证迁移文件
    console.log('2️⃣ 验证 PostgreSQL 迁移文件...');
    const migrationPath = path.join(__dirname, '../migrations/001_create_users_table_postgresql.sql');
    if (!fs.existsSync(migrationPath)) {
      throw new Error('PostgreSQL 迁移文件不存在');
    }

    const migrationContent = fs.readFileSync(migrationPath, 'utf8');
    const requiredKeywords = ['CREATE TABLE', 'SERIAL', 'TIMESTAMP WITH TIME ZONE', 'PRIMARY KEY'];
    for (const keyword of requiredKeywords) {
      if (!migrationContent.includes(keyword)) {
        throw new Error(`迁移文件缺少必要的关键字: ${keyword}`);
      }
    }
    console.log('✅ PostgreSQL 迁移文件验证通过');

    // 3. 验证迁移脚本
    console.log('3️⃣ 验证数据迁移脚本...');
    const migrateScriptPath = path.join(__dirname, 'migrate_to_postgresql.js');
    if (!fs.existsSync(migrateScriptPath)) {
      throw new Error('数据迁移脚本不存在');
    }

    const migrateScript = fs.readFileSync(migrateScriptPath, 'utf8');
    if (!migrateScript.includes('Sequelize')) {
      throw new Error('数据迁移脚本格式不正确');
    }
    console.log('✅ 数据迁移脚本验证通过');

    // 4. 验证 package.json 脚本
    console.log('4️⃣ 验证 package.json 脚本...');
    const packagePath = path.join(__dirname, '../../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    const requiredScripts = ['migrate:postgresql', 'test:postgresql'];
    for (const script of requiredScripts) {
      if (!packageJson.scripts[script]) {
        throw new Error(`package.json 缺少脚本: ${script}`);
      }
    }
    console.log('✅ package.json 脚本验证通过');

    // 5. 验证模型兼容性
    console.log('5️⃣ 验证数据模型兼容性...');
    const userModelPath = path.join(__dirname, '../../src/models/User.js');
    const userModel = fs.readFileSync(userModelPath, 'utf8');

    const modelChecks = ['DataTypes.INTEGER', 'DataTypes.STRING', 'DataTypes.BOOLEAN', 'DataTypes.DATE'];
    for (const check of modelChecks) {
      if (!userModel.includes(check)) {
        throw new Error(`数据模型缺少必要的类型: ${check}`);
      }
    }
    console.log('✅ 数据模型兼容性验证通过');

    // 6. 检查 SQLite 数据
    console.log('6️⃣ 检查 SQLite 数据...');
    const sqlitePath = path.join(__dirname, '../timepal_dev.sqlite');
    if (fs.existsSync(sqlitePath)) {
      const stats = fs.statSync(sqlitePath);
      console.log(`✅ 找到 SQLite 数据库文件 (${Math.round(stats.size / 1024)}KB)`);
    } else {
      console.log('ℹ️  未找到 SQLite 数据库文件，将创建空数据库');
    }

    // 7. 验证 Docker 配置
    console.log('7️⃣ 验证 Docker 配置...');
    const dockerComposePath = path.join(__dirname, '../../docker-compose.yml');
    if (fs.existsSync(dockerComposePath)) {
      const dockerCompose = fs.readFileSync(dockerComposePath, 'utf8');
      if (dockerCompose.includes('postgres:') && dockerCompose.includes('image: postgres')) {
        console.log('✅ Docker 配置验证通过');
      } else {
        console.log('⚠️  Docker 配置可能需要检查');
      }
    }

    // 8. 提供测试命令
    console.log('\n🎯 验证完成！以下是测试 PostgreSQL 的命令：\n');
    console.log('📋 本地 PostgreSQL 测试步骤：');
    console.log('1. 安装 PostgreSQL: sudo apt install postgresql postgresql-contrib');
    console.log('2. 创建数据库: sudo -u postgres createdb timepal_dev');
    console.log('3. 创建用户: sudo -u postgres createuser -P timepal_user');
    console.log('4. 授权: sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE timepal_dev TO timepal_user;"');
    console.log('5. 更新 .env 文件配置');
    console.log('6. 运行测试: npm run test:postgresql');
    console.log('');
    console.log('🐳 Docker 测试步骤：');
    console.log('1. 安装 Docker: sudo apt install docker.io docker-compose');
    console.log('2. 启动服务: docker-compose up -d postgres');
    console.log('3. 等待服务启动: docker-compose logs postgres');
    console.log('4. 运行测试: npm run test:postgresql');
    console.log('');
    console.log('🎉 所有验证通过！迁移配置已就绪。');

  } catch (error) {
    console.error('❌ 验证失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  validateMigration();
}

module.exports = validateMigration;
