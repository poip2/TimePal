const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserPet = sequelize.define('UserPet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'user_id'
  },
  petId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pets',
      key: 'id'
    },
    field: 'pet_id'
  },
  isOwned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_owned'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_active'
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 100
    }
  },
  currentExp: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'current_exp',
    validate: {
      min: 0
    }
  },
  stats: {
    type: DataTypes.JSONB,
    defaultValue: {},
    validate: {
      isValidStats(value) {
        if (typeof value !== 'object' || value === null) {
          throw new Error('stats must be an object');
        }
        const validStats = ['strength', 'intelligence', 'constitution', 'perception', 'luck', 'speed'];
        for (const key of Object.keys(value)) {
          if (!validStats.includes(key)) {
            throw new Error(`Invalid stat: ${key}`);
          }
          if (typeof value[key] !== 'number' || value[key] < 0) {
            throw new Error(`Stat ${key} must be a non-negative number`);
          }
        }
      }
    }
  },
  lastFedTime: {
    type: DataTypes.DATE,
    field: 'last_fed_time'
  },
  isFavorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_favorite'
  },
  isTamedAsMount: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_tamed_as_mount'
  },
  mountLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'mount_level',
    validate: {
      min: 1,
      max: 100
    }
  },
  mountExp: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'mount_exp',
    validate: {
      min: 0
    }
  },
  mountEquipped: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'mount_equipped'
  },
  mountSpeedBonus: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'mount_speed_bonus',
    validate: {
      min: 0
    }
  },
  unlockedMountSkills: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
    field: 'unlocked_mount_skills'
  },
  mountStamina: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    field: 'mount_stamina',
    validate: {
      min: 0,
      max: 100
    }
  },
  lastMountUse: {
    type: DataTypes.DATE,
    field: 'last_mount_use'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'user_pets',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'pet_id']
    },
    {
      fields: ['user_id', 'is_active']
    },
    {
      fields: ['user_id', 'is_owned']
    },
    {
      fields: ['user_id', 'mount_equipped'],
      where: { mount_equipped: true }
    },
    {
      fields: ['user_id', 'is_tamed_as_mount']
    }
  ]
});

// 关联定义
UserPet.associate = function (models) {
  UserPet.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  UserPet.belongsTo(models.Pet, {
    foreignKey: 'pet_id',
    as: 'pet'
  });
};

// 实例方法：计算升级所需经验
UserPet.prototype.getExpToNextLevel = function () {
  return Math.floor(100 * Math.pow(1.5, this.level - 1));
};

// 实例方法：添加经验值并处理升级
UserPet.prototype.addExperience = async function (amount) {
  if (amount <= 0) return { leveledUp: false, newLevel: this.level };

  this.currentExp += amount;
  let leveledUp = false;
  let oldLevel = this.level;

  // 检查是否可以升级
  const maxLevel = this.pet?.maxLevel || 20;
  while (this.currentExp >= this.getExpToNextLevel() && this.level < maxLevel) {
    this.currentExp -= this.getExpToNextLevel();
    this.level += 1;
    leveledUp = true;

    // 升级时增加属性
    if (this.pet && this.pet.baseStats) {
      const baseStats = this.pet.baseStats;
      const levelMultiplier = 1 + (this.level - 1) * 0.1;

      for (const [stat, value] of Object.entries(baseStats)) {
        if (!this.stats[stat]) this.stats[stat] = 0;
        this.stats[stat] = Math.floor(value * levelMultiplier);
      }
    }
  }

  await this.save();
  return { leveledUp, newLevel: this.level, oldLevel };
};

// 实例方法：获取总属性值
UserPet.prototype.getTotalStats = function () {
  if (!this.pet || !this.pet.baseStats) {
    return this.stats;
  }

  const baseStats = this.pet.baseStats;
  const levelMultiplier = 1 + (this.level - 1) * 0.1;

  const totalStats = { ...this.stats };
  for (const [stat, value] of Object.entries(baseStats)) {
    totalStats[stat] = Math.floor(value * levelMultiplier);
  }

  return totalStats;
};

// 类方法：获取用户的所有宠物
UserPet.findByUser = async function (userId) {
  return await this.findAll({
    where: { userId },
    include: ['pet'],
    order: [
      ['isFavorite', 'DESC'],
      ['isActive', 'DESC'],
      ['level', 'DESC'],
      ['createdAt', 'ASC']
    ]
  });
};

// 类方法：获取用户的已拥有宠物
UserPet.findOwnedByUser = async function (userId) {
  return await this.findAll({
    where: { userId, isOwned: true },
    include: ['pet'],
    order: [
      ['isFavorite', 'DESC'],
      ['isActive', 'DESC'],
      ['level', 'DESC'],
      ['createdAt', 'ASC']
    ]
  });
};

// 类方法：获取用户的激活宠物
UserPet.findActivePet = async function (userId) {
  return await this.findOne({
    where: { userId, isActive: true },
    include: ['pet']
  });
};

// 类方法：激活宠物（同时取消其他激活的宠物）
UserPet.activatePet = async function (userId, userPetId) {
  // 先取消所有激活的宠物
  await this.update(
    { isActive: false },
    { where: { userId, isActive: true } }
  );

  // 激活指定的宠物
  const userPet = await this.findOne({
    where: { id: userPetId, userId, isOwned: true }
  });

  if (!userPet) {
    throw new Error('Pet not found or not owned by user');
  }

  userPet.isActive = true;
  await userPet.save();

  return userPet;
};

// 类方法：获取宠物图鉴进度
UserPet.getCollectionProgress = async function (userId) {
  const totalPets = await sequelize.models.Pet.count();
  const ownedPets = await this.count({
    where: { userId, isOwned: true }
  });

  return {
    total: totalPets,
    owned: ownedPets,
    percentage: Math.round((ownedPets / totalPets) * 100)
  };
};

// 类方法：获取用户的所有坐骑
UserPet.findMountsByUser = async function (userId) {
  return await this.findAll({
    where: {
      userId,
      isTamedAsMount: true,
      isOwned: true
    },
    include: ['pet'],
    order: [
      ['mountEquipped', 'DESC'],
      ['mountLevel', 'DESC'],
      ['createdAt', 'ASC']
    ]
  });
};

// 类方法：获取用户当前装备的坐骑
UserPet.findEquippedMount = async function (userId) {
  return await this.findOne({
    where: {
      userId,
      mountEquipped: true,
      isTamedAsMount: true
    },
    include: ['pet']
  });
};

// 类方法：装备坐骑（同时卸下其他坐骑）
UserPet.equipMount = async function (userId, userPetId) {
  // 先卸下所有已装备的坐骑
  await this.update(
    { mountEquipped: false },
    {
      where: {
        userId,
        mountEquipped: true
      }
    }
  );

  // 装备指定的坐骑
  const userPet = await this.findOne({
    where: {
      id: userPetId,
      userId,
      isTamedAsMount: true,
      isOwned: true
    },
    include: ['pet']
  });

  if (!userPet) {
    throw new Error('Mount not found or not tamed by user');
  }

  userPet.mountEquipped = true;
  await userPet.save();

  return userPet;
};

// 类方法：卸下当前装备的坐骑
UserPet.unequipMount = async function (userId) {
  const result = await this.update(
    { mountEquipped: false },
    {
      where: {
        userId,
        mountEquipped: true
      }
    }
  );

  return result[0] > 0;
};

// 类方法：获取可驯服的宠物（已拥有且宠物可成为坐骑）
UserPet.findTamablePets = async function (userId) {
  return await this.findAll({
    where: {
      userId,
      isOwned: true,
      isTamedAsMount: false
    },
    include: [{
      model: sequelize.models.Pet,
      as: 'pet',
      where: { canBeMount: true }
    }],
    order: [
      ['level', 'DESC'],
      ['createdAt', 'ASC']
    ]
  });
};

// 实例方法：计算坐骑升级所需经验
UserPet.prototype.getMountExpToNextLevel = function () {
  return Math.floor(150 * Math.pow(1.6, this.mountLevel - 1));
};

// 实例方法：添加坐骑经验并处理升级
UserPet.prototype.addMountExperience = async function (amount) {
  if (amount <= 0 || !this.isTamedAsMount) {
    return { leveledUp: false, newLevel: this.mountLevel };
  }

  this.mountExp += amount;
  let leveledUp = false;
  let oldLevel = this.mountLevel;

  // 检查是否可以升级
  const maxMountLevel = 50; // 坐骑最高等级
  while (this.mountExp >= this.getMountExpToNextLevel() && this.mountLevel < maxMountLevel) {
    this.mountExp -= this.getMountExpToNextLevel();
    this.mountLevel += 1;
    leveledUp = true;

    // 升级时增加速度加成
    this.mountSpeedBonus += 5;
  }

  await this.save();
  return { leveledUp, newLevel: this.mountLevel, oldLevel };
};

// 实例方法：获取坐骑总速度
UserPet.prototype.getTotalMountSpeed = function () {
  if (!this.isTamedAsMount || !this.pet) {
    return 0;
  }

  const baseSpeed = this.pet.baseMountSpeed || 100;
  return baseSpeed + this.mountSpeedBonus;
};

// 实例方法：获取坐骑详细信息
UserPet.prototype.getMountInfo = function () {
  if (!this.isTamedAsMount || !this.pet) {
    return null;
  }

  return {
    id: this.id,
    petId: this.petId,
    petName: this.pet.name,
    petKey: this.pet.key,
    mountLevel: this.mountLevel,
    mountExp: this.mountExp,
    mountExpToNextLevel: this.getMountExpToNextLevel(),
    mountEquipped: this.mountEquipped,
    totalMountSpeed: this.getTotalMountSpeed(),
    mountStamina: this.mountStamina,
    mountType: this.pet.mountType,
    mountAbilities: this.pet.mountAbilities || [],
    petImageUrl: this.pet.imageUrl
  };
};

// 实例方法：检查是否可以驯服为坐骑
UserPet.prototype.canBeTamedAsMount = function () {
  return this.isOwned &&
    this.pet &&
    this.pet.canBeMount &&
    !this.isTamedAsMount &&
    this.level >= 5; // 需要5级以上才能驯服为坐骑
};

// 类方法：获取坐骑图鉴进度
UserPet.getMountCollectionProgress = async function (userId) {
  const totalMountablePets = await sequelize.models.Pet.count({
    where: { canBeMount: true }
  });

  const tamedMounts = await this.count({
    where: {
      userId,
      isTamedAsMount: true
    }
  });

  return {
    total: totalMountablePets,
    tamed: tamedMounts,
    percentage: Math.round((tamedMounts / totalMountablePets) * 100)
  };
};

// 类方法：获取坐骑统计信息
UserPet.getMountStats = async function (userId) {
  const mounts = await this.findAll({
    where: {
      userId,
      isTamedAsMount: true
    },
    include: ['pet']
  });

  const stats = {
    totalMounts: mounts.length,
    equippedMount: null,
    byType: { land: 0, flying: 0, aquatic: 0, magical: 0 },
    byRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
    totalSpeed: 0
  };

  mounts.forEach(mount => {
    if (mount.mountEquipped) {
      stats.equippedMount = mount.getMountInfo();
    }

    if (mount.pet) {
      stats.byType[mount.pet.mountType] = (stats.byType[mount.pet.mountType] || 0) + 1;
      stats.byRarity[mount.pet.rarity] = (stats.byRarity[mount.pet.rarity] || 0) + 1;
      stats.totalSpeed += mount.getTotalMountSpeed();
    }
  });

  return stats;
};

module.exports = UserPet;
