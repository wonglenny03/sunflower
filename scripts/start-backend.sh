#!/bin/bash

# 启动后端服务的辅助脚本

echo "🚀 Starting Backend Service..."
echo ""

# 检查 PostgreSQL
echo "📊 Checking PostgreSQL..."
if ! pg_isready -h localhost > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running"
    echo ""
    echo "Please start PostgreSQL first:"
    echo "  Mac:   brew services start postgresql"
    echo "  Linux: sudo systemctl start postgresql"
    echo ""
    exit 1
fi
echo "✅ PostgreSQL is running"
echo ""

# 检查 .env 文件
if [ ! -f "apps/api/.env" ]; then
    echo "❌ apps/api/.env file not found"
    echo "Please create it from apps/api/.env.example"
    exit 1
fi
echo "✅ .env file exists"
echo ""

# 检查数据库是否存在
DB_NAME=$(grep DATABASE_URL apps/api/.env | sed 's/.*\/\([^?]*\).*/\1/')
if [ -z "$DB_NAME" ]; then
    DB_NAME="company_search"
fi

echo "📦 Checking database: $DB_NAME"
if ! psql -h localhost -U postgres -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "⚠️  Database '$DB_NAME' does not exist"
    echo "Creating database..."
    createdb "$DB_NAME" 2>/dev/null || psql -h localhost -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Database created"
    else
        echo "❌ Failed to create database. Please create it manually:"
        echo "   createdb $DB_NAME"
        exit 1
    fi
else
    echo "✅ Database exists"
fi
echo ""

# 启动后端
echo "🚀 Starting NestJS backend..."
cd apps/api
pnpm dev

