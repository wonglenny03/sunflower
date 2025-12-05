#!/bin/bash

# ============================================
# 部署验证脚本
# 用于验证部署是否成功
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

APP_DIR="/opt/company-search"
APP_USER="companysearch"
API_PORT=3001
WEB_PORT=3000

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

check_command() {
    if command -v $1 &> /dev/null; then
        log_success "$1 已安装: $($1 --version 2>/dev/null | head -1 || echo '已安装')"
        return 0
    else
        log_error "$1 未安装"
        return 1
    fi
}

check_service() {
    if systemctl is-active --quiet $1; then
        log_success "$1 服务正在运行"
        return 0
    else
        log_error "$1 服务未运行"
        return 1
    fi
}

check_port() {
    if netstat -tuln 2>/dev/null | grep -q ":$1 " || ss -tuln 2>/dev/null | grep -q ":$1 "; then
        log_success "端口 $1 正在监听"
        return 0
    else
        log_error "端口 $1 未监听"
        return 1
    fi
}

check_file() {
    if [ -f "$1" ]; then
        log_success "文件存在: $1"
        return 0
    else
        log_error "文件不存在: $1"
        return 1
    fi
}

check_directory() {
    if [ -d "$1" ]; then
        log_success "目录存在: $1"
        return 0
    else
        log_error "目录不存在: $1"
        return 1
    fi
}

check_http() {
    local url=$1
    local name=$2
    
    if curl -s -f -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|301\|302"; then
        log_success "$name 可访问: $url"
        return 0
    else
        log_error "$name 不可访问: $url"
        return 1
    fi
}

echo ""
echo "============================================"
echo "部署验证检查"
echo "============================================"
echo ""

ERRORS=0

# 1. 检查必需软件
echo -e "${CYAN}1. 检查必需软件${NC}"
echo "----------------------------------------"
check_command node || ((ERRORS++))
check_command npm || ((ERRORS++))
check_command pnpm || ((ERRORS++))
check_command psql || ((ERRORS++))
check_command pm2 || ((ERRORS++))
check_command nginx || ((ERRORS++))
echo ""

# 2. 检查 Node.js 版本
echo -e "${CYAN}2. 检查 Node.js 版本${NC}"
echo "----------------------------------------"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge "18" ]; then
    log_success "Node.js 版本符合要求: $(node -v)"
else
    log_error "Node.js 版本过低: $(node -v) (需要 18+)"
    ((ERRORS++))
fi
echo ""

# 3. 检查系统服务
echo -e "${CYAN}3. 检查系统服务${NC}"
echo "----------------------------------------"
# 检测 PostgreSQL 服务名
POSTGRES_SERVICE="postgresql-15"
if [ -f "/tmp/postgres_service_name" ]; then
    POSTGRES_SERVICE=$(cat /tmp/postgres_service_name)
elif systemctl list-unit-files 2>/dev/null | grep -q "postgresql.service"; then
    POSTGRES_SERVICE="postgresql"
fi

check_service $POSTGRES_SERVICE || {
    # 如果服务检查失败，尝试检查进程
    if pgrep -x postgres > /dev/null; then
        log_success "PostgreSQL 进程正在运行（服务名可能不同）"
    else
        ((ERRORS++))
    fi
}
check_service nginx || ((ERRORS++))
echo ""

# 4. 检查端口
echo -e "${CYAN}4. 检查端口监听${NC}"
echo "----------------------------------------"
check_port 5432 || ((ERRORS++))  # PostgreSQL
check_port $API_PORT || ((ERRORS++))  # API
check_port $WEB_PORT || ((ERRORS++))  # Web
check_port 80 || log_warning "端口 80 未监听（Nginx 可能未配置）"
echo ""

# 5. 检查应用目录和文件
echo -e "${CYAN}5. 检查应用目录和文件${NC}"
echo "----------------------------------------"
check_directory "$APP_DIR" || ((ERRORS++))
check_file "$APP_DIR/package.json" || ((ERRORS++))
check_file "$APP_DIR/apps/api/dist/main.js" || log_warning "后端未构建或构建失败"
check_directory "$APP_DIR/apps/web/.next" || log_warning "前端未构建或构建失败"
check_file "$APP_DIR/apps/api/.env" || log_warning "环境变量文件不存在"
echo ""

# 6. 检查 PM2 进程
echo -e "${CYAN}6. 检查 PM2 进程${NC}"
echo "----------------------------------------"
if sudo -u $APP_USER pm2 list &> /dev/null; then
    PM2_COUNT=$(sudo -u $APP_USER pm2 list | grep -c "online" || echo "0")
    if [ "$PM2_COUNT" -ge "2" ]; then
        log_success "PM2 进程运行正常 ($PM2_COUNT 个进程)"
        echo ""
        sudo -u $APP_USER pm2 list
    else
        log_error "PM2 进程数量不足 (期望 2 个，实际 $PM2_COUNT 个)"
        ((ERRORS++))
    fi
else
    log_error "PM2 未运行或无法访问"
    ((ERRORS++))
fi
echo ""

# 7. 检查数据库连接
echo -e "${CYAN}7. 检查数据库连接${NC}"
echo "----------------------------------------"
if [ -f "/root/.db_credentials" ]; then
    source /root/.db_credentials 2>/dev/null || true
    if [ -n "$DATABASE_URL" ]; then
        # 提取数据库信息
        DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
        DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
        
        if sudo -u postgres psql -d $DB_NAME -U $DB_USER -c "SELECT 1;" &> /dev/null; then
            log_success "数据库连接正常"
        else
            log_error "数据库连接失败"
            ((ERRORS++))
        fi
    else
        log_warning "无法读取数据库凭据"
    fi
else
    log_warning "数据库凭据文件不存在"
fi
echo ""

# 8. 检查 HTTP 服务
echo -e "${CYAN}8. 检查 HTTP 服务${NC}"
echo "----------------------------------------"
sleep 2  # 等待服务完全启动

# 检查本地 API
if check_http "http://localhost:$API_PORT/api" "后端 API"; then
    # 检查 API 文档
    check_http "http://localhost:$API_PORT/api/docs" "API 文档" || log_warning "API 文档不可访问"
else
    ((ERRORS++))
fi

# 检查本地前端
if check_http "http://localhost:$WEB_PORT" "前端应用"; then
    log_success "前端应用可访问"
else
    log_warning "前端应用不可访问（可能正在构建）"
fi
echo ""

# 9. 检查环境变量
echo -e "${CYAN}9. 检查环境变量配置${NC}"
echo "----------------------------------------"
if [ -f "$APP_DIR/apps/api/.env" ]; then
    ENV_FILE="$APP_DIR/apps/api/.env"
    
    # 检查关键环境变量
    if grep -q "OPENAI_API_KEY" "$ENV_FILE"; then
        if grep -q "OPENAI_API_KEY=your-openai-api-key-here" "$ENV_FILE"; then
            log_warning "OPENAI_API_KEY 未配置（仍为默认值）"
        else
            log_success "OPENAI_API_KEY 已配置"
        fi
    else
        log_error "OPENAI_API_KEY 未找到"
        ((ERRORS++))
    fi
    
    if grep -q "DATABASE_URL" "$ENV_FILE"; then
        log_success "DATABASE_URL 已配置"
    else
        log_error "DATABASE_URL 未配置"
        ((ERRORS++))
    fi
    
    if grep -q "JWT_SECRET" "$ENV_FILE"; then
        log_success "JWT_SECRET 已配置"
    else
        log_warning "JWT_SECRET 未配置"
    fi
else
    log_error "环境变量文件不存在"
    ((ERRORS++))
fi
echo ""

# 10. 检查日志
echo -e "${CYAN}10. 检查最近日志${NC}"
echo "----------------------------------------"
if [ -d "/home/$APP_USER/logs" ]; then
    log_success "日志目录存在"
    
    # 显示最近的错误日志
    if [ -f "/home/$APP_USER/logs/api-error.log" ]; then
        ERROR_COUNT=$(tail -100 /home/$APP_USER/logs/api-error.log | grep -i error | wc -l)
        if [ "$ERROR_COUNT" -gt "0" ]; then
            log_warning "发现 $ERROR_COUNT 个最近的错误日志"
            echo "最近的错误:"
            tail -5 /home/$APP_USER/logs/api-error.log | head -3
        else
            log_success "API 错误日志正常"
        fi
    fi
else
    log_warning "日志目录不存在"
fi
echo ""

# 总结
echo "============================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ 所有检查通过！部署成功！${NC}"
    echo ""
    echo -e "${CYAN}访问地址:${NC}"
    PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "your-server-ip")
    echo "  前端: http://${PUBLIC_IP}:${WEB_PORT}"
    echo "  后端 API: http://${PUBLIC_IP}:${API_PORT}/api"
    echo "  API 文档: http://${PUBLIC_IP}:${API_PORT}/api/docs"
    echo ""
    echo -e "${CYAN}常用命令:${NC}"
    echo "  查看 PM2 状态: sudo -u $APP_USER pm2 status"
    echo "  查看日志: sudo -u $APP_USER pm2 logs"
    echo "  重启服务: sudo -u $APP_USER pm2 restart all"
    exit 0
else
    echo -e "${RED}✗ 发现 $ERRORS 个问题，请检查上述错误${NC}"
    echo ""
    echo -e "${CYAN}故障排查建议:${NC}"
    echo "  1. 查看 PM2 日志: sudo -u $APP_USER pm2 logs"
    echo "  2. 查看系统日志: journalctl -xe"
    echo "  3. 检查服务状态: systemctl status postgresql-15 nginx"
    echo "  4. 检查环境变量: cat $APP_DIR/apps/api/.env"
    exit 1
fi

