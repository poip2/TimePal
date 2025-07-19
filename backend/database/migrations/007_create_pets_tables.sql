-- PostgreSQL: 创建宠物系统相关表

-- 创建宠物定义表
CREATE TABLE IF NOT EXISTS pets (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('cat', 'dog', 'bird', 'dragon', 'mythical', 'elemental')),
    egg_type VARCHAR(50),
    potion_type VARCHAR(50),
    image_url VARCHAR(255),
    rarity VARCHAR(10) DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    base_stats JSONB DEFAULT '{}',
    max_level INTEGER DEFAULT 20,
    evolution_chain INTEGER[],
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建用户宠物关联表
CREATE TABLE IF NOT EXISTS user_pets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pet_id INTEGER REFERENCES pets(id) ON DELETE CASCADE,
    is_owned BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT false,
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    current_exp INTEGER DEFAULT 0 CHECK (current_exp >= 0),
    stats JSONB DEFAULT '{}',
    last_fed_time TIMESTAMP WITH TIME ZONE,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, pet_id)
);

-- 创建宠物合成材料表
CREATE TABLE IF NOT EXISTS pet_materials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    material_type VARCHAR(50) NOT NULL,
    quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, material_type)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_pets_key ON pets(key);
CREATE INDEX IF NOT EXISTS idx_pets_type ON pets(type);
CREATE INDEX IF NOT EXISTS idx_pets_rarity ON pets(rarity);

CREATE INDEX IF NOT EXISTS idx_user_pets_user_id ON user_pets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pets_pet_id ON user_pets(pet_id);
CREATE INDEX IF NOT EXISTS idx_user_pets_active ON user_pets(is_active);
CREATE INDEX IF NOT EXISTS idx_user_pets_owned ON user_pets(is_owned);

CREATE INDEX IF NOT EXISTS idx_pet_materials_user_id ON pet_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_materials_type ON pet_materials(material_type);

-- 创建更新时间触发器
CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_pets_updated_at BEFORE UPDATE ON user_pets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pet_materials_updated_at BEFORE UPDATE ON pet_materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 添加表注释
COMMENT ON TABLE pets IS '宠物定义表，存储所有可收集的宠物信息';
COMMENT ON COLUMN pets.key IS '宠物唯一标识符';
COMMENT ON COLUMN pets.name IS '宠物名称';
COMMENT ON COLUMN pets.type IS '宠物类型：cat,dog,bird,dragon,mythical,elemental';
COMMENT ON COLUMN pets.rarity IS '稀有度：common,uncommon,rare,epic,legendary';
COMMENT ON COLUMN pets.base_stats IS '基础属性JSON对象';
COMMENT ON COLUMN pets.max_level IS '宠物最高等级';
COMMENT ON COLUMN pets.evolution_chain IS '进化链，存储可进化成的宠物ID数组';

COMMENT ON TABLE user_pets IS '用户宠物关联表';
COMMENT ON COLUMN user_pets.is_owned IS '用户是否拥有该宠物';
COMMENT ON COLUMN user_pets.is_active IS '是否为当前激活的宠物';
COMMENT ON COLUMN user_pets.level IS '宠物当前等级';
COMMENT ON COLUMN user_pets.current_exp IS '当前经验值';
COMMENT ON COLUMN user_pets.stats IS '当前属性JSON对象';
COMMENT ON COLUMN user_pets.last_fed_time IS '上次喂养时间';

COMMENT ON TABLE pet_materials IS '宠物合成材料表';
COMMENT ON COLUMN pet_materials.material_type IS '材料类型：egg_common,potion_fire等';
COMMENT ON COLUMN pet_materials.quantity IS '材料数量';
