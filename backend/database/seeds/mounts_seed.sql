-- 坐骑系统种子数据
-- 添加坐骑相关材料和可坐骑的宠物

-- 1. 更新现有宠物为可坐骑状态
UPDATE pets SET
    can_be_mount = true,
    mount_type = 'flying',
    base_mount_speed = 150,
    mount_abilities = '["火焰冲刺", "龙威", "火焰护盾"]',
    mount_description = '传说中的火焰龙，拥有炽热的火焰之力，是空中最快的坐骑之一。能够进行火焰冲刺，短时间内提升移动速度。'
WHERE key = 'flame_dragon';

UPDATE pets SET
    can_be_mount = true,
    mount_type = 'land',
    base_mount_speed = 120,
    mount_abilities = '["冰霜疾驰", "耐寒", "雪地适应"]',
    mount_description = '来自极寒之地的冰霜狼，在雪地中行动如风。能够在雪地地形上获得速度加成，并减少寒冷地区的体力消耗。'
WHERE key = 'frost_wolf';

UPDATE pets SET
    can_be_mount = true,
    mount_type = 'flying',
    base_mount_speed = 180,
    mount_abilities = '["雷光闪", "风之守护", "空中机动"]',
    mount_description = '掌控雷电之力的神鸟，能够进行短距离的瞬间移动。飞行时免疫风系伤害，是空中旅行的最佳选择。'
WHERE key = 'thunder_bird';

UPDATE pets SET
    can_be_mount = true,
    mount_type = 'aquatic',
    base_mount_speed = 130,
    mount_abilities = '["水遁", "深海潜行", "水流加速"]',
    mount_description = '深海中的神秘生物，能够在水下快速移动。具有水遁能力，可以在水下呼吸并快速游动。'
WHERE key = 'water_dragon';

UPDATE pets SET
    can_be_mount = true,
    mount_type = 'magical',
    base_mount_speed = 160,
    mount_abilities = '["魔法传送", "相位移动", "魔力护盾"]',
    mount_description = '神秘的魔法生物，能够进行短距离的魔法传送。可以穿越障碍物，是探索未知区域的最佳伙伴。'
WHERE key = 'shadow_cat';

-- 2. 添加坐骑驯服材料到用户材料表（示例数据）
-- 注意：这些材料会在用户注册时自动添加，这里只是示例

-- 3. 添加坐骑技能详细数据
INSERT INTO mount_skills (pet_key, skill_name, skill_type, description, unlock_level, effect_value, icon_url) VALUES
-- 火焰龙技能
('flame_dragon', '火焰冲刺', 'speed', '短时间内提升50%移动速度，持续5秒', 1, '{"speed_multiplier": 1.5, "duration": 5}', '/images/skills/flame_dash.png'),
('flame_dragon', '龙威', 'special', '威慑敌人，降低遭遇野生宠物的概率30%', 3, '{"encounter_reduction": 0.3}', '/images/skills/dragon_aura.png'),
('flame_dragon', '火焰护盾', 'combat', '战斗中提供20%火焰伤害减免', 5, '{"damage_reduction": 0.2, "type": "fire"}', '/images/skills/flame_shield.png'),
('flame_dragon', '龙息', 'combat', '对敌人造成火焰伤害', 7, '{"damage": 150, "type": "fire"}', '/images/skills/dragon_breath.png'),

-- 冰霜狼技能
('frost_wolf', '冰霜疾驰', 'speed', '在雪地地形上速度提升100%', 1, '{"terrain_bonus": {"snow": 2.0}}', '/images/skills/frost_sprint.png'),
('frost_wolf', '耐寒', 'utility', '减少寒冷地区的体力消耗30%', 2, '{"stamina_cost_reduction": 0.3}', '/images/skills/cold_resistance.png'),
('frost_wolf', '冰甲', 'combat', '提供冰甲保护，减少20%物理伤害', 4, '{"damage_reduction": 0.2, "type": "physical"}', '/images/skills/ice_armor.png'),
('frost_wolf', '狼嚎', 'special', '召唤狼群协助战斗', 6, '{"summon_count": 2, "duration": 10}', '/images/skills/wolf_howl.png'),

-- 雷电鸟技能
('thunder_bird', '雷光闪', 'speed', '瞬间移动到短距离目标位置，范围100', 1, '{"teleport_range": 100}', '/images/skills/lightning_flash.png'),
('thunder_bird', '风之守护', 'special', '飞行时免疫风系伤害', 4, '{"wind_immunity": true}', '/images/skills/wind_guard.png'),
('thunder_bird', '雷电链', 'combat', '对多个敌人造成雷电伤害', 5, '{"damage": 120, "targets": 3}', '/images/skills/lightning_chain.png'),
('thunder_bird', '雷暴', 'combat', '召唤雷暴天气，提升雷电技能效果', 8, '{"weather_effect": "storm", "damage_bonus": 1.5}', '/images/skills/thunder_storm.png'),

-- 水龙技能
('water_dragon', '水遁', 'speed', '在水中移动速度提升80%', 1, '{"terrain_bonus": {"water": 1.8}}', '/images/skills/water_dash.png'),
('water_dragon', '深海潜行', 'special', '可以在水下呼吸，潜水时间延长50%', 2, '{"breath_duration": 1.5}', '/images/skills/deep_dive.png'),
('water_dragon', '水流加速', 'speed', '利用水流加速，速度提升40%', 3, '{"speed_bonus": 0.4}', '/images/skills/water_current.png'),
('water_dragon', '海啸', 'combat', '召唤海啸攻击敌人', 6, '{"damage": 200, "range": "large"}', '/images/skills/tsunami.png'),

-- 暗影猫技能
('shadow_cat', '魔法传送', 'special', '进行短距离魔法传送，无视障碍物', 1, '{"teleport_range": 80, "ignore_obstacles": true}', '/images/skills/magic_teleport.png'),
('shadow_cat', '相位移动', 'special', '可以穿过小型障碍物', 3, '{"phase_through": true}', '/images/skills/phase_shift.png'),
('shadow_cat', '魔力护盾', 'combat', '提供魔法护盾，吸收一定量的魔法伤害', 4, '{"shield_amount": 150}', '/images/skills/magic_shield.png'),
('shadow_cat', '暗影突袭', 'combat', '从阴影中突袭敌人，造成额外伤害', 5, '{"damage": 180, "crit_chance": 0.3}', '/images/skills/shadow_strike.png');

-- 4. 添加坐骑驯服材料类型（用于PetMaterial表）
-- 这些材料会在用户首次获得坐骑相关功能时自动添加
-- 材料类型说明：
-- mount_taming_scroll: 驯兽符，用于驯服坐骑
-- mount_essence: 坐骑精华，用于驯服坐骑
-- mount_upgrade_stone: 坐骑升级石，用于升级坐骑
-- mount_stamina_potion: 坐骑体力药水，用于恢复坐骑体力
-- mount_skill_scroll: 坐骑技能卷轴，用于解锁坐骑技能

-- 5. 创建坐骑图鉴解锁记录（示例）
-- 注意：这些记录会在用户首次驯服对应坐骑时自动创建

-- 6. 设置坐骑升级经验表
-- 坐骑升级经验公式：150 * (1.6^(level-1))
-- 最高等级：50级
