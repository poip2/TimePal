-- 装备系统数据库迁移
-- 创建装备定义表和用户装备关系表

-- 创建装备表
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('weapon', 'armor', 'accessory', 'helmet', 'boots', 'gloves')),
    class VARCHAR(20) CHECK (class IN ('warrior', 'mage', 'rogue', 'archer', NULL)),
    strength_bonus INTEGER DEFAULT 0 CHECK (strength_bonus >= 0),
    intelligence_bonus INTEGER DEFAULT 0 CHECK (intelligence_bonus >= 0),
    constitution_bonus INTEGER DEFAULT 0 CHECK (constitution_bonus >= 0),
    perception_bonus INTEGER DEFAULT 0 CHECK (perception_bonus >= 0),
    gold_cost INTEGER DEFAULT 0 CHECK (gold_cost >= 0),
    gem_cost INTEGER DEFAULT 0 CHECK (gem_cost >= 0),
    image_url VARCHAR(255),
    level_required INTEGER DEFAULT 1 CHECK (level_required >= 1),
    description TEXT,
    rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建用户装备关系表
CREATE TABLE IF NOT EXISTS user_equipment (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
    is_owned BOOLEAN DEFAULT false,
    is_equipped BOOLEAN DEFAULT false,
    equipped_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, equipment_id)
);

-- 创建索引以提高查询性能
CREATE INDEX idx_equipment_type ON equipment(type);
CREATE INDEX idx_equipment_class ON equipment(class);
CREATE INDEX idx_equipment_level ON equipment(level_required);
CREATE INDEX idx_user_equipment_user ON user_equipment(user_id);
CREATE INDEX idx_user_equipment_equipment ON user_equipment(equipment_id);
CREATE INDEX idx_user_equipment_owned ON user_equipment(user_id, is_owned);
CREATE INDEX idx_user_equipment_equipped ON user_equipment(user_id, is_equipped);

-- 创建更新时间戳触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_equipment_updated_at BEFORE UPDATE ON user_equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入初始装备数据
INSERT INTO equipment (key, name, type, class, strength_bonus, intelligence_bonus, constitution_bonus, perception_bonus, gold_cost, gem_cost, level_required, description, rarity) VALUES
-- 战士装备
('iron_sword', '铁剑', 'weapon', 'warrior', 5, 0, 2, 0, 100, 0, 1, '基础战士武器，提供力量和体质加成', 'common'),
('steel_sword', '钢剑', 'weapon', 'warrior', 8, 0, 3, 0, 300, 0, 5, '强化版战士武器，属性提升明显', 'rare'),
('dragon_slayer', '屠龙剑', 'weapon', 'warrior', 15, 0, 8, 0, 2000, 50, 15, '传说中的战士武器，拥有巨大威力', 'legendary'),

-- 法师装备
('apprentice_staff', '学徒法杖', 'weapon', 'mage', 0, 5, 1, 2, 100, 0, 1, '基础法师武器，提供智力和感知加成', 'common'),
('mystic_staff', '神秘法杖', 'weapon', 'mage', 0, 8, 2, 3, 300, 0, 5, '强化版法师武器，魔法威力更强', 'rare'),
('arcane_staff', '奥术法杖', 'weapon', 'mage', 0, 15, 5, 8, 2000, 50, 15, '传说中的法师武器，蕴含无穷魔力', 'legendary'),

-- 盗贼装备
('shadow_dagger', '暗影匕首', 'weapon', 'rogue', 2, 0, 1, 5, 100, 0, 1, '基础盗贼武器，提供敏捷和感知加成', 'common'),
('assassin_blade', '刺客之刃', 'weapon', 'rogue', 3, 0, 2, 8, 300, 0, 5, '强化版盗贼武器，致命而精准', 'rare'),
('death_sting', '死亡之刺', 'weapon', 'rogue', 5, 0, 3, 15, 2000, 50, 15, '传说中的盗贼武器，一击必杀', 'legendary'),

-- 弓箭手装备
('hunting_bow', '猎弓', 'weapon', 'archer', 0, 2, 1, 5, 100, 0, 1, '基础弓箭手武器，提供感知和智力加成', 'common'),
('eagle_bow', '鹰弓', 'weapon', 'archer', 0, 3, 2, 8, 300, 0, 5, '强化版弓箭手武器，精准无比', 'rare'),
('windforce', '风之力', 'weapon', 'archer', 0, 5, 3, 15, 2000, 50, 15, '传说中的弓箭手武器，箭无虚发', 'legendary'),

-- 防具（通用）
('leather_armor', '皮甲', 'armor', NULL, 1, 0, 5, 0, 150, 0, 1, '基础防具，提供体质加成', 'common'),
('chain_mail', '锁子甲', 'armor', NULL, 2, 0, 8, 0, 400, 0, 5, '强化防具，防御力更强', 'rare'),
('plate_armor', '板甲', 'armor', NULL, 3, 0, 12, 0, 1500, 30, 10, '高级防具，提供强大防护', 'epic'),

-- 饰品（通用）
('power_ring', '力量戒指', 'accessory', NULL, 3, 0, 0, 0, 200, 0, 1, '增加力量的魔法戒指', 'common'),
('wisdom_ring', '智慧戒指', 'accessory', NULL, 0, 3, 0, 0, 200, 0, 1, '增加智力的魔法戒指', 'common'),
('vitality_ring', '活力戒指', 'accessory', NULL, 0, 0, 3, 0, 200, 0, 1, '增加体质的魔法戒指', 'common'),
('insight_ring', '洞察戒指', 'accessory', NULL, 0, 0, 0, 3, 200, 0, 1, '增加感知的魔法戒指', 'common');
