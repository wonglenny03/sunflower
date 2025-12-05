#!/bin/bash

# ============================================
# 切换到 bcryptjs（纯 JavaScript，无需编译）
# 作为 bcrypt 的替代方案
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
pnpm add bcryptjs @types/bcryptjs --save 2>&1 | tail -10
cd ../..

# 2. 修改代码
echo "2. 修改代码..."
AUTH_SERVICE="apps/api/src/auth/auth.service.ts"

if [ -f "$AUTH_SERVICE" ]; then
    # 备份原文件
    cp "$AUTH_SERVICE" "$AUTH_SERVICE.bak"
    
    # 替换 import
    sed -i "s/import \* as bcrypt from 'bcrypt'/import * as bcrypt from 'bcryptjs'/" "$AUTH_SERVICE"
    
    echo "✓ 代码已修改"
    echo "备份文件: $AUTH_SERVICE.bak"
else
    echo "错误: 未找到 $AUTH_SERVICE"
    exit 1
fi

# 3. 重新构建
echo "3. 重新构建..."
cd apps/api
pnpm build 2>&1 | tail -10
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
echo "现在可以重启应用:"
echo "  pm2 restart all"
echo ""
echo "注意: bcryptjs 是纯 JavaScript 实现，性能略低于 bcrypt，但无需编译"
echo ""

