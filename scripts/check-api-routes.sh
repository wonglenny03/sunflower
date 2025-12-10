#!/bin/bash

# ============================================
# 检查 API 路由和连接
# ============================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

API_BASE="${1:-http://localhost:3001}"

echo ""
echo "============================================"
echo "API 路由诊断"
echo "============================================"
echo ""

# 1. 检查端口
echo -e "${CYAN}1. 检查端口 3001:${NC}"
if netstat -tuln 2>/dev/null | grep -q ":3001 "; then
    echo -e "${GREEN}✓ 端口 3001 正在监听${NC}"
else
    echo -e "${RED}✗ 端口 3001 未监听${NC}"
fi
echo ""

# 2. 测试根路径
echo -e "${CYAN}2. 测试根路径:${NC}"
echo "GET ${API_BASE}/"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "${API_BASE}/" 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")
echo "响应: $BODY"
echo "HTTP 状态码: $HTTP_CODE"
echo ""

# 3. 测试 /api 路径
echo -e "${CYAN}3. 测试 /api 路径:${NC}"
echo "GET ${API_BASE}/api"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "${API_BASE}/api" 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")
echo "响应: $BODY"
echo "HTTP 状态码: $HTTP_CODE"
echo ""

# 4. 测试 /api/docs (Swagger)
echo -e "${CYAN}4. 测试 Swagger 文档:${NC}"
echo "GET ${API_BASE}/api/docs"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "${API_BASE}/api/docs" 2>&1 | head -10)
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Swagger 文档可访问${NC}"
    echo "访问: ${API_BASE}/api/docs"
else
    echo -e "${RED}✗ Swagger 文档不可访问 (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# 5. 测试注册接口
echo -e "${CYAN}5. 测试注册接口:${NC}"
echo "POST ${API_BASE}/api/auth/register"
RESPONSE=$(curl -s -X POST "${API_BASE}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test123456"}' \
  -w "\nHTTP_CODE:%{http_code}" 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")
echo "响应: $BODY"
echo "HTTP 状态码: $HTTP_CODE"
echo ""

# 6. 测试不带 /api 前缀（如果后端没有设置全局前缀）
echo -e "${CYAN}6. 测试不带 /api 前缀:${NC}"
echo "POST ${API_BASE}/auth/register"
RESPONSE=$(curl -s -X POST "${API_BASE}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test123456"}' \
  -w "\nHTTP_CODE:%{http_code}" 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")
echo "响应: $BODY"
echo "HTTP 状态码: $HTTP_CODE"
echo ""

# 7. 检查 PM2 状态
echo -e "${CYAN}7. PM2 进程状态:${NC}"
if command -v pm2 &> /dev/null; then
    pm2 status | grep -E "company-search-api|Status" || echo "未找到 API 进程"
else
    echo "PM2 未安装"
fi
echo ""

echo "============================================"
echo -e "${CYAN}诊断完成${NC}"
echo "============================================"
echo ""

