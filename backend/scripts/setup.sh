#!/bin/bash

# TimePal 后端初始化脚本
# 用于设置数据库和运行测试

set -e

echo "🚀 开始设置 TimePal 后端..."

# 检查环境变量
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件，正在创建..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件并设置正确的数据库连接信息"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 等待数据库启动
echo "⏳ 等待数据库启动..."
sleep 5

# 创建数据库（如果不存在）
echo "🗄️  创建数据库..."
createdb timepal_db || echo "数据库已存在"

# 运行迁移
echo "🔄 运行数据库迁移..."
psql -d timepal_db -f database/migrations/001_create_users_table.sql

# 插入种子数据
echo "🌱 插入测试数据..."
psql -d timepal_db -f database/seeds/users_seed.sql

# 运行测试
echo "🧪 运行测试..."
npm test

echo "✅ 设置完成！"
echo "🚀 启动服务器: npm start"
echo "📖 API文档: http://localhost:3000/api-docs"
