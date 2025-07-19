const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PetMaterial = sequelize.define('PetMaterial', {
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
  materialType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'material_type',
    validate: {
      len: [1, 50],
      isValidMaterialType(value) {
        const validTypes = [
          'egg_common', 'egg_uncommon', 'egg_rare', 'egg_epic', 'egg_legendary',
          'potion_common', 'potion_uncommon', 'potion_rare', 'potion_epic', 'potion_legendary',
          'potion_fire', 'potion_water', 'potion_earth', 'potion_air',
          'potion_light', 'potion_dark', 'potion_mystical'
        ];
        if (!validTypes.includes(value)) {
          throw new Error(`Invalid material type: ${value}`);
        }
      }
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
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
  tableName: 'pet_materials',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'material_type']
    }
  ]
});

// 类方法：获取用户的所有材料
PetMaterial.findByUser = async function (userId) {
  return await this.findAll({
    where: { userId },
    order: [['materialType', 'ASC']]
  });
};

// 类方法：获取特定类型的材料
PetMaterial.findByType = async function (userId, materialType) {
  return await this.findOne({
    where: { userId, materialType }
  });
};

// 类方法：添加材料数量
PetMaterial.addMaterial = async function (userId, materialType, quantity) {
  if (quantity <= 0) return null;

  const [material, created] = await this.findOrCreate({
    where: { userId, materialType },
    defaults: { quantity }
  });

  if (!created) {
    material.quantity += quantity;
    await material.save();
  }

  return material;
};

// 类方法：消耗材料
PetMaterial.consumeMaterial = async function (userId, materialType, quantity) {
  if (quantity <= 0) return false;

  const material = await this.findOne({
    where: { userId, materialType }
  });

  if (!material || material.quantity < quantity) {
    return false;
  }

  material.quantity -= quantity;
  if (material.quantity === 0) {
    await material.destroy();
  } else {
    await material.save();
  }

  return true;
};

// 类方法：检查是否有足够的材料
PetMaterial.hasMaterial = async function (userId, materialType, quantity) {
  const material = await this.findOne({
    where: { userId, materialType }
  });

  return material && material.quantity >= quantity;
};

// 类方法：批量获取材料
PetMaterial.getMaterials = async function (userId, materialTypes) {
  return await this.findAll({
    where: {
      userId,
      materialType: materialTypes
    }
  });
};

module.exports = PetMaterial;
