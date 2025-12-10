#!/bin/bash

# ============================================
# 测试 API 路由
# ============================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

API_BASE="${1:-http://localhost:3001}"

echo ""
echo "============================================"
echo "测试 API 路由"
echo "============================================"
echo ""

# 测试不同的路径
echo -e "${CYAN}测试不同的 API 路径:${NC}"
echo ""

# 1. 测试根路径
echo "1. GET ${API_BASE}/"
curl -s -w "\nHTTP Status: %{http_code}\n" "${API_BASE}/" || echo "失败"
echo ""

# 2. 测试 /api
echo "2. GET ${API_BASE}/api"
curl -s -w "\nHTTP Status: %{http_code}\n" "${API_BASE}/api" || echo "失败"
echo ""

# 3. 测试 /api/auth
echo "3. GET ${API_BASE}/api/auth"
curl -s -w "\nHTTP Status: %{http_code}\n" "${API_BASE}/api/auth" || echo "失败"
echo ""

# 4. 测试 /api/auth/register (POST)
echo "4. POST ${API_BASE}/api/auth/register"
curl -s -X POST "${API_BASE}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test123456"}' \
  -w "\nHTTP Status: %{http_code}\n" || echo "失败"
echo ""

# 5. 测试 /api/docs (Swagger)
echo "5. GET ${API_BASE}/api/docs"
curl -s -w "\nHTTP Status: %{http_code}\n" "${API_BASE}/api/docs" | head -5 || echo "失败"
echo ""

# 6. 测试不带 /api 前缀
echo "6. POST ${API_BASE}/auth/register"
curl -s -X POST "${API_BASE}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test123456"}' \
  -w "\nHTTP Status: %{http_code}\n" || echo "失败"
echo ""

echo "============================================"
echo -e "${CYAN}测试完成${NC}"
echo "============================================"
echo ""
echo "使用方法:"
echo "  本地: bash test-api-routes.sh"
echo "  远程: bash test-api-routes.sh http://51.21.199.15:3001"
echo ""

