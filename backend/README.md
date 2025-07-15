# TimePal 后端认证系统

基于Node.js + Express + PostgreSQL的完整用户认证系统。

## 功能特性

- ✅ 用户注册与登录
- ✅ JWT令牌认证
- ✅ 密码加密存储
- ✅ 用户信息管理
- ✅ 输入验证与错误处理
- ✅ 完整的单元测试
- ✅ API文档

## 技术栈

- **后端框架**: Express.js
- **数据库**: PostgreSQL
- **ORM**: Sequelize
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **输入验证**: Joi
- **测试**: Jest + Supertest
- **环境管理**: dotenv

## 快速开始

### 1. 环境要求

- Node.js >= 14.0.0
- PostgreSQL >= 12.0
- npm 或 yarn

### 2. 安装与配置

```bash
# 进入后端目录
cd backend

# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

### 3. 一键设置

```bash
# 运行设置脚本（包含安装依赖、数据库初始化、测试）
./scripts/setup.sh
```

### 4. 手动设置

```bash
# 安装依赖
npm install

# 创建数据库
createdb timepal_db

# 运行迁移
psql -d timepal_db -f database/migrations/001_create_users_table.sql

# 插入测试数据
psql -d timepal_db -f database/seeds/users_seed.sql

# 运行测试
npm test

# 启动服务器
npm start
```

## API文档

详细的API文档位于 [`docs/auth-api.md`](docs/auth-api.md)

## 测试用户

| 用户名 | 邮箱 | 密码 |
|--------|------|------|
| admin | admin@timepal.com | password123 |
| testuser1 | user1@example.com | password123 |
| testuser2 | user2@example.com | password123 |
| testuser3 | user3@example.com | password123 |

## 项目结构

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # 数据库配置
│   ├── controllers/
│   │   └── authController.js    # 认证控制器
│   ├── middleware/
│   │   └── auth.js              # JWT认证中间件
│   ├── models/
│   │   ├── User.js              # 用户模型
│   │   └── index.js             # 模型索引
│   ├── routes/
│   │   └── auth.js              # 认证路由
│   └── server.js                # 主服务器文件
├── database/
│   ├── migrations/
│   │   └── 001_create_users_table.sql
│   └── seeds/
│       └── users_seed.sql
├── tests/
│   └── unit/
│       └── auth.test.js         # 单元测试
├── docs/
│   └── auth-api.md              # API文档
├── scripts/
│   └── setup.sh                 # 设置脚本
└── package.json
```

## 开发命令

```bash
# 启动开发服务器
npm run dev

# 运行测试
npm test

# 运行测试并监听
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage

# 代码格式化
npm run format
```

## 环境变量

```bash
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=timepal_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

MIT License
