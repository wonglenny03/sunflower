#!/bin/bash

# 数据库设置脚本

echo "🗄️  Database Setup Script"
echo "=========================="
echo ""

# 检查 PostgreSQL 是否安装
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed"
    echo ""
    echo "Please install PostgreSQL first:"
    echo ""
    echo "  Mac (using Homebrew):"
    echo "    brew install postgresql@14"
    echo "    brew services start postgresql@14"
    echo ""
    echo "  Or download from: https://www.postgresql.org/download/"
    echo ""
    exit 1
fi

echo "✅ PostgreSQL client found"
echo ""

# 检查 PostgreSQL 服务是否运行
if ! pg_isready -h localhost > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL service is not running"
    echo ""
    echo "Attempting to start PostgreSQL..."
    
    # 尝试启动 PostgreSQL (Mac)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            echo "Starting PostgreSQL with Homebrew..."
            brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null
            sleep 2
        fi
    fi
    
    # 再次检查
    if ! pg_isready -h localhost > /dev/null 2>&1; then
        echo "❌ Failed to start PostgreSQL automatically"
        echo ""
        echo "Please start PostgreSQL manually:"
        echo "  Mac:   brew services start postgresql"
        echo "  Linux: sudo systemctl start postgresql"
        echo ""
        exit 1
    fi
fi

echo "✅ PostgreSQL is running"
echo ""

# 读取数据库名称
DB_NAME="company_search"
if [ -f "apps/api/.env" ]; then
    DB_URL=$(grep DATABASE_URL apps/api/.env | cut -d '=' -f2)
    if [ ! -z "$DB_URL" ]; then
        DB_NAME=$(echo $DB_URL | sed 's/.*\/\([^?]*\).*/\1/')
    fi
fi

echo "📦 Checking database: $DB_NAME"

# 检查数据库是否存在
if psql -h localhost -U postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "✅ Database '$DB_NAME' already exists"
else
    echo "Creating database '$DB_NAME'..."
    
    # 尝试创建数据库
    createdb "$DB_NAME" 2>/dev/null || \
    psql -h localhost -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || \
    psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Database created successfully"
    else
        echo "❌ Failed to create database"
        echo ""
        echo "Please create it manually:"
        echo "  createdb $DB_NAME"
        echo "  or"
        echo "  psql -U postgres -c 'CREATE DATABASE $DB_NAME;'"
        exit 1
    fi
fi

echo ""
echo "✅ Database setup completed!"
echo ""
echo "Next steps:"
echo "  1. Make sure apps/api/.env is configured correctly"
echo "  2. Start the backend: pnpm dev:api"
echo "  3. Or start everything: pnpm start"

