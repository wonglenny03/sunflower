#!/bin/bash

# ============================================
# 环境变量配置助手脚本
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

APP_DIR="/opt/company-search"
API_ENV_FILE="${APP_DIR}/apps/api/.env"

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 检查 root
if [ "$EUID" -ne 0 ]; then 
    log_warning "建议使用 root 用户运行以修改环境变量文件"
fi

echo ""
echo "============================================"
echo "环境变量配置助手"
echo "============================================"
echo ""

# 读取数据库凭据
if [ -f "/root/.db_credentials" ]; then
    source /root/.db_credentials
    log_success "已读取数据库配置"
else
    log_warning "未找到数据库凭据，将使用默认配置"
    DATABASE_URL="postgresql://companysearch:password@localhost:5432/company_search"
fi

# 生成 JWT Secret
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)

# 交互式配置
echo ""
log_info "请输入配置信息（直接回车使用默认值）:"
echo ""

read -p "OpenAI API Key [your-openai-api-key-here]: " OPENAI_KEY
OPENAI_KEY=${OPENAI_KEY:-your-openai-api-key-here}

read -p "SMTP Host [smtp.gmail.com]: " SMTP_HOST
SMTP_HOST=${SMTP_HOST:-smtp.gmail.com}

read -p "SMTP Port [587]: " SMTP_PORT
SMTP_PORT=${SMTP_PORT:-587}

read -p "SMTP User [your-email@gmail.com]: " SMTP_USER
SMTP_USER=${SMTP_USER:-your-email@gmail.com}

read -p "SMTP Password: " SMTP_PASS
SMTP_PASS=${SMTP_PASS:-your-app-password}

read -p "SMTP From [noreply@yourdomain.com]: " SMTP_FROM
SMTP_FROM=${SMTP_FROM:-noreply@yourdomain.com}

read -p "API Port [3001]: " API_PORT
API_PORT=${API_PORT:-3001}

read -p "Frontend URL [http://localhost:3000]: " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000}

# 创建环境变量文件
log_info "创建环境变量文件..."

cat > ${API_ENV_FILE} <<EOF
# 数据库配置
${DATABASE_URL}

# JWT 配置
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=${API_PORT}
NODE_ENV=production

# OpenAI API Key
OPENAI_API_KEY=${OPENAI_KEY}

# SMTP 邮件配置
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
SMTP_FROM=${SMTP_FROM}

# 前端 URL
FRONTEND_URL=${FRONTEND_URL}
EOF

chmod 600 ${API_ENV_FILE}
if [ -n "$SUDO_USER" ]; then
    chown ${SUDO_USER}:${SUDO_USER} ${API_ENV_FILE} 2>/dev/null || true
fi

log_success "环境变量文件已创建: ${API_ENV_FILE}"
echo ""
log_warning "请检查并确认配置是否正确"
echo ""

