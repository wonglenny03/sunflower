#!/bin/bash

# ============================================
# AWS EC2 一键部署脚本 (Amazon Linux 2023)
# ============================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 配置变量（可根据需要修改）
APP_DIR="/opt/company-search"
APP_USER="companysearch"
DB_NAME="company_search"
DB_USER="companysearch"
NODE_VERSION="20"  # Node.js 版本
API_PORT=3001
WEB_PORT=3000

# 日志函数
log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为 root 用户
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        log_error "请使用 root 用户运行此脚本: sudo bash deploy-aws.sh"
        exit 1
    fi
}

# 更新系统
update_system() {
    log_info "更新系统包..."
    dnf update -y
    dnf install -y git curl wget tar gzip
    log_success "系统更新完成"
}

# 安装 Node.js
install_nodejs() {
    log_info "安装 Node.js ${NODE_VERSION}..."
    
    if command -v node &> /dev/null; then
        CURRENT_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$CURRENT_VERSION" -ge "$NODE_VERSION" ]; then
            log_warning "Node.js 已安装，版本: $(node -v)"
            return
        fi
    fi
    
    # 安装 Node.js 20
    dnf install -y nodejs npm
    # 如果系统仓库版本不够，使用 NodeSource
    if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt "$NODE_VERSION" ]; then
        curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | bash -
        dnf install -y nodejs
    fi
    
    log_success "Node.js 安装完成: $(node -v)"
    log_success "npm 版本: $(npm -v)"
}

# 安装 pnpm
install_pnpm() {
    log_info "安装 pnpm..."
    
    if command -v pnpm &> /dev/null; then
        log_warning "pnpm 已安装，版本: $(pnpm -v)"
        return
    fi
    
    npm install -g pnpm
    log_success "pnpm 安装完成: $(pnpm -v)"
}

# 安装 PostgreSQL
install_postgresql() {
    log_info "安装 PostgreSQL..."
    
    if command -v psql &> /dev/null; then
        log_warning "PostgreSQL 已安装"
        return
    fi
    
    # Amazon Linux 2023 使用 dnf，安装 PostgreSQL 15
    dnf install -y postgresql15 postgresql15-server
    
    # 初始化数据库（如果尚未初始化）
    if [ ! -d "/var/lib/pgsql/15/data" ]; then
        /usr/pgsql-15/bin/postgresql-15-setup initdb
    fi
    
    # 配置 PostgreSQL 允许本地连接
    PG_HBA="/var/lib/pgsql/15/data/pg_hba.conf"
    if ! grep -q "host    all             all             127.0.0.1/32" "$PG_HBA" | grep -v "^#"; then
        # 确保本地连接使用 md5 认证
        sed -i 's/^host    all             all             127.0.0.1\/32.*/host    all             all             127.0.0.1\/32            md5/' "$PG_HBA" || \
        echo "host    all             all             127.0.0.1/32            md5" >> "$PG_HBA"
    fi
    
    # 启动并启用 PostgreSQL
    systemctl enable postgresql-15
    systemctl start postgresql-15
    
    # 等待 PostgreSQL 启动
    sleep 3
    
    log_success "PostgreSQL 安装完成"
}

# 配置 PostgreSQL
setup_postgresql() {
    log_info "配置 PostgreSQL 数据库..."
    
    # 等待 PostgreSQL 完全启动
    sleep 2
    
    # 检查用户是否已存在
    USER_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" 2>/dev/null || echo "")
    
    if [ "$USER_EXISTS" = "1" ]; then
        log_warning "数据库用户 ${DB_USER} 已存在，跳过创建"
        # 读取现有密码（如果可能）或生成新密码
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        # 尝试更新密码
        sudo -u postgres psql -c "ALTER USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';" 2>/dev/null || true
    else
        # 生成随机密码
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        
        # 创建用户
        sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';"
    fi
    
    # 检查数据库是否已存在
    DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" 2>/dev/null || echo "")
    
    if [ "$DB_EXISTS" = "1" ]; then
        log_warning "数据库 ${DB_NAME} 已存在，跳过创建"
    else
        # 创建数据库
        sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
    fi
    
    # 授予权限
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
    
    # 连接到数据库并授予 schema 权限
    sudo -u postgres psql -d ${DB_NAME} <<EOF
GRANT ALL ON SCHEMA public TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};
EOF

    # 保存数据库密码到文件（仅 root 可读）
    echo "DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}" > /root/.db_credentials
    chmod 600 /root/.db_credentials
    
    log_success "PostgreSQL 配置完成"
    log_warning "数据库密码已保存到 /root/.db_credentials"
    log_info "数据库连接字符串: postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}"
}

# 创建应用用户
create_app_user() {
    log_info "创建应用用户 ${APP_USER}..."
    
    if id "$APP_USER" &>/dev/null; then
        log_warning "用户 ${APP_USER} 已存在"
    else
        useradd -r -m -s /bin/bash ${APP_USER}
        log_success "用户 ${APP_USER} 创建完成"
    fi
}

# 安装 PM2
install_pm2() {
    log_info "安装 PM2..."
    
    if command -v pm2 &> /dev/null; then
        log_warning "PM2 已安装，版本: $(pm2 -v)"
        return
    fi
    
    npm install -g pm2
    pm2 startup systemd -u ${APP_USER} --hp /home/${APP_USER}
    
    log_success "PM2 安装完成"
}

# 安装 Nginx
install_nginx() {
    log_info "安装 Nginx..."
    
    if command -v nginx &> /dev/null; then
        log_warning "Nginx 已安装"
        return
    fi
    
    dnf install -y nginx
    systemctl enable nginx
    
    log_success "Nginx 安装完成"
}

# 部署应用代码
deploy_app() {
    log_info "部署应用代码..."
    
    # 创建应用目录
    mkdir -p ${APP_DIR}
    
    # 如果目录已存在且有代码，询问是否更新
    if [ -d "${APP_DIR}/.git" ]; then
        log_warning "检测到已有代码，将更新代码..."
        cd ${APP_DIR}
        sudo -u ${APP_USER} git pull || {
            log_warning "Git pull 失败，继续使用现有代码"
        }
    else
        log_warning "未检测到代码，请手动部署代码到 ${APP_DIR}"
        log_info "部署方式："
        log_info "  1. 使用 Git: cd ${APP_DIR} && sudo -u ${APP_USER} git clone <your-repo-url> ."
        log_info "  2. 使用 SCP: 在本地打包后上传到服务器"
        log_info ""
        log_warning "按 Enter 继续（假设代码已在 ${APP_DIR}）..."
        read -t 10 || true
    fi
    
    # 检查代码是否存在
    if [ ! -f "${APP_DIR}/package.json" ]; then
        log_error "未找到代码文件，请先部署代码到 ${APP_DIR}"
        log_info "可以使用以下命令部署："
        log_info "  cd ${APP_DIR}"
        log_info "  sudo -u ${APP_USER} git clone <your-repo-url> ."
        exit 1
    fi
    
    # 确保目录权限
    chown -R ${APP_USER}:${APP_USER} ${APP_DIR}
    
    log_success "应用代码部署完成"
}

# 安装依赖和构建
build_app() {
    log_info "安装依赖和构建应用..."
    
    cd ${APP_DIR}
    
    # 安装依赖
    log_info "安装依赖（这可能需要几分钟）..."
    sudo -u ${APP_USER} pnpm install --frozen-lockfile
    
    # 构建共享包
    log_info "构建共享包..."
    sudo -u ${APP_USER} pnpm --filter './packages/*' build
    
    # 构建后端
    log_info "构建后端..."
    cd ${APP_DIR}/apps/api
    sudo -u ${APP_USER} pnpm build
    
    # 构建前端
    log_info "构建前端..."
    cd ${APP_DIR}/apps/web
    sudo -u ${APP_USER} pnpm build
    
    log_success "应用构建完成"
}

# 配置环境变量
setup_env() {
    log_info "配置环境变量..."
    
    # 读取数据库凭据
    if [ -f "/root/.db_credentials" ]; then
        source /root/.db_credentials
    else
        log_error "未找到数据库凭据文件"
        exit 1
    fi
    
    # 后端环境变量
    API_ENV_FILE="${APP_DIR}/apps/api/.env"
    cat > ${API_ENV_FILE} <<EOF
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

    chown ${APP_USER}:${APP_USER} ${API_ENV_FILE}
    chmod 600 ${API_ENV_FILE}
    
    # 前端环境变量
    WEB_ENV_FILE="${APP_DIR}/apps/web/.env.production"
    cat > ${WEB_ENV_FILE} <<EOF
NEXT_PUBLIC_API_URL=http://localhost:${API_PORT}
EOF

    chown ${APP_USER}:${APP_USER} ${WEB_ENV_FILE}
    
    log_success "环境变量配置完成"
    log_warning "请编辑 ${API_ENV_FILE} 设置 OPENAI_API_KEY 和 SMTP 配置"
}

# 初始化数据库
init_database() {
    log_info "初始化数据库..."
    
    # 等待 PostgreSQL 启动
    sleep 2
    
    # 运行数据库迁移（如果使用 TypeORM synchronize，这一步可能不需要）
    # 这里假设使用 synchronize: true，所以只需要确保数据库存在即可
    
    log_success "数据库初始化完成"
}

# 配置 PM2
setup_pm2() {
    log_info "配置 PM2..."
    
    # 创建 PM2 生态系统文件
    PM2_CONFIG="/home/${APP_USER}/ecosystem.config.js"
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
      max_memory_restart: '500M'
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
        PORT: ${WEB_PORT}
      },
      error_file: '/home/${APP_USER}/logs/web-error.log',
      out_file: '/home/${APP_USER}/logs/web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M'
    }
  ]
};
EOF

    chown ${APP_USER}:${APP_USER} ${PM2_CONFIG}
    
    # 创建日志目录
    mkdir -p /home/${APP_USER}/logs
    chown -R ${APP_USER}:${APP_USER} /home/${APP_USER}/logs
    
    log_success "PM2 配置完成"
}

# 配置 Nginx
setup_nginx() {
    log_info "配置 Nginx..."
    
    NGINX_CONFIG="/etc/nginx/conf.d/company-search.conf"
    cat > ${NGINX_CONFIG} <<EOF
# 后端 API 代理
server {
    listen 80;
    server_name api.yourdomain.com;  # 修改为你的域名或使用 IP

    location /api {
        proxy_pass http://localhost:${API_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # 增加超时时间
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # Swagger 文档
    location /api/docs {
        proxy_pass http://localhost:${API_PORT}/api/docs;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}

# 前端应用
server {
    listen 80;
    server_name yourdomain.com;  # 修改为你的域名或使用 IP

    location / {
        proxy_pass http://localhost:${WEB_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    # 测试 Nginx 配置
    nginx -t
    
    log_success "Nginx 配置完成"
    log_warning "请编辑 ${NGINX_CONFIG} 修改域名配置"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    # 启动 PostgreSQL
    systemctl restart postgresql-15
    sleep 2
    
    # 检查 PostgreSQL 是否启动成功
    if ! systemctl is-active --quiet postgresql-15; then
        log_error "PostgreSQL 启动失败"
        systemctl status postgresql-15 --no-pager -l
        exit 1
    fi
    
    # 使用 PM2 启动应用
    cd ${APP_DIR}
    
    # 停止现有进程
    sudo -u ${APP_USER} pm2 delete all 2>/dev/null || true
    
    # 启动应用
    sudo -u ${APP_USER} pm2 start /home/${APP_USER}/ecosystem.config.js
    
    # 保存 PM2 配置
    sudo -u ${APP_USER} pm2 save
    
    # 等待应用启动
    sleep 5
    
    # 检查应用是否启动成功
    if ! sudo -u ${APP_USER} pm2 list | grep -q "online"; then
        log_warning "部分应用可能未正常启动，请检查日志"
        sudo -u ${APP_USER} pm2 logs --lines 20
    fi
    
    # 启动 Nginx
    systemctl restart nginx
    
    # 检查 Nginx 是否启动成功
    if ! systemctl is-active --quiet nginx; then
        log_error "Nginx 启动失败"
        systemctl status nginx --no-pager -l
        nginx -t
        exit 1
    fi
    
    # 检查服务状态
    log_info "检查服务状态..."
    echo ""
    echo -e "${CYAN}PostgreSQL 状态:${NC}"
    systemctl status postgresql-15 --no-pager -l | head -3
    echo ""
    echo -e "${CYAN}PM2 应用状态:${NC}"
    sudo -u ${APP_USER} pm2 status
    echo ""
    echo -e "${CYAN}Nginx 状态:${NC}"
    systemctl status nginx --no-pager -l | head -3
    
    log_success "服务启动完成"
}

# 配置防火墙
setup_firewall() {
    log_info "配置防火墙..."
    
    # 检查 firewalld 是否运行
    if systemctl is-active --quiet firewalld; then
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --permanent --add-port=${API_PORT}/tcp
        firewall-cmd --reload
        log_success "防火墙配置完成"
    else
        log_warning "firewalld 未运行，跳过防火墙配置"
    fi
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "============================================"
    echo -e "${GREEN}部署完成！${NC}"
    echo "============================================"
    echo ""
    echo -e "${CYAN}应用信息:${NC}"
    echo "  应用目录: ${APP_DIR}"
    echo "  应用用户: ${APP_USER}"
    echo "  后端端口: ${API_PORT}"
    echo "  前端端口: ${WEB_PORT}"
    echo ""
    echo -e "${CYAN}数据库信息:${NC}"
    echo "  数据库名: ${DB_NAME}"
    echo "  数据库用户: ${DB_USER}"
    echo "  连接字符串: 查看 /root/.db_credentials"
    echo ""
    echo -e "${CYAN}服务管理:${NC}"
    echo "  查看 PM2 状态: sudo -u ${APP_USER} pm2 status"
    echo "  查看 PM2 日志: sudo -u ${APP_USER} pm2 logs"
    echo "  重启应用: sudo -u ${APP_USER} pm2 restart all"
    echo "  停止应用: sudo -u ${APP_USER} pm2 stop all"
    echo ""
    echo "  查看 Nginx 状态: systemctl status nginx"
    echo "  重启 Nginx: systemctl restart nginx"
    echo ""
    echo "  查看 PostgreSQL 状态: systemctl status postgresql-15"
    echo ""
    echo -e "${CYAN}重要提醒:${NC}"
    echo "  1. 请编辑 ${APP_DIR}/apps/api/.env 设置 OPENAI_API_KEY"
    echo "  2. 请编辑 ${APP_DIR}/apps/api/.env 配置 SMTP 邮件服务"
    echo "  3. 请编辑 /etc/nginx/conf.d/company-search.conf 修改域名"
    echo "  4. 如需 HTTPS，请配置 SSL 证书（使用 Let's Encrypt）"
    echo ""
    echo -e "${CYAN}访问地址:${NC}"
    PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "your-server-ip")
    echo "  前端: http://${PUBLIC_IP}:${WEB_PORT}"
    echo "  后端 API: http://${PUBLIC_IP}:${API_PORT}/api"
    echo "  API 文档: http://${PUBLIC_IP}:${API_PORT}/api/docs"
    echo ""
    echo -e "${CYAN}下一步操作:${NC}"
    echo "  1. 配置环境变量: sudo nano ${APP_DIR}/apps/api/.env"
    echo "  2. 配置 Nginx: sudo nano /etc/nginx/conf.d/company-search.conf"
    echo "  3. 重启服务: sudo -u ${APP_USER} pm2 restart all"
    echo ""
    echo "============================================"
}

# 主函数
main() {
    echo ""
    echo "============================================"
    echo -e "${BLUE}AWS EC2 一键部署脚本${NC}"
    echo -e "${BLUE}Amazon Linux 2023${NC}"
    echo "============================================"
    echo ""
    
    check_root
    
    log_info "开始部署..."
    echo ""
    
    # 执行部署步骤
    update_system
    install_nodejs
    install_pnpm
    install_postgresql
    setup_postgresql
    create_app_user
    install_pm2
    install_nginx
    deploy_app
    build_app
    setup_env
    init_database
    setup_pm2
    setup_nginx
    setup_firewall
    start_services
    
    show_deployment_info
}

# 运行主函数
main

