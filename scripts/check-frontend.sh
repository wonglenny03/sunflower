#!/bin/bash

# ============================================
# 前端访问诊断脚本
# ============================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "============================================"
echo "前端访问诊断"
echo "============================================"
echo ""

# 1. 检查 PM2 状态
echo -e "${CYAN}1. PM2 进程状态:${NC}"
if command -v pm2 &> /dev/null; then
    pm2 status
else
    echo -e "${RED}✗ PM2 未安装${NC}"
fi
echo ""

# 2. 检查端口监听
echo -e "${CYAN}2. 端口监听状态:${NC}"
if netstat -tuln 2>/dev/null | grep -q ":3000 "; then
    echo -e "${GREEN}✓ 端口 3000 正在监听${NC}"
    netstat -tuln 2>/dev/null | grep ":3000 "
else
    echo -e "${RED}✗ 端口 3000 未监听${NC}"
fi
echo ""

# 3. 检查本地访问
echo -e "${CYAN}3. 本地访问测试:${NC}"
if curl -s -f -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000 2>/dev/null; then
    echo -e "${GREEN}✓ 本地访问正常${NC}"
else
    echo -e "${RED}✗ 本地访问失败${NC}"
fi
echo ""

# 4. 检查防火墙
echo -e "${CYAN}4. 防火墙状态:${NC}"
if command -v firewall-cmd &> /dev/null; then
    if firewall-cmd --list-ports 2>/dev/null | grep -q "3000"; then
        echo -e "${GREEN}✓ 端口 3000 已在防火墙中开放${NC}"
    else
        echo -e "${YELLOW}! 端口 3000 可能未在防火墙中开放${NC}"
        echo "  运行: sudo firewall-cmd --permanent --add-port=3000/tcp && sudo firewall-cmd --reload"
    fi
elif command -v ufw &> /dev/null; then
    if ufw status | grep -q "3000"; then
        echo -e "${GREEN}✓ 端口 3000 已在防火墙中开放${NC}"
    else
        echo -e "${YELLOW}! 端口 3000 可能未在防火墙中开放${NC}"
    fi
else
    echo -e "${YELLOW}! 未检测到防火墙工具${NC}"
fi
echo ""

# 5. 检查 EC2 安全组
echo -e "${CYAN}5. EC2 安全组检查:${NC}"
echo "  请确保 AWS EC2 安全组已开放端口 3000"
echo "  检查方法："
echo "    1. 登录 AWS Console"
echo "    2. 进入 EC2 -> Security Groups"
echo "    3. 找到你的实例的安全组"
echo "    4. 检查 Inbound Rules 是否包含端口 3000"
echo ""

# 6. 检查应用日志
echo -e "${CYAN}6. 应用日志（最近 20 行）:${NC}"
if command -v pm2 &> /dev/null; then
    pm2 logs company-search-web --lines 20 --nostream 2>/dev/null || echo "无法读取日志"
else
    echo "PM2 未安装，无法查看日志"
fi
echo ""

# 7. 检查进程
echo -e "${CYAN}7. Node.js 进程:${NC}"
ps aux | grep -E "node|next" | grep -v grep || echo "未找到 Node.js 进程"
echo ""

echo "============================================"
echo -e "${CYAN}快速修复建议:${NC}"
echo "  1. 启动应用: pm2 restart all"
echo "  2. 检查日志: pm2 logs company-search-web"
echo "  3. 开放防火墙: sudo firewall-cmd --permanent --add-port=3000/tcp && sudo firewall-cmd --reload"
echo "  4. 检查 AWS 安全组是否开放端口 3000"
echo ""

