# TimePal 项目结构文档

## 1. 项目根目录结构

```
TimePal/
├── README.md                    # 项目说明文档
├── docs/                        # 项目文档目录
│   ├── Implementation.md        # 实现计划文档
│   ├── ProjectStructure.md      # 项目结构文档
│   ├── UI_UX_DOC.md            # UI/UX设计文档
│   └── BugTracking.md          # 错误跟踪文档
├── prd.md                       # 产品需求文档
├── frontend/                    # Flutter前端项目
├── backend/                     # Node.js后端项目
├── database/                    # 数据库相关文件
├── games/                       # 小游戏项目
├── deployment/                  # 部署配置文件
└── scripts/                     # 辅助脚本
```

## 2. Flutter前端项目结构

### 2.1 目录结构
```
frontend/
├── android/                     # Android平台配置
├── ios/                        # iOS平台配置
├── lib/                        # Flutter源代码
│   ├── main.dart               # 应用入口点
│   ├── app/                    # 应用配置
│   │   ├── app.dart           # 应用主类
│   │   ├── routes.dart        # 路由配置
│   │   └── theme.dart         # 主题配置
│   ├── core/                  # 核心功能模块
│   │   ├── constants/         # 常量定义
│   │   │   ├── api_constants.dart
│   │   │   ├── app_constants.dart
│   │   │   └── color_constants.dart
│   │   ├── utils/             # 工具类
│   │   │   ├── date_utils.dart
│   │   │   ├── validation_utils.dart
│   │   │   └── format_utils.dart
│   │   ├── services/          # 服务层
│   │   │   ├── api_service.dart
│   │   │   ├── auth_service.dart
│   │   │   ├── storage_service.dart
│   │   │   └── notification_service.dart
│   │   └── exceptions/        # 异常处理
│   │       ├── app_exceptions.dart
│   │       └── network_exceptions.dart
│   ├── data/                  # 数据层
│   │   ├── models/            # 数据模型
│   │   │   ├── user_model.dart
│   │   │   ├── habit_model.dart
│   │   │   ├── checkin_model.dart
│   │   │   └── achievement_model.dart
│   │   ├── repositories/      # 数据仓库
│   │   │   ├── user_repository.dart
│   │   │   ├── habit_repository.dart
│   │   │   └── game_repository.dart
│   │   └── providers/         # 数据提供者
│   │       ├── auth_provider.dart
│   │       ├── habit_provider.dart
│   │       └── game_provider.dart
│   ├── presentation/          # 表现层
│   │   ├── pages/             # 页面
│   │   │   ├── auth/          # 认证相关页面
│   │   │   │   ├── login_page.dart
│   │   │   │   ├── register_page.dart
│   │   │   │   └── profile_page.dart
│   │   │   ├── habits/        # 习惯管理页面
│   │   │   │   ├── habit_list_page.dart
│   │   │   │   ├── habit_detail_page.dart
│   │   │   │   ├── habit_create_page.dart
│   │   │   │   └── habit_stats_page.dart
│   │   │   ├── games/         # 游戏相关页面
│   │   │   │   ├── game_hub_page.dart
│   │   │   │   ├── life_restart_page.dart
│   │   │   │   └── travel_frog_page.dart
│   │   │   ├── dashboard/     # 仪表盘
│   │   │   │   ├── home_page.dart
│   │   │   │   └── stats_page.dart
│   │   │   └── settings/      # 设置页面
│   │   │       ├── settings_page.dart
│   │   │       └── notification_settings_page.dart
│   │   ├── widgets/           # 通用组件
│   │   │   ├── common/        # 通用组件
│   │   │   │   ├── custom_button.dart
│   │   │   │   ├── custom_text_field.dart
│   │   │   │   ├── loading_widget.dart
│   │   │   │   └── error_widget.dart
│   │   │   ├── habit/         # 习惯相关组件
│   │   │   │   ├── habit_card.dart
│   │   │   │   ├── habit_progress.dart
│   │   │   │   └── checkin_button.dart
│   │   │   └── game/          # 游戏相关组件
│   │   │       ├── game_card.dart
│   │   │       └── webview_container.dart
│   │   └── themes/            # 主题样式
│   │       ├── app_theme.dart
│   │       ├── light_theme.dart
│   │       └── dark_theme.dart
│   └── domain/                # 业务逻辑层
│       ├── entities/          # 实体类
│       │   ├── user.dart
│       │   ├── habit.dart
│       │   └── achievement.dart
│       ├── usecases/          # 用例
│       │   ├── auth_usecases.dart
│       │   ├── habit_usecases.dart
│       │   └── game_usecases.dart
│       └── repositories/      # 仓库接口
│           ├── user_repository_interface.dart
│           └── habit_repository_interface.dart
├── test/                      # 测试文件
│   ├── unit/                  # 单元测试
│   ├── widget/                # 组件测试
│   └── integration/           # 集成测试
├── assets/                    # 资源文件
│   ├── images/                # 图片资源
│   ├── icons/                 # 图标资源
│   └── fonts/                 # 字体资源
├── pubspec.yaml              # Flutter配置文件
└── pubspec.lock              # 依赖锁定文件
```

### 2.2 主要依赖包
```yaml
dependencies:
  flutter:
    sdk: flutter
  provider: ^6.0.5           # 状态管理
  dio: ^5.3.2               # HTTP客户端
  shared_preferences: ^2.2.2 # 本地存储
  sqflite: ^2.3.0           # SQLite数据库
  webview_flutter: ^4.4.2   # WebView组件
  flutter_local_notifications: ^16.3.0 # 本地通知
  image_picker: ^1.0.4      # 图片选择
  charts_flutter: ^0.12.0   # 图表组件
  cached_network_image: ^3.3.0 # 网络图片缓存
```

## 3. Node.js后端项目结构

### 3.1 目录结构
```
backend/
├── src/                       # 源代码目录
│   ├── app.js                # 应用入口文件
│   ├── server.js             # 服务器启动文件
│   ├── config/               # 配置文件
│   │   ├── database.js       # 数据库配置
│   │   ├── auth.js           # 认证配置
│   │   ├── cors.js           # CORS配置
│   │   └── environment.js    # 环境变量配置
│   ├── controllers/          # 控制器层
│   │   ├── authController.js # 认证控制器
│   │   ├── userController.js # 用户控制器
│   │   ├── habitController.js # 习惯控制器
│   │   ├── checkinController.js # 打卡控制器
│   │   ├── gameController.js # 游戏控制器
│   │   └── achievementController.js # 成就控制器
│   ├── models/               # 数据模型层
│   │   ├── index.js          # 模型索引文件
│   │   ├── User.js           # 用户模型
│   │   ├── Habit.js          # 习惯模型
│   │   ├── CheckIn.js        # 打卡记录模型
│   │   ├── Achievement.js    # 成就模型
│   │   └── UserLevel.js      # 用户等级模型
│   ├── routes/               # 路由层
│   │   ├── index.js          # 路由索引
│   │   ├── auth.js           # 认证路由
│   │   ├── users.js          # 用户路由
│   │   ├── habits.js         # 习惯路由
│   │   ├── checkins.js       # 打卡路由
│   │   ├── games.js          # 游戏路由
│   │   └── achievements.js   # 成就路由
│   ├── middleware/           # 中间件
│   │   ├── auth.js           # 认证中间件
│   │   ├── validation.js     # 验证中间件
│   │   ├── errorHandler.js   # 错误处理中间件
│   │   ├── rateLimiter.js    # 限流中间件
│   │   └── logger.js         # 日志中间件
│   ├── services/             # 服务层
│   │   ├── authService.js    # 认证服务
│   │   ├── userService.js    # 用户服务
│   │   ├── habitService.js   # 习惯服务
│   │   ├── gameService.js    # 游戏服务
│   │   ├── notificationService.js # 通知服务
│   │   └── statisticsService.js # 统计服务
│   ├── utils/                # 工具函数
│   │   ├── helpers.js        # 辅助函数
│   │   ├── validators.js     # 验证函数
│   │   ├── encryption.js     # 加密工具
│   │   └── dateUtils.js      # 日期工具
│   └── constants/            # 常量定义
│       ├── statusCodes.js    # 状态码
│       ├── messages.js       # 消息常量
│       └── gameConstants.js  # 游戏常量
├── tests/                    # 测试文件
│   ├── unit/                 # 单元测试
│   ├── integration/          # 集成测试
│   └── fixtures/             # 测试数据
├── logs/                     # 日志文件
├── uploads/                  # 上传文件存储
├── package.json              # 项目配置
├── package-lock.json         # 依赖锁定
├── .env                      # 环境变量
├── .gitignore               # Git忽略文件
└── README.md                # 项目说明
```

### 3.2 主要依赖包
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.0",
    "pg": "^8.11.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "multer": "^1.4.5-lts.1",
    "winston": "^3.11.0",
    "joi": "^17.11.0",
    "dotenv": "^16.3.1",
    "nodemailer": "^6.9.7"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "nodemon": "^3.0.2",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0"
  }
}
```

## 4. 数据库结构

### 4.1 目录结构
```
database/
├── migrations/               # 数据库迁移文件
│   ├── 001_create_users_table.sql
│   ├── 002_create_habits_table.sql
│   ├── 003_create_checkins_table.sql
│   ├── 004_create_achievements_table.sql
│   └── 005_create_user_levels_table.sql
├── seeds/                    # 种子数据
│   ├── users_seed.sql
│   ├── habits_seed.sql
│   └── achievements_seed.sql
├── schemas/                  # 数据库架构
│   ├── tables.sql           # 表结构定义
│   ├── indexes.sql          # 索引定义
│   └── constraints.sql      # 约束定义
├── backups/                 # 数据库备份
├── scripts/                 # 数据库脚本
│   ├── setup.sql           # 初始化脚本
│   ├── cleanup.sql         # 清理脚本
│   └── maintenance.sql     # 维护脚本
└── README.md               # 数据库说明
```

### 4.2 主要表结构
```sql
-- 用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 习惯表
CREATE TABLE habits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    frequency VARCHAR(20) DEFAULT 'daily',
    category VARCHAR(50),
    icon VARCHAR(50),
    color VARCHAR(7),
    reminder_time TIME,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 打卡记录表
CREATE TABLE check_ins (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    experience_gained INTEGER DEFAULT 0,
    coins_gained INTEGER DEFAULT 0
);
```

## 5. 小游戏项目结构

### 5.1 目录结构
```
games/
├── life-restart/            # 人生重开游戏
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── assets/
├── travel-frog/             # 旅行青蛙游戏
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── assets/
├── shared/                  # 共享资源
│   ├── css/
│   ├── js/
│   └── assets/
└── deployment/              # 部署配置
    ├── nginx.conf
    └── docker-compose.yml
```

## 6. 部署配置结构

### 6.1 目录结构
```
deployment/
├── docker/                  # Docker配置
│   ├── frontend/
│   │   └── Dockerfile
│   ├── backend/
│   │   └── Dockerfile
│   └── nginx/
│       ├── Dockerfile
│       └── nginx.conf
├── kubernetes/              # K8s配置
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── deployment.yaml
│   └── service.yaml
├── scripts/                 # 部署脚本
│   ├── deploy.sh
│   ├── backup.sh
│   └── rollback.sh
├── environments/            # 环境配置
│   ├── development.env
│   ├── staging.env
│   └── production.env
└── docker-compose.yml       # 本地开发环境
```

## 7. 开发工具配置

### 7.1 VSCode配置
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "dart.flutterSdkPath": "/path/to/flutter",
  "eslint.workingDirectories": ["backend"],
  "files.associations": {
    "*.dart": "dart"
  }
}
```

### 7.2 Git配置
```gitignore
# .gitignore
# Flutter
/build/
/android/app/debug
/android/app/profile
/android/app/release
*.g.dart
*.freezed.dart

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.sqlite
*.sqlite3

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

## 8. 项目命令规范

### 8.1 前端命令
```bash
# 开发环境运行
flutter run

# 构建APK
flutter build apk

# 运行测试
flutter test

# 代码格式化
flutter format lib/

# 依赖管理
flutter pub get
flutter pub upgrade
```

### 8.2 后端命令
```bash
# 开发环境运行
npm run dev

# 生产环境运行
npm start

# 运行测试
npm test

# 代码检查
npm run lint

# 代码格式化
npm run format

# 数据库迁移
npm run migrate

# 数据库种子
npm run seed
```

### 8.3 数据库命令
```bash
# 创建数据库
createdb timepal_dev

# 运行迁移
psql -d timepal_dev -f database/migrations/001_create_users_table.sql

# 导入种子数据
psql -d timepal_dev -f database/seeds/users_seed.sql

# 备份数据库
pg_dump timepal_dev > database/backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

## 9. 文件命名规范

### 9.1 Flutter文件命名
- 文件名使用小写字母和下划线：`user_profile_page.dart`
- 类名使用大驼峰：`UserProfilePage`
- 变量名使用小驼峰：`userName`
- 常量使用大写字母和下划线：`API_BASE_URL`

### 9.2 Node.js文件命名
- 文件名使用小写字母和下划线：`user_controller.js`
- 类名使用大驼峰：`UserController`
- 函数名使用小驼峰：`getUserProfile`
- 常量使用大写字母和下划线：`HTTP_STATUS_CODES`

### 9.3 数据库命名
- 表名使用小写字母和下划线：`user_profiles`
- 字段名使用小写字母和下划线：`created_at`
- 索引名使用前缀：`idx_users_email`

## 10. 版本控制策略

### 10.1 分支管理
```
main                         # 主分支（生产环境）
├── develop                  # 开发分支
│   ├── feature/user-auth   # 功能分支
│   ├── feature/habit-mgmt  # 功能分支
│   └── feature/game-integration # 功能分支
├── release/v1.0.0          # 发布分支
└── hotfix/critical-bug     # 热修复分支
```

### 10.2 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

---

**文档版本**: v1.0  
**创建日期**: 2024年12月  
**最后更新**: 2024年12月  
**维护人**: 开发团队 