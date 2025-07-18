#!/bin/bash

# 批量创建GitHub Issues脚本
# 基于issues-config-habitica.json配置文件

echo "开始批量创建GitHub Issues..."

# 创建项目初始化与环境搭建
gh issue create --title "🏗️ 项目初始化与环境搭建" --body "## 📋 任务描述
完成TimePal项目的基础环境搭建和项目初始化

## ✅ 检查清单
- [x] 安装Flutter开发环境（3.0+版本）
- [x] 配置Node.js开发环境
- [x] 搭建PostgreSQL数据库
- [x] 创建Flutter项目结构
- [x] 创建Express.js后端项目
- [x] 配置项目依赖
- [x] 设置代码规范和Git工作流
- [x] 配置开发工具（VSCode、Postman等）

## 📁 相关文件
- docs/Implementation.md 第一阶段任务
- docs/ProjectStructure.md 项目结构规范

## ⏱️ 预计时间
2-3天

## 🏷️ 标签
setup, infrastructure, high-priority"

# 创建用户认证系统 - 后端API
gh issue create --title "🔐 用户认证系统 - 后端API" --body "## 📋 任务描述
实现完整的用户认证系统后端API

## ✅ 检查清单
- [x] 设计用户表结构（users表）
- [x] 实现用户注册API (POST /api/auth/register)
- [x] 实现用户登录API (POST /api/auth/login)
- [x] JWT令牌生成与验证
- [x] 密码加密存储（bcryptjs）
- [x] 输入验证和错误处理
- [x] API文档编写
- [x] 单元测试编写

## 🔧 技术规范
- 使用JWT进行身份验证
- 密码加密：bcryptjs
- 输入验证：Joi
- 返回统一格式的响应

## 📁 相关文件
- backend/src/controllers/authController.js
- backend/src/models/User.js
- backend/src/routes/auth.js

## ⏱️ 预计时间
3天

## 🏷️ 标签
backend, auth, api, security"

# 创建用户认证界面 - 前端
gh issue create --title "🖥️ 用户认证界面 - 前端" --body "## 📋 任务描述
实现用户认证相关的前端界面

## ✅ 检查清单
- [x] 创建登录页面 (LoginPage)
- [x] 创建注册页面 (RegisterPage)
- [x] 实现表单验证（前端）
- [x] 集成后端认证API
- [x] 实现状态管理（Provider）
- [x] 添加加载状态和错误处理
- [x] 实现自动登录（记住我功能）
- [x] 响应式设计适配

## 🎨 UI/UX要求
- 遵循设计系统规范（颜色、字体、间距）
- 支持深色/浅色主题切换
- 表单验证友好的错误提示
- 加载动画和状态反馈

## 📁 相关文件
- frontend/lib/presentation/pages/auth/login_page.dart
- frontend/lib/presentation/pages/auth/register_page.dart
- frontend/lib/data/providers/auth_provider.dart

## ⏱️ 预计时间
3天

## 🏷️ 标签
frontend, auth, ui, mobile"

# 创建扩展用户系统 - 游戏化属性
gh issue create --title "👤 扩展用户系统 - 游戏化属性" --body "## 📋 任务描述
实现Habitica风格的用户游戏化属性系统

## ✅ 检查清单
- [ ] 设计用户游戏化属性表结构
- [ ] 实现等级系统（level, experience, experience_to_next）
- [ ] 实现生命值系统（health, max_health）
- [ ] 实现魔法值系统（mana, max_mana）
- [ ] 实现货币系统（coins, gold）
- [ ] 实现职业系统（class, class_points）
- [ ] 实现四维属性（strength, intelligence, constitution, perception）
- [ ] 实现用户统计字段（total_tasks_completed, streak_highest, login_streak）

## 📊 数据模型
\`\`\`sql
-- 用户游戏化属性扩展
ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN experience INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN experience_to_next INTEGER DEFAULT 100;
ALTER TABLE users ADD COLUMN health INTEGER DEFAULT 50;
ALTER TABLE users ADD COLUMN max_health INTEGER DEFAULT 50;
ALTER TABLE users ADD COLUMN mana INTEGER DEFAULT 10;
ALTER TABLE users ADD COLUMN max_mana INTEGER DEFAULT 10;
ALTER TABLE users ADD COLUMN coins INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN gold INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN class VARCHAR(20) DEFAULT 'warrior';
\`\`\`

## 🔗 API端点
- \`GET /api/users/stats\` - 获取用户游戏化属性
- \`PUT /api/users/stats\` - 更新用户属性
- \`POST /api/users/level-up\` - 处理升级逻辑
- \`GET /api/users/class\` - 获取职业信息

## ⏱️ 预计时间
3天

## 🏷️ 标签
backend, user-system, gamification, database"

# 创建任务系统 - 习惯管理
gh issue create --title "🎯 任务系统 - 习惯管理" --body "## 📋 任务描述
实现完整的习惯管理系统（Habits）

## ✅ 检查清单
- [ ] 设计习惯表结构（habits表）
- [ ] 实现习惯CRUD操作
- [ ] 实现习惯评分系统（正向/负向）
- [ ] 实现难度系统（trivial, easy, medium, hard）
- [ ] 实现计数器功能（counter_up, counter_down）
- [ ] 实现习惯排序和分类
- [ ] 实现习惯归档功能
- [ ] 实现习惯历史记录

## 📊 数据模型
\`\`\`sql
CREATE TABLE habits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    notes TEXT,
    type VARCHAR(10) NOT NULL, -- good, bad
    difficulty VARCHAR(10) DEFAULT 'easy',
    up_count INTEGER DEFAULT 0,
    down_count INTEGER DEFAULT 0,
    counter_up INTEGER DEFAULT 0,
    counter_down INTEGER DEFAULT 0,
    position INTEGER DEFAULT 0,
    is_positive BOOLEAN DEFAULT true,
    is_negative BOOLEAN DEFAULT true,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## 🔗 API端点
- \`GET /api/habits\` - 获取所有习惯
- \`POST /api/habits\` - 创建新习惯
- \`GET /api/habits/:id\` - 获取单个习惯
- \`PUT /api/habits/:id\` - 更新习惯
- \`DELETE /api/habits/:id\` - 删除习惯
- \`POST /api/habits/:id/score\` - 评分习惯（up/down）

## ⏱️ 预计时间
4天

## 🏷️ 标签
backend, habits, tasks, crud"

# 创建任务系统 - 每日任务
gh issue create --title "📅 任务系统 - 每日任务" --body "## 📋 任务描述
实现每日任务管理系统（Dailies）

## ✅ 检查清单
- [ ] 设计每日任务表结构（dailies）
- [ ] 实现复杂的重复规则系统
- [ ] 实现连续完成奖励（streak系统）
- [ ] 实现提醒时间设置
- [ ] 实现任务完成状态跟踪
- [ ] 实现最长连续记录
- [ ] 实现任务归档和激活
- [ ] 实现每日重置逻辑

## 📊 数据模型
\`\`\`sql
CREATE TABLE dailies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    notes TEXT,
    difficulty VARCHAR(10) DEFAULT 'easy',
    repeat_type VARCHAR(10) DEFAULT 'weekly',
    repeat_days JSONB DEFAULT '[]',
    start_date DATE,
    every_x INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    last_completed_date DATE,
    reminder_time TIME,
    position INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## 🔗 API端点
- \`GET /api/dailies\` - 获取所有每日任务
- \`POST /api/dailies\` - 创建每日任务
- \`GET /api/dailies/:id\` - 获取单个每日任务
- \`PUT /api/dailies/:id\` - 更新每日任务
- \`DELETE /api/dailies/:id\` - 删除每日任务
- \`POST /api/dailies/:id/complete\` - 完成每日任务
- \`POST /api/dailies/:id/uncomplete\` - 取消完成

## ⏱️ 预计时间
4天

## 🏷️ 标签
backend, dailies, tasks, scheduling"

# 创建任务系统 - 待办事项
gh issue create --title "✅ 任务系统 - 待办事项" --body "## 📋 任务描述
实现待办事项管理系统（Todos）

## ✅ 检查清单
- [ ] 设计待办事项表结构（todos）
- [ ] 实现检查清单功能（checklist）
- [ ] 实现截止日期管理
- [ ] 实现任务完成状态跟踪
- [ ] 实现任务排序和优先级
- [ ] 实现任务历史记录
- [ ] 实现任务删除和恢复
- [ ] 实现任务统计功能

## 📊 数据模型
\`\`\`sql
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    notes TEXT,
    difficulty VARCHAR(10) DEFAULT 'easy',
    due_date DATE,
    date_completed TIMESTAMP,
    checklist JSONB DEFAULT '[]',
    is_completed BOOLEAN DEFAULT false,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## 🔗 API端点
- \`GET /api/todos\` - 获取所有待办事项
- \`POST /api/todos\` - 创建待办事项
- \`GET /api/todos/:id\` - 获取单个待办事项
- \`PUT /api/todos/:id\` - 更新待办事项
- \`DELETE /api/todos/:id\` - 删除待办事项
- \`POST /api/todos/:id/complete\` - 完成待办事项

## ⏱️ 预计时间
3天

## 🏷️ 标签
backend, todos, tasks, checklist"

# 创建物品系统 - 装备管理
gh issue create --title "🗡️ 物品系统 - 装备管理" --body "## 📋 任务描述
实现完整的装备系统，包括武器、防具等

## ✅ 检查清单
- [ ] 设计装备表结构（equipment）
- [ ] 实现装备属性加成系统
- [ ] 实现装备购买和解锁
- [ ] 实现装备穿戴和卸下
- [ ] 实现职业限制和等级要求
- [ ] 实现用户装备管理
- [ ] 实现装备商店界面
- [ ] 实现装备分类和筛选

## 📊 数据模型
\`\`\`sql
CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    class VARCHAR(20),
    strength_bonus INTEGER DEFAULT 0,
    intelligence_bonus INTEGER DEFAULT 0,
    constitution_bonus INTEGER DEFAULT 0,
    perception_bonus INTEGER DEFAULT 0,
    gold_cost INTEGER DEFAULT 0,
    gem_cost INTEGER DEFAULT 0,
    image_url VARCHAR(255),
    level_required INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_equipment (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
    is_owned BOOLEAN DEFAULT false,
    is_equipped BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, equipment_id)
);
\`\`\`

## 🔗 API端点
- \`GET /api/equipment\` - 获取所有装备
- \`GET /api/equipment/owned\` - 获取已拥有装备
- \`POST /api/equipment/:id/buy\` - 购买装备
- \`POST /api/equipment/:id/equip\` - 装备物品
- \`POST /api/equipment/:id/unequip\` - 卸下物品

## ⏱️ 预计时间
4天

## 🏷️ 标签
backend, equipment, items, shop"

# 创建物品系统 - 宠物系统
gh issue create --title "🐾 物品系统 - 宠物系统" --body "## 📋 任务描述
实现宠物收集、孵化和升级系统

## ✅ 检查清单
- [ ] 设计宠物表结构（pets）
- [ ] 实现宠物蛋和药水的合成系统
- [ ] 实现宠物孵化逻辑
- [ ] 实现宠物升级系统
- [ ] 实现宠物装备和卸下
- [ ] 实现宠物稀有度系统
- [ ] 实现用户宠物收藏
- [ ] 实现宠物图鉴功能

## 📊 数据模型
\`\`\`sql
CREATE TABLE pets (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    egg_type VARCHAR(50),
    potion_type VARCHAR(50),
    image_url VARCHAR(255),
    rarity VARCHAR(10) DEFAULT 'common',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_pets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pet_id INTEGER REFERENCES pets(id) ON DELETE CASCADE,
    is_owned BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT false,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, pet_id)
);
\`\`\`

## 🔗 API端点
- \`GET /api/pets\` - 获取所有宠物
- \`GET /api/pets/owned\` - 获取已拥有宠物
- \`POST /api/pets/:id/hatch\` - 孵化宠物
- \`POST /api/pets/:id/feed\` - 喂养宠物
- \`POST /api/pets/:id/equip\` - 装备宠物

## ⏱️ 预计时间
4天

## 🏷️ 标签
backend, pets, collection, gamification"

# 创建物品系统 - 坐骑系统
gh issue create --title "🐎 物品系统 - 坐骑系统" --body "## 📋 任务描述
实现坐骑收集和装备系统

## ✅ 检查清单
- [ ] 设计坐骑表结构（mounts）
- [ ] 实现坐骑驯服系统
- [ ] 实现坐骑装备和卸下
- [ ] 实现坐骑稀有度系统
- [ ] 实现坐骑图鉴功能
- [ ] 实现坐骑与宠物的关联
- [ ] 实现用户坐骑收藏
- [ ] 实现坐骑展示界面

## 📊 数据模型
\`\`\`sql
CREATE TABLE mounts (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    image_url VARCHAR(255),
    rarity VARCHAR(10) DEFAULT 'common',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_mounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    mount_id INTEGER REFERENCES mounts(id) ON DELETE CASCADE,
    is_owned BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, mount_id)
);
\`\`\`

## 🔗 API端点
- \`GET /api/mounts\` - 获取所有坐骑
- \`GET /api/mounts/owned\` - 获取已拥有坐骑
- \`POST /api/mounts/:id/tame\` - 驯服坐骑
- \`POST /api/mounts/:id/equip\` - 装备坐骑

## ⏱️ 预计时间
3天

## 🏷️ 标签
backend, mounts, collection, gamification"

# 创建社交系统 - 队伍管理
gh issue create --title "👥 社交系统 - 队伍管理" --body "## 📋 任务描述
实现队伍创建、加入和管理系统

## ✅ 检查清单
- [ ] 设计队伍表结构（parties）
- [ ] 实现队伍创建和删除
- [ ] 实现队伍成员管理
- [ ] 实现队伍权限系统（队长、管理员、成员）
- [ ] 实现队伍邀请和加入机制
- [ ] 实现队伍聊天功能
- [ ] 实现队伍副本系统
- [ ] 实现队伍排行榜

## 📊 数据模型
\`\`\`sql
CREATE TABLE parties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    leader_id INTEGER REFERENCES users(id),
    privacy VARCHAR(10) DEFAULT 'private',
    max_members INTEGER DEFAULT 30,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE party_members (
    id SERIAL PRIMARY KEY,
    party_id INTEGER REFERENCES parties(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(party_id, user_id)
);
\`\`\`

## 🔗 API端点
- \`GET /api/parties\` - 获取用户队伍
- \`POST /api/parties\` - 创建队伍
- \`GET /api/parties/:id\` - 获取队伍详情
- \`PUT /api/parties/:id\` - 更新队伍
- \`POST /api/parties/:id/join\` - 加入队伍
- \`POST /api/parties/:id/leave\` - 离开队伍

## ⏱️ 预计时间
4天

## 🏷️ 标签
backend, parties, social, teams"

# 创建社交系统 - 好友系统
gh issue create --title "🤝 社交系统 - 好友系统" --body "## 📋 任务描述
实现好友添加、管理和互动系统

## ✅ 检查清单
- [ ] 设计好友关系表结构（friends）
- [ ] 实现好友请求发送和接受
- [ ] 实现好友列表管理
- [ ] 实现好友状态查看
- [ ] 实现好友排行榜
- [ ] 实现好友挑战功能
- [ ] 实现好友消息系统
- [ ] 实现好友推荐算法

## 📊 数据模型
\`\`\`sql
CREATE TABLE friends (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    addressee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(10) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(requester_id, addressee_id)
);
\`\`\`

## 🔗 API端点
- \`GET /api/friends\` - 获取好友列表
- \`POST /api/friends/:id/request\` - 发送好友请求
- \`POST /api/friends/:id/accept\` - 接受好友请求
- \`DELETE /api/friends/:id\` - 删除好友

## ⏱️ 预计时间
3天

## 🏷️ 标签
backend, friends, social, relationships"

# 创建社交系统 - 消息系统
gh issue create --title "💬 社交系统 - 消息系统" --body "## 📋 任务描述
实现实时消息通信系统

## ✅ 检查清单
- [ ] 设计消息表结构（messages）
- [ ] 实现私信功能
- [ ] 实现队伍消息
- [ ] 实现系统通知
- [ ] 实现消息已读状态
- [ ] 实现消息历史记录
- [ ] 实现消息推送通知
- [ ] 实现消息防垃圾机制

## 📊 数据模型
\`\`\`sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## 🔗 API端点
- \`GET /api/messages\` - 获取消息
- \`POST /api/messages\` - 发送消息
- \`PUT /api/messages/:id/read\` - 标记已读

## ⏱️ 预计时间
3天

## 🏷️ 标签
backend, messages, chat, notifications"

# 创建游戏化系统 - 技能系统
gh issue create --title "🏆 游戏化系统 - 技能系统" --body "## 📋 任务描述
实现基于职业的技能系统

## ✅ 检查清单
- [ ] 设计技能表结构（skills）
- [ ] 实现四种职业（战士、法师、盗贼、医者）
- [ ] 实现技能解锁机制
- [ ] 实现魔法值消耗系统
- [ ] 实现技能效果系统
- [ ] 实现技能冷却时间
- [ ] 实现用户技能管理
- [ ] 实现技能施放动画

## 📊 数据模型
\`\`\`sql
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    class VARCHAR(20) NOT NULL,
    mana_cost INTEGER DEFAULT 0,
    target VARCHAR(20) DEFAULT 'self',
    effect_type VARCHAR(20),
    effect_value INTEGER,
    level_required INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    is_unlocked BOOLEAN DEFAULT false,
    last_used TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_id)
);
\`\`\`

## 🔗 API端点
- \`GET /api/skills\` - 获取用户技能
- \`POST /api/skills/:id/cast\` - 施放技能
- \`GET /api/buffs\` - 获取当前buff

## ⏱️ 预计时间
4天

## 🏷️ 标签
backend, skills, classes, magic"

# 创建游戏化系统 - 副本系统
gh issue create --title "⚔️ 游戏化系统 - 副本系统" --body "## 📋 任务描述
实现副本挑战和进度系统

## ✅ 检查清单
- [ ] 设计副本表结构（quests）
- [ ] 实现副本创建和配置
- [ ] 实现副本进度跟踪
- [ ] 实现副本难度系统
- [ ] 实现副本奖励机制
- [ ] 实现用户副本进度
- [ ] 实现队伍副本系统
- [ ] 实现副本完成记录

## 📊 数据模型
\`\`\`sql
CREATE TABLE quests (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty VARCHAR(10) DEFAULT 'easy',
    level_required INTEGER DEFAULT 1,
    experience_reward INTEGER DEFAULT 0,
    gold_reward INTEGER DEFAULT 0,
    item_rewards JSONB DEFAULT '[]',
    max_progress INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_quests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    quest_id INTEGER REFERENCES quests(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    status VARCHAR(10) DEFAULT 'locked',
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, quest_id)
);
\`\`\`

## 🔗 API端点
- \`GET /api/quests\` - 获取可用副本
- \`POST /api/quests/:id/start\` - 开始副本
- \`GET /api/quests/progress\` - 获取副本进度

## ⏱️ 预计时间
3天

## 🏷️ 标签
backend, quests, challenges, progression"

# 创建游戏化系统 - 成就系统
gh issue create --title "🎖️ 游戏化系统 - 成就系统" --body "## 📋 任务描述
实现多样化的成就解锁系统

## ✅ 检查清单
- [ ] 设计成就表结构（achievements）
- [ ] 实现成就分类系统（基础、季节、特殊）
- [ ] 实现成就进度跟踪
- [ ] 实现成就解锁通知
- [ ] 实现成就奖励系统
- [ ] 实现用户成就展示
- [ ] 实现成就分享功能
- [ ] 实现隐藏成就系统

## 📊 数据模型
\`\`\`sql
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(20) NOT NULL,
    experience_reward INTEGER DEFAULT 0,
    gold_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    max_progress INTEGER DEFAULT 1,
    is_achieved BOOLEAN DEFAULT false,
    achieved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);
\`\`\`

## 🔗 API端点
- \`GET /api/achievements\` - 获取成就列表
- \`GET /api/achievements/unlocked\` - 获取已解锁成就

## ⏱️ 预计时间
3天

## 🏷️ 标签
backend, achievements, gamification, rewards"

# 创建统计系统 - 用户数据分析
gh issue create --title "📊 统计系统 - 用户数据分析" --body "## 📋 任务描述
实现全面的用户行为数据分析系统

## ✅ 检查清单
- [ ] 设计用户统计表结构（user_stats）
- [ ] 实现任务完成统计
- [ ] 实现完美日统计
- [ ] 实现伤害统计系统
- [ ] 实现物品收集统计
- [ ] 实现社交互动统计
- [ ] 实现在线时间统计
- [ ] 实现统计更新机制

## 📊 数据模型
\`\`\`sql
CREATE TABLE user_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    habits_completed INTEGER DEFAULT 0,
    dailies_completed INTEGER DEFAULT 0,
    todos_completed INTEGER DEFAULT 0,
    perfect_days INTEGER DEFAULT 0,
    current_perfect_day_streak INTEGER DEFAULT 0,
    longest_perfect_day_streak INTEGER DEFAULT 0,
    total_damage_dealt INTEGER DEFAULT 0,
    total_damage_received INTEGER DEFAULT 0,
    total_pets_found INTEGER DEFAULT 0,
    total_mounts_tamed INTEGER DEFAULT 0,
    total_equipment_owned INTEGER DEFAULT 0,
    total_messages_sent INTEGER DEFAULT 0,
    total_parties_joined INTEGER DEFAULT 0,
    total_challenges_won INTEGER DEFAULT 0,
    total_playtime_minutes INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## 🔗 API端点
- \`GET /api/stats/overview\` - 获取统计概览
- \`GET /api/stats/detailed\` - 获取详细统计
- \`GET /api/stats/daily\` - 获取每日统计
- \`GET /api/stats/weekly\` - 获取每周统计
- \`GET /api/stats/monthly\` - 获取每月统计

## ⏱️ 预计时间
3天

## 🏷️ 标签
backend, statistics, analytics, data"

# 创建统计系统 - 图表和可视化
gh issue create --title "📈 统计系统 - 图表和可视化" --body "## 📋 任务描述
实现数据可视化图表和报告系统

## ✅ 检查清单
- [ ] 设计每日统计表结构（daily_stats）
- [ ] 实现打卡日历热力图
- [ ] 实现任务完成趋势图
- [ ] 实现属性成长曲线
- [ ] 实现社交互动图表
- [ ] 实现成就进度图表
- [ ] 实现自定义时间范围查询
- [ ] 实现数据导出功能

## 📊 数据模型
\`\`\`sql
CREATE TABLE daily_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    habits_completed INTEGER DEFAULT 0,
    dailies_completed INTEGER DEFAULT 0,
    todos_completed INTEGER DEFAULT 0,
    experience_gained INTEGER DEFAULT 0,
    gold_gained INTEGER DEFAULT 0,
    mana_gained INTEGER DEFAULT 0,
    damage_dealt INTEGER DEFAULT 0,
    damage_received INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);
\`\`\`

## 🔗 API端点
- \`GET /api/charts/heatmap\` - 获取热力图数据
- \`GET /api/charts/trends\` - 获取趋势图数据
- \`GET /api/charts/progress\` - 获取进度图数据
- \`GET /api/charts/export\` - 导出统计数据

## ⏱️ 预计时间
4天

## 🏷️ 标签
backend, charts, visualization, reporting"

# 创建商店系统 - 物品交易
gh issue create --title "🛒 商店系统 - 物品交易" --body "## 📋 任务描述
实现完整的游戏内商店系统

## ✅ 检查清单
- [ ] 设计消耗品表结构（consumables）
- [ ] 实现物品购买系统
- [ ] 实现货币扣除逻辑
- [ ] 实现物品使用效果
- [ ] 实现商店库存管理
- [ ] 实现限时商品系统
- [ ] 实现购买历史记录
- [ ] 实现商品推荐算法

## 📊 数据模型
\`\`\`sql
CREATE TABLE consumables (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    effect_type VARCHAR(20),
    effect_value INTEGER,
    gold_cost INTEGER DEFAULT 0,
    gem_cost INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    consumable_id INTEGER REFERENCES consumables(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, consumable_id)
);
\`\`\`

## 🔗 API端点
- \`GET /api/shop/items\` - 获取商店物品
- \`POST /api/shop/purchase\` - 购买物品
- \`POST /api/items/:id/use\` - 使用物品
- \`GET /api/items\` - 获取用户物品

## ⏱️ 预计时间
3天

## 🏷️ 标签
backend, shop, marketplace, economy"

# 创建挑战系统 - 社交挑战
gh issue create --title "🏅 挑战系统 - 社交挑战" --body "## 📋 任务描述
实现用户间挑战和竞赛系统

## ✅ 检查清单
- [ ] 设计挑战表结构（challenges）
- [ ] 实现挑战创建和管理
- [ ] 实现挑战参与机制
- [ ] 实现挑战进度跟踪
- [ ] 实现挑战奖励分配
- [ ] 实现公开和私密挑战
- [ ] 实现挑战排行榜
- [ ] 实现挑战历史记录

## 📊 数据模型
\`\`\`sql
CREATE TABLE challenges (
    id SERIAL PRIMARY KEY,
    creator_id INTEGER REFERENCES users(id),
    group_id INTEGER REFERENCES parties(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'habit',
    prize_gold INTEGER DEFAULT 0,
    prize_gems INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE challenge_participants (
    id SERIAL PRIMARY KEY,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    is_winner BOOLEAN DEFAULT false,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(challenge_id, user_id)
);
\`\`\`

## 🔗 API端点
- \`GET /api/challenges\` - 获取挑战
- \`POST /api/challenges\` - 创建挑战
- \`POST /api/challenges/:id/join\` - 加入挑战

## ⏱️ 预计时间
3天

## 🏷️ 标签
backend, challenges, competitions, social"

# 创建前端界面 - Habitica风格UI
gh issue create --title "🎨 前端界面 - Habitica风格UI" --body "## 📋 任务描述
实现Habitica风格的用户界面

## ✅ 检查清单
- [ ] 设计像素风格的UI组件
- [ ] 实现角色状态面板（HP, MP, EXP）
- [ ] 实现任务列表界面（习惯、每日、待办）
- [ ] 实现装备和物品界面
- [ ] 实现宠物和坐骑展示界面
- [ ] 实现社交界面（队伍、好友）
- [ ] 实现商店界面
- [ ] 实现成就和统计界面

## 🎨 设计规范
- 采用像素艺术风格
- 使用Habitica配色方案
- 实现响应式设计
- 支持深色/浅色主题
- 添加游戏化动画效果

## 📱 组件设计
- 角色卡片：显示等级、职业、装备
- 任务卡片：可交互的习惯按钮
- 物品网格：装备和宠物展示
- 社交面板：队伍成员状态

## ⏱️ 预计时间
5天

## 🏷️ 标签
frontend, ui, gamification, pixel-art"

# 创建实时同步系统
gh issue create --title "🔄 实时同步系统" --body "## 📋 任务描述
实现跨设备实时数据同步

## ✅ 检查清单
- [ ] 设计WebSocket实时通信
- [ ] 实现数据冲突解决机制
- [ ] 实现离线数据缓存
- [ ] 实现增量数据同步
- [ ] 实现同步状态指示器
- [ ] 实现网络状态检测
- [ ] 实现数据备份机制
- [ ] 实现同步错误处理

## 🔧 技术实现
- WebSocket实时通信
- 本地存储缓存
- 增量同步算法
- 冲突检测和解决
- 断线重连机制

## 📊 数据同步
- 任务状态实时更新
- 用户属性变化同步
- 社交互动实时通知
- 成就解锁即时推送

## ⏱️ 预计时间
4天

## 🏷️ 标签
backend, frontend, sync, real-time"

echo "所有GitHub Issues创建完成！"
echo "总共创建了 22 个Issues"
