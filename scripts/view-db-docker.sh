#!/bin/bash

# 使用 Docker 查看数据库的脚本

echo "📊 Viewing Database (via Docker)"
echo "================================="
echo ""

# 检查容器是否运行
if ! docker ps | grep -q "postgres.*5432"; then
    echo "❌ PostgreSQL container is not running"
    echo "Start it with: pnpm start-pg"
    exit 1
fi

echo "✅ PostgreSQL container is running"
echo ""

# 查看用户数量
echo "👥 Users:"
USER_COUNT=$(docker exec postgres psql -U postgres -d company_search -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ')
echo "  Total: ${USER_COUNT:-0}"

# 查看公司数量
echo ""
echo "🏢 Companies:"
COMPANY_COUNT=$(docker exec postgres psql -U postgres -d company_search -t -c "SELECT COUNT(*) FROM companies;" 2>/dev/null | tr -d ' ')
echo "  Total: ${COMPANY_COUNT:-0}"

# 查看搜索历史数量
echo ""
echo "📊 Search History:"
HISTORY_COUNT=$(docker exec postgres psql -U postgres -d company_search -t -c "SELECT COUNT(*) FROM search_history;" 2>/dev/null | tr -d ' ')
echo "  Total: ${HISTORY_COUNT:-0}"

# 查看最近的用户
echo ""
echo "📋 Recent Users:"
docker exec postgres psql -U postgres -d company_search -c "SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 5;" 2>/dev/null

# 查看最近的公司
echo ""
echo "📋 Recent Companies:"
docker exec postgres psql -U postgres -d company_search -c "SELECT id, company_name, country, keywords, created_at FROM companies ORDER BY created_at DESC LIMIT 5;" 2>/dev/null

# 邮件发送统计
echo ""
echo "📧 Email Status:"
docker exec postgres psql -U postgres -d company_search -c "SELECT email_status, COUNT(*) as count FROM companies GROUP BY email_status;" 2>/dev/null

echo ""
echo "✅ Done!"

