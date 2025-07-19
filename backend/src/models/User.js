const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const UserEquipment = require('./UserEquipment');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    validate: {
      len: [3, 50],
      isAlphanumeric: true
    }
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash'
  },
  avatarUrl: {
    type: DataTypes.STRING(255),
    field: 'avatar_url'
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  coins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  experienceToNext: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    field: 'experience_to_next',
    validate: {
      min: 1
    }
  },
  health: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    validate: {
      min: 0
    }
  },
  maxHealth: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    field: 'max_health',
    validate: {
      min: 1
    }
  },
  mana: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    validate: {
      min: 0
    }
  },
  maxMana: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    field: 'max_mana',
    validate: {
      min: 1
    }
  },
  gold: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  class: {
    type: DataTypes.ENUM('warrior', 'mage', 'rogue', 'healer'),
    defaultValue: 'warrior',
    validate: {
      isIn: [['warrior', 'mage', 'rogue', 'healer']]
    }
  },
  classPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'class_points',
    validate: {
      min: 0
    }
  },
  strength: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  intelligence: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  constitution: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  perception: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  totalTasksCompleted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_tasks_completed',
    validate: {
      min: 0
    }
  },
  streakHighest: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'streak_highest',
    validate: {
      min: 0
    }
  },
  loginStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'login_streak',
    validate: {
      min: 0
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
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
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.passwordHash) {
        user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('passwordHash')) {
        user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
      }
    }
  }
});

// 实例方法：验证密码
User.prototype.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

// 类方法：根据邮箱或用户名查找用户
User.findByEmailOrUsername = async function (email, username) {
  return await this.findOne({
    where: {
      [require('sequelize').Op.or]: [
        { email },
        { username }
      ]
    }
  });
};

// 实例方法：获取装备属性加成
User.prototype.getEquipmentBonuses = async function () {
  return await UserEquipment.getTotalBonuses(this.id);
};

// 实例方法：获取总属性值（基础值 + 装备加成）
User.prototype.getTotalAttributes = async function () {
  const equipmentBonuses = await this.getEquipmentBonuses();
  return {
    strength: this.strength + equipmentBonuses.strength,
    intelligence: this.intelligence + equipmentBonuses.intelligence,
    constitution: this.constitution + equipmentBonuses.constitution,
    perception: this.perception + equipmentBonuses.perception
  };
};

// 实例方法：获取用户游戏化状态摘要（包含装备加成）
User.prototype.getGameStats = function () {
  return {
    level: this.level,
    experience: this.experience,
    experienceToNext: this.experienceToNext,
    health: this.health,
    maxHealth: this.maxHealth,
    mana: this.mana,
    maxMana: this.maxMana,
    gold: this.gold,
    class: this.class,
    classPoints: this.classPoints,
    attributes: {
      strength: this.strength,
      intelligence: this.intelligence,
      constitution: this.constitution,
      perception: this.perception
    },
    stats: {
      totalTasksCompleted: this.totalTasksCompleted,
      streakHighest: this.streakHighest,
      loginStreak: this.loginStreak
    }
  };
};

// 实例方法：获取完整游戏状态（包含装备加成）
User.prototype.getFullGameStats = async function () {
  const equipmentBonuses = await this.getEquipmentBonuses();
  const totalAttributes = await this.getTotalAttributes();

  return {
    level: this.level,
    experience: this.experience,
    experienceToNext: this.experienceToNext,
    health: this.health,
    maxHealth: this.maxHealth,
    mana: this.mana,
    maxMana: this.maxMana,
    gold: this.gold,
    class: this.class,
    classPoints: this.classPoints,
    baseAttributes: {
      strength: this.strength,
      intelligence: this.intelligence,
      constitution: this.constitution,
      perception: this.perception
    },
    equipmentBonuses,
    totalAttributes,
    stats: {
      totalTasksCompleted: this.totalTasksCompleted,
      streakHighest: this.streakHighest,
      loginStreak: this.loginStreak
    }
  };
};

// 实例方法：添加经验值并处理升级逻辑
User.prototype.addExperience = async function (amount) {
  if (amount <= 0) return false;

  this.experience += amount;

  // 处理升级逻辑
  while (this.experience >= this.experienceToNext) {
    this.experience -= this.experienceToNext;
    this.level += 1;
    this.experienceToNext = Math.floor(this.experienceToNext * 1.2); // 升级所需经验值增加

    // 升级奖励
    this.maxHealth += 5;
    this.health = this.maxHealth; // 升级时恢复满血
    this.maxMana += 2;
    this.mana = this.maxMana; // 升级时恢复满蓝

    // 根据职业给予属性点
    const attributePoints = 3;
    switch (this.class) {
      case 'warrior':
        this.strength += attributePoints;
        break;
      case 'mage':
        this.intelligence += attributePoints;
        break;
      case 'rogue':
        this.perception += attributePoints;
        break;
      case 'healer':
        this.constitution += attributePoints;
        break;
    }
  }

  await this.save();
  return true;
};

// 实例方法：扣除生命值
User.prototype.takeDamage = async function (amount) {
  if (amount <= 0) return false;

  this.health = Math.max(0, this.health - amount);
  await this.save();
  return this.health > 0; // 返回是否存活
};

// 实例方法：恢复生命值
User.prototype.heal = async function (amount) {
  if (amount <= 0) return false;

  this.health = Math.min(this.maxHealth, this.health + amount);
  await this.save();
  return true;
};

// 实例方法：使用魔法值
User.prototype.useMana = async function (amount) {
  if (amount <= 0 || this.mana < amount) return false;

  this.mana -= amount;
  await this.save();
  return true;
};

// 实例方法：恢复魔法值
User.prototype.restoreMana = async function (amount) {
  if (amount <= 0) return false;

  this.mana = Math.min(this.maxMana, this.mana + amount);
  await this.save();
  return true;
};

// 实例方法：添加金币
User.prototype.addGold = async function (amount) {
  if (amount <= 0) return false;

  this.gold += amount;
  await this.save();
  return true;
};

// 实例方法：花费金币
User.prototype.spendGold = async function (amount) {
  if (amount <= 0 || this.gold < amount) return false;

  this.gold -= amount;
  await this.save();
  return true;
};

// 实例方法：完成任务更新统计
User.prototype.completeTask = async function () {
  this.totalTasksCompleted += 1;
  this.classPoints += 10; // 完成任务获得职业点数
  await this.save();
  return true;
};

// 类方法：获取排行榜
User.getLeaderboard = async function (limit = 10) {
  return await this.findAll({
    attributes: ['id', 'username', 'level', 'experience', 'totalTasksCompleted', 'streakHighest'],
    order: [
      ['level', 'DESC'],
      ['experience', 'DESC'],
      ['totalTasksCompleted', 'DESC']
    ],
    limit: limit
  });
};

// 类方法：根据职业获取用户
User.getUsersByClass = async function (userClass) {
  const validClasses = ['warrior', 'mage', 'rogue', 'healer'];
  if (!validClasses.includes(userClass)) {
    throw new Error('Invalid user class');
  }

  return await this.findAll({
    where: { class: userClass },
    order: [['level', 'DESC'], ['experience', 'DESC']]
  });
};

module.exports = User;
