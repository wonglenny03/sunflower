# 启动脚本说明

## 一键启动脚本

项目提供了两个启动脚本，用于一键启动开发环境：

### 1. Node.js 脚本（推荐，跨平台）

```bash
pnpm start
# 或
npm start
```

**功能：**
- ✅ 自动检查端口占用（3000, 3001）
- ✅ 自动释放被占用的端口
- ✅ 自动检查并安装依赖
- ✅ 自动构建共享包
- ✅ 同时启动前后端服务
- ✅ 彩色日志输出，区分前后端日志
- ✅ 优雅退出（Ctrl+C 停止所有服务）

### 2. Shell 脚本（Unix/Linux/Mac）

```bash
pnpm start:sh
# 或
bash scripts/start.sh
```

**功能：**
- ✅ 自动检查端口占用
- ✅ 自动释放被占用的端口
- ✅ 自动检查并安装依赖
- ✅ 自动构建共享包
- ✅ 同时启动前后端服务

### 3. Windows 批处理脚本

```bash
pnpm start:win
# 或
scripts\start.bat
```

**功能：**
- ✅ 自动检查端口占用
- ✅ 自动释放被占用的端口
- ✅ 自动检查并安装依赖
- ✅ 自动构建共享包
- ✅ 在独立窗口启动前后端服务

## 使用说明

### 首次启动

1. 确保已安装 Node.js 18+ 和 pnpm 8+
2. 配置环境变量（参考 README.md）
3. 运行启动脚本：

```bash
pnpm start
```

### 端口冲突处理

如果端口 3000 或 3001 被占用，脚本会：
1. 自动检测占用端口的进程
2. 自动终止占用端口的进程
3. 继续启动服务

### 停止服务

按 `Ctrl+C` 即可停止所有服务。

## 服务地址

启动成功后，可以访问：

- **前端**: http://localhost:3000
- **后端 API**: http://localhost:3001
- **API 文档**: http://localhost:3001/api/docs

## 日志说明

启动脚本会显示彩色日志：
- 🔵 `[API]` - 后端服务日志
- 🟢 `[WEB]` - 前端服务日志
- 🔴 错误信息

## 故障排除

### 端口仍然被占用

如果自动释放端口失败，可以手动处理：

**Mac/Linux:**
```bash
# 查找占用端口的进程
lsof -ti:3000
lsof -ti:3001

# 终止进程
kill -9 <PID>
```

**Windows:**
```bash
# 查找占用端口的进程
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# 终止进程
taskkill /PID <PID> /F
```

### 依赖安装失败

确保已安装 pnpm：
```bash
npm install -g pnpm
```

### 构建失败

如果共享包构建失败，可以手动构建：
```bash
pnpm build:packages
```

