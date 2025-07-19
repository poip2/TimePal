const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pet = sequelize.define('Pet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    validate: {
      len: [1, 50]
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [1, 100]
    }
  },
  type: {
    type: DataTypes.ENUM('cat', 'dog', 'bird', 'dragon', 'mythical', 'elemental'),
    allowNull: false,
    validate: {
      isIn: [['cat', 'dog', 'bird', 'dragon', 'mythical', 'elemental']]
    }
  },
  eggType: {
    type: DataTypes.STRING(50),
    field: 'egg_type'
  },
  potionType: {
    type: DataTypes.STRING(50),
    field: 'potion_type'
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    field: 'image_url'
  },
  rarity: {
    type: DataTypes.ENUM('common', 'uncommon', 'rare', 'epic', 'legendary'),
    defaultValue: 'common',
    validate: {
      isIn: [['common', 'uncommon', 'rare', 'epic', 'legendary']]
    }
  },
  baseStats: {
    type: DataTypes.JSONB,
    defaultValue: {},
    field: 'base_stats',
    validate: {
      isValidStats(value) {
        if (typeof value !== 'object' || value === null) {
          throw new Error('baseStats must be an object');
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
  maxLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
    field: 'max_level',
    validate: {
      min: 1,
      max: 100
    }
  },
  evolutionChain: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
    field: 'evolution_chain'
  },
  description: {
    type: DataTypes.TEXT
  },
  canBeMount: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'can_be_mount'
  },
  mountType: {
    type: DataTypes.ENUM('land', 'flying', 'aquatic', 'magical'),
    field: 'mount_type',
    validate: {
      isIn: [['land', 'flying', 'aquatic', 'magical']]
    }
  },
  baseMountSpeed: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    field: 'base_mount_speed',
    validate: {
      min: 1,
      max: 1000
    }
  },
  mountAbilities: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'mount_abilities',
    validate: {
      isArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('mountAbilities must be an array');
        }
      }
    }
  },
  mountDescription: {
    type: DataTypes.TEXT,
    field: 'mount_description'
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
  tableName: 'pets',
  timestamps: true,
  underscored: true
});

// 类方法：根据稀有度获取宠物
Pet.findByRarity = async function (rarity) {
  return await this.findAll({
    where: { rarity },
    order: [['id', 'ASC']]
  });
};

// 类方法：根据类型获取宠物
Pet.findByType = async function (type) {
  return await this.findAll({
    where: { type },
    order: [['rarity', 'ASC'], ['id', 'ASC']]
  });
};

// 类方法：获取所有宠物（包含稀有度排序）
Pet.getAllPets = async function () {
  return await this.findAll({
    order: [
      ['rarity', 'ASC'],
      ['type', 'ASC'],
      ['id', 'ASC']
    ]
  });
};

// 类方法：获取可进化的宠物
Pet.getEvolutionPets = async function () {
  return await this.findAll({
    where: {
      evolutionChain: {
        [sequelize.Sequelize.Op.ne]: []
      }
    }
  });
};

// 类方法：获取可成为坐骑的宠物
Pet.getMountablePets = async function () {
  return await this.findAll({
    where: { canBeMount: true },
    order: [
      ['rarity', 'ASC'],
      ['baseMountSpeed', 'DESC'],
      ['id', 'ASC']
    ]
  });
};

// 类方法：根据坐骑类型获取宠物
Pet.findByMountType = async function (mountType) {
  return await this.findAll({
    where: {
      canBeMount: true,
      mountType
    },
    order: [
      ['rarity', 'ASC'],
      ['baseMountSpeed', 'DESC']
    ]
  });
};

// 类方法：获取坐骑稀有度统计
Pet.getMountRarityStats = async function () {
  return await this.findAll({
    where: { canBeMount: true },
    attributes: [
      'rarity',
      [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('id')), 'count']
    ],
    group: ['rarity'],
    order: [['rarity', 'ASC']]
  });
};

// 实例方法：获取坐骑详细信息
Pet.prototype.getMountInfo = function () {
  if (!this.canBeMount) {
    return null;
  }

  return {
    canBeMount: this.canBeMount,
    mountType: this.mountType,
    baseMountSpeed: this.baseMountSpeed,
    mountAbilities: this.mountAbilities,
    mountDescription: this.mountDescription
  };
};

// 实例方法：检查是否为特定类型的坐骑
Pet.prototype.isMountType = function (type) {
  return this.canBeMount && this.mountType === type;
};

module.exports = Pet;
