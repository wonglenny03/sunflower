#!/bin/bash

# ============================================
# PM2 启动脚本（简化版）
# 直接启动已配置的 PM2 应用
# ============================================

set -e

APP_USER="companysearch"
APP_DIR="/opt/company-search"
PM2_CONFIG="/home/${APP_USER}/ecosystem.config.js"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
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

# 检查 root
if [ "$EUID" -ne 0 ]; then 
    log_error "请使用 root 用户运行: sudo bash pm2-start.sh"
    exit 1
fi

echo ""
echo "============================================"
echo "PM2 启动应用"
echo "============================================"
echo ""

# 检查代码目录
if [ ! -d "$APP_DIR" ]; then
    log_error "代码目录不存在: $APP_DIR"
    exit 1
fi

# 检查 .env 文件
ENV_FILE="${APP_DIR}/apps/api/.env"
if [ ! -f "$ENV_FILE" ]; then
    log_error ".env 文件不存在: $ENV_FILE"
    log_info "请先创建 .env 文件或运行 pm2-deploy.sh"
    exit 1
fi

log_success ".env 文件: $ENV_FILE"

# 检查 PM2 配置
if [ ! -f "$PM2_CONFIG" ]; then
    log_error "PM2 配置文件不存在: $PM2_CONFIG"
    log_info "请先运行 pm2-deploy.sh 进行初始配置"
    exit 1
fi

log_success "PM2 配置: $PM2_CONFIG"

# 停止现有进程
log_info "停止现有进程..."
sudo -u ${APP_USER} pm2 delete all 2>/dev/null || true

# 启动应用
log_info "启动应用..."
cd ${APP_DIR}
sudo -u ${APP_USER} pm2 start ${PM2_CONFIG}

# 保存配置
sudo -u ${APP_USER} pm2 save

# 等待启动
sleep 3

# 显示状态
log_success "启动完成！"
echo ""
sudo -u ${APP_USER} pm2 status
echo ""
log_info "查看日志: sudo -u ${APP_USER} pm2 logs"

