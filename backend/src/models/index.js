const sequelize = require('../config/database');
const User = require('./User');
const Habit = require('./Habit');
const Daily = require('./Daily');
const Equipment = require('./Equipment');
const UserEquipment = require('./UserEquipment');
const Todo = require('./Todo');
const Pet = require('./Pet');
const UserPet = require('./UserPet');
const PetMaterial = require('./PetMaterial');

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

User.hasMany(Todo, {
  foreignKey: 'userId',
  as: 'todos',
  onDelete: 'CASCADE'
});

Todo.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE'
});

// 装备系统关联关系
User.belongsToMany(Equipment, {
  through: UserEquipment,
  foreignKey: 'userId',
  otherKey: 'equipmentId',
  as: 'equipment'
});

Equipment.belongsToMany(User, {
  through: UserEquipment,
  foreignKey: 'equipmentId',
  otherKey: 'userId',
  as: 'users'
});

User.hasMany(UserEquipment, {
  foreignKey: 'userId',
  as: 'userEquipment'
});

UserEquipment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Equipment.hasMany(UserEquipment, {
  foreignKey: 'equipmentId',
  as: 'userEquipment'
});

UserEquipment.belongsTo(Equipment, {
  foreignKey: 'equipmentId',
  as: 'equipment'
});

// 宠物系统关联关系
User.hasMany(UserPet, {
  foreignKey: 'userId',
  as: 'userPets',
  onDelete: 'CASCADE'
});

UserPet.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE'
});

Pet.hasMany(UserPet, {
  foreignKey: 'petId',
  as: 'userPets',
  onDelete: 'CASCADE'
});

UserPet.belongsTo(Pet, {
  foreignKey: 'petId',
  as: 'pet',
  onDelete: 'CASCADE'
});

User.hasMany(PetMaterial, {
  foreignKey: 'userId',
  as: 'petMaterials',
  onDelete: 'CASCADE'
});

PetMaterial.belongsTo(User, {
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
  Equipment,
  UserEquipment,
  Todo,
  Pet,
  UserPet,
  PetMaterial,
  syncDatabase
};
