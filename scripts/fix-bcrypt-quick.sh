#!/bin/bash

# ============================================
# 快速修复 bcrypt 脚本
# ============================================

set -e

cd /home/ec2-user/sunflower || cd /opt/company-search || {
    echo "错误: 未找到代码目录"
    exit 1
}

echo "修复 bcrypt 模块..."

# 安装编译工具
echo "安装编译工具..."
sudo dnf install -y gcc gcc-c++ make python3 2>/dev/null || true

# 删除 bcrypt
echo "删除旧的 bcrypt..."
rm -rf node_modules/.pnpm/bcrypt@* 2>/dev/null || true

# 重新安装
echo "重新安装 bcrypt..."
export npm_config_build_from_source=true
pnpm install --force bcrypt 2>&1 | tail -10

# 手动重建
echo "重建 bcrypt..."
cd apps/api
pnpm rebuild bcrypt 2>&1 || npm rebuild bcrypt --build-from-source 2>&1 || true
cd ../..

# 验证
echo "验证..."
if node -e "require('bcrypt'); console.log('✓ bcrypt OK')" 2>/dev/null; then
    echo "✓ bcrypt 修复成功！"
    pm2 restart all
else
    echo "✗ bcrypt 仍然有问题，请检查日志"
    exit 1
fi

