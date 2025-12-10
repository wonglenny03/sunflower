#!/bin/bash

# ============================================
# 验证 API 功能
# ============================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

API_BASE="${1:-http://localhost:3001}"

echo ""
echo "============================================"
echo "验证 API 功能"
echo "============================================"
echo ""

# 1. 测试注册接口
echo -e "${CYAN}1. 测试注册接口:${NC}"
echo "POST ${API_BASE}/api/auth/register"
echo ""

RESPONSE=$(curl -s -X POST "${API_BASE}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test'$(date +%s)'@example.com",
    "username": "testuser'$(date +%s)'",
    "password": "Test123456"
  }' \
  -w "\nHTTP_CODE:%{http_code}" 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")

echo "响应:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""
echo "HTTP 状态码: $HTTP_CODE"

if [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✓ 注册成功！${NC}"
    TOKEN=$(echo "$BODY" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        echo "Token: ${TOKEN:0:50}..."
    fi
elif [ "$HTTP_CODE" = "409" ]; then
    echo -e "${YELLOW}! 用户已存在（这是正常的，说明接口工作正常）${NC}"
elif [ "$HTTP_CODE" = "500" ]; then
    echo -e "${RED}✗ 服务器错误 (500)${NC}"
    echo "可能原因：数据库表不存在或数据库连接失败"
    echo "解决方案：运行 sudo bash /tmp/init-database.sh"
elif [ "$HTTP_CODE" = "404" ]; then
    echo -e "${RED}✗ 端点不存在 (404)${NC}"
    echo "请检查路由配置"
else
    echo -e "${YELLOW}! HTTP $HTTP_CODE${NC}"
fi
echo ""

# 2. 测试登录接口
echo -e "${CYAN}2. 测试登录接口:${NC}"
echo "POST ${API_BASE}/api/auth/login"
echo ""

RESPONSE=$(curl -s -X POST "${API_BASE}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "test@example.com",
    "password": "Test123456"
  }' \
  -w "\nHTTP_CODE:%{http_code}" 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")

echo "响应:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""
echo "HTTP 状态码: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ 登录成功！${NC}"
elif [ "$HTTP_CODE" = "401" ]; then
    echo -e "${YELLOW}! 认证失败（用户不存在或密码错误）${NC}"
elif [ "$HTTP_CODE" = "404" ]; then
    echo -e "${RED}✗ 端点不存在 (404)${NC}"
else
    echo -e "${YELLOW}! HTTP $HTTP_CODE${NC}"
fi
echo ""

# 3. 检查数据库表
echo -e "${CYAN}3. 检查数据库表:${NC}"
APP_DIR="/home/ec2-user/sunflower"
if [ ! -d "$APP_DIR" ]; then
    APP_DIR="/opt/company-search"
fi

ENV_FILE="$APP_DIR/apps/api/.env"
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE" 2>/dev/null || true
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    
    if [ -n "$DB_NAME" ] && [ -n "$DB_USER" ]; then
        TABLES=$(sudo -u postgres psql -d "$DB_NAME" -U "$DB_USER" -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'companies', 'search_history', 'email_templates');" 2>/dev/null || echo "0")
        if [ "$TABLES" = "4" ]; then
            echo -e "${GREEN}✓ 所有数据库表已创建（4 个表）${NC}"
        else
            echo -e "${RED}✗ 数据库表不完整（只有 $TABLES 个表，期望 4 个）${NC}"
            echo "运行: sudo bash /tmp/init-database.sh"
        fi
    else
        echo "无法读取数据库配置"
    fi
else
    echo ".env 文件不存在"
fi
echo ""

echo "============================================"
echo -e "${CYAN}验证完成${NC}"
echo "============================================"
echo ""

