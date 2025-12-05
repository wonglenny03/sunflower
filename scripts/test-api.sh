#!/bin/bash

# ============================================
# API 测试脚本
# ============================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

API_URL="${1:-http://localhost:3001/api}"
SERVER_IP="${2:-51.21.199.15}"

echo ""
echo "============================================"
echo "API 测试脚本"
echo "============================================"
echo ""

# 测试注册接口
echo -e "${CYAN}1. 测试注册接口:${NC}"
echo "POST ${API_URL}/auth/register"
echo ""

REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test123456"
  }' \
  -w "\nHTTP Status: %{http_code}\n")

echo "$REGISTER_RESPONSE"
echo ""

# 测试登录接口
echo -e "${CYAN}2. 测试登录接口:${NC}"
echo "POST ${API_URL}/auth/login"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "test@example.com",
    "password": "Test123456"
  }' \
  -w "\nHTTP Status: %{http_code}\n")

echo "$LOGIN_RESPONSE"
echo ""

# 提取 token（如果登录成功）
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ 登录成功，Token 已获取${NC}"
    echo ""
    
    # 测试需要认证的接口
    echo -e "${CYAN}3. 测试需要认证的接口:${NC}"
    echo "GET ${API_URL}/email-templates"
    echo ""
    
    PROTECTED_RESPONSE=$(curl -s -X GET "${API_URL}/email-templates" \
      -H "Authorization: Bearer ${TOKEN}" \
      -w "\nHTTP Status: %{http_code}\n")
    
    echo "$PROTECTED_RESPONSE"
    echo ""
else
    echo -e "${YELLOW}! 登录失败，跳过认证接口测试${NC}"
fi

# 测试健康检查
echo -e "${CYAN}4. 测试 API 健康状态:${NC}"
echo "GET ${API_URL}"
echo ""

HEALTH_RESPONSE=$(curl -s "${API_URL}" -w "\nHTTP Status: %{http_code}\n")
echo "$HEALTH_RESPONSE"
echo ""

echo "============================================"
echo -e "${CYAN}测试完成${NC}"
echo "============================================"
echo ""
echo "使用方法:"
echo "  本地测试: bash test-api.sh"
echo "  远程测试: bash test-api.sh http://${SERVER_IP}:3001/api ${SERVER_IP}"
echo ""

