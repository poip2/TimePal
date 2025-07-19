-- PostgreSQL: 添加坐骑系统功能到现有宠物系统

-- 1. 扩展pets表，添加坐骑相关字段
ALTER TABLE pets
ADD COLUMN IF NOT EXISTS can_be_mount BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mount_type VARCHAR(20) CHECK (mount_type IN ('land', 'flying', 'aquatic', 'magical')),
ADD COLUMN IF NOT EXISTS base_mount_speed INTEGER DEFAULT 100 CHECK (base_mount_speed > 0),
ADD COLUMN IF NOT EXISTS mount_abilities JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS mount_description TEXT;

-- 2. 扩展user_pets表，添加坐骑状态字段
ALTER TABLE user_pets
ADD COLUMN IF NOT EXISTS is_tamed_as_mount BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mount_level INTEGER DEFAULT 1 CHECK (mount_level >= 1),
ADD COLUMN IF NOT EXISTS mount_exp INTEGER DEFAULT 0 CHECK (mount_exp >= 0),
ADD COLUMN IF NOT EXISTS mount_equipped BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mount_speed_bonus INTEGER DEFAULT 0 CHECK (mount_speed_bonus >= 0),
ADD COLUMN IF NOT EXISTS unlocked_mount_skills INTEGER[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS mount_stamina INTEGER DEFAULT 100 CHECK (mount_stamina >= 0 AND mount_stamina <= 100),
ADD COLUMN IF NOT EXISTS last_mount_use TIMESTAMP WITH TIME ZONE;

-- 3. 创建坐骑技能表
CREATE TABLE IF NOT EXISTS mount_skills (
    id SERIAL PRIMARY KEY,
    pet_key VARCHAR(50) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    skill_type VARCHAR(20) NOT NULL CHECK (skill_type IN ('speed', 'stamina', 'special', 'combat', 'utility')),
    description TEXT NOT NULL,
    unlock_level INTEGER DEFAULT 1 CHECK (unlock_level >= 1),
    effect_value JSONB DEFAULT '{}',
    icon_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pet_key, skill_name)
);

-- 4. 创建坐骑驯服材料表（扩展现有pet_materials表）
-- 使用现有pet_materials表，添加坐骑相关材料类型
-- 材料类型示例: mount_taming_scroll, mount_upgrade_stone, mount_stamina_potion

-- 5. 创建坐骑图鉴解锁表
CREATE TABLE IF NOT EXISTS mount_collection (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pet_key VARCHAR(50) NOT NULL,
    first_tamed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    mount_count INTEGER DEFAULT 0 CHECK (mount_count >= 0),
    max_mount_level INTEGER DEFAULT 1 CHECK (max_mount_level >= 1),
    UNIQUE(user_id, pet_key)
);

-- 6. 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_pets_can_be_mount ON pets(can_be_mount);
CREATE INDEX IF NOT EXISTS idx_pets_mount_type ON pets(mount_type);
CREATE INDEX IF NOT EXISTS idx_user_pets_mount_equipped ON user_pets(mount_equipped) WHERE mount_equipped = true;
CREATE INDEX IF NOT EXISTS idx_user_pets_is_tamed_as_mount ON user_pets(is_tamed_as_mount);
CREATE INDEX IF NOT EXISTS idx_mount_skills_pet_key ON mount_skills(pet_key);
CREATE INDEX IF NOT EXISTS idx_mount_collection_user_id ON mount_collection(user_id);

-- 7. 创建触发器自动更新时间戳
CREATE TRIGGER update_mount_skills_updated_at BEFORE UPDATE ON mount_skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. 添加表注释
COMMENT ON COLUMN pets.can_be_mount IS '该宠物是否可以被驯服为坐骑';
COMMENT ON COLUMN pets.mount_type IS '坐骑类型：land陆地, flying飞行, aquatic水生, magical魔法';
COMMENT ON COLUMN pets.base_mount_speed IS '坐骑基础速度值';
COMMENT ON COLUMN pets.mount_abilities IS '坐骑特殊能力JSON数组';
COMMENT ON COLUMN pets.mount_description IS '坐骑描述文本';

COMMENT ON COLUMN user_pets.is_tamed_as_mount IS '该宠物是否已被驯服为坐骑';
COMMENT ON COLUMN user_pets.mount_level IS '坐骑当前等级';
COMMENT ON COLUMN user_pets.mount_exp IS '坐骑当前经验值';
COMMENT ON COLUMN user_pets.mount_equipped IS '是否为当前装备的坐骑';
COMMENT ON COLUMN user_pets.mount_speed_bonus IS '坐骑速度加成值';
COMMENT ON COLUMN user_pets.unlocked_mount_skills IS '已解锁的坐骑技能ID数组';
COMMENT ON COLUMN user_pets.mount_stamina IS '坐骑当前体力值';
COMMENT ON COLUMN user_pets.last_mount_use IS '上次使用坐骑的时间';

COMMENT ON TABLE mount_skills IS '坐骑技能定义表';
COMMENT ON TABLE mount_collection IS '用户坐骑图鉴收集表';

-- 9. 插入示例坐骑技能数据
INSERT INTO mount_skills (pet_key, skill_name, skill_type, description, unlock_level, effect_value, icon_url) VALUES
-- 火焰龙坐骑技能
('flame_dragon', '火焰冲刺', 'speed', '短时间内提升50%移动速度', 1, '{"speed_multiplier": 1.5, "duration": 5}', '/images/skills/flame_dash.png'),
('flame_dragon', '龙威', 'special', '威慑敌人，降低遭遇野生宠物的概率', 3, {'encounter_reduction': 0.3}, '/images/skills/dragon_aura.png'),
('flame_dragon', '火焰护盾', 'combat', '战斗中提供火焰伤害减免', 5, {'damage_reduction': 0.2, 'type': 'fire'}, '/images/skills/flame_shield.png'),

-- 冰霜狼坐骑技能
('frost_wolf', '冰霜疾驰', 'speed', '在雪地地形上速度提升100%', 1, {'terrain_bonus': {'snow': 2.0}}, '/images/skills/frost_sprint.png'),
('frost_wolf', '耐寒', 'utility', '减少寒冷地区的体力消耗', 2, {'stamina_cost_reduction': 0.3}, '/images/skills/cold_resistance.png'),

-- 雷电鸟坐骑技能
('thunder_bird', '雷光闪', 'speed', '瞬间移动到短距离目标位置', 1, {'teleport_range': 100}, '/images/skills/lightning_flash.png'),
('thunder_bird', '风之守护', 'special', '飞行时免疫风系伤害', 4, {'wind_immunity': true}, '/images/skills/wind_guard.png');

-- 10. 更新现有宠物为可坐骑状态（示例数据）
UPDATE pets SET
    can_be_mount = true,
    mount_type = 'flying',
    base_mount_speed = 150,
    mount_description = '传说中的火焰龙，拥有炽热的火焰之力，是空中最快的坐骑之一'
WHERE key = 'flame_dragon';

UPDATE pets SET
    can_be_mount = true,
    mount_type = 'land',
    base_mount_speed = 120,
    mount_description = '来自极寒之地的冰霜狼，在雪地中行动如风'
WHERE key = 'frost_wolf';

UPDATE pets SET
    can_be_mount = true,
    mount_type = 'flying',
    base_mount_speed = 180,
    mount_description = '掌控雷电之力的神鸟，能够进行短距离的瞬间移动'
WHERE key = 'thunder_bird';
