#!/bin/bash

# ============================================
# 修复 bcrypt 模块脚本
# 解决 bcrypt 原生模块编译问题
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
echo "修复 bcrypt 模块"
echo "============================================"
echo ""

# 检测代码目录
if [ -d "/home/ec2-user/sunflower" ]; then
    APP_DIR="/home/ec2-user/sunflower"
    log_info "检测到代码目录: $APP_DIR"
elif [ -d "/opt/company-search" ]; then
    APP_DIR="/opt/company-search"
    log_info "检测到代码目录: $APP_DIR"
else
    log_error "未找到代码目录"
    read -p "请输入代码目录路径: " APP_DIR
    if [ ! -d "$APP_DIR" ]; then
        log_error "目录不存在: $APP_DIR"
        exit 1
    fi
fi

cd $APP_DIR

# 检查必需工具
log_info "检查编译工具..."

# 安装编译工具（Amazon Linux 2023）
if ! command -v gcc &> /dev/null || ! command -v make &> /dev/null || ! command -v python3 &> /dev/null; then
    log_warning "缺少编译工具，正在安装..."
    sudo dnf groupinstall -y "Development Tools" 2>/dev/null || \
    sudo dnf install -y gcc gcc-c++ make python3 node-gyp 2>/dev/null || {
        log_error "无法安装编译工具"
        exit 1
    }
fi

log_success "编译工具已就绪"

# 检查 Node.js 版本
NODE_VERSION=$(node -v)
log_info "Node.js 版本: $NODE_VERSION"

# 方法 1: 重新安装 bcrypt
log_info "方法 1: 重新安装 bcrypt..."

# 删除 bcrypt（pnpm workspace 需要删除整个包）
log_info "删除旧的 bcrypt 模块..."
rm -rf node_modules/.pnpm/bcrypt@* 2>/dev/null || true
rm -rf node_modules/bcrypt 2>/dev/null || true
rm -rf apps/api/node_modules/bcrypt 2>/dev/null || true

# 检查是否有编译工具
if ! command -v gcc &> /dev/null; then
    log_warning "gcc 未安装，正在安装编译工具..."
    sudo dnf groupinstall -y "Development Tools" 2>/dev/null || \
    sudo dnf install -y gcc gcc-c++ make python3 2>/dev/null || {
        log_error "无法安装编译工具"
        exit 1
    }
fi

# 设置环境变量确保编译成功
export npm_config_build_from_source=true

# 重新安装依赖（会重新编译 bcrypt）
log_info "重新安装依赖（这可能需要几分钟）..."
pnpm install --force 2>&1 | tail -20

# 如果 pnpm install 没有编译 bcrypt，手动重建
log_info "手动重建 bcrypt..."
cd apps/api
pnpm rebuild bcrypt 2>&1 || {
    log_warning "pnpm rebuild 失败，尝试 npm rebuild..."
    npm rebuild bcrypt --build-from-source 2>&1 || true
}
cd ../..

# 验证 bcrypt
log_info "验证 bcrypt 安装..."

# 查找 bcrypt 目录
BCRYPT_DIR=$(find node_modules/.pnpm -name "bcrypt" -type d -path "*/bcrypt@*/node_modules/bcrypt" 2>/dev/null | head -1)

if [ -z "$BCRYPT_DIR" ]; then
    log_error "无法找到 bcrypt 目录"
    exit 1
fi

log_info "找到 bcrypt 目录: $BCRYPT_DIR"

# 检查绑定文件是否存在
BINDING_FILE="$BCRYPT_DIR/lib/binding/napi-v3/bcrypt_lib.node"
if [ -f "$BINDING_FILE" ]; then
    log_success "bcrypt 绑定文件已存在: $BINDING_FILE"
else
    log_warning "bcrypt 绑定文件不存在，尝试手动编译..."
    
    # 方法 2: 手动编译 bcrypt
    cd "$BCRYPT_DIR"
    
    log_info "编译 bcrypt（在目录: $(pwd)）..."
    
    # 尝试不同的编译方法
    if [ -f "package.json" ]; then
        npm run install 2>&1 || \
        node-gyp rebuild 2>&1 || \
        npm rebuild --build-from-source 2>&1 || {
            log_error "手动编译失败"
            cd $APP_DIR
            exit 1
        }
    else
        log_error "package.json 不存在"
        cd $APP_DIR
        exit 1
    fi
    
    cd $APP_DIR
    
    # 再次检查绑定文件
    if [ -f "$BINDING_FILE" ]; then
        log_success "bcrypt 编译成功！绑定文件: $BINDING_FILE"
    else
        log_error "bcrypt 绑定文件仍然不存在"
        log_info "尝试查找其他版本的绑定文件..."
        find "$BCRYPT_DIR/lib/binding" -name "*.node" 2>/dev/null || true
        exit 1
    fi
fi

# 最终验证
log_info "最终验证 bcrypt..."
if node -e "const bcrypt = require('bcrypt'); console.log('bcrypt version:', require('$BCRYPT_DIR/package.json').version); console.log('bcrypt OK')" 2>/dev/null; then
    log_success "bcrypt 验证成功！"
else
    log_error "bcrypt 验证失败"
    log_info "尝试从应用目录验证..."
    cd apps/api
    if node -e "require('bcrypt'); console.log('bcrypt OK')" 2>/dev/null; then
        log_success "从应用目录验证成功！"
    else
        log_error "bcrypt 仍然无法使用"
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
