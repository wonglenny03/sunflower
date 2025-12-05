#!/bin/bash

# PostgreSQL 安装脚本

echo "🗄️  PostgreSQL Installation Script"
echo "===================================="
echo ""

# 检测操作系统
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="mac"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
else
    OS="unknown"
fi

echo "Detected OS: $OS"
echo ""

if [ "$OS" == "mac" ]; then
    # Mac 安装
    echo "📦 Installing PostgreSQL on macOS..."
    echo ""
    
    # 检查 Homebrew
    if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew is not installed"
        echo ""
        echo "Please install Homebrew first:"
        echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        echo ""
        exit 1
    fi
    
    echo "✅ Homebrew found"
    echo ""
    
    # 安装 PostgreSQL
    echo "Installing PostgreSQL..."
    brew install postgresql@14
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ PostgreSQL installed successfully"
        echo ""
        echo "Starting PostgreSQL service..."
        brew services start postgresql@14
        
        # 等待服务启动
        sleep 3
        
        if pg_isready -h localhost > /dev/null 2>&1; then
            echo "✅ PostgreSQL is running"
        else
            echo "⚠️  PostgreSQL installed but not running yet"
            echo "Please start it manually: brew services start postgresql@14"
        fi
    else
        echo "❌ Failed to install PostgreSQL"
        exit 1
    fi
    
elif [ "$OS" == "linux" ]; then
    # Linux 安装
    echo "📦 Installing PostgreSQL on Linux..."
    echo ""
    
    # 检测包管理器
    if command -v apt-get &> /dev/null; then
        # Debian/Ubuntu
        echo "Using apt-get..."
        sudo apt-get update
        sudo apt-get install -y postgresql postgresql-contrib
        
        echo ""
        echo "Starting PostgreSQL service..."
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
        
    elif command -v yum &> /dev/null; then
        # CentOS/RHEL
        echo "Using yum..."
        sudo yum install -y postgresql-server postgresql-contrib
        sudo postgresql-setup initdb
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
        
    elif command -v dnf &> /dev/null; then
        # Fedora
        echo "Using dnf..."
        sudo dnf install -y postgresql-server postgresql-contrib
        sudo postgresql-setup initdb
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    else
        echo "❌ Unsupported Linux distribution"
        echo "Please install PostgreSQL manually"
        exit 1
    fi
    
    if pg_isready -h localhost > /dev/null 2>&1; then
        echo "✅ PostgreSQL installed and running"
    else
        echo "⚠️  PostgreSQL installed but may need manual start"
    fi
else
    echo "❌ Unsupported operating system"
    echo ""
    echo "Please install PostgreSQL manually:"
    echo "  https://www.postgresql.org/download/"
    exit 1
fi

echo ""
echo "✅ Installation completed!"
echo ""
echo "Next steps:"
echo "  1. Create database: pnpm setup-db"
echo "  2. Start backend: pnpm start"
echo ""

