-- 宠物系统种子数据

-- 插入基础宠物数据
INSERT INTO pets (key, name, type, egg_type, potion_type, image_url, rarity, base_stats, max_level, description) VALUES
-- 普通宠物
('cat_gray', '灰猫', 'cat', 'egg_common', 'potion_common', '/images/pets/cat_gray.png', 'common', '{"strength": 5, "intelligence": 3, "luck": 2}', 20, '一只温顺的灰色小猫，喜欢安静地陪伴主人。'),
('dog_brown', '棕狗', 'dog', 'egg_common', 'potion_common', '/images/pets/dog_brown.png', 'common', '{"strength": 6, "constitution": 4, "luck": 1}', 20, '忠诚的棕色小狗，总是充满活力。'),
('bird_blue', '蓝鸟', 'bird', 'egg_common', 'potion_common', '/images/pets/bird_blue.png', 'common', '{"intelligence": 4, "perception": 5, "speed": 3}', 20, '灵巧的蓝色小鸟，歌声优美动听。'),

-- 不常见宠物
('cat_black', '黑猫', 'cat', 'egg_uncommon', 'potion_uncommon', '/images/pets/cat_black.png', 'uncommon', '{"strength": 7, "intelligence": 5, "luck": 3}', 25, '神秘的黑猫，据说能带来好运。'),
('dog_husky', '哈士奇', 'dog', 'egg_uncommon', 'potion_uncommon', '/images/pets/dog_husky.png', 'uncommon', '{"strength": 8, "constitution": 6, "speed": 4}', 25, '活泼的哈士奇，有着迷人的蓝眼睛。'),
('bird_parrot', '鹦鹉', 'bird', 'egg_uncommon', 'potion_uncommon', '/images/pets/bird_parrot.png', 'uncommon', '{"intelligence": 6, "perception": 7, "luck": 2}', 25, '聪明的鹦鹉，能够模仿人类语言。'),

-- 稀有宠物
('cat_siamese', '暹罗猫', 'cat', 'egg_rare', 'potion_rare', '/images/pets/cat_siamese.png', 'rare', '{"strength": 9, "intelligence": 8, "luck": 5, "speed": 4}', 30, '优雅的暹罗猫，拥有高贵的气质。'),
('dog_golden', '金毛', 'dog', 'egg_rare', 'potion_rare', '/images/pets/dog_golden.png', 'rare', '{"strength": 10, "constitution": 9, "luck": 3, "speed": 3}', 30, '温顺的金毛寻回犬，是最好的伙伴。'),
('bird_eagle', '鹰', 'bird', 'egg_rare', 'potion_rare', '/images/pets/bird_eagle.png', 'rare', '{"strength": 8, "perception": 10, "speed": 7, "luck": 2}', 30, '威武的雄鹰，拥有锐利的目光。'),

-- 史诗宠物
('dragon_fire', '火龙', 'dragon', 'egg_epic', 'potion_fire', '/images/pets/dragon_fire.png', 'epic', '{"strength": 15, "intelligence": 12, "constitution": 10, "luck": 5}', 35, '传说中的火龙，能够喷吐烈焰。'),
('dragon_ice', '冰龙', 'dragon', 'egg_epic', 'potion_ice', '/images/pets/dragon_ice.png', 'epic', '{"intelligence": 15, "constitution": 12, "perception": 10, "luck": 5}', 35, '神秘的冰龙，能够冻结一切。'),

-- 传说宠物
('phoenix', '凤凰', 'mythical', 'egg_legendary', 'potion_mystical', '/images/pets/phoenix.png', 'legendary', '{"strength": 20, "intelligence": 18, "constitution": 15, "luck": 10, "speed": 8}', 40, '不死的凤凰，象征着重生与永恒。'),
('unicorn', '独角兽', 'mythical', 'egg_legendary', 'potion_mystical', '/images/pets/unicorn.png', 'legendary', '{"intelligence": 20, "constitution": 15, "perception": 18, "luck": 12, "speed': 6}', 40, '纯洁的独角兽，拥有治愈的能力。');

-- 插入合成材料基础数据
-- 为演示目的，给用户ID为1的用户添加一些初始材料
INSERT INTO pet_materials (user_id, material_type, quantity) VALUES
(1, 'egg_common', 5),
(1, 'egg_uncommon', 3),
(1, 'egg_rare', 1),
(1, 'potion_common', 10),
(1, 'potion_uncommon', 5),
(1, 'potion_rare', 2),
(1, 'potion_fire', 3),
(1, 'potion_mystical', 1);
