#!/bin/bash

# ============================================
# 检查 API 错误日志
# ============================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "============================================"
echo "API 错误诊断"
echo "============================================"
echo ""

# 1. 查看 PM2 日志
echo -e "${CYAN}1. PM2 错误日志（最近 50 行）:${NC}"
echo "----------------------------------------"
if command -v pm2 &> /dev/null; then
    pm2 logs company-search-api --err --lines 50 --nostream 2>/dev/null || echo "无法读取日志"
else
    echo "PM2 未安装"
fi
echo ""

# 2. 查看所有日志
echo -e "${CYAN}2. PM2 所有日志（最近 50 行）:${NC}"
echo "----------------------------------------"
if command -v pm2 &> /dev/null; then
    pm2 logs company-search-api --lines 50 --nostream 2>/dev/null || echo "无法读取日志"
else
    echo "PM2 未安装"
fi
echo ""

# 3. 查看文件日志
echo -e "${CYAN}3. 文件日志:${NC}"
echo "----------------------------------------"
APP_DIR="/home/ec2-user/sunflower"
if [ ! -d "$APP_DIR" ]; then
    APP_DIR="/opt/company-search"
fi

if [ -f "$APP_DIR/logs/api-error.log" ]; then
    echo "错误日志文件:"
    tail -50 "$APP_DIR/logs/api-error.log"
else
    echo "错误日志文件不存在"
fi
echo ""

if [ -f "$APP_DIR/logs/api-out.log" ]; then
    echo "输出日志文件（最后 30 行）:"
    tail -30 "$APP_DIR/logs/api-out.log"
else
    echo "输出日志文件不存在"
fi
echo ""

# 4. 检查数据库连接
echo -e "${CYAN}4. 数据库连接测试:${NC}"
echo "----------------------------------------"
if pgrep -x postgres > /dev/null; then
    echo "✓ PostgreSQL 进程正在运行"
    
    # 尝试连接数据库
    ENV_FILE="$APP_DIR/apps/api/.env"
    if [ -f "$ENV_FILE" ]; then
        DB_URL=$(grep "DATABASE_URL" "$ENV_FILE" | cut -d'=' -f2-)
        if [ -n "$DB_URL" ]; then
            echo "尝试连接数据库..."
            # 提取数据库信息
            DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
            DB_USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
            
            if sudo -u postgres psql -d "$DB_NAME" -U "$DB_USER" -c "SELECT 1;" &> /dev/null; then
                echo "✓ 数据库连接成功"
            else
                echo -e "${RED}✗ 数据库连接失败${NC}"
            fi
        else
            echo -e "${RED}✗ DATABASE_URL 未配置${NC}"
        fi
    else
        echo -e "${RED}✗ .env 文件不存在${NC}"
    fi
else
    echo -e "${RED}✗ PostgreSQL 未运行${NC}"
fi
echo ""

# 5. 检查环境变量
echo -e "${CYAN}5. 环境变量检查:${NC}"
echo "----------------------------------------"
ENV_FILE="$APP_DIR/apps/api/.env"
if [ -f "$ENV_FILE" ]; then
    echo "必需的环境变量:"
    grep -E "DATABASE_URL|JWT_SECRET|PORT" "$ENV_FILE" | sed 's/=.*/=***/' || echo "未找到必需的环境变量"
else
    echo -e "${RED}✗ .env 文件不存在${NC}"
fi
echo ""

echo "============================================"
echo -e "${CYAN}建议操作:${NC}"
echo "  1. 查看完整日志: pm2 logs company-search-api"
echo "  2. 重启应用: pm2 restart company-search-api"
echo "  3. 检查数据库迁移: cd apps/api && pnpm typeorm migration:run"
echo ""

