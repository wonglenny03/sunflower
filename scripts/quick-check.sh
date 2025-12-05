#!/bin/bash

# ============================================
# 快速检查脚本（简化版）
# ============================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_USER="companysearch"
API_PORT=3001
WEB_PORT=3000

echo ""
echo "============================================"
echo "快速部署检查"
echo "============================================"
echo ""

# 检查服务状态
echo "1. 服务状态:"
# 检测 PostgreSQL 服务名
POSTGRES_SERVICE="postgresql-15"
if [ -f "/tmp/postgres_service_name" ]; then
    POSTGRES_SERVICE=$(cat /tmp/postgres_service_name)
elif systemctl list-unit-files 2>/dev/null | grep -q "postgresql.service"; then
    POSTGRES_SERVICE="postgresql"
fi

if systemctl is-active --quiet $POSTGRES_SERVICE 2>/dev/null || pgrep -x postgres > /dev/null; then
    echo -e "  ${GREEN}✓${NC} PostgreSQL 运行中"
else
    echo -e "  ${RED}✗${NC} PostgreSQL 未运行"
fi
systemctl is-active --quiet nginx && echo -e "  ${GREEN}✓${NC} Nginx 运行中" || echo -e "  ${RED}✗${NC} Nginx 未运行"

# 检查 PM2
echo ""
echo "2. PM2 进程:"
if sudo -u $APP_USER pm2 list &> /dev/null; then
    sudo -u $APP_USER pm2 list | grep -E "company-search|online|errored" || echo -e "  ${YELLOW}!${NC} 无运行中的进程"
else
    echo -e "  ${RED}✗${NC} PM2 未运行"
fi

# 检查端口
echo ""
echo "3. 端口监听:"
netstat -tuln 2>/dev/null | grep -q ":5432 " && echo -e "  ${GREEN}✓${NC} PostgreSQL (5432)" || echo -e "  ${RED}✗${NC} PostgreSQL (5432)"
netstat -tuln 2>/dev/null | grep -q ":$API_PORT " && echo -e "  ${GREEN}✓${NC} API ($API_PORT)" || echo -e "  ${RED}✗${NC} API ($API_PORT)"
netstat -tuln 2>/dev/null | grep -q ":$WEB_PORT " && echo -e "  ${GREEN}✓${NC} Web ($WEB_PORT)" || echo -e "  ${RED}✗${NC} Web ($WEB_PORT)"

# 检查 HTTP 响应
echo ""
echo "4. HTTP 服务:"
curl -s -f -o /dev/null -w "" http://localhost:$API_PORT/api && echo -e "  ${GREEN}✓${NC} API 可访问" || echo -e "  ${RED}✗${NC} API 不可访问"
curl -s -f -o /dev/null -w "" http://localhost:$WEB_PORT && echo -e "  ${GREEN}✓${NC} Web 可访问" || echo -e "  ${RED}✗${NC} Web 不可访问"

echo ""
echo "============================================"
echo ""

