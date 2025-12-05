#!/bin/bash

# 启动后端开发服务器的脚本

echo "🚀 Starting Backend Development Server..."
echo ""

cd "$(dirname "$0")/../apps/api" || exit 1

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "❌ .env file not found in apps/api/"
    echo "Please create apps/api/.env with DATABASE_URL"
    exit 1
fi

# 检查 DATABASE_URL
if ! grep -q "DATABASE_URL" .env; then
    echo "❌ DATABASE_URL not found in .env"
    exit 1
fi

echo "✅ Environment configured"
echo ""

# 启动开发服务器
echo "Starting NestJS in watch mode..."
echo ""

pnpm dev

