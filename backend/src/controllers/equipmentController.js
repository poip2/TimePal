const Equipment = require('../models/Equipment');
const UserEquipment = require('../models/UserEquipment');
const User = require('../models/User');
const { sequelize } = require('../models');

const equipmentController = {
  // 获取所有装备（商店展示）
  async getAllEquipment(req, res) {
    try {
      const { type, class: className, rarity, minLevel, maxLevel } = req.query;

      const where = {};
      if (type) where.type = type;
      if (className) {
        where[sequelize.Sequelize.Op.or] = [
          { class: className },
          { class: null }
        ];
      }
      if (rarity) where.rarity = rarity;
      if (minLevel) where.levelRequired = { [sequelize.Sequelize.Op.gte]: parseInt(minLevel) };
      if (maxLevel) {
        where.levelRequired = where.levelRequired || {};
        where.levelRequired[sequelize.Sequelize.Op.lte] = parseInt(maxLevel);
      }

      const equipment = await Equipment.findAll({
        where,
        order: [
          ['type', 'ASC'],
          ['levelRequired', 'ASC'],
          ['rarity', 'ASC']
        ]
      });

      res.json({
        success: true,
        data: equipment,
        count: equipment.length
      });
    } catch (error) {
      console.error('获取装备列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取装备列表失败',
        error: error.message
      });
    }
  },

  // 获取单个装备详情
  async getEquipmentById(req, res) {
    try {
      const { id } = req.params;

      const equipment = await Equipment.findByPk(id);
      if (!equipment) {
        return res.status(404).json({
          success: false,
          message: '装备不存在'
        });
      }

      res.json({
        success: true,
        data: equipment
      });
    } catch (error) {
      console.error('获取装备详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取装备详情失败',
        error: error.message
      });
    }
  },

  // 获取用户已拥有的装备
  async getOwnedEquipment(req, res) {
    try {
      const userId = req.user.id;
      const { type, equipped } = req.query;

      const where = { userId, isOwned: true };
      if (type) {
        where['$Equipment.type$'] = type;
      }
      if (equipped !== undefined) {
        where.isEquipped = equipped === 'true';
      }

      const userEquipment = await UserEquipment.findAll({
        where,
        include: [{
          model: Equipment,
          as: 'equipment'
        }],
        order: [
          [{ model: Equipment, as: 'equipment' }, 'type', 'ASC'],
          [{ model: Equipment, as: 'equipment' }, 'levelRequired', 'ASC'],
          ['isEquipped', 'DESC'],
          ['equippedAt', 'DESC']
        ]
      });

      const formattedData = userEquipment.map(item => ({
        userEquipmentId: item.id,
        isEquipped: item.isEquipped,
        equippedAt: item.equippedAt,
        ...item.equipment.toJSON()
      }));

      res.json({
        success: true,
        data: formattedData,
        count: formattedData.length
      });
    } catch (error) {
      console.error('获取已拥有装备失败:', error);
      res.status(500).json({
        success: false,
        message: '获取已拥有装备失败',
        error: error.message
      });
    }
  },

  // 购买装备
  async buyEquipment(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const userId = req.user.id;
      const { id: equipmentId } = req.params;

      const user = await User.findByPk(userId, { transaction });
      const equipment = await Equipment.findByPk(equipmentId, { transaction });

      if (!user || !equipment) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: '用户或装备不存在'
        });
      }

      // 检查是否已拥有
      const existingUserEquipment = await UserEquipment.findByUserAndEquipment(userId, equipmentId);
      if (existingUserEquipment && existingUserEquipment.isOwned) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: '已拥有该装备'
        });
      }

      // 检查金币和宝石是否足够
      if (user.gold < equipment.goldCost) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: '金币不足',
          required: equipment.goldCost,
          current: user.gold
        });
      }

      if (user.gems < equipment.gemCost) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: '宝石不足',
          required: equipment.gemCost,
          current: user.gems
        });
      }

      // 扣除金币和宝石
      await user.update({
        gold: user.gold - equipment.goldCost,
        gems: user.gems - equipment.gemCost
      }, { transaction });

      // 创建或更新用户装备关系
      let userEquipment;
      if (existingUserEquipment) {
        userEquipment = await existingUserEquipment.update({
          isOwned: true
        }, { transaction });
      } else {
        userEquipment = await UserEquipment.create({
          userId,
          equipmentId,
          isOwned: true,
          isEquipped: false
        }, { transaction });
      }

      await transaction.commit();

      res.json({
        success: true,
        message: '购买成功',
        data: {
          userEquipmentId: userEquipment.id,
          equipment: equipment.toJSON(),
          remainingGold: user.gold,
          remainingGems: user.gems
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('购买装备失败:', error);
      res.status(500).json({
        success: false,
        message: '购买装备失败',
        error: error.message
      });
    }
  },

  // 装备物品
  async equipItem(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const userId = req.user.id;
      const { id: equipmentId } = req.params;

      const canEquip = await UserEquipment.canEquip(userId, equipmentId);
      if (!canEquip.canEquip) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: canEquip.reason
        });
      }

      const userEquipment = await UserEquipment.findByUserAndEquipment(userId, equipmentId);

      // 如果是武器、防具等，先卸下同类型的装备
      const equipment = await Equipment.findByPk(equipmentId);
      if (['weapon', 'armor', 'helmet', 'boots', 'gloves'].includes(equipment.type)) {
        await UserEquipment.update(
          { isEquipped: false, equippedAt: null },
          {
            where: {
              userId,
              isEquipped: true
            },
            include: [{
              model: Equipment,
              as: 'equipment',
              where: { type: equipment.type }
            }],
            transaction
          }
        );
      }

      // 装备新物品
      await userEquipment.update({
        isEquipped: true,
        equippedAt: new Date()
      }, { transaction });

      // 获取更新后的总属性加成
      const totalBonuses = await UserEquipment.getTotalBonuses(userId);

      await transaction.commit();

      res.json({
        success: true,
        message: '装备成功',
        data: {
          userEquipmentId: userEquipment.id,
          equipment: equipment.toJSON(),
          totalBonuses
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('装备物品失败:', error);
      res.status(500).json({
        success: false,
        message: '装备物品失败',
        error: error.message
      });
    }
  },

  // 卸下物品
  async unequipItem(req, res) {
    try {
      const userId = req.user.id;
      const { id: equipmentId } = req.params;

      const userEquipment = await UserEquipment.findByUserAndEquipment(userId, equipmentId);
      if (!userEquipment) {
        return res.status(404).json({
          success: false,
          message: '未找到该装备'
        });
      }

      if (!userEquipment.isEquipped) {
        return res.status(400).json({
          success: false,
          message: '该装备未装备'
        });
      }

      await userEquipment.update({
        isEquipped: false,
        equippedAt: null
      });

      // 获取更新后的总属性加成
      const totalBonuses = await UserEquipment.getTotalBonuses(userId);

      const equipment = await Equipment.findByPk(equipmentId);

      res.json({
        success: true,
        message: '卸下成功',
        data: {
          userEquipmentId: userEquipment.id,
          equipment: equipment.toJSON(),
          totalBonuses
        }
      });
    } catch (error) {
      console.error('卸下物品失败:', error);
      res.status(500).json({
        success: false,
        message: '卸下物品失败',
        error: error.message
      });
    }
  },

  // 获取装备统计信息
  async getEquipmentStats(req, res) {
    try {
      const userId = req.user.id;

      const [
        totalOwned,
        totalEquipped
      ] = await Promise.all([
        UserEquipment.count({
          where: { userId, isOwned: true }
        }),
        UserEquipment.count({
          where: { userId, isEquipped: true }
        })
      ]);

      // 使用原始查询来获取类型和稀有度统计
      const typeStats = await sequelize.query(`
        SELECT e.type, COUNT(ue.id) as count
        FROM user_equipment ue
        JOIN equipment e ON ue.equipment_id = e.id
        WHERE ue.user_id = :userId AND ue.is_owned = true
        GROUP BY e.type
      `, {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
      });

      const rarityStats = await sequelize.query(`
        SELECT e.rarity, COUNT(ue.id) as count
        FROM user_equipment ue
        JOIN equipment e ON ue.equipment_id = e.id
        WHERE ue.user_id = :userId AND ue.is_owned = true
        GROUP BY e.rarity
      `, {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
      });

      const totalBonuses = await UserEquipment.getTotalBonuses(userId);

      res.json({
        success: true,
        data: {
          totalOwned,
          totalEquipped,
          totalTypes: (Array.isArray(typeStats) ? typeStats : [typeStats]).filter(Boolean).map(item => ({
            type: item.type,
            count: parseInt(item.count)
          })),
          totalRarities: (Array.isArray(rarityStats) ? rarityStats : [rarityStats]).filter(Boolean).map(item => ({
            rarity: item.rarity,
            count: parseInt(item.count)
          })),
          totalBonuses
        }
      });
    } catch (error) {
      console.error('获取装备统计信息失败:', error);
      res.status(500).json({
        success: false,
        message: '获取装备统计信息失败',
        error: error.message
      });
    }
  }
};

module.exports = equipmentController;
