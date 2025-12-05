#!/bin/bash

# 启动 PostgreSQL 数据库

echo "🚀 正在启动 PostgreSQL 数据库..."

# 检查 Docker 是否运行
if docker info > /dev/null 2>&1; then
  echo "✅ Docker 正在运行，使用 Docker 启动 PostgreSQL..."
  bash scripts/start-postgres-docker.sh
  exit $?
fi

# 检查 Homebrew PostgreSQL
if command -v brew > /dev/null 2>&1; then
  if brew services list | grep -q postgresql; then
    echo "✅ 发现 Homebrew PostgreSQL，正在启动..."
    brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null
    sleep 2
    
    if lsof -ti:5432 > /dev/null 2>&1; then
      echo "✅ PostgreSQL 已启动！"
      exit 0
    fi
  fi
fi

# 如果都失败了
echo "❌ 无法自动启动 PostgreSQL"
echo ""
echo "请选择以下方式之一："
echo "1. 启动 Docker Desktop，然后运行: pnpm start-pg"
echo "2. 安装并启动 Homebrew PostgreSQL:"
echo "   brew install postgresql@14"
echo "   brew services start postgresql@14"
echo "3. 手动启动系统 PostgreSQL"

exit 1

