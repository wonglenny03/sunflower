#!/bin/bash

# ============================================
# 修复前端访问问题
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
echo "修复前端访问问题"
echo "============================================"
echo ""

# 检查 root
if [ "$EUID" -ne 0 ]; then 
    log_error "部分操作需要 root 权限，请使用: sudo bash fix-frontend-access.sh"
fi

# 1. 检查并启动 PM2
log_info "1. 检查 PM2 进程..."
if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 status | grep "company-search-web" | awk '{print $10}')
    if [ "$PM2_STATUS" = "online" ]; then
        log_success "前端应用正在运行"
    else
        log_warning "前端应用未运行，正在启动..."
        cd /home/ec2-user/sunflower || cd /opt/company-search
        pm2 restart company-search-web || pm2 start ecosystem.config.js
        sleep 3
    fi
else
    log_error "PM2 未安装"
    exit 1
fi

# 2. 检查端口
log_info "2. 检查端口 3000..."
if netstat -tuln 2>/dev/null | grep -q ":3000 "; then
    log_success "端口 3000 正在监听"
else
    log_warning "端口 3000 未监听，等待应用启动..."
    sleep 5
    if netstat -tuln 2>/dev/null | grep -q ":3000 "; then
        log_success "端口 3000 现在正在监听"
    else
        log_error "端口 3000 仍未监听，请检查应用日志"
        pm2 logs company-search-web --lines 30 --nostream
        exit 1
    fi
fi

# 3. 配置防火墙
log_info "3. 配置防火墙..."
if command -v firewall-cmd &> /dev/null; then
    if firewall-cmd --list-ports 2>/dev/null | grep -q "3000"; then
        log_success "端口 3000 已在防火墙中开放"
    else
        log_warning "添加端口 3000 到防火墙..."
        sudo firewall-cmd --permanent --add-port=3000/tcp 2>/dev/null || true
        sudo firewall-cmd --permanent --add-port=3001/tcp 2>/dev/null || true
        sudo firewall-cmd --reload 2>/dev/null || true
        log_success "防火墙已配置"
    fi
elif command -v ufw &> /dev/null; then
    if ufw status | grep -q "3000"; then
        log_success "端口 3000 已在防火墙中开放"
    else
        log_warning "添加端口 3000 到防火墙..."
        sudo ufw allow 3000/tcp 2>/dev/null || true
        sudo ufw allow 3001/tcp 2>/dev/null || true
        log_success "防火墙已配置"
    fi
else
    log_warning "未检测到防火墙工具，跳过防火墙配置"
fi

# 4. 测试本地访问
log_info "4. 测试本地访问..."
if curl -s -f -o /dev/null http://localhost:3000 2>/dev/null; then
    log_success "本地访问正常"
else
    log_error "本地访问失败，请检查应用日志"
    pm2 logs company-search-web --lines 30 --nostream
    exit 1
fi

# 5. 显示访问信息
echo ""
echo "============================================"
log_success "前端访问配置完成！"
echo "============================================"
echo ""
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "your-server-ip")
echo -e "${CYAN}访问地址:${NC}"
echo "  本地: http://localhost:3000"
echo "  公网: http://${PUBLIC_IP}:3000"
echo ""
echo -e "${CYAN}重要提醒:${NC}"
echo "  1. 确保 AWS EC2 安全组已开放端口 3000"
echo "  2. 如果仍无法访问，检查安全组规则"
echo "  3. 查看日志: pm2 logs company-search-web"
echo ""

