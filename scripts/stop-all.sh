#!/bin/bash

# 关闭所有开发服务器端口

echo "🛑 正在关闭所有开发服务器端口..."

# 关闭端口 3000 (前端)
if lsof -ti:3000 > /dev/null 2>&1; then
  lsof -ti:3000 | xargs kill -9 2>/dev/null
  echo "✅ 已关闭端口 3000 (前端 Next.js)"
else
  echo "ℹ️  端口 3000 未被占用"
fi

# 关闭端口 3001 (后端)
if lsof -ti:3001 > /dev/null 2>&1; then
  lsof -ti:3001 | xargs kill -9 2>/dev/null
  echo "✅ 已关闭端口 3001 (后端 NestJS)"
else
  echo "ℹ️  端口 3001 未被占用"
fi

# 关闭所有 Next.js 和 NestJS 进程
pkill -f "next dev" 2>/dev/null && echo "✅ 已关闭 Next.js 开发服务器" || true
pkill -f "nest start" 2>/dev/null && echo "✅ 已关闭 NestJS 开发服务器" || true
pkill -f "node.*dev" 2>/dev/null && echo "✅ 已关闭其他开发进程" || true

echo ""
echo "✅ 所有端口已关闭！"

