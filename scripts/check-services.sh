#!/bin/bash

# 检查服务状态的脚本

echo "🔍 Checking Services Status..."
echo ""

# 检查 PostgreSQL
echo "📊 PostgreSQL:"
# 优先检查 Docker 容器
if docker ps | grep -q "postgres.*5432"; then
    echo "  ✅ Running (Docker)"
    docker exec postgres psql -U postgres -c "SELECT version();" 2>/dev/null | head -1 | sed 's/^/    /'
elif pg_isready -h localhost > /dev/null 2>&1; then
    echo "  ✅ Running (Local)"
    psql -h localhost -U postgres -c "SELECT version();" 2>/dev/null | head -1 | sed 's/^/    /'
else
    echo "  ❌ Not running"
    echo "  💡 Start with: pnpm start-pg (Docker) or brew services start postgresql (Mac)"
fi
echo ""

# 检查后端
echo "🔧 Backend API (port 3001):"
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "  ✅ Running"
    echo "  🌐 http://localhost:3001"
    echo "  📚 API Docs: http://localhost:3001/api/docs"
else
    echo "  ❌ Not running"
    echo "  💡 Start with: pnpm dev:api or pnpm start"
fi
echo ""

# 检查前端
echo "🌐 Frontend (port 3000):"
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "  ✅ Running"
    echo "  🌐 http://localhost:3000"
else
    echo "  ❌ Not running"
    echo "  💡 Start with: pnpm dev:web or pnpm start"
fi
echo ""

# 检查数据库
echo "💾 Database:"
if [ -f "apps/api/.env" ]; then
    DB_URL=$(grep DATABASE_URL apps/api/.env | cut -d '=' -f2)
    if [ ! -z "$DB_URL" ]; then
        DB_NAME=$(echo $DB_URL | sed 's/.*\/\([^?]*\).*/\1/')
        
        # 尝试使用 Docker 检查
        if docker ps | grep -q "postgres.*5432"; then
            if docker exec postgres psql -U postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
                echo "  ✅ Database '$DB_NAME' exists"
                # 获取表数量
                TABLE_COUNT=$(docker exec postgres psql -U postgres -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
                echo "  📊 Tables: $TABLE_COUNT"
            else
                echo "  ❌ Database '$DB_NAME' does not exist"
                echo "  💡 Create with: docker exec postgres createdb -U postgres $DB_NAME"
            fi
        # 尝试使用本地 psql
        elif psql -h localhost -U postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
            echo "  ✅ Database '$DB_NAME' exists"
            TABLE_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
            echo "  📊 Tables: $TABLE_COUNT"
        else
            echo "  ❌ Database '$DB_NAME' does not exist"
            echo "  💡 Create with: createdb $DB_NAME or pnpm setup-db"
        fi
    else
        echo "  ⚠️  DATABASE_URL not found in .env"
    fi
else
    echo "  ❌ .env file not found"
fi
echo ""

echo "✅ Status check completed"

