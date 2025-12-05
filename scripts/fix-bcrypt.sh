#!/bin/bash

# 修复 bcrypt 模块问题

echo "🔧 正在修复 bcrypt 模块..."

# 批准 bcrypt 构建脚本
echo "1. 批准 bcrypt 构建脚本..."
pnpm approve-builds bcrypt > /dev/null 2>&1

# 删除损坏的 bcrypt 模块
echo "2. 清理损坏的 bcrypt 模块..."
rm -rf node_modules/.pnpm/bcrypt@5.1.1 2>/dev/null

# 重新安装
echo "3. 重新安装 bcrypt..."
pnpm install --force > /dev/null 2>&1

# 手动编译 bcrypt
echo "4. 编译 bcrypt 原生模块..."
if [ -d "node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt" ]; then
  cd node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt
  npm run install > /dev/null 2>&1
  cd - > /dev/null
fi

# 测试
echo "5. 测试 bcrypt 模块..."
if node -e "require('bcrypt')" 2>/dev/null; then
  echo "✅ bcrypt 模块修复成功！"
  exit 0
else
  echo "❌ bcrypt 模块修复失败，请检查错误信息"
  exit 1
fi

