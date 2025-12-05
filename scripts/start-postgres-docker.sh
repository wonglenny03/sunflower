#!/bin/bash

# 使用 Docker 启动 PostgreSQL 的脚本

echo "🐳 Starting PostgreSQL with Docker..."
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    echo "Please start Docker Desktop first"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# 检查容器是否已存在
if docker ps -a | grep -q "postgres"; then
    echo "📦 PostgreSQL container exists"
    
    # 检查是否在运行
    if docker ps | grep -q "postgres"; then
        echo "✅ PostgreSQL container is already running"
    else
        echo "Starting existing container..."
        docker start postgres
        sleep 3
        echo "✅ Container started"
    fi
else
    echo "Creating new PostgreSQL container..."
    docker run -d \
      --name postgres \
      -e POSTGRES_PASSWORD=postgres \
      -e POSTGRES_DB=company_search \
      -p 5432:5432 \
      postgres:14
    
    if [ $? -eq 0 ]; then
        echo "✅ Container created and started"
        echo "⏳ Waiting for PostgreSQL to be ready..."
        sleep 5
    else
        echo "❌ Failed to create container"
        exit 1
    fi
fi

# 验证连接
echo ""
echo "🔍 Verifying connection..."

# 等待 PostgreSQL 就绪
for i in {1..10}; do
    if docker exec postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ PostgreSQL is ready!"
        echo ""
        echo "Connection info:"
        echo "  Host: localhost"
        echo "  Port: 5432"
        echo "  Database: company_search"
        echo "  Username: postgres"
        echo "  Password: postgres"
        echo ""
        echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/company_search"
        echo ""
        exit 0
    fi
    echo "  Waiting... ($i/10)"
    sleep 1
done

echo "⚠️  PostgreSQL may still be starting. Please wait a moment and try again."
echo "Check status with: docker ps | grep postgres"

