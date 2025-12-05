# 公司信息搜索系统

基于 OpenAI API 的智能公司信息搜索系统，支持搜索特定国家/地区的公司信息，并提供邮件发送、数据导出等功能。

## 技术栈

- **包管理**: pnpm (Monorepo)
- **后端**: NestJS + TypeScript
- **前端**: Next.js 14+ (App Router) + TypeScript + React
- **数据库**: PostgreSQL
- **ORM**: TypeORM
- **认证**: JWT
- **邮件服务**: Nodemailer
- **Excel导出**: ExcelJS
- **国际化**: next-intl / react-i18next

## 核心功能

### 1. 用户认证
- ✅ 用户注册（邮箱、用户名、密码）
- ✅ 用户登录
- ✅ JWT Token 认证
- ✅ 登录保护（未登录自动跳转登录页）

### 2. 公司搜索
- ✅ 使用 OpenAI API 搜索公司信息
- ✅ 支持国家/地区选择（新加坡、马来西亚）
- ✅ 关键词搜索
- ✅ 自动去重（跳过已搜索过的结果）
- ✅ 一次搜索10条，支持继续搜索

### 3. 数据展示
- ✅ 表格展示搜索结果
- ✅ 分页功能
- ✅ 最新结果排在前面
- ✅ 数据筛选

### 4. 邮件功能
- ✅ 单个邮件发送
- ✅ 批量邮件发送
- ✅ 固定邮件模板
- ✅ 邮件发送状态记录

### 5. 数据管理
- ✅ 数据导出（Excel）
- ✅ 数据删除（单个/批量）
- ✅ 数据筛选

### 6. 搜索历史
- ✅ 搜索历史记录
- ✅ 历史记录详情查看
- ✅ 历史记录统计
- ✅ 基于历史记录重新搜索

### 7. 多语言支持
- ✅ 中文（简体）
- ✅ 英文
- ✅ 语言切换功能

## 项目结构 (Monorepo)

```
sunflower/
├── apps/
│   ├── api/              # NestJS 后端应用
│   │   ├── src/
│   │   │   ├── auth/        # 认证模块
│   │   │   ├── users/       # 用户模块
│   │   │   ├── companies/   # 公司信息模块
│   │   │   ├── search/      # 搜索模块
│   │   │   ├── email/       # 邮件模块
│   │   │   └── export/      # 导出模块
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/              # Next.js 前端应用
│       ├── app/             # App Router 页面
│       ├── components/      # React 组件
│       ├── lib/             # 工具库和 API 客户端
│       ├── package.json
│       └── next.config.js
│
├── packages/
│   ├── types/            # 共享类型定义
│   │   ├── src/
│   │   └── package.json
│   ├── utils/            # 共享工具函数
│   │   ├── src/
│   │   └── package.json
│   └── config/           # 共享配置
│       ├── src/
│       └── package.json
│
├── pnpm-workspace.yaml   # pnpm workspace 配置
├── package.json          # 根 package.json
├── pnpm-lock.yaml        # pnpm 锁文件
├── .gitignore
├── PRD.md                # 产品需求文档（详细）
└── README.md             # 项目说明文档
```

## 环境变量配置

在 `apps/api/` 目录下创建 `.env` 文件，参考 `apps/api/.env.example`：

```bash
# 必需的环境变量
OPENAI_API_KEY=sk-your-openai-api-key-here  # OpenAI API Key（必需）
DATABASE_URL=postgresql://username:password@localhost:5432/company_search
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development

# 前端环境变量（在 apps/web/.env.local）
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**重要**: 必须配置 `OPENAI_API_KEY` 才能使用搜索功能。获取 API Key：
1. 访问 https://platform.openai.com/api-keys
2. 登录或注册账号
3. 创建新的 API Key
4. 将 Key 复制到 `.env` 文件中

## 快速开始

### 环境要求
- Node.js 18+
- pnpm 8+
- PostgreSQL 14+

### 安装 pnpm

```bash
npm install -g pnpm
```

### 安装依赖

在项目根目录执行：

```bash
pnpm install
```

这将安装所有 workspace 中的依赖。

### 环境变量配置

**重要**: 首次运行前需要创建环境变量文件！

**apps/api/.env** (后端环境变量，必需):
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/company_search

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Email (SMTP) - 可选，用于发送邮件功能
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
SMTP_FROM=noreply@companysearch.com

# Frontend
FRONTEND_URL=http://localhost:3000

# Server
PORT=3001
NODE_ENV=development
```

**apps/web/.env.local** (前端环境变量，可选):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**快速创建配置文件**:
```bash
# 复制示例文件
cp apps/api/.env.example apps/api/.env
# 然后编辑 apps/api/.env 填入你的配置
```

### 数据库设置

**1. 启动 PostgreSQL**:
```bash
# Mac (使用 Homebrew)
brew services start postgresql

# Linux
sudo systemctl start postgresql

# 或使用 Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres
```

**2. 创建数据库**:
```bash
# 连接到 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE company_search;

# 退出
\q
```

**3. 查看数据库**:
```bash
# 使用命令行查看
pnpm view-db

# 或使用图形化工具（推荐 DBeaver、pgAdmin、TablePlus）
# 详细说明请查看 docs/DATABASE.md
```

### 安装 PostgreSQL

**如果 PostgreSQL 未安装**，选择以下方式之一：

**方式 1: 使用 Docker（推荐，最简单）**
```bash
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=company_search \
  -p 5432:5432 \
  postgres:14
```

**方式 2: 使用安装脚本**
```bash
pnpm install-pg
```

**方式 3: 手动安装**
- Mac: `brew install postgresql@14 && brew services start postgresql@14`
- Linux: `sudo apt-get install postgresql postgresql-contrib`

详细说明请查看 [INSTALL_POSTGRESQL.md](./INSTALL_POSTGRESQL.md)

### 运行项目

**快速启动（自动安装和配置）**:
```bash
bash scripts/quick-start.sh
```

**一键启动** (推荐，自动处理端口冲突):
```bash
pnpm start
```

这个脚本会：
- ✅ 自动检查并释放被占用的端口（3000, 3001）
- ✅ 自动检查并安装依赖
- ✅ 自动构建共享包
- ✅ 同时启动前后端服务
- ✅ 显示彩色日志，区分前后端输出

**手动启动**:
```bash
# 启动所有应用
pnpm dev

# 单独启动后端
pnpm dev:api

# 单独启动前端
pnpm dev:web
```

**访问地址**:
- 前端: http://localhost:3000
- 后端 API: http://localhost:3001
- API 文档: http://localhost:3001/api/docs

### 常用命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器（一键启动，推荐）
pnpm start

# 在特定包中运行命令
pnpm --filter @company-search/api <command>
pnpm --filter @company-search/web <command>
pnpm --filter @company-search/types <command>

# 在所有包中运行命令
pnpm -r <command>

# 构建所有包
pnpm build

# 查看数据库
pnpm view-db

# 运行测试
pnpm test

# 代码检查
pnpm lint

# 格式化代码
pnpm format
```

### 故障排查

如果遇到问题，请查看 [QUICKSTART.md](./QUICKSTART.md) 获取详细的故障排查指南。

## 数据库设计

### 主要数据表

1. **users** - 用户表
2. **companies** - 公司信息表
3. **email_logs** - 邮件发送记录表
4. **email_templates** - 邮件模板表
5. **search_history** - 搜索历史表

详细设计请参考 [PRD.md](./PRD.md) 第4节。

## API 端点

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出

### 公司搜索
- `POST /api/companies/search` - 搜索公司
- `GET /api/companies` - 获取公司列表（分页）
- `DELETE /api/companies/:id` - 删除公司

### 邮件
- `POST /api/email/send` - 发送邮件
- `POST /api/email/batch-send` - 批量发送

### 导出
- `GET /api/export/excel` - 导出 Excel

### 搜索历史
- `GET /api/search-history` - 获取搜索历史列表
- `GET /api/search-history/:id` - 获取历史记录详情
- `DELETE /api/search-history/:id` - 删除历史记录
- `GET /api/search-history/statistics` - 获取统计信息

详细 API 设计请参考 [PRD.md](./PRD.md) 第3.2.2节。

## 开发计划

1. **第一阶段**: 基础功能（用户认证、项目初始化）
2. **第二阶段**: 核心功能（搜索、展示、分页）
3. **第三阶段**: 扩展功能（邮件、导出）
4. **第四阶段**: 优化和测试

## 详细文档

请查看 [PRD.md](./PRD.md) 获取完整的产品需求文档，包括：
- 详细功能需求
- 技术架构设计
- 数据库设计
- API 设计
- 安全设计
- 部署方案
- 测试计划

## 许可证

MIT

