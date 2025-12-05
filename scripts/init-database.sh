#!/bin/bash

# ============================================
# 初始化数据库表
# ============================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo ""
echo "============================================"
echo "初始化数据库表"
echo "============================================"
echo ""

# 检查 root
if [ "$EUID" -ne 0 ]; then 
    log_error "请使用 root 用户运行: sudo bash init-database.sh"
    exit 1
fi

APP_DIR="/home/ec2-user/sunflower"
if [ ! -d "$APP_DIR" ]; then
    APP_DIR="/opt/company-search"
fi

# 读取数据库配置
ENV_FILE="$APP_DIR/apps/api/.env"
if [ ! -f "$ENV_FILE" ]; then
    log_error ".env 文件不存在: $ENV_FILE"
    exit 1
fi

source "$ENV_FILE" 2>/dev/null || true

# 提取数据库信息
if [ -z "$DATABASE_URL" ]; then
    log_error "DATABASE_URL 未配置"
    exit 1
fi

DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

log_info "数据库: $DB_NAME"
log_info "用户: $DB_USER"
log_info "主机: ${DB_HOST:-localhost}"
log_info "端口: ${DB_PORT:-5432}"

# 创建 SQL 脚本
SQL_FILE="/tmp/init_tables.sql"
log_info "创建 SQL 脚本..."

cat > "$SQL_FILE" <<'EOF'
-- 创建 users 表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建 companies 表
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyName" VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    country VARCHAR(50) NOT NULL,
    keywords VARCHAR(255) NOT NULL,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "searchHistoryId" UUID,
    "emailSent" BOOLEAN DEFAULT FALSE,
    "emailStatus" VARCHAR(20) DEFAULT 'not_sent' CHECK ("emailStatus" IN ('not_sent', 'sent', 'failed')),
    "emailSentAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建 search_history 表
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keywords VARCHAR(255) NOT NULL,
    country VARCHAR(50) NOT NULL,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "resultCount" INTEGER DEFAULT 0,
    "searchParams" JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建 email_templates 表
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    "isDefault" BOOLEAN DEFAULT FALSE,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies("userId");
CREATE INDEX IF NOT EXISTS idx_companies_search_history_id ON companies("searchHistoryId");
CREATE INDEX IF NOT EXISTS idx_companies_keywords ON companies(keywords);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history("userId");
CREATE INDEX IF NOT EXISTS idx_search_history_keywords ON search_history(keywords);
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON email_templates("userId");
CREATE INDEX IF NOT EXISTS idx_email_templates_is_default ON email_templates("isDefault");
CREATE INDEX IF NOT EXISTS idx_email_templates_name ON email_templates(name);

-- 添加外键约束（如果 search_history 表存在）
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'search_history') THEN
        ALTER TABLE companies 
        ADD CONSTRAINT IF NOT EXISTS fk_companies_search_history 
        FOREIGN KEY ("searchHistoryId") REFERENCES search_history(id) ON DELETE SET NULL;
    END IF;
END $$;
EOF

log_success "SQL 脚本已创建: $SQL_FILE"

# 执行 SQL
log_info "执行 SQL 脚本..."

# 使用 PGPASSWORD 环境变量传递密码
export PGPASSWORD="$DB_PASS"

if psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE" 2>&1; then
    log_success "数据库表创建成功！"
else
    log_error "数据库表创建失败"
    log_info "尝试使用 postgres 用户执行..."
    
    # 尝试使用 postgres 用户
    sudo -u postgres psql -d "$DB_NAME" -f "$SQL_FILE" 2>&1 || {
        log_error "执行失败，请手动执行 SQL 脚本"
        log_info "SQL 文件位置: $SQL_FILE"
        exit 1
    }
    log_success "数据库表创建成功！"
fi

# 验证表
log_info "验证表是否创建成功..."
TABLES=$(psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'companies', 'search_history', 'email_templates');" 2>/dev/null || \
         sudo -u postgres psql -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'companies', 'search_history', 'email_templates');")

if [ "$TABLES" = "4" ]; then
    log_success "所有表已创建（4 个表）"
else
    log_warning "只创建了 $TABLES 个表（期望 4 个）"
fi

# 清理
rm -f "$SQL_FILE"

echo ""
echo "============================================"
log_success "数据库初始化完成！"
echo "============================================"
echo ""
log_info "现在可以重启 API 应用:"
echo "  pm2 restart company-search-api"
echo ""

