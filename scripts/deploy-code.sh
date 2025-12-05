#!/bin/bash

# ============================================
# 代码部署脚本
# 用于将代码部署到服务器
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

APP_DIR="/opt/company-search"
APP_USER="companysearch"

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
    log_error "请使用 root 用户运行: sudo bash deploy-code.sh"
    exit 1
fi

echo ""
echo "============================================"
echo "代码部署脚本"
echo "============================================"
echo ""

# 创建应用目录
log_info "创建应用目录..."
mkdir -p ${APP_DIR}
chown -R ${APP_USER}:${APP_USER} ${APP_DIR}

# 检查是否已有代码
if [ -f "${APP_DIR}/package.json" ]; then
    log_warning "检测到已有代码"
    read -p "是否更新代码？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd ${APP_DIR}
        if [ -d ".git" ]; then
            log_info "使用 Git 更新代码..."
            sudo -u ${APP_USER} git pull || {
                log_warning "Git pull 失败，请手动更新"
            }
        else
            log_warning "未检测到 Git 仓库，请手动更新代码"
        fi
    else
        log_info "跳过代码更新"
        exit 0
    fi
else
    log_info "未检测到代码，开始部署..."
    echo ""
    echo "请选择部署方式："
    echo "1. 使用 Git Clone（需要仓库 URL）"
    echo "2. 使用本地代码包（需要先上传）"
    echo "3. 退出（稍后手动部署）"
    echo ""
    read -p "请选择 (1/2/3): " choice
    
    case $choice in
        1)
            read -p "请输入 Git 仓库 URL: " GIT_URL
            if [ -z "$GIT_URL" ]; then
                log_error "Git URL 不能为空"
                exit 1
            fi
            
            log_info "克隆代码仓库..."
            cd ${APP_DIR}
            sudo -u ${APP_USER} git clone ${GIT_URL} . || {
                log_error "Git clone 失败"
                exit 1
            }
            log_success "代码克隆完成"
            ;;
        2)
            log_info "等待代码包上传..."
            log_info "请使用以下命令上传代码包："
            echo ""
            echo "  # 在本地执行（打包代码）"
            echo "  tar -czf app.tar.gz --exclude=node_modules --exclude=.git --exclude='.next' --exclude='dist' ."
            echo ""
            echo "  # 上传到服务器"
            echo "  scp -i your-key.pem app.tar.gz ec2-user@your-server:/tmp/"
            echo ""
            read -p "代码包是否已上传到 /tmp/app.tar.gz？(y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                if [ -f "/tmp/app.tar.gz" ]; then
                    log_info "解压代码包..."
                    cd ${APP_DIR}
                    sudo -u ${APP_USER} tar -xzf /tmp/app.tar.gz
                    rm -f /tmp/app.tar.gz
                    log_success "代码解压完成"
                else
                    log_error "未找到代码包 /tmp/app.tar.gz"
                    exit 1
                fi
            else
                log_warning "请先上传代码包"
                exit 1
            fi
            ;;
        3)
            log_info "退出，请稍后手动部署代码到 ${APP_DIR}"
            exit 0
            ;;
        *)
            log_error "无效选择"
            exit 1
            ;;
    esac
fi

# 确保目录权限
chown -R ${APP_USER}:${APP_USER} ${APP_DIR}

# 验证代码
if [ -f "${APP_DIR}/package.json" ]; then
    log_success "代码部署完成！"
    echo ""
    echo "代码位置: ${APP_DIR}"
    echo "下一步: 运行构建和启动脚本"
else
    log_error "代码部署失败，未找到 package.json"
    exit 1
fi

