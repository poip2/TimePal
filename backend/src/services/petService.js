const { Pet, UserPet, PetMaterial, User } = require('../models');
const { Op } = require('sequelize');

class PetService {
  /**
   * 获取所有宠物
   */
  static async getAllPets() {
    return await Pet.findAll({
      order: [
        ['rarity', 'ASC'],
        ['type', 'ASC'],
        ['id', 'ASC']
      ]
    });
  }

  /**
   * 根据ID获取宠物详情
   */
  static async getPetById(id) {
    return await Pet.findByPk(id);
  }

  /**
   * 根据key获取宠物
   */
  static async getPetByKey(key) {
    return await Pet.findOne({ where: { key } });
  }

  /**
   * 获取用户的所有宠物
   */
  static async getUserPets(userId) {
    return await UserPet.findByUser(userId);
  }

  /**
   * 获取用户已拥有的宠物
   */
  static async getUserOwnedPets(userId) {
    return await UserPet.findOwnedByUser(userId);
  }

  /**
   * 获取用户的激活宠物
   */
  static async getUserActivePet(userId) {
    return await UserPet.findActivePet(userId);
  }

  /**
   * 激活宠物
   */
  static async activatePet(userId, userPetId) {
    return await UserPet.activatePet(userId, userPetId);
  }

  /**
   * 获取宠物图鉴进度
   */
  static async getCollectionProgress(userId) {
    return await UserPet.getCollectionProgress(userId);
  }

  /**
   * 孵化宠物
   */
  static async hatchPet(userId, petId) {
    const pet = await Pet.findByPk(petId);
    if (!pet) {
      throw new Error('宠物不存在');
    }

    // 检查用户是否已经拥有该宠物
    const existingUserPet = await UserPet.findOne({
      where: { userId, petId }
    });

    if (existingUserPet && existingUserPet.isOwned) {
      throw new Error('已经拥有该宠物');
    }

    // 检查是否有足够的孵化材料
    const requiredEgg = pet.eggType || `egg_${pet.rarity}`;
    const hasEgg = await PetMaterial.hasMaterial(userId, requiredEgg, 1);

    if (!hasEgg) {
      throw new Error(`缺少孵化材料: ${requiredEgg}`);
    }

    // 消耗材料
    await PetMaterial.consumeMaterial(userId, requiredEgg, 1);

    // 创建或更新用户宠物
    let userPet;
    if (existingUserPet) {
      existingUserPet.isOwned = true;
      existingUserPet.level = 1;
      existingUserPet.currentExp = 0;
      await existingUserPet.save();
      userPet = existingUserPet;
    } else {
      userPet = await UserPet.create({
        userId,
        petId,
        isOwned: true,
        level: 1,
        currentExp: 0,
        stats: pet.baseStats || {}
      });
    }

    // 重新加载以包含宠物信息
    return await UserPet.findByPk(userPet.id, {
      include: ['pet']
    });
  }

  /**
   * 喂养宠物
   */
  static async feedPet(userId, userPetId, foodAmount = 10) {
    const userPet = await UserPet.findOne({
      where: { id: userPetId, userId, isOwned: true },
      include: ['pet']
    });

    if (!userPet) {
      throw new Error('宠物不存在或未拥有');
    }

    // 检查是否有足够的喂养材料
    const requiredPotion = userPet.pet.potionType || 'potion_common';
    const hasPotion = await PetMaterial.hasMaterial(userId, requiredPotion, 1);

    if (!hasPotion) {
      throw new Error(`缺少喂养材料: ${requiredPotion}`);
    }

    // 消耗材料
    await PetMaterial.consumeMaterial(userId, requiredPotion, 1);

    // 添加经验值
    const result = await userPet.addExperience(foodAmount);

    userPet.lastFedTime = new Date();
    await userPet.save();

    return {
      ...result,
      pet: userPet.pet,
      currentExp: userPet.currentExp,
      expToNext: userPet.getExpToNextLevel()
    };
  }

  /**
   * 装备宠物
   */
  static async equipPet(userId, userPetId) {
    return await UserPet.activatePet(userId, userPetId);
  }

  /**
   * 卸下宠物
   */
  static async unequipPet(userId) {
    const activePet = await UserPet.findActivePet(userId);
    if (activePet) {
      activePet.isActive = false;
      await activePet.save();
    }
    return activePet;
  }

  /**
   * 获取用户的材料
   */
  static async getUserMaterials(userId) {
    return await PetMaterial.findByUser(userId);
  }

  /**
   * 添加材料
   */
  static async addMaterial(userId, materialType, quantity) {
    return await PetMaterial.addMaterial(userId, materialType, quantity);
  }

  /**
   * 获取稀有度分布统计
   */
  static async getRarityStats() {
    const stats = await Pet.findAll({
      attributes: [
        'rarity',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['rarity'],
      order: [['rarity', 'ASC']]
    });

    return stats.reduce((acc, stat) => {
      acc[stat.rarity] = parseInt(stat.dataValues.count);
      return acc;
    }, {});
  }

  /**
   * 获取用户稀有度收集统计
   */
  static async getUserRarityStats(userId) {
    const stats = await UserPet.findAll({
      where: { userId, isOwned: true },
      include: [{
        model: Pet,
        attributes: ['rarity']
      }],
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('user_pets.id')), 'count']
      ],
      group: ['pet.rarity'],
      order: [[sequelize.col('pet.rarity'), 'ASC']]
    });

    return stats.reduce((acc, stat) => {
      acc[stat.pet.rarity] = parseInt(stat.dataValues.count);
      return acc;
    }, {});
  }

  /**
   * 获取宠物详情（包含用户状态）
   */
  static async getPetWithUserStatus(userId, petId) {
    const pet = await Pet.findByPk(petId);
    if (!pet) {
      throw new Error('宠物不存在');
    }

    const userPet = await UserPet.findOne({
      where: { userId, petId }
    });

    return {
      ...pet.toJSON(),
      userStatus: userPet ? {
        isOwned: userPet.isOwned,
        isActive: userPet.isActive,
        level: userPet.level,
        currentExp: userPet.currentExp,
        expToNext: userPet.getExpToNextLevel(),
        stats: userPet.getTotalStats()
      } : null
    };
  }
}

module.exports = PetService;
