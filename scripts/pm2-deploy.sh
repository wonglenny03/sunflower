#!/bin/bash

# ============================================
# PM2 一键部署脚本
# 用于构建和启动应用
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

APP_DIR="/opt/company-search"
APP_USER="companysearch"
API_PORT=3001
WEB_PORT=3000

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

# 检查 root
if [ "$EUID" -ne 0 ]; then 
    log_error "请使用 root 用户运行: sudo bash pm2-deploy.sh"
    exit 1
fi

echo ""
echo "============================================"
echo "PM2 一键部署脚本"
echo "============================================"
echo ""

# 检查代码是否存在
if [ ! -f "${APP_DIR}/package.json" ]; then
    log_error "未找到代码文件: ${APP_DIR}/package.json"
    log_info "请先部署代码到 ${APP_DIR}"
    exit 1
fi

log_success "代码目录: ${APP_DIR}"

# 检查必需软件
log_info "检查必需软件..."
if ! command -v node &> /dev/null; then
    log_error "Node.js 未安装"
    exit 1
fi
log_success "Node.js: $(node -v)"

if ! command -v pnpm &> /dev/null; then
    log_error "pnpm 未安装"
    exit 1
fi
log_success "pnpm: $(pnpm -v)"

if ! command -v pm2 &> /dev/null; then
    log_warning "PM2 未安装，正在安装..."
    npm install -g pm2
    pm2 startup systemd -u ${APP_USER} --hp /home/${APP_USER} 2>/dev/null || true
fi
log_success "PM2: $(pm2 -v)"

# 检查环境变量
log_info "检查环境变量文件..."
ENV_FILE="${APP_DIR}/apps/api/.env"

if [ ! -f "$ENV_FILE" ]; then
    log_warning "环境变量文件不存在，创建默认配置..."
    
    # 读取数据库凭据（如果存在）
    if [ -f "/root/.db_credentials" ]; then
        source /root/.db_credentials
    else
        DATABASE_URL="postgresql://companysearch:password@localhost:5432/company_search"
        log_warning "使用默认数据库配置，请稍后修改"
    fi
    
    # 创建环境变量文件
    mkdir -p ${APP_DIR}/apps/api
    cat > ${ENV_FILE} <<EOF
# 数据库配置
${DATABASE_URL}

# JWT 配置
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=${API_PORT}
NODE_ENV=production

# OpenAI API Key (请修改为你的实际 Key)
OPENAI_API_KEY=your-openai-api-key-here

# SMTP 邮件配置 (请根据实际情况修改)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com

# 前端 URL
FRONTEND_URL=http://localhost:${WEB_PORT}
EOF
    chown ${APP_USER}:${APP_USER} ${ENV_FILE}
    chmod 600 ${ENV_FILE}
    log_warning "已创建默认 .env 文件，请编辑 ${ENV_FILE} 设置 OPENAI_API_KEY 和 SMTP 配置"
else
    log_success "环境变量文件已存在: ${ENV_FILE}"
    log_info "如果环境变量有更新，请重启应用: sudo -u ${APP_USER} pm2 restart company-search-api"
fi

# 前端环境变量
if [ ! -f "${APP_DIR}/apps/web/.env.production" ]; then
    mkdir -p ${APP_DIR}/apps/web
    cat > ${APP_DIR}/apps/web/.env.production <<EOF
NEXT_PUBLIC_API_URL=http://localhost:${API_PORT}
EOF
    chown ${APP_USER}:${APP_USER} ${APP_DIR}/apps/web/.env.production
fi

# 安装依赖
log_info "安装依赖（这可能需要几分钟）..."
cd ${APP_DIR}
sudo -u ${APP_USER} pnpm install --frozen-lockfile || {
    log_error "依赖安装失败"
    exit 1
}
log_success "依赖安装完成"

# 构建共享包
log_info "构建共享包..."
sudo -u ${APP_USER} pnpm --filter './packages/*' build || {
    log_error "共享包构建失败"
    exit 1
}
log_success "共享包构建完成"

# 构建后端
log_info "构建后端..."
cd ${APP_DIR}/apps/api
sudo -u ${APP_USER} pnpm build || {
    log_error "后端构建失败"
    exit 1
}
log_success "后端构建完成"

# 构建前端
log_info "构建前端..."
cd ${APP_DIR}/apps/web
sudo -u ${APP_USER} pnpm build || {
    log_error "前端构建失败"
    exit 1
}
log_success "前端构建完成"

# 配置 PM2
log_info "配置 PM2..."
PM2_CONFIG="/home/${APP_USER}/ecosystem.config.js"

# 检查 .env 文件是否存在
ENV_FILE="${APP_DIR}/apps/api/.env"
if [ ! -f "$ENV_FILE" ]; then
    log_warning ".env 文件不存在: $ENV_FILE"
    log_info "将使用默认环境变量，建议创建 .env 文件"
fi

cat > ${PM2_CONFIG} <<EOF
module.exports = {
  apps: [
    {
      name: 'company-search-api',
      cwd: '${APP_DIR}/apps/api',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: ${API_PORT}
      },
      error_file: '/home/${APP_USER}/logs/api-error.log',
      out_file: '/home/${APP_USER}/logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'dist']
    },
    {
      name: 'company-search-web',
      cwd: '${APP_DIR}/apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p ${WEB_PORT}',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: ${WEB_PORT},
        NEXT_PUBLIC_API_URL: 'http://localhost:${API_PORT}'
      },
      error_file: '/home/${APP_USER}/logs/web-error.log',
      out_file: '/home/${APP_USER}/logs/web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.next']
    }
  ]
};
EOF

chown ${APP_USER}:${APP_USER} ${PM2_CONFIG}

# 创建日志目录
mkdir -p /home/${APP_USER}/logs
chown -R ${APP_USER}:${APP_USER} /home/${APP_USER}/logs

log_success "PM2 配置完成"

# 停止现有进程
log_info "停止现有进程..."
sudo -u ${APP_USER} pm2 delete all 2>/dev/null || true

# 启动应用
log_info "启动应用..."
sudo -u ${APP_USER} pm2 start ${PM2_CONFIG}

# 保存 PM2 配置
sudo -u ${APP_USER} pm2 save

# 等待启动
sleep 3

# 检查状态
log_info "检查应用状态..."
sudo -u ${APP_USER} pm2 status

echo ""
echo "============================================"
log_success "部署完成！"
echo "============================================"
echo ""
echo -e "${CYAN}应用信息:${NC}"
echo "  后端端口: ${API_PORT}"
echo "  前端端口: ${WEB_PORT}"
echo ""
echo -e "${CYAN}常用命令:${NC}"
echo "  查看状态: sudo -u ${APP_USER} pm2 status"
echo "  查看日志: sudo -u ${APP_USER} pm2 logs"
echo "  重启应用: sudo -u ${APP_USER} pm2 restart all"
echo "  停止应用: sudo -u ${APP_USER} pm2 stop all"
echo ""
echo -e "${CYAN}访问地址:${NC}"
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "your-server-ip")
echo "  前端: http://${PUBLIC_IP}:${WEB_PORT}"
echo "  后端 API: http://${PUBLIC_IP}:${API_PORT}/api"
echo "  API 文档: http://${PUBLIC_IP}:${API_PORT}/api/docs"
echo ""
echo -e "${CYAN}重要提醒:${NC}"
echo "  1. .env 文件位置: ${ENV_FILE}"
echo "  2. 代码目录: ${APP_DIR}"
echo "  3. 请编辑 ${ENV_FILE} 设置 OPENAI_API_KEY"
echo "  4. 请编辑 ${ENV_FILE} 配置 SMTP 邮件服务"
echo "  5. 配置完成后重启: sudo -u ${APP_USER} pm2 restart company-search-api"
echo ""
echo -e "${CYAN}PM2 配置文件:${NC}"
echo "  ${PM2_CONFIG}"
echo ""

