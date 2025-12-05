#!/bin/bash

# ============================================
# PostgreSQL 修复脚本
# 用于修复 PostgreSQL 初始化问题
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
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

# 检查 root
if [ "$EUID" -ne 0 ]; then 
    log_error "请使用 root 用户运行: sudo bash fix-postgres.sh"
    exit 1
fi

echo ""
echo "============================================"
echo "PostgreSQL 修复脚本"
echo "============================================"
echo ""

# 检测 PostgreSQL 数据目录
log_info "检测 PostgreSQL 安装..."

# 查找数据目录
PG_DATA_DIR=""
if [ -d "/var/lib/pgsql/15/data" ]; then
    PG_DATA_DIR="/var/lib/pgsql/15/data"
elif [ -d "/var/lib/pgsql/data" ]; then
    PG_DATA_DIR="/var/lib/pgsql/data"
else
    # 创建数据目录
    if [ -d "/var/lib/pgsql/15" ]; then
        PG_DATA_DIR="/var/lib/pgsql/15/data"
    else
        PG_DATA_DIR="/var/lib/pgsql/data"
    fi
    mkdir -p $PG_DATA_DIR
fi

log_info "PostgreSQL 数据目录: $PG_DATA_DIR"

# 检查是否已初始化
if [ -d "$PG_DATA_DIR" ] && [ -n "$(ls -A $PG_DATA_DIR 2>/dev/null)" ]; then
    log_warning "数据库已初始化，跳过初始化步骤"
else
    log_info "初始化 PostgreSQL 数据库..."
    
    # 确保目录权限
    mkdir -p $PG_DATA_DIR
    chown postgres:postgres $PG_DATA_DIR
    chmod 700 $PG_DATA_DIR
    
    # 查找 initdb
    INITDB_PATH=""
    for path in /usr/pgsql-15/bin/initdb /usr/bin/initdb $(which initdb 2>/dev/null); do
        if [ -f "$path" ] && [ -x "$path" ]; then
            INITDB_PATH=$path
            break
        fi
    done
    
    if [ -z "$INITDB_PATH" ]; then
        # 搜索 initdb
        INITDB_PATH=$(find /usr -name "initdb" -type f 2>/dev/null | head -1)
    fi
    
    if [ -n "$INITDB_PATH" ]; then
        log_info "使用 initdb: $INITDB_PATH"
        sudo -u postgres $INITDB_PATH -D $PG_DATA_DIR || {
            log_error "数据库初始化失败"
            exit 1
        }
        log_success "数据库初始化完成"
    else
        log_error "无法找到 initdb 命令"
        log_info "请手动运行: sudo -u postgres initdb -D $PG_DATA_DIR"
        exit 1
    fi
fi

# 配置 pg_hba.conf
PG_HBA="$PG_DATA_DIR/pg_hba.conf"
if [ -f "$PG_HBA" ]; then
    log_info "配置 pg_hba.conf..."
    if ! grep -q "host    all             all             127.0.0.1/32" "$PG_HBA" | grep -v "^#"; then
        echo "host    all             all             127.0.0.1/32            md5" >> "$PG_HBA"
        log_success "已添加本地连接配置"
    else
        log_info "本地连接配置已存在"
    fi
fi

# 尝试启动 PostgreSQL
log_info "尝试启动 PostgreSQL..."

# 检测服务名
POSTGRES_SERVICE=""
for svc in postgresql-15 postgresql postgresql15; do
    if systemctl list-unit-files 2>/dev/null | grep -q "$svc.service"; then
        POSTGRES_SERVICE=$svc
        break
    fi
done

if [ -n "$POSTGRES_SERVICE" ]; then
    log_info "找到服务: $POSTGRES_SERVICE"
    systemctl enable $POSTGRES_SERVICE 2>/dev/null || true
    systemctl start $POSTGRES_SERVICE 2>/dev/null || {
        log_warning "systemctl 启动失败，尝试直接启动..."
        # 直接启动
        sudo -u postgres /usr/pgsql-15/bin/postgres -D $PG_DATA_DIR > /var/log/postgresql.log 2>&1 &
        sleep 2
    }
else
    log_warning "未找到 systemd 服务，直接启动 PostgreSQL..."
    # 查找 postgres 二进制文件
    POSTGRES_BIN=""
    for path in /usr/pgsql-15/bin/postgres /usr/bin/postgres $(which postgres 2>/dev/null); do
        if [ -f "$path" ] && [ -x "$path" ]; then
            POSTGRES_BIN=$path
            break
        fi
    done
    
    if [ -n "$POSTGRES_BIN" ]; then
        log_info "使用 postgres: $POSTGRES_BIN"
        sudo -u postgres $POSTGRES_BIN -D $PG_DATA_DIR > /var/log/postgresql.log 2>&1 &
        sleep 2
    else
        log_error "无法找到 postgres 命令"
        exit 1
    fi
fi

# 等待启动
sleep 3

# 检查是否运行
if pgrep -x postgres > /dev/null; then
    log_success "PostgreSQL 已启动"
    echo ""
    echo "PostgreSQL 信息:"
    echo "  数据目录: $PG_DATA_DIR"
    echo "  进程: $(pgrep -x postgres | wc -l) 个进程运行中"
    echo "  端口: $(netstat -tuln 2>/dev/null | grep 5432 || echo '未监听（可能正在启动）')"
else
    log_error "PostgreSQL 启动失败"
    log_info "查看日志: tail -f /var/log/postgresql.log"
    exit 1
fi

echo ""
echo "============================================"
log_success "PostgreSQL 修复完成！"
echo "============================================"

