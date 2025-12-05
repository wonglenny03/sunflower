#!/bin/bash

# ============================================
# 后端 API 诊断脚本
# ============================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "============================================"
echo "后端 API 诊断"
echo "============================================"
echo ""

# 1. 检查 PM2 状态
echo -e "${CYAN}1. PM2 进程状态:${NC}"
if command -v pm2 &> /dev/null; then
    pm2 status | grep -E "company-search-api|Status" || echo "未找到 API 进程"
else
    echo -e "${RED}✗ PM2 未安装${NC}"
fi
echo ""

# 2. 检查端口监听
echo -e "${CYAN}2. 端口监听状态:${NC}"
if netstat -tuln 2>/dev/null | grep -q ":3001 "; then
    echo -e "${GREEN}✓ 端口 3001 正在监听${NC}"
    netstat -tuln 2>/dev/null | grep ":3001 "
else
    echo -e "${RED}✗ 端口 3001 未监听${NC}"
fi
echo ""

# 3. 检查本地 API 访问
echo -e "${CYAN}3. 本地 API 访问测试:${NC}"
if curl -s -f -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3001/api 2>/dev/null; then
    echo -e "${GREEN}✓ API 访问正常${NC}"
else
    echo -e "${RED}✗ API 访问失败${NC}"
    echo "  尝试访问: curl http://localhost:3001/api"
    curl -v http://localhost:3001/api 2>&1 | head -10
fi
echo ""

# 4. 检查应用日志
echo -e "${CYAN}4. API 应用日志（最近 30 行）:${NC}"
if command -v pm2 &> /dev/null; then
    pm2 logs company-search-api --lines 30 --nostream 2>/dev/null || echo "无法读取日志"
else
    echo "PM2 未安装，无法查看日志"
fi
echo ""

# 5. 检查环境变量
echo -e "${CYAN}5. 环境变量检查:${NC}"
ENV_FILE="/home/ec2-user/sunflower/apps/api/.env"
if [ -f "$ENV_FILE" ]; then
    echo "✓ .env 文件存在: $ENV_FILE"
    if grep -q "PORT=3001" "$ENV_FILE"; then
        echo "✓ PORT 配置正确"
    else
        echo "! PORT 配置可能不正确"
    fi
    if grep -q "DATABASE_URL" "$ENV_FILE"; then
        echo "✓ DATABASE_URL 已配置"
    else
        echo -e "${RED}✗ DATABASE_URL 未配置${NC}"
    fi
else
    echo -e "${RED}✗ .env 文件不存在: $ENV_FILE${NC}"
fi
echo ""

# 6. 检查构建文件
echo -e "${CYAN}6. 构建文件检查:${NC}"
DIST_FILE="/home/ec2-user/sunflower/apps/api/dist/main.js"
if [ -f "$DIST_FILE" ]; then
    echo "✓ 构建文件存在: $DIST_FILE"
else
    echo -e "${RED}✗ 构建文件不存在，需要重新构建${NC}"
fi
echo ""

# 7. 检查数据库连接
echo -e "${CYAN}7. 数据库连接检查:${NC}"
if pgrep -x postgres > /dev/null; then
    echo "✓ PostgreSQL 进程正在运行"
    if netstat -tuln 2>/dev/null | grep -q ":5432 "; then
        echo "✓ PostgreSQL 端口 5432 正在监听"
    else
        echo -e "${YELLOW}! PostgreSQL 端口未监听${NC}"
    fi
else
    echo -e "${RED}✗ PostgreSQL 未运行${NC}"
fi
echo ""

echo "============================================"
echo -e "${CYAN}快速修复建议:${NC}"
echo "  1. 启动 API: pm2 restart company-search-api"
echo "  2. 查看日志: pm2 logs company-search-api"
echo "  3. 检查环境变量: cat /home/ec2-user/sunflower/apps/api/.env"
echo "  4. 重新构建: cd /home/ec2-user/sunflower/apps/api && pnpm build"
echo ""

