#!/bin/bash

# ============================================
# 修复前端 API URL 配置
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

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo ""
echo "============================================"
echo "修复前端 API URL 配置"
echo "============================================"
echo ""

APP_DIR="/home/ec2-user/sunflower"
if [ ! -d "$APP_DIR" ]; then
    APP_DIR="/opt/company-search"
fi

cd $APP_DIR

# 获取公网 IP
log_info "获取服务器公网 IP..."
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "")

if [ -z "$PUBLIC_IP" ]; then
    log_error "无法获取公网 IP"
    read -p "请输入服务器公网 IP 或域名: " PUBLIC_IP
    if [ -z "$PUBLIC_IP" ]; then
        log_error "IP 地址不能为空"
        exit 1
    fi
fi

log_success "服务器公网 IP: $PUBLIC_IP"

# 创建 .env.production 文件
log_info "创建 .env.production 文件..."
WEB_ENV="apps/web/.env.production"
mkdir -p apps/web

cat > "$WEB_ENV" <<EOF
NEXT_PUBLIC_API_URL=http://${PUBLIC_IP}:3001
EOF

log_success ".env.production 文件已创建: $WEB_ENV"
cat "$WEB_ENV"

# 更新 ecosystem.config.js
log_info "更新 ecosystem.config.js..."
if [ -f "ecosystem.config.js" ]; then
    # 备份
    cp ecosystem.config.js ecosystem.config.js.bak
    
    # 更新配置（使用 sed 替换）
    sed -i "s|NEXT_PUBLIC_API_URL: 'http://localhost:3001'|NEXT_PUBLIC_API_URL: 'http://${PUBLIC_IP}:3001'|g" ecosystem.config.js
    
    log_success "ecosystem.config.js 已更新"
else
    log_warning "ecosystem.config.js 不存在，跳过更新"
fi

# 重新构建前端（因为环境变量在构建时使用）
log_info "重新构建前端（环境变量在构建时使用）..."
cd apps/web
pnpm build 2>&1 | tail -20
cd ../..

# 重启应用
log_info "重启应用..."
if command -v pm2 &> /dev/null; then
    pm2 restart company-search-web
    sleep 3
    log_success "应用已重启"
else
    log_warning "PM2 未安装，请手动重启应用"
fi

echo ""
echo "============================================"
log_success "API URL 配置完成！"
echo "============================================"
echo ""
echo -e "${CYAN}配置信息:${NC}"
echo "  前端 URL: http://${PUBLIC_IP}:3000"
echo "  后端 API URL: http://${PUBLIC_IP}:3001/api"
echo ""
echo -e "${CYAN}重要提醒:${NC}"
echo "  1. 确保 AWS EC2 安全组已开放端口 3000 和 3001"
echo "  2. 如果使用域名，请将 IP 替换为域名"
echo "  3. 如果使用 HTTPS，请将 http:// 替换为 https://"
echo ""

