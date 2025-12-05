#!/bin/bash

# ============================================
# AWS EC2 快速部署脚本 (简化版)
# 适用于已有代码的情况
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

APP_DIR="/opt/company-search"
APP_USER="companysearch"

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 root
if [ "$EUID" -ne 0 ]; then 
    log_error "请使用 root 用户运行: sudo bash deploy-aws-quick.sh"
    exit 1
fi

log_info "快速部署模式 - 假设所有软件已安装"
log_info "如果未安装，请先运行: sudo bash deploy-aws.sh"
echo ""

# 更新代码
if [ -d "${APP_DIR}/.git" ]; then
    log_info "更新代码..."
    cd ${APP_DIR}
    sudo -u ${APP_USER} git pull
else
    log_error "未找到代码目录 ${APP_DIR}"
    exit 1
fi

# 安装依赖和构建
log_info "安装依赖和构建..."
cd ${APP_DIR}
sudo -u ${APP_USER} pnpm install --frozen-lockfile
sudo -u ${APP_USER} pnpm --filter './packages/*' build
cd ${APP_DIR}/apps/api && sudo -u ${APP_USER} pnpm build
cd ${APP_DIR}/apps/web && sudo -u ${APP_USER} pnpm build

# 重启服务
log_info "重启服务..."
sudo -u ${APP_USER} pm2 restart all

log_success "部署完成！"

