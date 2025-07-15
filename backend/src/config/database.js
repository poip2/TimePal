const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.NODE_ENV === 'test') {
  // 测试环境使用内存SQLite
  sequelize = new Sequelize('sqlite::memory:', {
    logging: false,
  });
} else if (process.env.NODE_ENV === 'development') {
  // 开发环境使用文件SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database/timepal_dev.sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });
} else {
  // 生产环境使用PostgreSQL
  sequelize = new Sequelize(
    process.env.DB_NAME || 'timepal_dev',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

module.exports = sequelize;
