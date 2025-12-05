# PostgreSQL 安装指南

## 方法 1: 使用安装脚本（推荐）

```bash
bash scripts/install-postgresql.sh
```

## 方法 2: 手动安装

### Mac (使用 Homebrew)

#### 步骤 1: 安装 Homebrew（如果还没有）

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 步骤 2: 安装 PostgreSQL

```bash
# 安装 PostgreSQL
brew install postgresql@14

# 启动 PostgreSQL 服务
brew services start postgresql@14

# 验证安装
pg_isready
```

#### 步骤 3: 创建数据库用户（可选）

```bash
# 连接到 PostgreSQL
psql postgres

# 创建用户（如果需要）
CREATE USER your_username WITH PASSWORD 'your_password';
ALTER USER your_username CREATEDB;

# 退出
\q
```

### Linux (Ubuntu/Debian)

```bash
# 更新包列表
sudo apt-get update

# 安装 PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 验证
sudo systemctl status postgresql
```

### Linux (CentOS/RHEL/Fedora)

```bash
# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Fedora
sudo dnf install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 方法 3: 使用 Docker（最简单，推荐）

### 安装 Docker

如果还没有 Docker，先安装：
- Mac: https://www.docker.com/products/docker-desktop
- Linux: `sudo apt-get install docker.io` 或 `sudo yum install docker`

### 运行 PostgreSQL 容器

```bash
# 启动 PostgreSQL 容器
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=company_search \
  -p 5432:5432 \
  postgres:14

# 验证运行
docker ps | grep postgres

# 如果需要停止
docker stop postgres

# 如果需要启动已存在的容器
docker start postgres
```

**使用 Docker 时的 DATABASE_URL**:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/company_search
```

## 验证安装

```bash
# 检查 PostgreSQL 是否运行
pg_isready

# 或
psql --version

# 连接到数据库
psql -U postgres
```

## 安装后设置

### 1. 创建数据库

```bash
# 使用 createdb 命令
createdb company_search

# 或使用 psql
psql -U postgres -c "CREATE DATABASE company_search;"
```

### 2. 配置环境变量

编辑 `apps/api/.env`:

```env
DATABASE_URL=postgresql://用户名:密码@localhost:5432/company_search
```

**默认用户**:
- Mac Homebrew: 你的系统用户名
- Linux: `postgres`
- Docker: `postgres`

### 3. 测试连接

```bash
# 测试连接
psql $DATABASE_URL

# 或使用项目脚本
pnpm view-db
```

## 常见问题

### Q: Homebrew 安装失败

**A**: 确保网络连接正常，或使用国内镜像：
```bash
# 使用国内镜像
export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.ustc.edu.cn/homebrew-bottles
brew install postgresql@14
```

### Q: 权限错误

**A**: 
- Mac: 确保使用正确的用户名
- Linux: 可能需要使用 `sudo` 或切换到 `postgres` 用户

### Q: 端口 5432 被占用

**A**: 
```bash
# 查看占用进程
lsof -ti:5432

# 终止进程
kill -9 $(lsof -ti:5432)
```

### Q: 忘记密码

**A**: 
```bash
# Mac: 重置密码
psql postgres
ALTER USER your_username WITH PASSWORD 'new_password';

# Linux: 使用 postgres 用户
sudo -u postgres psql
ALTER USER postgres WITH PASSWORD 'new_password';
```

## 推荐方式

**对于开发环境，推荐使用 Docker**，因为：
- ✅ 安装简单，一条命令
- ✅ 不污染系统环境
- ✅ 易于清理和重置
- ✅ 跨平台一致

## 下一步

安装完成后：

```bash
# 1. 设置数据库
pnpm setup-db

# 2. 启动项目
pnpm start
```

