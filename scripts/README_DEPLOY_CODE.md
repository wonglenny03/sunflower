# 代码部署指南

## 方式一：使用 SCP 上传代码（推荐，如果代码在本地）

### 1. 在本地打包代码

```bash
# 在项目根目录执行
cd /Users/lenny/cursor/sunflower
tar -czf app.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='coverage' \
  --exclude='*.log' \
  .
```

### 2. 上传到服务器

```bash
scp -i /Users/lenny/Downloads/lenny.pem app.tar.gz ec2-user@51.21.199.15:/tmp/
```

### 3. 在服务器上解压

```bash
# SSH 连接到服务器
ssh -i /Users/lenny/Downloads/lenny.pem ec2-user@51.21.199.15

# 解压代码
sudo mkdir -p /opt/company-search
sudo tar -xzf /tmp/app.tar.gz -C /opt/company-search
sudo chown -R companysearch:companysearch /opt/company-search
rm /tmp/app.tar.gz
```

### 4. 继续部署

```bash
# 运行构建和启动脚本
sudo bash /tmp/deploy-aws.sh
```

---

## 方式二：使用 Git Clone（如果有 Git 仓库）

### 1. 在服务器上克隆代码

```bash
# SSH 连接到服务器
ssh -i /Users/lenny/Downloads/lenny.pem ec2-user@51.21.199.15

# 克隆代码
sudo mkdir -p /opt/company-search
cd /opt/company-search
sudo -u companysearch git clone <your-git-repo-url> .

# 或者如果已有代码，更新
cd /opt/company-search
sudo -u companysearch git pull
```

### 2. 继续部署

```bash
# 运行构建和启动脚本
sudo bash /tmp/deploy-aws.sh
```

---

## 方式三：使用代码部署脚本（交互式）

### 1. 上传代码部署脚本

```bash
scp -i /Users/lenny/Downloads/lenny.pem scripts/deploy-code.sh ec2-user@51.21.199.15:/tmp/
```

### 2. 在服务器上运行

```bash
# SSH 连接到服务器
ssh -i /Users/lenny/Downloads/lenny.pem ec2-user@51.21.199.15

# 运行代码部署脚本
sudo bash /tmp/deploy-code.sh
```

脚本会引导你选择部署方式。

---

## 快速命令（一键部署代码）

### 使用 SCP 方式（在本地执行）

```bash
# 1. 打包
cd /Users/lenny/cursor/sunflower
tar -czf /tmp/app.tar.gz --exclude=node_modules --exclude=.git --exclude='.next' --exclude='dist' .

# 2. 上传
scp -i /Users/lenny/Downloads/lenny.pem /tmp/app.tar.gz ec2-user@51.21.199.15:/tmp/

# 3. 在服务器上解压（SSH 连接后执行）
ssh -i /Users/lenny/Downloads/lenny.pem ec2-user@51.21.199.15 << 'EOF'
sudo mkdir -p /opt/company-search
sudo tar -xzf /tmp/app.tar.gz -C /opt/company-search
sudo chown -R companysearch:companysearch /opt/company-search
rm /tmp/app.tar.gz
echo "代码部署完成！"
EOF
```

---

## 验证代码部署

```bash
# 检查代码是否部署成功
ls -la /opt/company-search/package.json
ls -la /opt/company-search/apps/api/package.json
ls -la /opt/company-search/apps/web/package.json
```

如果这些文件存在，说明代码部署成功。

---

## 继续完成部署

代码部署后，继续运行部署脚本完成构建和启动：

```bash
sudo bash /tmp/deploy-aws.sh
```

脚本会自动检测代码并继续执行构建、配置和启动步骤。

