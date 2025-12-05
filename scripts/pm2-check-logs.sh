#!/bin/bash

# ============================================
# PM2 日志检查脚本
# 用于快速查看错误日志
# ============================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "============================================"
echo "PM2 日志检查"
echo "============================================"
echo ""

# 检查 PM2 状态
echo -e "${CYAN}PM2 状态:${NC}"
pm2 status
echo ""

# 查看最近的错误日志
echo -e "${CYAN}API 错误日志（最近 30 行）:${NC}"
echo "----------------------------------------"
pm2 logs company-search-api --err --lines 30 --nostream 2>/dev/null || echo "无法读取日志"
echo ""

echo -e "${CYAN}Web 错误日志（最近 30 行）:${NC}"
echo "----------------------------------------"
pm2 logs company-search-web --err --lines 30 --nostream 2>/dev/null || echo "无法读取日志"
echo ""

# 查看所有日志
echo -e "${CYAN}所有应用日志（最近 20 行）:${NC}"
echo "----------------------------------------"
pm2 logs --lines 20 --nostream 2>/dev/null || echo "无法读取日志"
echo ""

# 检查文件日志
APP_DIR="/opt/company-search"
if [ -d "${APP_DIR}/logs" ]; then
    echo -e "${CYAN}文件日志:${NC}"
    echo "----------------------------------------"
    if [ -f "${APP_DIR}/logs/api-error.log" ]; then
        echo -e "${YELLOW}API 错误日志文件:${NC}"
        tail -20 ${APP_DIR}/logs/api-error.log
        echo ""
    fi
    if [ -f "${APP_DIR}/logs/web-error.log" ]; then
        echo -e "${YELLOW}Web 错误日志文件:${NC}"
        tail -20 ${APP_DIR}/logs/web-error.log
        echo ""
    fi
fi

echo "============================================"
echo ""
echo -e "${CYAN}常用命令:${NC}"
echo "  实时查看日志: pm2 logs"
echo "  查看 API 日志: pm2 logs company-search-api"
echo "  查看 Web 日志: pm2 logs company-search-web"
echo "  查看错误日志: pm2 logs --err"
echo "  重启应用: pm2 restart all"
echo ""

