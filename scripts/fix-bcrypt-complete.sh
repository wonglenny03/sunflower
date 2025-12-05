#!/bin/bash

# ============================================
# 完整修复 bcrypt 脚本
# 彻底解决 bcrypt 原生模块问题
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo ""
echo "============================================"
echo "完整修复 bcrypt 模块"
echo "============================================"
echo ""

# 检测代码目录
if [ -d "/home/ec2-user/sunflower" ]; then
    APP_DIR="/home/ec2-user/sunflower"
elif [ -d "/opt/company-search" ]; then
    APP_DIR="/opt/company-search"
else
    log_error "未找到代码目录"
    exit 1
fi

log_info "代码目录: $APP_DIR"
cd $APP_DIR

# 1. 安装编译工具
log_info "步骤 1: 安装编译工具..."
sudo dnf install -y gcc gcc-c++ make python3 python3-devel 2>/dev/null || {
    log_warning "使用 dnf groupinstall..."
    sudo dnf groupinstall -y "Development Tools" 2>/dev/null || true
}

# 验证编译工具
if ! command -v gcc &> /dev/null; then
    log_error "gcc 未安装"
    exit 1
fi
log_success "编译工具已就绪: gcc $(gcc --version | head -1 | awk '{print $3}')"

# 2. 完全删除 bcrypt
log_info "步骤 2: 完全删除 bcrypt..."
rm -rf node_modules/.pnpm/bcrypt@* 2>/dev/null || true
rm -rf node_modules/bcrypt 2>/dev/null || true
rm -rf apps/api/node_modules/bcrypt 2>/dev/null || true
rm -rf apps/*/node_modules/bcrypt 2>/dev/null || true
log_success "bcrypt 已删除"

# 3. 设置环境变量
export npm_config_build_from_source=true
export npm_config_cache=/tmp/.npm

# 4. 重新安装 bcrypt
log_info "步骤 3: 重新安装 bcrypt（这可能需要几分钟）..."
cd apps/api
pnpm add bcrypt@5.1.1 --save 2>&1 | tail -20 || {
    log_warning "pnpm add 失败，尝试从根目录安装..."
    cd ../..
    pnpm add bcrypt@5.1.1 -w 2>&1 | tail -20 || true
}

# 5. 查找 bcrypt 目录并手动编译
log_info "步骤 4: 查找并编译 bcrypt..."
cd $APP_DIR

BCRYPT_DIR=$(find node_modules/.pnpm -type d -path "*/bcrypt@5.1.1/node_modules/bcrypt" 2>/dev/null | head -1)

if [ -z "$BCRYPT_DIR" ]; then
    log_error "无法找到 bcrypt 目录"
    log_info "尝试重新安装所有依赖..."
    pnpm install --force 2>&1 | tail -20
    BCRYPT_DIR=$(find node_modules/.pnpm -type d -path "*/bcrypt@*/node_modules/bcrypt" 2>/dev/null | head -1)
fi

if [ -n "$BCRYPT_DIR" ]; then
    log_info "找到 bcrypt 目录: $BCRYPT_DIR"
    cd "$BCRYPT_DIR"
    
    # 检查绑定文件
    BINDING_FILE="lib/binding/napi-v3/bcrypt_lib.node"
    if [ ! -f "$BINDING_FILE" ]; then
        log_info "绑定文件不存在，开始编译..."
        
        # 清理旧的构建
        rm -rf build lib/binding 2>/dev/null || true
        
        # 编译
        log_info "运行 npm install（编译原生模块）..."
        npm install --build-from-source 2>&1 | tail -30 || {
            log_warning "npm install 失败，尝试 node-gyp..."
            if command -v node-gyp &> /dev/null; then
                node-gyp rebuild 2>&1 | tail -30 || true
            else
                npm install -g node-gyp
                node-gyp rebuild 2>&1 | tail -30 || true
            fi
        }
        
        # 检查是否编译成功
        if [ -f "$BINDING_FILE" ]; then
            log_success "bcrypt 编译成功！绑定文件: $BINDING_FILE"
        else
            log_warning "编译后仍未找到绑定文件，检查其他版本..."
            find lib/binding -name "*.node" 2>/dev/null || true
        fi
    else
        log_success "绑定文件已存在: $BINDING_FILE"
    fi
    
    cd $APP_DIR
else
    log_error "无法找到 bcrypt 目录，请检查安装"
    exit 1
fi

# 6. 验证
log_info "步骤 5: 验证 bcrypt..."
if node -e "const bc = require('bcrypt'); console.log('bcrypt version:', require('$BCRYPT_DIR/package.json').version); console.log('✓ bcrypt OK')" 2>/dev/null; then
    log_success "bcrypt 验证成功！"
else
    log_error "bcrypt 验证失败"
    log_info "尝试从应用目录验证..."
    cd apps/api
    if node -e "require('bcrypt'); console.log('✓ bcrypt OK')" 2>/dev/null; then
        log_success "从应用目录验证成功！"
    else
        log_error "bcrypt 仍然无法使用"
        log_info "请检查编译错误信息"
        exit 1
    fi
    cd ../..
fi

echo ""
echo "============================================"
log_success "bcrypt 修复完成！"
echo "============================================"
echo ""
log_info "现在可以重启应用:"
echo "  pm2 restart all"
echo ""

