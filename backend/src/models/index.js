const sequelize = require('../config/database');
const User = require('./User');
const Habit = require('./Habit');
const Daily = require('./Daily');

// 定义模型关联关系
User.hasMany(Habit, {
  foreignKey: 'userId',
  as: 'habits',
  onDelete: 'CASCADE'
});

Habit.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE'
});

User.hasMany(Daily, {
  foreignKey: 'userId',
  as: 'dailies',
  onDelete: 'CASCADE'
});

Daily.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE'
});

// 同步所有模型
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    await sequelize.sync({ alter: true });
    console.log('所有模型同步成功');
  } catch (error) {
    console.error('数据库同步失败:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Habit,
  Daily,
  syncDatabase
};
