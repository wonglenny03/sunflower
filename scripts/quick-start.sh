#!/bin/bash

# 快速启动脚本 - 自动安装和配置所有依赖

echo "🚀 Quick Start Script"
echo "===================="
echo ""

# 检查 PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed"
    echo ""
    echo "Choose installation method:"
    echo "  1. Docker (recommended, easiest)"
    echo "  2. Homebrew (Mac)"
    echo "  3. Manual installation"
    echo ""
    read -p "Enter choice (1-3): " choice
    
    case $choice in
        1)
            echo ""
            echo "🐳 Installing PostgreSQL with Docker..."
            if ! command -v docker &> /dev/null; then
                echo "❌ Docker is not installed"
                echo "Please install Docker Desktop: https://www.docker.com/products/docker-desktop"
                exit 1
            fi
            
            # 检查容器是否已存在
            if docker ps -a | grep -q postgres; then
                echo "Starting existing PostgreSQL container..."
                docker start postgres
            else
                echo "Creating new PostgreSQL container..."
                docker run -d \
                  --name postgres \
                  -e POSTGRES_PASSWORD=postgres \
                  -e POSTGRES_DB=company_search \
                  -p 5432:5432 \
                  postgres:14
            fi
            
            sleep 3
            echo "✅ PostgreSQL container started"
            ;;
        2)
            if [[ "$OSTYPE" == "darwin"* ]]; then
                echo ""
                echo "📦 Installing PostgreSQL with Homebrew..."
                bash scripts/install-postgresql.sh
            else
                echo "❌ Homebrew is only available on macOS"
                exit 1
            fi
            ;;
        3)
            echo ""
            echo "Please install PostgreSQL manually"
            echo "See INSTALL_POSTGRESQL.md for instructions"
            exit 1
            ;;
        *)
            echo "Invalid choice"
            exit 1
            ;;
    esac
else
    echo "✅ PostgreSQL is installed"
    
    # 检查是否运行
    if ! pg_isready -h localhost > /dev/null 2>&1; then
        echo "⚠️  PostgreSQL is not running"
        echo "Starting PostgreSQL..."
        
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null
        else
            sudo systemctl start postgresql 2>/dev/null
        fi
        
        sleep 2
    fi
    
    if pg_isready -h localhost > /dev/null 2>&1; then
        echo "✅ PostgreSQL is running"
    else
        echo "❌ Failed to start PostgreSQL"
        exit 1
    fi
fi

echo ""

# 设置数据库
echo "📦 Setting up database..."
bash scripts/setup-database.sh

if [ $? -ne 0 ]; then
    echo "❌ Database setup failed"
    exit 1
fi

echo ""

# 检查环境变量
if [ ! -f "apps/api/.env" ]; then
    echo "⚠️  apps/api/.env not found"
    echo "Creating from example..."
    if [ -f "apps/api/.env.example" ]; then
        cp apps/api/.env.example apps/api/.env
        echo "✅ Created apps/api/.env"
        echo "⚠️  Please edit apps/api/.env and update DATABASE_URL if needed"
    else
        echo "❌ apps/api/.env.example not found"
        exit 1
    fi
fi

echo ""

# 启动服务
echo "🚀 Starting services..."
echo ""
pnpm start

