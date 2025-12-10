#!/bin/bash

# ============================================
# 修复 CORS 配置
# ============================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

echo ""
echo "============================================"
echo "修复 CORS 配置"
echo "============================================"
echo ""

APP_DIR="/home/ec2-user/sunflower"
if [ ! -d "$APP_DIR" ]; then
    APP_DIR="/opt/company-search"
fi

cd $APP_DIR

# 获取公网 IP
log_info "获取服务器公网 IP..."
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "51.21.199.15")

log_success "服务器公网 IP: $PUBLIC_IP"

# 更新后端 .env 文件
log_info "更新后端 CORS 配置..."
ENV_FILE="apps/api/.env"

if [ -f "$ENV_FILE" ]; then
    # 更新或添加 FRONTEND_URL
    if grep -q "FRONTEND_URL" "$ENV_FILE"; then
        sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=http://${PUBLIC_IP}:3000|" "$ENV_FILE"
    else
        echo "" >> "$ENV_FILE"
        echo "# 前端 URL（用于 CORS 配置）" >> "$ENV_FILE"
        echo "FRONTEND_URL=http://${PUBLIC_IP}:3000" >> "$ENV_FILE"
    fi
    log_success ".env 文件已更新"
else
    log_error ".env 文件不存在"
    exit 1
fi

# 重新构建后端（如果代码已更新）
log_info "检查是否需要重新构建..."
if [ -f "apps/api/src/main.ts" ]; then
    # 检查 main.ts 是否已更新（包含新的 CORS 配置）
    if grep -q "allowedOrigins" "apps/api/src/main.ts"; then
        log_info "代码已更新，重新构建后端..."
        cd apps/api
        pnpm build 2>&1 | tail -20
        cd ../..
        log_success "后端构建完成"
    else
        log_warning "代码未更新，请先更新代码并重新构建"
    fi
fi

# 重启 API
log_info "重启 API 应用..."
if command -v pm2 &> /dev/null; then
    pm2 restart company-search-api
    sleep 3
    log_success "API 已重启"
else
    log_warning "PM2 未安装"
fi

echo ""
echo "============================================"
log_success "CORS 配置完成！"
echo "============================================"
echo ""
echo -e "${CYAN}配置信息:${NC}"
echo "  FRONTEND_URL: http://${PUBLIC_IP}:3000"
echo "  前端地址: http://${PUBLIC_IP}:3000"
echo "  后端 API: http://${PUBLIC_IP}:3001/api"
echo ""
echo -e "${CYAN}注意:${NC}"
echo "  如果代码已更新，需要重新构建后端"
echo "  运行: cd apps/api && pnpm build && pm2 restart company-search-api"
echo ""

