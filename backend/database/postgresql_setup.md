# PostgreSQL 数据库迁移指南

## 概述
本文档指导如何将 TimePal 从 SQLite 迁移到 PostgreSQL。

## 前置要求

### 1. 安装 PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (使用 Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# 下载并安装 PostgreSQL 从 https://www.postgresql.org/download/windows/
```

### 2. 创建数据库和用户
```bash
# 切换到 postgres 用户
sudo -u postgres psql

-- 创建数据库
CREATE DATABASE timepal_dev;

-- 创建用户
CREATE USER timepal_user WITH PASSWORD 'your_secure_password';

-- 授权
GRANT ALL PRIVILEGES ON DATABASE timepal_dev TO timepal_user;

-- 退出
\q
```

### 3. 更新环境变量
复制 `.env.example` 到 `.env` 并更新数据库配置：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=timepal_dev
DB_USER=timepal_user
DB_PASSWORD=your_secure_password
```

## 迁移步骤

### 方法1：使用迁移脚本（推荐）

1. **确保当前SQLite数据库是最新的**
   ```bash
   npm run migrate
   ```

2. **运行迁移脚本**
   ```bash
   node database/scripts/migrate_to_postgresql.js
   ```

3. **验证迁移**
   脚本会自动验证数据完整性。

### 方法2：使用 Docker（可选）

1. **启动 PostgreSQL 容器**
   ```bash
   docker-compose up -d postgres
   ```

2. **等待数据库启动**
   ```bash
   docker-compose logs postgres
   ```

3. **运行迁移**
   ```bash
   docker-compose exec backend node database/scripts/migrate_to_postgresql.js
   ```

## 验证迁移

### 1. 检查数据完整性
```bash
# 连接到 PostgreSQL
psql -h localhost -U timepal_user -d timepal_dev

# 检查用户数量
SELECT COUNT(*) FROM users;

# 检查数据
SELECT * FROM users LIMIT 5;
```

### 2. 测试应用连接
```bash
# 启动应用
npm run dev

# 测试API
curl http://localhost:3000/api/users
```

## 常见问题

### 1. 连接被拒绝
```bash
# 检查 PostgreSQL 服务状态
sudo systemctl status postgresql

# 检查端口监听
sudo netstat -plntu | grep 5432
```

### 2. 权限问题
```bash
# 修改 pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf

# 添加或修改
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5

# 重启 PostgreSQL
sudo systemctl restart postgresql
```

### 3. 数据类型不兼容
如果遇到数据类型问题，可以手动调整迁移脚本中的数据类型映射。

## 回滚计划

如果需要回滚到 SQLite：

1. 停止应用
2. 修改 `backend/src/config/database.js` 恢复 SQLite 配置
3. 重启应用

## 性能优化

### 1. 索引优化
```sql
-- 创建复合索引
CREATE INDEX idx_users_email_active ON users(email, is_active);

-- 创建部分索引
CREATE INDEX idx_users_active_true ON users(is_active) WHERE is_active = true;
```

### 2. 连接池配置
在 `database.js` 中调整连接池参数：
```javascript
pool: {
  max: 20,
  min: 5,
  acquire: 30000,
  idle: 10000
}
```

## 监控和维护

### 1. 查看数据库状态
```bash
# 查看活动连接
SELECT * FROM pg_stat_activity;

# 查看数据库大小
SELECT pg_size_pretty(pg_database_size('timepal_dev'));
```

### 2. 备份策略
```bash
# 创建备份
pg_dump -h localhost -U timepal_user timepal_dev > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复备份
psql -h localhost -U timepal_user timepal_dev < backup_file.sql
