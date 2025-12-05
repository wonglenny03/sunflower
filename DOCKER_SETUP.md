# Docker PostgreSQL 设置指南

## 快速启动 PostgreSQL

```bash
# 启动 PostgreSQL 容器
pnpm start-pg

# 或使用脚本
bash scripts/start-postgres-docker.sh
```

## 常用命令

### 启动容器
```bash
docker start postgres
```

### 停止容器
```bash
docker stop postgres
```

### 查看容器状态
```bash
docker ps | grep postgres
```

### 查看容器日志
```bash
docker logs postgres
```

### 进入容器
```bash
docker exec -it postgres psql -U postgres -d company_search
```

### 查看数据库
```bash
# 使用 Docker 脚本
pnpm view-db:docker

# 或直接执行 SQL
docker exec postgres psql -U postgres -d company_search -c "SELECT * FROM users;"
```

## 连接信息

使用 Docker 时的默认连接信息：

```
Host: localhost
Port: 5432
Database: company_search
Username: postgres
Password: postgres
```

**DATABASE_URL**:
```
postgresql://postgres:postgres@localhost:5432/company_search
```

## 故障排查

### 容器无法启动

```bash
# 查看错误日志
docker logs postgres

# 检查端口是否被占用
lsof -ti:5432

# 删除旧容器并重新创建
docker rm -f postgres
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=company_search -p 5432:5432 postgres:14
```

### 无法连接数据库

```bash
# 检查容器是否运行
docker ps | grep postgres

# 检查端口映射
docker port postgres

# 测试连接
docker exec postgres pg_isready -U postgres
```

### 重置数据库

```bash
# 删除并重新创建容器
docker rm -f postgres
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=company_search -p 5432:5432 postgres:14
```

## 数据持久化

如果需要数据持久化，可以挂载数据卷：

```bash
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=company_search \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:14
```

这样即使删除容器，数据也会保留。

