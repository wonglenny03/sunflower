# AWS EC2 一键部署指南

## 快速开始

### 前提条件

1. **EC2 实例已创建**
   - 推荐配置: t3.large (2 vCPU, 8 GB RAM)
   - 操作系统: Amazon Linux 2023
   - 存储: 至少 30 GB

2. **安全组配置**
   - 开放端口: 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (前端), 3001 (后端)

3. **连接到 EC2 实例**
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

---

## 一键部署步骤

### 方法一：完整部署（首次部署）

1. **上传部署脚本到服务器**
   ```bash
   # 在本地执行
   scp -i your-key.pem scripts/deploy-aws.sh ec2-user@your-ec2-ip:/tmp/
   ```

2. **SSH 连接到服务器并运行脚本**
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   sudo bash /tmp/deploy-aws.sh
   ```

3. **部署代码**
   
   脚本会提示你部署代码。有两种方式：

   **方式 A: 使用 Git（推荐）**
   ```bash
   cd /opt/company-search
   sudo -u companysearch git clone https://github.com/your-username/your-repo.git .
   ```

   **方式 B: 使用 SCP 上传**
   ```bash
   # 在本地打包代码
   tar -czf app.tar.gz --exclude=node_modules --exclude=.git .
   
   # 上传到服务器
   scp -i your-key.pem app.tar.gz ec2-user@your-ec2-ip:/tmp/
   
   # 在服务器上解压
   sudo mkdir -p /opt/company-search
   sudo tar -xzf /tmp/app.tar.gz -C /opt/company-search
   sudo chown -R companysearch:companysearch /opt/company-search
   ```

4. **配置环境变量**
   
   脚本会自动创建环境变量文件，但需要手动配置：
   ```bash
   sudo nano /opt/company-search/apps/api/.env
   ```
   
   必须配置：
   - `OPENAI_API_KEY`: 你的 OpenAI API Key
   - `SMTP_*`: 邮件服务配置

5. **完成部署**
   
   脚本会自动完成剩余步骤，包括：
   - 安装依赖
   - 构建应用
   - 启动服务

---

### 方法二：快速更新（代码更新）

如果只是更新代码，使用快速部署脚本：

```bash
sudo bash scripts/deploy-aws-quick.sh
```

---

## 部署脚本功能

### deploy-aws.sh（完整部署）

自动完成以下任务：

1. ✅ **系统更新**
   - 更新系统包
   - 安装基础工具

2. ✅ **安装 Node.js 20**
   - 使用 NodeSource 仓库
   - 安装 npm

3. ✅ **安装 pnpm**
   - 全局安装 pnpm 包管理器

4. ✅ **安装 PostgreSQL 15**
   - 安装数据库服务器
   - 初始化数据库
   - 创建数据库和用户
   - 配置访问权限

5. ✅ **创建应用用户**
   - 创建 `companysearch` 用户
   - 设置目录权限

6. ✅ **安装 PM2**
   - 进程管理器
   - 配置自动启动

7. ✅ **安装 Nginx**
   - Web 服务器和反向代理

8. ✅ **部署应用**
   - 创建应用目录
   - 部署代码（需要手动或 Git）

9. ✅ **构建应用**
   - 安装依赖
   - 构建共享包
   - 构建后端
   - 构建前端

10. ✅ **配置环境变量**
    - 创建 `.env` 文件
    - 生成 JWT Secret
    - 配置数据库连接

11. ✅ **初始化数据库**
    - 确保数据库就绪

12. ✅ **配置 PM2**
    - 创建 ecosystem 配置文件
    - 配置日志

13. ✅ **配置 Nginx**
    - 反向代理配置
    - 前端和后端路由

14. ✅ **配置防火墙**
    - 开放必要端口

15. ✅ **启动服务**
    - 启动 PostgreSQL
    - 启动应用（PM2）
    - 启动 Nginx

---

## 部署后配置

### 1. 配置环境变量

编辑环境变量文件：
```bash
sudo nano /opt/company-search/apps/api/.env
```

**必须配置的项目**：
- `OPENAI_API_KEY`: 你的 OpenAI API Key
- `SMTP_HOST`: SMTP 服务器地址
- `SMTP_USER`: SMTP 用户名
- `SMTP_PASS`: SMTP 密码
- `SMTP_FROM`: 发件人邮箱

**可选配置**：
- `FRONTEND_URL`: 前端访问地址
- `PORT`: API 端口（默认 3001）

配置完成后重启服务：
```bash
sudo -u companysearch pm2 restart all
```

### 2. 配置 Nginx 域名

编辑 Nginx 配置：
```bash
sudo nano /etc/nginx/conf.d/company-search.conf
```

修改 `server_name` 为你的域名或 IP 地址。

测试并重载配置：
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 3. 配置 SSL 证书（HTTPS）

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo dnf install -y certbot python3-certbot-nginx

# 获取证书（替换为你的域名）
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 服务管理

### PM2 命令

```bash
# 查看状态
sudo -u companysearch pm2 status

# 查看日志
sudo -u companysearch pm2 logs
sudo -u companysearch pm2 logs company-search-api
sudo -u companysearch pm2 logs company-search-web

# 重启服务
sudo -u companysearch pm2 restart all
sudo -u companysearch pm2 restart company-search-api

# 停止服务
sudo -u companysearch pm2 stop all

# 删除服务
sudo -u companysearch pm2 delete all

# 保存当前配置
sudo -u companysearch pm2 save
```

### 系统服务

```bash
# PostgreSQL
sudo systemctl status postgresql-15
sudo systemctl restart postgresql-15
sudo systemctl stop postgresql-15

# Nginx
sudo systemctl status nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
```

---

## 日志查看

### 应用日志

```bash
# PM2 日志
sudo -u companysearch pm2 logs

# 应用日志文件
tail -f /home/companysearch/logs/api-out.log
tail -f /home/companysearch/logs/api-error.log
tail -f /home/companysearch/logs/web-out.log
tail -f /home/companysearch/logs/web-error.log
```

### 系统日志

```bash
# Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL 日志
sudo tail -f /var/lib/pgsql/15/data/log/postgresql-*.log
```

---

## 数据库管理

### 连接数据库

```bash
# 使用保存的凭据
sudo -u postgres psql -d company_search -U companysearch

# 或使用连接字符串
psql postgresql://companysearch:password@localhost:5432/company_search
```

### 备份数据库

```bash
# 创建备份
sudo -u postgres pg_dump -U companysearch company_search > backup_$(date +%Y%m%d).sql

# 恢复备份
sudo -u postgres psql -U companysearch company_search < backup_20240101.sql
```

### 查看数据库信息

```bash
# 查看数据库大小
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('company_search'));"

# 查看表大小
sudo -u postgres psql -d company_search -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

---

## 故障排查

### 服务无法启动

1. **检查日志**
   ```bash
   sudo -u companysearch pm2 logs --err
   ```

2. **检查端口占用**
   ```bash
   sudo netstat -tulpn | grep -E '3000|3001'
   ```

3. **检查环境变量**
   ```bash
   sudo cat /opt/company-search/apps/api/.env
   ```

### 数据库连接失败

1. **检查 PostgreSQL 状态**
   ```bash
   sudo systemctl status postgresql-15
   ```

2. **检查数据库用户**
   ```bash
   sudo -u postgres psql -c "\du"
   ```

3. **检查连接配置**
   ```bash
   sudo cat /root/.db_credentials
   ```

### Nginx 502 错误

1. **检查后端服务**
   ```bash
   curl http://localhost:3001/api
   ```

2. **检查 Nginx 配置**
   ```bash
   sudo nginx -t
   ```

3. **查看 Nginx 错误日志**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

---

## 性能优化

### 1. 增加 Node.js 内存限制

编辑 PM2 配置：
```bash
sudo nano /home/companysearch/ecosystem.config.js
```

修改 `max_memory_restart` 为更大的值（如 '1G'）。

### 2. 配置 PostgreSQL 性能

编辑 PostgreSQL 配置：
```bash
sudo nano /var/lib/pgsql/15/data/postgresql.conf
```

建议配置：
```
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 128MB
```

重启 PostgreSQL：
```bash
sudo systemctl restart postgresql-15
```

### 3. 启用 Nginx 缓存

在 Nginx 配置中添加缓存：
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m;

location /api {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    # ... 其他配置
}
```

---

## 安全建议

1. **防火墙配置**
   - 只开放必要端口
   - 限制 SSH 访问 IP

2. **定期更新**
   ```bash
   sudo dnf update -y
   ```

3. **备份策略**
   - 定期备份数据库
   - 备份环境变量文件

4. **监控设置**
   - 配置 CloudWatch 监控
   - 设置告警

---

## 常见问题

### Q: 如何更新代码？

A: 使用快速部署脚本：
```bash
cd /opt/company-search
sudo -u companysearch git pull
sudo bash scripts/deploy-aws-quick.sh
```

### Q: 如何查看应用状态？

A: 
```bash
sudo -u companysearch pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql-15
```

### Q: 如何重启所有服务？

A:
```bash
sudo -u companysearch pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart postgresql-15
```

### Q: 数据库密码在哪里？

A: 保存在 `/root/.db_credentials`，只有 root 可读。

### Q: 如何添加新用户？

A: 通过前端注册页面，或直接在数据库中创建。

---

## 支持

如有问题，请查看：
- 应用日志: `sudo -u companysearch pm2 logs`
- 系统日志: `journalctl -xe`
- Nginx 日志: `/var/log/nginx/error.log`

