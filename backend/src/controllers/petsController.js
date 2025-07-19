const PetService = require('../services/petService');
const Joi = require('joi');

// 验证schema
const feedPetSchema = Joi.object({
  foodAmount: Joi.number().integer().min(1).max(100).default(10)
});

const hatchPetSchema = Joi.object({
  petId: Joi.number().integer().min(1).required()
});

const equipPetSchema = Joi.object({
  userPetId: Joi.number().integer().min(1).required()
});

// 坐骑相关验证schema
const tameMountSchema = Joi.object({
  userPetId: Joi.number().integer().min(1).required()
});

const mountActionSchema = Joi.object({
  userPetId: Joi.number().integer().min(1).required()
});

/**
 * 获取所有宠物
 */
const getAllPets = async (req, res) => {
  try {
    const pets = await PetService.getAllPets();

    res.json({
      success: true,
      data: { pets }
    });
  } catch (error) {
    console.error('获取宠物列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 获取用户已拥有的宠物
 */
const getUserOwnedPets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const pets = await PetService.getUserOwnedPets(userId);

    res.json({
      success: true,
      data: { pets }
    });
  } catch (error) {
    console.error('获取用户宠物错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 获取宠物详情
 */
const getPetById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const pet = await PetService.getPetWithUserStatus(userId, parseInt(id));

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: '宠物不存在'
      });
    }

    res.json({
      success: true,
      data: { pet }
    });
  } catch (error) {
    console.error('获取宠物详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 获取用户激活的宠物
 */
const getUserActivePet = async (req, res) => {
  try {
    const userId = req.user.userId;
    const pet = await PetService.getUserActivePet(userId);

    res.json({
      success: true,
      data: { pet }
    });
  } catch (error) {
    console.error('获取激活宠物错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 获取宠物图鉴进度
 */
const getCollectionProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const progress = await PetService.getCollectionProgress(userId);

    res.json({
      success: true,
      data: { progress }
    });
  } catch (error) {
    console.error('获取图鉴进度错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 获取用户稀有度统计
 */
const getUserRarityStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const stats = await PetService.getUserRarityStats(userId);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('获取稀有度统计错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 获取用户材料
 */
const getUserMaterials = async (req, res) => {
  try {
    const userId = req.user.userId;
    const materials = await PetService.getUserMaterials(userId);

    res.json({
      success: true,
      data: { materials }
    });
  } catch (error) {
    console.error('获取用户材料错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 孵化宠物
 */
const hatchPet = async (req, res) => {
  try {
    const { error } = hatchPetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: error.details.map(detail => detail.message)
      });
    }

    const userId = req.user.userId;
    const { petId } = req.body;

    const userPet = await PetService.hatchPet(userId, petId);

    res.json({
      success: true,
      message: '宠物孵化成功',
      data: { userPet }
    });
  } catch (error) {
    console.error('孵化宠物错误:', error);

    if (error.message.includes('缺少孵化材料')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('已经拥有')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('宠物不存在')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 喂养宠物
 */
const feedPet = async (req, res) => {
  try {
    const { error } = feedPetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: error.details.map(detail => detail.message)
      });
    }

    const userId = req.user.userId;
    const { userPetId } = req.params;
    const { foodAmount } = req.body;

    const result = await PetService.feedPet(userId, parseInt(userPetId), foodAmount);

    res.json({
      success: true,
      message: result.leveledUp ? '宠物升级了！' : '喂养成功',
      data: { result }
    });
  } catch (error) {
    console.error('喂养宠物错误:', error);

    if (error.message.includes('宠物不存在') || error.message.includes('未拥有')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('缺少喂养材料')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 装备宠物
 */
const equipPet = async (req, res) => {
  try {
    const { error } = equipPetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: error.details.map(detail => detail.message)
      });
    }

    const userId = req.user.userId;
    const { userPetId } = req.body;

    const userPet = await PetService.equipPet(userId, userPetId);

    res.json({
      success: true,
      message: '宠物装备成功',
      data: { userPet }
    });
  } catch (error) {
    console.error('装备宠物错误:', error);

    if (error.message.includes('Pet not found')) {
      return res.status(404).json({
        success: false,
        message: '宠物不存在或未拥有'
      });
    }

    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 卸下宠物
 */
const unequipPet = async (req, res) => {
  try {
    const userId = req.user.userId;

    const userPet = await PetService.unequipPet(userId);

    res.json({
      success: true,
      message: '宠物卸下成功',
      data: { userPet }
    });
  } catch (error) {
    console.error('卸下宠物错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 获取可成为坐骑的宠物列表
 */
const getMountablePets = async (req, res) => {
  try {
    const { Pet } = require('../models');
    const mountablePets = await Pet.getMountablePets();

    res.json({
      success: true,
      data: { pets: mountablePets }
    });
  } catch (error) {
    console.error('获取可坐骑宠物错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 获取用户的坐骑列表
 */
const getUserMounts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const MountService = require('../services/mountService');
    const mounts = await MountService.getUserMounts(userId);

    res.json({
      success: true,
      data: { mounts }
    });
  } catch (error) {
    console.error('获取用户坐骑错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 获取用户的坐骑统计
 */
const getMountStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const MountService = require('../services/mountService');
    const stats = await MountService.getMountStats(userId);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('获取坐骑统计错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 获取可驯服的宠物
 */
const getTamablePets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const MountService = require('../services/mountService');
    const tamablePets = await MountService.getTamablePets(userId);

    res.json({
      success: true,
      data: { pets: tamablePets }
    });
  } catch (error) {
    console.error('获取可驯服宠物错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 驯服宠物为坐骑
 */
const tameMount = async (req, res) => {
  try {
    const { error } = tameMountSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: error.details.map(detail => detail.message)
      });
    }

    const userId = req.user.userId;
    const { userPetId } = req.body;
    const MountService = require('../services/mountService');

    const result = await MountService.tameMount(userId, userPetId);

    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('驯服坐骑错误:', error);

    if (error.message.includes('Pet not found') ||
      error.message.includes('not owned') ||
      error.message.includes('cannot be tamed')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('level 5') ||
      error.message.includes('Insufficient')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('already tamed')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 装备坐骑
 */
const equipMount = async (req, res) => {
  try {
    const { error } = mountActionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: error.details.map(detail => detail.message)
      });
    }

    const userId = req.user.userId;
    const { userPetId } = req.body;
    const MountService = require('../services/mountService');

    const result = await MountService.equipMount(userId, userPetId);

    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('装备坐骑错误:', error);

    if (error.message.includes('Mount not found') ||
      error.message.includes('not tamed')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 卸下坐骑
 */
const unequipMount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const MountService = require('../services/mountService');

    const result = await MountService.unequipMount(userId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('卸下坐骑错误:', error);

    if (error.message.includes('No mount')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 升级坐骑
 */
const upgradeMount = async (req, res) => {
  try {
    const { error } = mountActionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: error.details.map(detail => detail.message)
      });
    }

    const userId = req.user.userId;
    const { userPetId } = req.body;
    const { expAmount } = req.body;
    const MountService = require('../services/mountService');

    const result = await MountService.upgradeMount(userId, userPetId, expAmount);

    res.json({
      success: true,
      message: result.leveledUp ? '坐骑升级成功！' : '坐骑经验增加',
      data: result
    });
  } catch (error) {
    console.error('升级坐骑错误:', error);

    if (error.message.includes('Mount not found') ||
      error.message.includes('not tamed')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 检查坐骑操作资格
 */
const checkMountAction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { userPetId } = req.params;
    const { action } = req.query;

    const MountService = require('../services/mountService');
    const result = await MountService.checkMountAction(userId, parseInt(userPetId), action);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('检查坐骑操作错误:', error);

    if (error.message.includes('Mount not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

module.exports = {
  getAllPets,
  getUserOwnedPets,
  getPetById,
  getUserActivePet,
  getCollectionProgress,
  getUserRarityStats,
  getUserMaterials,
  hatchPet,
  feedPet,
  equipPet,
  unequipPet,
  // 坐骑相关方法
  getMountablePets,
  getUserMounts,
  getMountStats,
  getTamablePets,
  tameMount,
  equipMount,
  unequipMount,
  upgradeMount,
  checkMountAction
};
