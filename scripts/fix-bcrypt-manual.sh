#!/bin/bash

# ============================================
# 手动修复 bcrypt - 详细诊断和修复
# ============================================

set -e

cd /home/ec2-user/sunflower || {
    echo "错误: 未找到代码目录"
    exit 1
}

echo "============================================"
echo "手动修复 bcrypt - 详细诊断"
echo "============================================"
echo ""

# 1. 检查环境
echo "1. 检查环境..."
echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"
echo "pnpm: $(pnpm -v)"
echo ""

# 2. 检查编译工具
echo "2. 检查编译工具..."
if command -v gcc &> /dev/null; then
    echo "✓ gcc: $(gcc --version | head -1)"
else
    echo "✗ gcc 未安装"
    sudo dnf install -y gcc gcc-c++ make python3 python3-devel
fi

if command -v make &> /dev/null; then
    echo "✓ make: $(make --version | head -1)"
else
    echo "✗ make 未安装"
fi

if command -v python3 &> /dev/null; then
    echo "✓ python3: $(python3 --version)"
else
    echo "✗ python3 未安装"
fi
echo ""

# 3. 查找 bcrypt 目录
echo "3. 查找 bcrypt 目录..."
BCRYPT_DIR=$(find node_modules/.pnpm -type d -path "*/bcrypt@5.1.1/node_modules/bcrypt" 2>/dev/null | head -1)

if [ -z "$BCRYPT_DIR" ]; then
    echo "未找到 bcrypt@5.1.1，查找所有 bcrypt 版本..."
    find node_modules/.pnpm -type d -name "bcrypt" -path "*/node_modules/bcrypt" 2>/dev/null
    BCRYPT_DIR=$(find node_modules/.pnpm -type d -name "bcrypt" -path "*/node_modules/bcrypt" 2>/dev/null | head -1)
fi

if [ -z "$BCRYPT_DIR" ]; then
    echo "错误: 未找到 bcrypt 目录"
    exit 1
fi

echo "找到 bcrypt 目录: $BCRYPT_DIR"
cd "$BCRYPT_DIR"

# 4. 检查目录结构
echo ""
echo "4. 检查目录结构..."
ls -la
echo ""
if [ -d "lib" ]; then
    echo "lib 目录内容:"
    ls -la lib/ 2>/dev/null || echo "lib 目录为空"
    if [ -d "lib/binding" ]; then
        echo "lib/binding 目录内容:"
        find lib/binding -type f 2>/dev/null || echo "lib/binding 为空"
    fi
fi
echo ""

# 5. 检查 package.json
echo "5. 检查 package.json..."
if [ -f "package.json" ]; then
    cat package.json | grep -A 5 '"scripts"'
else
    echo "错误: package.json 不存在"
    exit 1
fi
echo ""

# 6. 清理并重新编译
echo "6. 清理旧的构建..."
rm -rf build lib/binding node_modules 2>/dev/null || true

echo "7. 安装 node-gyp（如果不存在）..."
if ! command -v node-gyp &> /dev/null; then
    npm install -g node-gyp
fi

echo "8. 配置构建..."
node-gyp configure 2>&1 | tail -10

echo "9. 编译..."
node-gyp build 2>&1 | tail -20

# 7. 检查结果
echo ""
echo "10. 检查编译结果..."
BINDING_FILE="lib/binding/napi-v3/bcrypt_lib.node"
if [ -f "$BINDING_FILE" ]; then
    echo "✓ 绑定文件已创建: $BINDING_FILE"
    ls -lh "$BINDING_FILE"
else
    echo "✗ 绑定文件不存在，查找所有 .node 文件..."
    find . -name "*.node" -type f 2>/dev/null || echo "未找到任何 .node 文件"
    
    # 检查是否有其他版本的绑定
    if [ -d "lib/binding" ]; then
        echo "lib/binding 目录内容:"
        find lib/binding -type f 2>/dev/null
    fi
fi

cd /home/ec2-user/sunflower

# 8. 验证
echo ""
echo "11. 验证..."
if node -e "require('bcrypt'); console.log('✓ bcrypt OK')" 2>/dev/null; then
    echo "✓ bcrypt 验证成功！"
else
    echo "✗ bcrypt 验证失败"
    echo ""
    echo "如果仍然失败，建议使用 bcryptjs（纯 JavaScript，无需编译）"
fi

