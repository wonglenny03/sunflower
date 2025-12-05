# 快速设置指南

## 问题：Network Error - 后端未运行

如果看到 "Network Error: Cannot connect to server"，说明后端服务没有运行。

## 解决步骤

### 1. 检查服务状态

```bash
pnpm check
```

这会显示所有服务的运行状态。

### 2. 安装和启动 PostgreSQL

#### Mac (使用 Homebrew)

```bash
# 安装 PostgreSQL
brew install postgresql@14

# 启动 PostgreSQL 服务
brew services start postgresql@14

# 验证是否运行
pg_isready
```

#### Linux

```bash
# 安装 PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 验证是否运行
sudo systemctl status postgresql
```

#### 使用 Docker (跨平台)

```bash
# 启动 PostgreSQL 容器
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=company_search \
  -p 5432:5432 \
  postgres:14

# 验证
docker ps | grep postgres
```

### 3. 设置数据库

运行自动设置脚本：

```bash
pnpm setup-db
```

或手动创建：

```bash
# 创建数据库
createdb company_search

# 或使用 psql
psql -U postgres -c "CREATE DATABASE company_search;"
```

### 4. 配置环境变量

确保 `apps/api/.env` 文件存在并配置正确：

```bash
# 如果不存在，复制示例文件
cp apps/api/.env.example apps/api/.env

# 编辑配置文件
nano apps/api/.env
```

**重要配置**:
```env
DATABASE_URL=postgresql://用户名:密码@localhost:5432/company_search
JWT_SECRET=your-secret-key
```

### 5. 启动后端

```bash
# 方法 1: 使用启动脚本（推荐）
pnpm start

# 方法 2: 单独启动后端
pnpm dev:api

# 方法 3: 使用辅助脚本
bash scripts/start-backend.sh
```

### 6. 验证后端运行

```bash
# 检查端口
lsof -ti:3001

# 或访问 API 文档
open http://localhost:3001/api/docs
```

## 常见问题

### Q: PostgreSQL 安装失败

**A**: 
- Mac: 确保已安装 Homebrew
- Linux: 使用系统包管理器
- 或使用 Docker 方式

### Q: 数据库连接失败

**A**: 检查：
1. PostgreSQL 是否运行: `pg_isready`
2. `DATABASE_URL` 中的用户名密码是否正确
3. 数据库是否存在: `psql -l | grep company_search`

### Q: 端口 3001 被占用

**A**: 
```bash
# 查看占用进程
lsof -ti:3001

# 终止进程
kill -9 $(lsof -ti:3001)

# 或使用启动脚本自动处理
pnpm start
```

### Q: 后端启动后立即退出

**A**: 检查：
1. 数据库连接是否正常
2. 环境变量是否配置
3. 查看后端日志中的错误信息

## 完整启动流程

```bash
# 1. 检查状态
pnpm check

# 2. 设置数据库（如果需要）
pnpm setup-db

# 3. 一键启动所有服务
pnpm start
```

## 查看数据库

```bash
# 快速查看
pnpm view-db

# 或使用命令行
psql postgresql://用户名:密码@localhost:5432/company_search
```

详细说明请查看 [docs/DATABASE.md](./docs/DATABASE.md)

