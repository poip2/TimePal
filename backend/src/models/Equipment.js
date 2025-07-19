const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Equipment = sequelize.define('Equipment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [1, 50],
      notEmpty: true
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [1, 100],
      notEmpty: true
    }
  },
  type: {
    type: DataTypes.ENUM('weapon', 'armor', 'accessory', 'helmet', 'boots', 'gloves'),
    allowNull: false,
    validate: {
      isIn: [['weapon', 'armor', 'accessory', 'helmet', 'boots', 'gloves']]
    }
  },
  class: {
    type: DataTypes.ENUM('warrior', 'mage', 'rogue', 'archer'),
    allowNull: true,
    validate: {
      isIn: [['warrior', 'mage', 'rogue', 'archer', null]]
    }
  },
  strengthBonus: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    },
    field: 'strength_bonus'
  },
  intelligenceBonus: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    },
    field: 'intelligence_bonus'
  },
  constitutionBonus: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    },
    field: 'constitution_bonus'
  },
  perceptionBonus: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    },
    field: 'perception_bonus'
  },
  goldCost: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    },
    field: 'gold_cost'
  },
  gemCost: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    },
    field: 'gem_cost'
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    },
    field: 'image_url'
  },
  levelRequired: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1
    },
    field: 'level_required'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rarity: {
    type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary'),
    defaultValue: 'common',
    validate: {
      isIn: [['common', 'rare', 'epic', 'legendary']]
    }
  }
}, {
  tableName: 'equipment',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['class']
    },
    {
      fields: ['level_required']
    },
    {
      fields: ['rarity']
    }
  ]
});

// 实例方法
Equipment.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  return {
    id: values.id,
    key: values.key,
    name: values.name,
    type: values.type,
    class: values.class,
    strengthBonus: values.strengthBonus,
    intelligenceBonus: values.intelligenceBonus,
    constitutionBonus: values.constitutionBonus,
    perceptionBonus: values.perceptionBonus,
    goldCost: values.goldCost,
    gemCost: values.gemCost,
    imageUrl: values.imageUrl,
    levelRequired: values.levelRequired,
    description: values.description,
    rarity: values.rarity,
    createdAt: values.createdAt,
    updatedAt: values.updatedAt
  };
};

// 类方法
Equipment.findByType = function (type) {
  return this.findAll({
    where: { type },
    order: [['level_required', 'ASC'], ['rarity', 'ASC']]
  });
};

Equipment.findByClass = function (className) {
  return this.findAll({
    where: {
      [sequelize.Sequelize.Op.or]: [
        { class: className },
        { class: null }
      ]
    },
    order: [['level_required', 'ASC'], ['rarity', 'ASC']]
  });
};

Equipment.findByRarity = function (rarity) {
  return this.findAll({
    where: { rarity },
    order: [['level_required', 'ASC']]
  });
};

Equipment.findAffordable = function (userGold, userGems) {
  return this.findAll({
    where: {
      gold_cost: { [sequelize.Sequelize.Op.lte]: userGold },
      gem_cost: { [sequelize.Sequelize.Op.lte]: userGems }
    },
    order: [['gold_cost', 'ASC'], ['gem_cost', 'ASC']]
  });
};

module.exports = Equipment;
