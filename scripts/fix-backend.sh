#!/bin/bash

# ============================================
# 修复后端 API 问题
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

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo ""
echo "============================================"
echo "修复后端 API"
echo "============================================"
echo ""

APP_DIR="/home/ec2-user/sunflower"
if [ ! -d "$APP_DIR" ]; then
    APP_DIR="/opt/company-search"
fi

cd $APP_DIR

# 1. 检查环境变量
log_info "1. 检查环境变量..."
ENV_FILE="apps/api/.env"
if [ ! -f "$ENV_FILE" ]; then
    log_error ".env 文件不存在: $ENV_FILE"
    log_info "请创建 .env 文件或运行部署脚本"
    exit 1
fi
log_success ".env 文件存在"

# 2. 检查构建文件
log_info "2. 检查构建文件..."
if [ ! -f "apps/api/dist/main.js" ]; then
    log_warning "构建文件不存在，开始构建..."
    cd apps/api
    pnpm build
    cd ../..
fi
log_success "构建文件存在"

# 3. 检查 PM2 进程
log_info "3. 检查 PM2 进程..."
if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 status | grep "company-search-api" | awk '{print $10}' || echo "notfound")
    if [ "$PM2_STATUS" = "online" ]; then
        log_success "API 进程正在运行"
    else
        log_warning "API 进程未运行，正在启动..."
        pm2 restart company-search-api || pm2 start ecosystem.config.js
        sleep 5
    fi
else
    log_error "PM2 未安装"
    exit 1
fi

# 4. 检查端口
log_info "4. 检查端口 3001..."
sleep 2
if netstat -tuln 2>/dev/null | grep -q ":3001 "; then
    log_success "端口 3001 正在监听"
else
    log_error "端口 3001 未监听"
    log_info "查看应用日志..."
    pm2 logs company-search-api --lines 50 --nostream
    exit 1
fi

# 5. 测试 API
log_info "5. 测试 API 访问..."
if curl -s -f -o /dev/null http://localhost:3001/api 2>/dev/null; then
    log_success "API 访问正常"
else
    log_warning "API 访问失败，查看日志..."
    pm2 logs company-search-api --lines 50 --nostream
    exit 1
fi

# 6. 检查前端配置
log_info "6. 检查前端 API 配置..."
WEB_ENV="apps/web/.env.production"
if [ -f "$WEB_ENV" ]; then
    API_URL=$(grep "NEXT_PUBLIC_API_URL" "$WEB_ENV" | cut -d'=' -f2)
    log_info "前端 API URL: $API_URL"
    if [ "$API_URL" != "http://localhost:3001" ]; then
        log_warning "前端 API URL 配置可能不正确"
    fi
else
    log_warning ".env.production 文件不存在"
fi

echo ""
echo "============================================"
log_success "后端 API 修复完成！"
echo "============================================"
echo ""
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "your-server-ip")
echo -e "${CYAN}API 地址:${NC}"
echo "  本地: http://localhost:3001/api"
echo "  公网: http://${PUBLIC_IP}:3001/api"
echo "  API 文档: http://${PUBLIC_IP}:3001/api/docs"
echo ""
echo -e "${CYAN}常用命令:${NC}"
echo "  查看日志: pm2 logs company-search-api"
echo "  重启 API: pm2 restart company-search-api"
echo ""

