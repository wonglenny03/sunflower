# 快速开始指南

## 问题排查：Network Error

如果遇到 "Network Error"，请按以下步骤检查：

### 1. 检查后端是否运行

```bash
# 检查端口 3001 是否被占用
lsof -ti:3001

# 如果没有输出，说明后端未运行
# 启动后端：
pnpm dev:api
```

### 2. 检查数据库是否运行

```bash
# 检查 PostgreSQL 是否运行
pg_isready -h localhost

# 如果未运行，启动 PostgreSQL：
# Mac
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### 3. 检查环境变量配置

确保 `apps/api/.env` 文件存在并配置正确：

```bash
# 检查文件是否存在
ls -la apps/api/.env

# 如果不存在，复制示例文件
cp apps/api/.env.example apps/api/.env

# 编辑配置文件
nano apps/api/.env  # 或使用你喜欢的编辑器
```

**必需的环境变量**:
- `DATABASE_URL` - 数据库连接字符串
- `JWT_SECRET` - JWT 密钥（可以随机生成）

### 4. 创建数据库

如果数据库不存在：

```bash
# 连接到 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE company_search;

# 退出
\q
```

### 5. 一键启动（推荐）

使用启动脚本会自动处理大部分问题：

```bash
pnpm start
```

这个脚本会：
- ✅ 检查并释放端口
- ✅ 检查依赖
- ✅ 构建共享包
- ✅ 启动前后端

## 查看数据库

### 方法 1: 使用脚本（最简单）

```bash
pnpm view-db
```

### 方法 2: 使用命令行

```bash
# 连接到数据库
psql $DATABASE_URL

# 或
psql -h localhost -U your_username -d company_search

# 查看表
\dt

# 查看用户
SELECT * FROM users;

# 查看公司
SELECT * FROM companies;

# 退出
\q
```

### 方法 3: 使用图形化工具

推荐工具：
- **DBeaver** (免费): https://dbeaver.io/
- **pgAdmin** (免费): https://www.pgadmin.org/
- **TablePlus** (付费但美观): https://tableplus.com/

详细说明请查看 [docs/DATABASE.md](./docs/DATABASE.md)

## 常见问题

### Q: 后端启动失败，提示数据库连接错误

**A**: 检查：
1. PostgreSQL 是否运行
2. `DATABASE_URL` 是否正确
3. 数据库是否存在

```bash
# 检查 PostgreSQL
pg_isready

# 创建数据库
createdb company_search
```

### Q: 前端无法连接到后端

**A**: 检查：
1. 后端是否在 3001 端口运行
2. `NEXT_PUBLIC_API_URL` 是否正确（默认是 http://localhost:3001）
3. 浏览器控制台是否有 CORS 错误

### Q: 注册时提示 "Email already exists"

**A**: 这是正常的，说明邮箱已被注册。可以：
1. 使用不同的邮箱注册
2. 或删除数据库中的用户记录

```sql
-- 连接到数据库后执行
DELETE FROM users WHERE email = 'your-email@example.com';
```

### Q: 如何重置数据库

**A**: 删除并重新创建数据库：

```bash
# 删除数据库
dropdb company_search

# 重新创建
createdb company_search

# 重启后端，TypeORM 会自动创建表结构
```

## 下一步

1. ✅ 确保 PostgreSQL 运行
2. ✅ 创建并配置 `apps/api/.env`
3. ✅ 创建数据库 `company_search`
4. ✅ 运行 `pnpm start` 启动项目
5. ✅ 访问 http://localhost:3000 开始使用

如有问题，请查看：
- [数据库查看指南](./docs/DATABASE.md)
- [README.md](./README.md)
- [PRD.md](./PRD.md)

