// 测试环境数据库配置 - 使用SQLite内存数据库
const { Sequelize } = require('sequelize');

// 创建SQLite内存数据库用于测试
const sequelize = new Sequelize('sqlite::memory:', {
  logging: false, // 关闭SQL日志
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  }
});

module.exports = sequelize;
