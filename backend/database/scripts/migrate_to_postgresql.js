#!/usr/bin/env node

/**
 * PostgreSQL迁移脚本
 * 从SQLite迁移数据到PostgreSQL
 */

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// PostgreSQL连接配置
const postgresConfig = {
  database: process.env.DB_NAME || 'timepal_dev',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: console.log
};

// SQLite连接配置（源数据库）
const sqliteConfig = {
  dialect: 'sqlite',
  storage: './database/timepal_dev.sqlite',
  logging: false
};

async function migrateData() {
  console.log('🚀 开始数据库迁移...');

  try {
    // 创建数据库连接
    const sqliteDb = new Sequelize(sqliteConfig);
    const postgresDb = new Sequelize(
      postgresConfig.database,
      postgresConfig.username,
      postgresConfig.password,
      {
        host: postgresConfig.host,
        port: postgresConfig.port,
        dialect: postgresConfig.dialect,
        logging: postgresConfig.logging
      }
    );

    // 测试PostgreSQL连接
    console.log('🔍 测试PostgreSQL连接...');
    await postgresDb.authenticate();
    console.log('✅ PostgreSQL连接成功');

    // 读取并执行PostgreSQL初始化脚本
    console.log('📋 初始化PostgreSQL表结构...');
    const initScript = fs.readFileSync(
      path.join(__dirname, '../migrations/001_create_users_table_postgresql.sql'),
      'utf8'
    );

    // 分割SQL语句并逐条执行
    const statements = initScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('COMMENT'));

    for (const statement of statements) {
      try {
        await postgresDb.query(statement);
      } catch (error) {
        // 忽略已存在的表错误
        if (!error.message.includes('already exists')) {
          console.warn(`⚠️  执行SQL警告: ${error.message}`);
        }
      }
    }
    console.log('✅ PostgreSQL表结构初始化完成');

    // 获取SQLite中的数据
    console.log('📊 从SQLite读取数据...');
    const users = await sqliteDb.query('SELECT * FROM users', { type: Sequelize.QueryTypes.SELECT });
    console.log(`📈 找到 ${users.length} 条用户记录`);

    if (users.length > 0) {
      // 批量插入数据到PostgreSQL
      console.log('📝 插入数据到PostgreSQL...');

      // 使用事务确保数据一致性
      await postgresDb.transaction(async (t) => {
        for (const user of users) {
          await postgresDb.query(
            `INSERT INTO users (
              id, username, email, password_hash, avatar_url,
              level, experience, coins, is_active, created_at, updated_at
            ) VALUES (
              $id, $username, $email, $password_hash, $avatar_url,
              $level, $experience, $coins, $is_active, $created_at, $updated_at
            )`,
            {
              bind: {
                id: user.id,
                username: user.username,
                email: user.email,
                password_hash: user.password_hash,
                avatar_url: user.avatar_url,
                level: user.level,
                experience: user.experience,
                coins: user.coins,
                is_active: user.is_active,
                created_at: user.created_at,
                updated_at: user.updated_at
              },
              type: Sequelize.QueryTypes.INSERT,
              transaction: t
            }
          );
        }
      });

      console.log(`✅ 成功迁移 ${users.length} 条用户记录`);
    } else {
      console.log('ℹ️  SQLite中没有数据需要迁移');
    }

    // 验证迁移结果
    console.log('🔍 验证迁移结果...');
    const countResult = await postgresDb.query('SELECT COUNT(*) as count FROM users', {
      type: Sequelize.QueryTypes.SELECT
    });
    console.log(`📊 PostgreSQL中现在有 ${countResult[0].count} 条用户记录`);

    // 关闭连接
    await sqliteDb.close();
    await postgresDb.close();

    console.log('🎉 数据库迁移完成！');

  } catch (error) {
    console.error('❌ 迁移失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  migrateData();
}

module.exports = migrateData;
