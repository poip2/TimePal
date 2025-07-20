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
const Party = require('./Party');
const PartyMember = require('./PartyMember');
const PartyInvitation = require('./PartyInvitation');
const PartyMessage = require('./PartyMessage');
const PartyActivity = require('./PartyActivity');
const Friend = require('./Friend');
const Message = require('./Message');

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

// 队伍系统关联关系
User.hasMany(Party, {
  foreignKey: 'leaderId',
  as: 'createdParties',
  onDelete: 'CASCADE'
});

Party.belongsTo(User, {
  foreignKey: 'leaderId',
  as: 'leader'
});

User.belongsToMany(Party, {
  through: PartyMember,
  foreignKey: 'userId',
  otherKey: 'partyId',
  as: 'parties'
});

Party.belongsToMany(User, {
  through: PartyMember,
  foreignKey: 'partyId',
  otherKey: 'userId',
  as: 'members'
});

User.hasMany(PartyMember, {
  foreignKey: 'userId',
  as: 'partyMemberships',
  onDelete: 'CASCADE'
});

PartyMember.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE'
});

Party.hasMany(PartyMember, {
  foreignKey: 'partyId',
  as: 'partyMembers',
  onDelete: 'CASCADE'
});

PartyMember.belongsTo(Party, {
  foreignKey: 'partyId',
  as: 'party',
  onDelete: 'CASCADE'
});

User.hasMany(PartyInvitation, {
  foreignKey: 'inviterId',
  as: 'sentInvitations',
  onDelete: 'CASCADE'
});

User.hasMany(PartyInvitation, {
  foreignKey: 'inviteeId',
  as: 'receivedInvitations',
  onDelete: 'CASCADE'
});

PartyInvitation.belongsTo(User, {
  foreignKey: 'inviterId',
  as: 'inviter'
});

PartyInvitation.belongsTo(User, {
  foreignKey: 'inviteeId',
  as: 'invitee'
});

Party.hasMany(PartyInvitation, {
  foreignKey: 'partyId',
  as: 'invitations',
  onDelete: 'CASCADE'
});

PartyInvitation.belongsTo(Party, {
  foreignKey: 'partyId',
  as: 'party'
});

User.hasMany(PartyMessage, {
  foreignKey: 'userId',
  as: 'partyMessages',
  onDelete: 'CASCADE'
});

PartyMessage.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE'
});

Party.hasMany(PartyMessage, {
  foreignKey: 'partyId',
  as: 'messages',
  onDelete: 'CASCADE'
});

PartyMessage.belongsTo(Party, {
  foreignKey: 'partyId',
  as: 'party',
  onDelete: 'CASCADE'
});

User.hasMany(PartyActivity, {
  foreignKey: 'userId',
  as: 'partyActivities',
  onDelete: 'CASCADE'
});

PartyActivity.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE'
});

Party.hasMany(PartyActivity, {
  foreignKey: 'partyId',
  as: 'activities',
  onDelete: 'CASCADE'
});

PartyActivity.belongsTo(Party, {
  foreignKey: 'partyId',
  as: 'party',
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

// 好友系统关联关系
User.hasMany(Friend, {
  foreignKey: 'requesterId',
  as: 'sentFriendRequests',
  onDelete: 'CASCADE'
});

User.hasMany(Friend, {
  foreignKey: 'addresseeId',
  as: 'receivedFriendRequests',
  onDelete: 'CASCADE'
});

Friend.belongsTo(User, {
  foreignKey: 'requesterId',
  as: 'requester'
});

Friend.belongsTo(User, {
  foreignKey: 'addresseeId',
  as: 'addressee'
});

// 消息系统关联关系
User.hasMany(Message, {
  foreignKey: 'senderId',
  as: 'sentMessages',
  onDelete: 'CASCADE'
});

User.hasMany(Message, {
  foreignKey: 'receiverId',
  as: 'receivedMessages',
  onDelete: 'CASCADE'
});

Message.belongsTo(User, {
  foreignKey: 'senderId',
  as: 'sender'
});

Message.belongsTo(User, {
  foreignKey: 'receiverId',
  as: 'receiver'
});

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
  Party,
  PartyMember,
  PartyInvitation,
  PartyMessage,
  PartyActivity,
  Friend,
  Message,
  syncDatabase
};
