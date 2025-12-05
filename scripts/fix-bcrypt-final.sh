#!/bin/bash

# ============================================
# 最终修复 bcrypt - 切换到 bcryptjs
# ============================================

set -e

cd /home/ec2-user/sunflower || cd /opt/company-search || {
    echo "错误: 未找到代码目录"
    exit 1
}

echo "============================================"
echo "切换到 bcryptjs（无需编译）"
echo "============================================"
echo ""

# 1. 安装 bcryptjs
echo "1. 安装 bcryptjs..."
cd apps/api
pnpm remove bcrypt @types/bcrypt 2>/dev/null || true
pnpm add bcryptjs @types/bcryptjs --save

# 2. 修改代码（如果还没有修改）
echo "2. 检查代码..."
AUTH_SERVICE="src/auth/auth.service.ts"
if grep -q "from 'bcrypt'" "$AUTH_SERVICE"; then
    echo "修改代码..."
    sed -i "s/from 'bcrypt'/from 'bcryptjs'/" "$AUTH_SERVICE"
    echo "✓ 代码已修改"
else
    echo "✓ 代码已使用 bcryptjs"
fi

# 3. 重新构建
echo "3. 重新构建..."
pnpm build 2>&1 | tail -20

cd ../..

# 4. 验证
echo "4. 验证..."
if node -e "require('bcryptjs'); console.log('✓ bcryptjs OK')" 2>/dev/null; then
    echo "✓ bcryptjs 安装成功！"
else
    echo "✗ bcryptjs 验证失败"
    exit 1
fi

echo ""
echo "============================================"
echo "✓ 切换完成！"
echo "============================================"
echo ""
echo "现在重启应用:"
echo "  pm2 restart all"
echo ""

