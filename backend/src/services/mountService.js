const { UserPet, Pet, PetMaterial, sequelize } = require('../models');
const { Op } = require('sequelize');

class MountService {
  /**
   * 检查宠物是否可以驯服为坐骑
   * @param {number} userId - 用户ID
   * @param {number} userPetId - 用户宠物ID
   * @returns {Promise<Object>} 检查结果
   */
  async checkTameEligibility(userId, userPetId) {
    const userPet = await UserPet.findOne({
      where: { id: userPetId, userId },
      include: ['pet']
    });

    if (!userPet) {
      throw new Error('Pet not found');
    }

    if (!userPet.isOwned) {
      throw new Error('Pet is not owned by user');
    }

    if (userPet.isTamedAsMount) {
      throw new Error('Pet is already tamed as mount');
    }

    if (!userPet.pet.canBeMount) {
      throw new Error('This pet cannot be tamed as mount');
    }

    if (userPet.level < 5) {
      throw new Error('Pet must be at least level 5 to be tamed as mount');
    }

    return {
      eligible: true,
      petName: userPet.pet.name,
      currentLevel: userPet.level,
      requiredMaterials: {
        mount_taming_scroll: 3,
        mount_essence: 1
      }
    };
  }

  /**
   * 驯服宠物为坐骑
   * @param {number} userId - 用户ID
   * @param {number} userPetId - 用户宠物ID
   * @returns {Promise<Object>} 驯服结果
   */
  async tameMount(userId, userPetId) {
    const transaction = await sequelize.transaction();

    try {
      // 检查资格
      const eligibility = await this.checkTameEligibility(userId, userPetId);

      // 检查材料是否足够
      const requiredMaterials = {
        mount_taming_scroll: 3,
        mount_essence: 1
      };

      for (const [materialType, requiredQuantity] of Object.entries(requiredMaterials)) {
        const material = await PetMaterial.findOne({
          where: { userId, materialType }
        });

        if (!material || material.quantity < requiredQuantity) {
          throw new Error(`Insufficient ${materialType}: need ${requiredQuantity}`);
        }
      }

      // 扣除材料
      for (const [materialType, requiredQuantity] of Object.entries(requiredMaterials)) {
        await PetMaterial.decrement('quantity', {
          by: requiredQuantity,
          where: { userId, materialType },
          transaction
        });
      }

      // 更新宠物为坐骑
      const userPet = await UserPet.findOne({
        where: { id: userPetId, userId },
        transaction
      });

      userPet.isTamedAsMount = true;
      userPet.mountLevel = 1;
      userPet.mountExp = 0;
      userPet.mountEquipped = false;
      userPet.mountSpeedBonus = 0;
      userPet.unlockedMountSkills = [];
      userPet.mountStamina = 100;

      await userPet.save({ transaction });

      await transaction.commit();

      return {
        success: true,
        message: 'Pet successfully tamed as mount',
        mountInfo: await userPet.getMountInfo()
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 装备坐骑
   * @param {number} userId - 用户ID
   * @param {number} userPetId - 用户宠物ID
   * @returns {Promise<Object>} 装备结果
   */
  async equipMount(userId, userPetId) {
    const userPet = await UserPet.findOne({
      where: { id: userPetId, userId },
      include: ['pet']
    });

    if (!userPet) {
      throw new Error('Mount not found');
    }

    if (!userPet.isTamedAsMount) {
      throw new Error('Pet is not tamed as mount');
    }

    // 使用类方法装备坐骑
    const equippedMount = await UserPet.equipMount(userId, userPetId);

    return {
      success: true,
      message: 'Mount equipped successfully',
      mount: equippedMount
    };
  }

  /**
   * 卸下坐骑
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 卸下结果
   */
  async unequipMount(userId) {
    const result = await UserPet.unequipMount(userId);

    if (!result) {
      throw new Error('No mount is currently equipped');
    }

    return {
      success: true,
      message: 'Mount unequipped successfully'
    };
  }

  /**
   * 升级坐骑
   * @param {number} userId - 用户ID
   * @param {number} userPetId - 用户宠物ID
   * @param {number} expAmount - 经验值
   * @returns {Promise<Object>} 升级结果
   */
  async upgradeMount(userId, userPetId, expAmount = 100) {
    const userPet = await UserPet.findOne({
      where: { id: userPetId, userId },
      include: ['pet']
    });

    if (!userPet) {
      throw new Error('Mount not found');
    }

    if (!userPet.isTamedAsMount) {
      throw new Error('Pet is not tamed as mount');
    }

    const result = await userPet.addMountExperience(expAmount);

    return {
      success: true,
      leveledUp: result.leveledUp,
      oldLevel: result.oldLevel,
      newLevel: result.newLevel,
      mountExp: userPet.mountExp,
      expToNextLevel: userPet.getMountExpToNextLevel(),
      totalSpeed: userPet.getTotalMountSpeed()
    };
  }

  /**
   * 获取用户的坐骑列表
   * @param {number} userId - 用户ID
   * @returns {Promise<Array>} 坐骑列表
   */
  async getUserMounts(userId) {
    const mounts = await UserPet.findMountsByUser(userId);
    return mounts.map(mount => mount.getMountInfo());
  }

  /**
   * 获取用户的坐骑统计
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 统计信息
   */
  async getMountStats(userId) {
    return await UserPet.getMountStats(userId);
  }

  /**
   * 获取可驯服的宠物列表
   * @param {number} userId - 用户ID
   * @returns {Promise<Array>} 可驯服的宠物列表
   */
  async getTamablePets(userId) {
    return await UserPet.findTamablePets(userId);
  }

  /**
   * 恢复坐骑体力
   * @param {number} userId - 用户ID
   * @param {number} userPetId - 用户宠物ID
   * @param {number} staminaAmount - 恢复的体力值
   * @returns {Promise<Object>} 恢复结果
   */
  async restoreMountStamina(userId, userPetId, staminaAmount = 20) {
    const userPet = await UserPet.findOne({
      where: { id: userPetId, userId }
    });

    if (!userPet || !userPet.isTamedAsMount) {
      throw new Error('Mount not found');
    }

    const oldStamina = userPet.mountStamina;
    userPet.mountStamina = Math.min(100, oldStamina + staminaAmount);

    await userPet.save();

    return {
      success: true,
      oldStamina,
      newStamina: userPet.mountStamina,
      restoredAmount: userPet.mountStamina - oldStamina
    };
  }

  /**
   * 检查坐骑是否可以进行特定操作
   * @param {number} userId - 用户ID
   * @param {number} userPetId - 用户宠物ID
   * @param {string} action - 操作类型 ('ride', 'upgrade', 'equip')
   * @returns {Promise<Object>} 检查结果
   */
  async checkMountAction(userId, userPetId, action) {
    const userPet = await UserPet.findOne({
      where: { id: userPetId, userId },
      include: ['pet']
    });

    if (!userPet) {
      throw new Error('Mount not found');
    }

    if (!userPet.isTamedAsMount) {
      throw new Error('Pet is not tamed as mount');
    }

    const checks = {
      canRide: userPet.mountStamina >= 10,
      canUpgrade: true,
      canEquip: true,
      currentStamina: userPet.mountStamina,
      requiredStamina: 10
    };

    return checks;
  }
}

module.exports = new MountService();
