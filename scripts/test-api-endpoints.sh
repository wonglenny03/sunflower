#!/bin/bash

# ============================================
# 测试 API 端点
# ============================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

API_BASE="${1:-http://localhost:3001}"

echo ""
echo "============================================"
echo "测试 API 端点"
echo "============================================"
echo ""

# 测试注册接口
echo -e "${CYAN}1. 测试注册接口:${NC}"
echo "POST ${API_BASE}/api/auth/register"
RESPONSE=$(curl -s -X POST "${API_BASE}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test123456"}' \
  -w "\nHTTP_CODE:%{http_code}" 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")
echo "响应: $BODY"
echo "HTTP 状态码: $HTTP_CODE"
if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "409" ]; then
    echo -e "${GREEN}✓ 端点可访问（201=成功，409=用户已存在）${NC}"
elif [ "$HTTP_CODE" = "404" ]; then
    echo -e "${RED}✗ 端点不存在 (404)${NC}"
elif [ "$HTTP_CODE" = "500" ]; then
    echo -e "${YELLOW}! 服务器错误 (500)，可能是数据库问题${NC}"
else
    echo -e "${YELLOW}! HTTP $HTTP_CODE${NC}"
fi
echo ""

# 测试 Swagger 文档
echo -e "${CYAN}2. 测试 Swagger 文档:${NC}"
echo "GET ${API_BASE}/api/docs"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE}/api/docs" 2>&1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Swagger 文档可访问 (HTTP $HTTP_CODE)${NC}"
    echo "访问: ${API_BASE}/api/docs"
else
    echo -e "${RED}✗ Swagger 文档不可访问 (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# 测试登录接口（不需要认证）
echo -e "${CYAN}3. 测试登录接口:${NC}"
echo "POST ${API_BASE}/api/auth/login"
RESPONSE=$(curl -s -X POST "${API_BASE}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"test@example.com","password":"Test123456"}' \
  -w "\nHTTP_CODE:%{http_code}" 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")
echo "响应: $BODY"
echo "HTTP 状态码: $HTTP_CODE"
echo ""

echo "============================================"
echo -e "${CYAN}测试完成${NC}"
echo "============================================"
echo ""

