const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Equipment = require('./Equipment');

const UserEquipment = sequelize.define('UserEquipment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    field: 'user_id'
  },
  equipmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Equipment,
      key: 'id'
    },
    field: 'equipment_id'
  },
  isOwned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_owned'
  },
  isEquipped: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_equipped'
  },
  equippedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'equipped_at'
  }
}, {
  tableName: 'user_equipment',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'equipment_id']
    },
    {
      fields: ['user_id', 'is_owned']
    },
    {
      fields: ['user_id', 'is_equipped']
    }
  ]
});

// 关联定义将在 models/index.js 中统一处理

// 实例方法
UserEquipment.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  return {
    id: values.id,
    userId: values.userId,
    equipmentId: values.equipmentId,
    isOwned: values.isOwned,
    isEquipped: values.isEquipped,
    equippedAt: values.equippedAt,
    createdAt: values.createdAt,
    updatedAt: values.updatedAt
  };
};

// 类方法
UserEquipment.findByUser = function (userId) {
  return this.findAll({
    where: { userId },
    include: [{
      model: Equipment,
      as: 'equipment'
    }],
    order: [['createdAt', 'DESC']]
  });
};

UserEquipment.findOwnedByUser = function (userId) {
  return this.findAll({
    where: {
      userId,
      isOwned: true
    },
    include: [{
      model: Equipment,
      as: 'equipment'
    }],
    order: [['createdAt', 'DESC']]
  });
};

UserEquipment.findEquippedByUser = function (userId) {
  return this.findAll({
    where: {
      userId,
      isEquipped: true
    },
    include: [{
      model: Equipment,
      as: 'equipment'
    }],
    order: [['equippedAt', 'DESC']]
  });
};

UserEquipment.findByUserAndEquipment = function (userId, equipmentId) {
  return this.findOne({
    where: {
      userId,
      equipmentId
    }
  });
};

UserEquipment.countEquippedByType = function (userId, type) {
  return this.count({
    include: [{
      model: Equipment,
      as: 'equipment',
      where: { type }
    }],
    where: {
      userId,
      isEquipped: true
    }
  });
};

// 获取用户所有装备的属性加成总和
UserEquipment.getTotalBonuses = async function (userId) {
  const { Equipment } = require('./index');
  const equippedItems = await this.findAll({
    where: {
      userId,
      isEquipped: true
    },
    include: [{
      model: Equipment,
      as: 'equipment'
    }]
  });

  return equippedItems.reduce((bonuses, item) => {
    const equipment = item.equipment;
    return {
      strength: bonuses.strength + (equipment.strengthBonus || 0),
      intelligence: bonuses.intelligence + (equipment.intelligenceBonus || 0),
      constitution: bonuses.constitution + (equipment.constitutionBonus || 0),
      perception: bonuses.perception + (equipment.perceptionBonus || 0)
    };
  }, {
    strength: 0,
    intelligence: 0,
    constitution: 0,
    perception: 0
  });
};

// 检查用户是否可以装备某物品
UserEquipment.canEquip = async function (userId, equipmentId) {
  const { User, Equipment } = require('./index');
  const user = await User.findByPk(userId);
  const equipment = await Equipment.findByPk(equipmentId);

  if (!user || !equipment) {
    return { canEquip: false, reason: '用户或装备不存在' };
  }

  if (equipment.class && user.class !== equipment.class) {
    return { canEquip: false, reason: '职业不符' };
  }

  if (user.level < equipment.levelRequired) {
    return { canEquip: false, reason: '等级不足' };
  }

  const userEquipment = await this.findByUserAndEquipment(userId, equipmentId);
  if (!userEquipment || !userEquipment.isOwned) {
    return { canEquip: false, reason: '未拥有该装备' };
  }

  // 检查是否已装备同类型物品
  const equippedCount = await this.countEquippedByType(userId, equipment.type);
  if (equippedCount > 0 && ['weapon', 'armor', 'helmet', 'boots', 'gloves'].includes(equipment.type)) {
    return { canEquip: false, reason: '已装备同类型物品' };
  }

  return { canEquip: true };
};

module.exports = UserEquipment;
