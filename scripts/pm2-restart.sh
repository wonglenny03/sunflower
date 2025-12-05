#!/bin/bash

# ============================================
# PM2 快速重启脚本
# 用于更新代码后快速重启
# ============================================

set -e

APP_USER="companysearch"
APP_DIR="/opt/company-search"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# 检查 root
if [ "$EUID" -ne 0 ]; then 
    echo "请使用 root 用户运行: sudo bash pm2-restart.sh"
    exit 1
fi

echo ""
echo "============================================"
echo "PM2 快速重启"
echo "============================================"
echo ""

# 更新代码（如果使用 Git）
if [ -d "${APP_DIR}/.git" ]; then
    log_info "更新代码..."
    cd ${APP_DIR}
    sudo -u ${APP_USER} git pull || {
        echo "Git pull 失败，使用现有代码"
    }
fi

# 重新构建（可选）
read -p "是否重新构建应用？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "重新构建应用..."
    cd ${APP_DIR}
    sudo -u ${APP_USER} pnpm install --frozen-lockfile
    sudo -u ${APP_USER} pnpm --filter './packages/*' build
    cd ${APP_DIR}/apps/api && sudo -u ${APP_USER} pnpm build
    cd ${APP_DIR}/apps/web && sudo -u ${APP_USER} pnpm build
    log_success "构建完成"
fi

# 重启 PM2
log_info "重启应用..."
sudo -u ${APP_USER} pm2 restart all

# 等待启动
sleep 2

# 显示状态
log_success "重启完成！"
echo ""
sudo -u ${APP_USER} pm2 status

