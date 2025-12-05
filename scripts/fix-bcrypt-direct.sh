#!/bin/bash

# ============================================
# 直接修复 bcrypt - 手动编译
# ============================================

set -e

cd /home/ec2-user/sunflower || {
    echo "错误: 未找到代码目录"
    exit 1
}

echo "============================================"
echo "直接修复 bcrypt"
echo "============================================"
echo ""

# 1. 安装编译工具
echo "1. 安装编译工具..."
sudo dnf install -y gcc gcc-c++ make python3 python3-devel 2>/dev/null || true

# 2. 找到 bcrypt 目录
echo "2. 查找 bcrypt 目录..."
BCRYPT_DIR=$(find node_modules/.pnpm -type d -path "*/bcrypt@5.1.1/node_modules/bcrypt" 2>/dev/null | head -1)

if [ -z "$BCRYPT_DIR" ]; then
    echo "错误: 未找到 bcrypt 目录"
    echo "尝试重新安装..."
    rm -rf node_modules/.pnpm/bcrypt@*
    export npm_config_build_from_source=true
    pnpm install --force bcrypt 2>&1 | tail -10
    BCRYPT_DIR=$(find node_modules/.pnpm -type d -path "*/bcrypt@*/node_modules/bcrypt" 2>/dev/null | head -1)
fi

if [ -z "$BCRYPT_DIR" ]; then
    echo "错误: 仍然无法找到 bcrypt 目录"
    exit 1
fi

echo "找到 bcrypt 目录: $BCRYPT_DIR"
cd "$BCRYPT_DIR"

# 3. 检查绑定文件
BINDING_FILE="lib/binding/napi-v3/bcrypt_lib.node"
echo "3. 检查绑定文件..."

if [ -f "$BINDING_FILE" ]; then
    echo "✓ 绑定文件已存在"
    exit 0
fi

# 4. 清理并编译
echo "4. 清理旧的构建..."
rm -rf build lib/binding node_modules 2>/dev/null || true

echo "5. 安装依赖..."
npm install 2>&1 | tail -20 || true

echo "6. 编译原生模块..."
npm run install 2>&1 || \
node-gyp rebuild 2>&1 || \
npm rebuild --build-from-source 2>&1 || {
    echo "尝试使用 node-gyp 直接编译..."
    if ! command -v node-gyp &> /dev/null; then
        npm install -g node-gyp
    fi
    node-gyp configure
    node-gyp build 2>&1
}

# 5. 验证
echo "7. 验证编译结果..."
if [ -f "$BINDING_FILE" ]; then
    echo "✓ bcrypt 编译成功！"
    echo "绑定文件: $(pwd)/$BINDING_FILE"
else
    echo "✗ 编译失败，检查其他位置..."
    find lib -name "*.node" 2>/dev/null || echo "未找到任何 .node 文件"
    
    # 检查是否有其他版本的绑定
    if [ -d "lib/binding" ]; then
        echo "找到的绑定文件:"
        find lib/binding -name "*.node" 2>/dev/null
    fi
    exit 1
fi

cd /home/ec2-user/sunflower

# 6. 最终验证
echo "8. 最终验证..."
if node -e "require('bcrypt'); console.log('✓ bcrypt OK')" 2>/dev/null; then
    echo "✓ bcrypt 验证成功！"
    echo ""
    echo "现在可以重启应用:"
    echo "  pm2 restart all"
else
    echo "✗ bcrypt 验证失败"
    exit 1
fi

