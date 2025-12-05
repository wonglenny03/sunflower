# 数据库查看指南

## PostgreSQL 数据库连接

### 1. 使用命令行工具 (psql)

#### 连接到数据库

```bash
# 使用环境变量中的连接字符串
psql $DATABASE_URL

# 或直接指定连接参数
psql -h localhost -U your_username -d company_search

# 如果设置了密码
PGPASSWORD=your_password psql -h localhost -U your_username -d company_search
```

#### 常用 SQL 命令

```sql
-- 列出所有表
\dt

-- 查看表结构
\d users
\d companies
\d search_history
\d email_logs

-- 查看所有用户
SELECT * FROM users;

-- 查看所有公司
SELECT * FROM companies;

-- 查看搜索历史
SELECT * FROM search_history;

-- 查看邮件日志
SELECT * FROM email_logs;

-- 统计信息
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM companies;
SELECT COUNT(*) FROM search_history;

-- 退出
\q
```

### 2. 使用图形化工具

#### DBeaver (推荐，免费)

1. 下载安装 DBeaver: https://dbeaver.io/
2. 创建新连接：
   - 选择 PostgreSQL
   - 主机: `localhost`
   - 端口: `5432`
   - 数据库: `company_search`
   - 用户名: 你的用户名
   - 密码: 你的密码
3. 测试连接并保存

#### pgAdmin (PostgreSQL 官方工具)

1. 下载安装 pgAdmin: https://www.pgadmin.org/
2. 添加服务器：
   - 名称: `Company Search DB`
   - 主机: `localhost`
   - 端口: `5432`
   - 数据库: `company_search`
   - 用户名和密码

#### TablePlus (Mac/Windows，付费但美观)

1. 下载安装 TablePlus: https://tableplus.com/
2. 创建新连接：
   - 选择 PostgreSQL
   - 输入连接信息
   - 保存并连接

### 3. 使用 VS Code 扩展

#### PostgreSQL 扩展

1. 在 VS Code 中安装扩展: `PostgreSQL` (由 Chris Kolkman 开发)
2. 点击左侧边栏的数据库图标
3. 添加连接：
   - 输入连接字符串或单独的参数
   - 保存并连接

### 4. 使用 Web 界面

#### Adminer (轻量级)

```bash
# 使用 Docker 运行 Adminer
docker run -d -p 8080:8080 adminer

# 访问 http://localhost:8080
# 系统: PostgreSQL
# 服务器: host.docker.internal (Mac/Windows) 或 localhost (Linux)
# 用户名、密码、数据库名
```

### 5. 快速查看脚本

创建一个简单的 Node.js 脚本来查看数据：

```bash
# 运行查看脚本
node scripts/view-db.js
```

## 数据库表结构

### users 表
- `id` (UUID) - 用户ID
- `email` (VARCHAR) - 邮箱
- `username` (VARCHAR) - 用户名
- `password` (VARCHAR) - 密码（加密）
- `created_at` (TIMESTAMP) - 创建时间
- `updated_at` (TIMESTAMP) - 更新时间

### companies 表
- `id` (UUID) - 公司ID
- `company_name` (VARCHAR) - 公司名称
- `phone` (VARCHAR) - 电话
- `email` (VARCHAR) - 邮箱
- `website` (VARCHAR) - 网站
- `country` (VARCHAR) - 国家
- `keywords` (VARCHAR) - 关键词
- `email_sent` (BOOLEAN) - 是否已发送邮件
- `email_sent_at` (TIMESTAMP) - 邮件发送时间
- `email_status` (VARCHAR) - 邮件状态
- `user_id` (UUID) - 用户ID
- `search_history_id` (UUID) - 搜索历史ID
- `created_at` (TIMESTAMP) - 创建时间
- `updated_at` (TIMESTAMP) - 更新时间

### search_history 表
- `id` (UUID) - 历史记录ID
- `user_id` (UUID) - 用户ID
- `keywords` (VARCHAR) - 关键词
- `country` (VARCHAR) - 国家
- `result_count` (INT) - 结果数量
- `search_params` (JSONB) - 搜索参数
- `created_at` (TIMESTAMP) - 创建时间
- `updated_at` (TIMESTAMP) - 更新时间

## 常用查询示例

### 查看用户及其公司数量
```sql
SELECT 
  u.id,
  u.username,
  u.email,
  COUNT(c.id) as company_count
FROM users u
LEFT JOIN companies c ON c.user_id = u.id
GROUP BY u.id, u.username, u.email;
```

### 查看最近的搜索
```sql
SELECT 
  sh.*,
  u.username
FROM search_history sh
JOIN users u ON u.id = sh.user_id
ORDER BY sh.created_at DESC
LIMIT 10;
```

### 查看邮件发送统计
```sql
SELECT 
  email_status,
  COUNT(*) as count
FROM companies
GROUP BY email_status;
```

### 清空测试数据（谨慎使用）
```sql
-- 删除所有公司
DELETE FROM companies;

-- 删除所有搜索历史
DELETE FROM search_history;

-- 删除所有用户（除了管理员）
DELETE FROM users WHERE username != 'admin';
```

## 环境变量配置

确保在 `apps/api/.env` 中配置了正确的数据库连接：

```env
DATABASE_URL=postgresql://username:password@localhost:5432/company_search
```

## 创建数据库

如果数据库不存在，需要先创建：

```bash
# 连接到 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE company_search;

# 创建用户（可选）
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE company_search TO your_username;

# 退出
\q
```

## 备份和恢复

### 备份数据库
```bash
pg_dump -U username -d company_search -f backup.sql
```

### 恢复数据库
```bash
psql -U username -d company_search -f backup.sql
```

