# 公司信息搜索系统 - 产品需求文档 (PRD)

## 1. 项目概述

### 1.1 项目名称
公司信息搜索系统 (Company Search System)

### 1.2 项目描述
基于 OpenAI API 的智能公司信息搜索系统，支持搜索特定国家/地区的公司信息，并提供邮件发送、数据导出等功能。

### 1.3 技术栈
- **包管理**: pnpm (Monorepo)
- **后端**: NestJS
- **前端**: Next.js (React)
- **数据库**: PostgreSQL / MySQL
- **ORM**: TypeORM / Prisma
- **认证**: JWT
- **邮件服务**: Nodemailer
- **Excel导出**: ExcelJS / xlsx
- **国际化**: next-intl / react-i18next
- **状态管理**: Zustand / React Context

---

## 2. 功能需求

### 2.1 用户认证模块

#### 2.1.1 用户注册
- **功能描述**: 新用户注册账号
- **输入字段**:
  - 邮箱 (Email) - 必填，需验证格式和唯一性
  - 用户名 (Username) - 必填，3-20字符，唯一
  - 密码 (Password) - 必填，至少8位，包含字母和数字
  - 确认密码 - 必填，需与密码一致
- **验证规则**:
  - 邮箱格式验证
  - 邮箱唯一性验证
  - 用户名唯一性验证
  - 密码强度验证
- **输出**: 注册成功后跳转到登录页面

#### 2.1.2 用户登录
- **功能描述**: 用户登录系统
- **输入字段**:
  - 邮箱或用户名 - 必填
  - 密码 - 必填
- **验证规则**:
  - 验证用户是否存在
  - 验证密码是否正确
- **输出**: 
  - 登录成功：返回 JWT Token，跳转到搜索页面
  - 登录失败：显示错误信息

#### 2.1.3 用户登出
- **功能描述**: 用户退出登录
- **输出**: 清除 Token，跳转到登录页面

#### 2.1.4 会话管理
- **功能描述**: 保持用户登录状态
- **实现方式**: JWT Token 存储在 localStorage，每次请求携带 Token

#### 2.1.5 登录保护
- **功能描述**: 未登录用户需要先登录才能使用系统
- **保护范围**: 
  - 所有功能页面（搜索、公司列表、历史记录等）
  - 所有 API 接口（除注册、登录接口外）
- **实现方式**:
  - 前端路由守卫：检查 Token 是否存在，不存在则跳转到登录页
  - 后端 API 守卫：验证 JWT Token，无效或过期则返回 401
- **用户体验**:
  - 未登录访问受保护页面时，自动跳转到登录页
  - 登录成功后，跳转回原访问页面（如果存在）
  - Token 过期时，提示用户重新登录

---

### 2.2 公司搜索模块

#### 2.2.1 搜索功能
- **功能描述**: 使用 OpenAI API 搜索公司信息
- **输入参数**:
  - 国家/地区 (Country/Region) - 下拉选择：新加坡、马来西亚（可扩展）
  - 关键词 (Keywords) - 文本输入，必填
  - 搜索数量 - 默认10条，可配置
- **搜索逻辑**:
  1. 调用 OpenAI API，传入国家/地区和关键词
  2. 解析返回结果，提取公司信息
  3. 检查数据库中是否已存在（通过公司名称、邮箱、网站等字段）
  4. 过滤已存在的记录
  5. 保存新记录到数据库
  6. 返回搜索结果
- **返回数据**:
  - 公司名称 (Company Name)
  - 电话 (Phone)
  - 邮箱 (Email)
  - 网站地址 (Website)
  - 国家/地区 (Country)
  - 搜索关键词 (Keywords)
  - 创建时间 (Created At)

#### 2.2.2 继续搜索
- **功能描述**: 点击"更多"按钮继续搜索
- **实现逻辑**:
  - 使用相同的搜索条件
  - 跳过已搜索过的结果（数据库中已存在的记录）
  - 继续获取新的10条结果
  - 追加到现有结果列表

#### 2.2.3 搜索结果排序
- **排序规则**: 最新搜索的信息排在前面（按创建时间倒序）

#### 2.2.4 去重机制
- **去重字段**: 
  - 公司名称（模糊匹配）
  - 邮箱（精确匹配）
  - 网站地址（精确匹配）
- **去重逻辑**: 搜索前检查数据库，跳过已存在的记录

---

### 2.3 搜索结果展示模块

#### 2.3.1 表格展示
- **表格列**:
  - 序号
  - 公司名称
  - 电话
  - 邮箱
  - 网站地址
  - 国家/地区
  - 搜索关键词
  - 创建时间
  - 邮件发送状态
  - 操作列（发送邮件、删除）
- **表格特性**:
  - 响应式设计
  - 列排序功能
  - 列筛选功能
  - 行选择功能（支持批量操作）

#### 2.3.2 分页功能
- **分页参数**:
  - 每页显示数量：10/20/50/100（可配置）
  - 当前页码
  - 总记录数
  - 总页数
- **分页控件**: 显示页码、上一页、下一页、跳转到指定页

#### 2.3.3 搜索状态显示
- **加载状态**: 搜索中显示加载动画
- **空状态**: 无结果时显示提示信息
- **错误状态**: 搜索失败显示错误信息

---

### 2.4 邮件发送模块

#### 2.4.1 单个邮件发送
- **功能描述**: 对单个公司发送邮件
- **操作流程**:
  1. 点击表格中的"发送邮件"按钮
  2. 弹出确认对话框
  3. 确认后调用邮件发送接口
  4. 发送成功后更新邮件发送状态
  5. 显示发送成功提示

#### 2.4.2 批量邮件发送
- **功能描述**: 对选中的多个公司批量发送邮件
- **操作流程**:
  1. 勾选需要发送邮件的公司（复选框）
  2. 点击"批量发送邮件"按钮
  3. 弹出确认对话框，显示选中数量
  4. 确认后批量调用邮件发送接口
  5. 显示发送进度
  6. 发送完成后更新所有记录的状态

#### 2.4.3 邮件模板
- **模板内容**: 固定模板，包含以下变量：
  - {companyName} - 公司名称
  - {contactPerson} - 联系人（如果有）
  - {customContent} - 自定义内容（可选）
- **模板配置**: 存储在数据库中，管理员可配置

#### 2.4.4 邮件发送状态
- **状态字段**: 
  - 未发送 (Not Sent)
  - 已发送 (Sent)
  - 发送失败 (Failed)
- **状态显示**: 在表格中通过图标或标签显示

#### 2.4.5 邮件发送记录
- **记录信息**:
  - 发送时间
  - 发送状态
  - 错误信息（如果发送失败）
  - 收件人邮箱

---

### 2.5 数据导出模块

#### 2.5.1 Excel 导出
- **功能描述**: 将搜索结果导出为 Excel 文件
- **导出内容**:
  - 所有表格列的数据
  - 支持导出当前页或全部数据
- **文件格式**: .xlsx
- **文件命名**: `公司搜索_关键词_日期时间.xlsx`
- **导出字段**:
  - 公司名称
  - 电话
  - 邮箱
  - 网站地址
  - 国家/地区
  - 搜索关键词
  - 创建时间
  - 邮件发送状态

---

### 2.6 数据管理模块

#### 2.6.1 数据删除
- **功能描述**: 删除单条或批量删除公司记录
- **操作**: 
  - 单个删除：点击操作列的删除按钮
  - 批量删除：选中多条记录后点击批量删除按钮
- **确认机制**: 删除前弹出确认对话框

#### 2.6.2 数据筛选
- **筛选条件**:
  - 按国家/地区筛选
  - 按关键词筛选
  - 按邮件发送状态筛选
  - 按创建时间范围筛选

---

### 2.7 搜索历史记录模块

#### 2.7.1 历史记录列表（按关键词汇总）
- **功能描述**: 展示用户的所有搜索历史记录，相同关键词和国家的搜索结果自动汇总成一条记录
- **汇总规则**:
  - 按关键词（Keywords）和国家（Country）组合进行汇总
  - 相同关键词和国家的多次搜索合并显示为一条记录
- **显示内容**:
  - 搜索关键词（标签样式显示）
  - 国家/地区
  - 搜索次数（该关键词在该国家的搜索总次数）
  - 公司总数（该关键词在该国家找到的所有公司总数）
  - 首次搜索时间
  - 最后搜索时间
  - 操作按钮（查看详情、重新搜索）
- **排序规则**: 按最后搜索时间倒序（最新在前）
- **分页功能**: 支持分页展示历史记录

#### 2.7.2 历史记录详情（按需加载）
- **功能描述**: 查看某个关键词和国家的所有公司信息，支持按需加载和邮件管理
- **访问方式**: 通过 URL 参数传递关键词和国家（`/history/detail?keywords=xxx&country=xxx`）
- **显示内容**:
  - 页面标题和返回按钮
  - 搜索条件展示（关键词标签、国家名称）
  - 公司信息列表（按需分页加载，每页20条）
  - 邮件发送状态显示
  - 批量操作按钮（当有选中项时显示）
- **按需加载**:
  - 初始加载第一页数据（20条）
  - 支持分页浏览，点击页码加载对应页数据
  - 每页数据独立加载，不累积（类似搜索页面）
- **邮件状态显示**:
  - 已发送：绿色标签，显示"已发送"
  - 未发送：灰色标签，显示"未发送"
  - 发送失败：红色标签，显示"发送失败"
- **邮件发送功能**:
  - 单条发送：每行操作列显示发送邮件按钮（仅未发送状态显示）
  - 批量发送：选中多条未发送记录后，顶部显示批量发送按钮
  - 已发送的记录不能再次发送，复选框自动禁用
  - 发送成功后自动刷新列表，更新邮件状态
- **批量选择**:
  - 表头复选框：全选/取消全选所有未发送的公司
  - 行复选框：选择/取消选择单个公司（已发送的公司不可选）
  - 选中项数量显示在批量操作按钮上

#### 2.7.3 历史记录操作
- **查看详情**: 点击查看按钮，跳转到详情页面，显示该关键词和国家的所有公司
- **重新搜索**: 基于历史记录的条件重新执行搜索
- **清空历史**: 清空所有历史记录（需确认）

#### 2.7.4 历史记录统计
- **统计信息**:
  - 总搜索次数（所有搜索记录的总数）
  - 总找到公司数量（所有搜索找到的公司总数）
  - 最近搜索时间
  - 最常搜索的关键词（Top 5，显示关键词和搜索次数）

---

### 2.8 多语言支持模块

#### 2.8.1 支持语言
- **中文 (zh-CN)**: 简体中文
- **英文 (en-US)**: 英文

#### 2.8.2 语言切换
- **切换方式**: 
  - 页面顶部语言选择器（下拉菜单或按钮）
  - 用户选择后保存到 localStorage
  - 下次访问时自动使用上次选择的语言
- **默认语言**: 根据浏览器语言自动检测，默认中文

#### 2.8.3 多语言内容
- **需要翻译的内容**:
  - 所有页面文本（标题、按钮、提示信息等）
  - 表单标签和占位符
  - 错误提示信息
  - 成功提示信息
  - 表格列名
  - 邮件模板（支持中英文版本）
- **实现方式**:
  - 前端：使用 i18n 库（如 next-intl、react-i18next）
  - 后端：API 错误信息支持多语言返回
  - 翻译文件：JSON 格式存储翻译内容

#### 2.8.4 语言文件结构
```
locales/
├── zh-CN/
│   ├── common.json      # 通用文本
│   ├── auth.json        # 认证相关
│   ├── search.json      # 搜索相关
│   ├── company.json     # 公司相关
│   └── email.json       # 邮件相关
└── en-US/
    ├── common.json
    ├── auth.json
    ├── search.json
    ├── company.json
    └── email.json
```

---

## 3. 技术架构

### 3.1 系统架构图
```
┌─────────────────────────────────────────┐
│         Monorepo (pnpm workspace)       │
│                                         │
│  ┌─────────────────┐  ┌──────────────┐ │
│  │   Next.js 前端   │  │  NestJS 后端  │ │
│  │   (React/TS)    │  │  (Node.js)   │ │
│  │   apps/web      │  │  apps/api    │ │
│  └────────┬────────┘  └──────┬───────┘ │
│           │                   │         │
│           │  HTTP/REST API    │         │
│           └─────────┬─────────┘         │
│                     │                   │
│  ┌──────────────────┴──────────────┐   │
│  │      Shared Packages            │   │
│  │  - @company-search/types        │   │
│  │  - @company-search/utils        │   │
│  │  - @company-search/config       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    │         │          │          │
┌───▼───┐ ┌──▼───┐ ┌────▼────┐ ┌──▼────┐
│PostgreSQL│ │OpenAI│ │Nodemailer│ │ExcelJS│
│ Database │ │ API  │ │  Email   │ │Export │
└─────────┘ └──────┘ └──────────┘ └───────┘
```

### 3.1.1 Monorepo 架构说明
- **包管理工具**: pnpm (支持 workspace)
- **项目结构**: 
  - `apps/` - 应用程序（前端、后端）
  - `packages/` - 共享包（类型定义、工具函数、配置等）
- **优势**:
  - 代码共享和复用
  - 统一的依赖管理
  - 原子性提交
  - 统一的构建和测试流程

### 3.2 后端架构 (NestJS)

#### 3.2.1 模块结构
```
src/
├── auth/              # 认证模块
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── dto/
│   │   ├── register.dto.ts
│   │   └── login.dto.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── users/             # 用户模块
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   └── entities/
│       └── user.entity.ts
├── companies/         # 公司信息模块
│   ├── companies.controller.ts
│   ├── companies.service.ts
│   ├── companies.module.ts
│   ├── dto/
│   │   ├── search.dto.ts
│   │   └── company.dto.ts
│   └── entities/
│       └── company.entity.ts
├── search/            # 搜索模块
│   ├── search.controller.ts
│   ├── search.service.ts
│   ├── search.module.ts
│   └── openai.service.ts
├── email/             # 邮件模块
│   ├── email.controller.ts
│   ├── email.service.ts
│   ├── email.module.ts
│   └── templates/
│       └── email.template.ts
├── export/            # 导出模块
│   ├── export.controller.ts
│   ├── export.service.ts
│   └── export.module.ts
├── search-history/    # 搜索历史模块
│   ├── search-history.controller.ts
│   ├── search-history.service.ts
│   ├── search-history.module.ts
│   ├── dto/
│   │   └── search-history.dto.ts
│   └── entities/
│       └── search-history.entity.ts
├── i18n/              # 国际化模块
│   ├── i18n.module.ts
│   └── i18n.service.ts
├── common/            # 公共模块
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── public.decorator.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   └── interceptors/
│       └── transform.interceptor.ts
└── main.ts
```

#### 3.2.2 API 端点设计

**认证相关**
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/profile` - 获取当前用户信息

**公司搜索相关**
- `POST /api/companies/search` - 搜索公司
- `GET /api/companies` - 获取公司列表（支持分页、筛选）
- `GET /api/companies/:id` - 获取单个公司详情
- `DELETE /api/companies/:id` - 删除单个公司
- `DELETE /api/companies/batch` - 批量删除公司

**邮件相关**
- `POST /api/email/send` - 发送单个邮件
- `POST /api/email/batch-send` - 批量发送邮件
- `GET /api/email/template` - 获取邮件模板
- `PUT /api/email/template` - 更新邮件模板

**导出相关**
- `GET /api/export/excel` - 导出 Excel

**搜索历史相关**
- `GET /api/search-history` - 获取搜索历史列表（支持分页）
- `GET /api/search-history/:id` - 获取单条历史记录详情
- `GET /api/search-history/:id/companies` - 获取历史记录的公司列表
- `DELETE /api/search-history/:id` - 删除单条历史记录
- `DELETE /api/search-history/batch` - 批量删除历史记录
- `DELETE /api/search-history/clear` - 清空所有历史记录
- `GET /api/search-history/statistics` - 获取历史记录统计信息

---

### 3.3 前端架构 (Next.js)

#### 3.3.1 目录结构
```
app/                   # Next.js App Router
├── (auth)/            # 认证相关页面（路由组）
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (dashboard)/       # 主应用页面（路由组）
│   ├── layout.tsx
│   ├── search/
│   │   └── page.tsx
│   ├── companies/
│   │   └── page.tsx
│   └── history/
│       ├── page.tsx
│       └── [id]/
│           └── page.tsx
├── api/               # API Routes（如果需要）
└── layout.tsx

components/            # 组件
├── auth/
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── companies/
│   ├── CompanyTable.tsx
│   ├── CompanySearch.tsx
│   ├── CompanyFilters.tsx
│   └── CompanyPagination.tsx
├── email/
│   ├── EmailModal.tsx
│   └── BatchEmailButton.tsx
├── history/
│   ├── HistoryList.tsx
│   ├── HistoryItem.tsx
│   ├── HistoryDetail.tsx
│   └── HistoryStatistics.tsx
├── i18n/
│   ├── LanguageSwitcher.tsx
│   └── useTranslation.ts
├── common/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Loading.tsx
│   └── ProtectedRoute.tsx
└── layout/
    ├── Header.tsx
    ├── Sidebar.tsx
    └── Footer.tsx

lib/                   # 工具库
├── api/
│   ├── auth.ts
│   ├── companies.ts
│   ├── email.ts
│   ├── export.ts
│   └── search-history.ts
├── utils/
│   ├── format.ts
│   ├── validation.ts
│   └── auth.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useCompanies.ts
│   ├── usePagination.ts
│   └── useLanguage.ts
└── i18n/
    ├── config.ts
    └── messages/
        ├── zh-CN.json
        └── en-US.json

types/                 # TypeScript 类型定义
├── user.ts
├── company.ts
└── api.ts

styles/                # 样式文件
└── globals.css
```

#### 3.3.2 页面设计

**登录页面**
- 邮箱/用户名输入框
- 密码输入框
- 登录按钮
- 注册链接

**注册页面**
- 邮箱输入框
- 用户名输入框
- 密码输入框
- 确认密码输入框
- 注册按钮
- 登录链接

**搜索页面**
- 搜索表单（国家/地区选择、关键词输入）
- 搜索结果表格
- 分页控件
- 导出按钮
- 批量操作工具栏

**历史记录页面**
- 历史记录列表
- 统计信息卡片
- 筛选和搜索功能
- 分页控件
- 批量操作工具栏

**历史记录详情页面**
- 搜索条件展示
- 公司信息列表
- 导出功能

---

## 4. 数据库设计

### 4.1 用户表 (users)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID/INT | PRIMARY KEY | 用户ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 邮箱 |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| password | VARCHAR(255) | NOT NULL | 密码（加密） |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

### 4.2 公司信息表 (companies)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID/INT | PRIMARY KEY | 公司ID |
| company_name | VARCHAR(255) | NOT NULL | 公司名称 |
| phone | VARCHAR(50) | NULL | 电话 |
| email | VARCHAR(255) | NULL | 邮箱 |
| website | VARCHAR(255) | NULL | 网站地址 |
| country | VARCHAR(50) | NOT NULL | 国家/地区 |
| keywords | VARCHAR(255) | NOT NULL | 搜索关键词 |
| email_sent | BOOLEAN | DEFAULT FALSE | 是否已发送邮件 |
| email_sent_at | TIMESTAMP | NULL | 邮件发送时间 |
| email_status | VARCHAR(20) | DEFAULT 'not_sent' | 邮件状态（not_sent/sent/failed） |
| user_id | UUID/INT | FOREIGN KEY | 所属用户ID |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

**索引**:
- `idx_company_name` - 公司名称索引（用于去重）
- `idx_email` - 邮箱索引（用于去重）
- `idx_website` - 网站索引（用于去重）
- `idx_user_id` - 用户ID索引
- `idx_country` - 国家索引
- `idx_keywords` - 关键词索引
- `idx_created_at` - 创建时间索引（用于排序）

### 4.3 邮件发送记录表 (email_logs)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID/INT | PRIMARY KEY | 记录ID |
| company_id | UUID/INT | FOREIGN KEY | 公司ID |
| recipient_email | VARCHAR(255) | NOT NULL | 收件人邮箱 |
| subject | VARCHAR(255) | NOT NULL | 邮件主题 |
| content | TEXT | NOT NULL | 邮件内容 |
| status | VARCHAR(20) | NOT NULL | 发送状态（sent/failed） |
| error_message | TEXT | NULL | 错误信息 |
| sent_at | TIMESTAMP | NOT NULL | 发送时间 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |

### 4.4 邮件模板表 (email_templates)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID/INT | PRIMARY KEY | 模板ID |
| name | VARCHAR(100) | NOT NULL | 模板名称 |
| subject | VARCHAR(255) | NOT NULL | 邮件主题模板 |
| content | TEXT | NOT NULL | 邮件内容模板 |
| is_default | BOOLEAN | DEFAULT FALSE | 是否默认模板 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

### 4.5 搜索历史表 (search_history)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID/INT | PRIMARY KEY | 历史记录ID |
| user_id | UUID/INT | FOREIGN KEY | 用户ID |
| keywords | VARCHAR(255) | NOT NULL | 搜索关键词 |
| country | VARCHAR(50) | NOT NULL | 国家/地区 |
| result_count | INT | DEFAULT 0 | 搜索结果数量 |
| search_params | JSON | NULL | 搜索参数（JSON格式，便于扩展） |
| created_at | TIMESTAMP | NOT NULL | 搜索时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

**索引**:
- `idx_user_id` - 用户ID索引
- `idx_created_at` - 创建时间索引（用于排序）
- `idx_keywords` - 关键词索引
- `idx_country` - 国家索引

**关联关系**:
- 搜索历史与公司信息：通过 `companies` 表的 `search_history_id` 字段关联（可选，用于快速查询某次搜索的所有公司）

---

## 5. OpenAI API 集成

### 5.1 API 调用设计

**Prompt 模板**:
```
请搜索{country}地区与"{keywords}"相关的公司信息，返回以下格式的JSON数据：
{
  "companies": [
    {
      "companyName": "公司名称",
      "phone": "电话号码",
      "email": "邮箱地址",
      "website": "网站地址"
    }
  ]
}

要求：
1. 返回至少10家公司信息
2. 确保信息准确可靠
3. 如果某个字段无法获取，使用null表示
4. 只返回JSON数据，不要其他文字说明
```

**API 参数**:
- Model: `gpt-4` 或 `gpt-3.5-turbo`
- Temperature: 0.7
- Max Tokens: 2000

### 5.2 错误处理
- API 调用失败：重试机制（最多3次）
- 返回数据格式错误：记录错误日志，返回空结果
- 速率限制：实现请求队列和限流

---

## 6. 邮件服务设计

### 6.1 邮件配置
- SMTP 服务器配置
- 发件人邮箱和密码
- 邮件服务提供商：Gmail / SendGrid / AWS SES

### 6.2 邮件模板示例

**主题**: 商务合作咨询 - {companyName}

**内容**:
```
尊敬的 {companyName} 团队：

您好！

我是来自 [您的公司名称] 的 [您的姓名]，我们专注于 [业务领域]。

我们注意到贵公司在 {keywords} 领域有着卓越的表现，希望能够与贵公司建立合作关系。

我们提供的服务包括：
- [服务1]
- [服务2]
- [服务3]

期待您的回复，我们可以进一步讨论合作的可能性。

此致
敬礼！

[您的姓名]
[您的职位]
[您的公司名称]
[联系方式]
```

### 6.3 发送策略
- 单个发送：立即发送
- 批量发送：队列处理，避免触发邮件服务商的速率限制
- 发送间隔：每封邮件间隔1-2秒

---

## 7. 安全设计

### 7.1 认证安全
- 密码加密：使用 bcrypt 加密存储
- JWT Token：设置过期时间（如7天）
- Token 刷新机制

### 7.2 API 安全
- 请求限流：防止 API 滥用
- 输入验证：所有输入参数进行验证和清理
- SQL 注入防护：使用 ORM 参数化查询
- XSS 防护：前端输入转义

### 7.3 数据安全
- 用户数据隔离：每个用户只能访问自己的数据
- 敏感信息加密：邮箱、电话等敏感信息加密存储
- 操作日志：记录重要操作日志

---

## 8. 性能优化

### 8.1 前端优化
- 代码分割和懒加载
- 虚拟滚动（如果数据量大）
- 防抖和节流
- 缓存 API 响应

### 8.2 后端优化
- 数据库查询优化（索引、分页）
- Redis 缓存（用户会话、搜索结果）
- 异步处理（邮件发送、数据导出）
- API 响应压缩

---

## 9. 部署方案

### 9.1 开发环境
- 本地开发服务器
- 本地数据库
- 环境变量配置

### 9.2 生产环境
- 后端：部署到服务器（如 AWS EC2、DigitalOcean）
- 前端：部署到 Vercel / Netlify
- 数据库：云数据库服务（如 AWS RDS、PlanetScale）
- 反向代理：Nginx

### 9.3 项目结构
```
sunflower/
├── apps/
│   ├── api/              # NestJS 后端应用
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/              # Next.js 前端应用
│       ├── app/
│       ├── components/
│       ├── package.json
│       └── next.config.js
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
├── pnpm-workspace.yaml   # pnpm workspace 配置
├── package.json          # 根 package.json
├── pnpm-lock.yaml        # pnpm 锁文件
├── .gitignore
├── README.md
└── PRD.md
```

### 9.4 环境变量

**根目录 .env** (共享环境变量):
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/company_search

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
SMTP_FROM=noreply@companysearch.com
```

**apps/api/.env** (后端环境变量):
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**apps/web/.env.local** (前端环境变量):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 10. 开发计划

### 10.1 第一阶段：基础功能（1-2周）
- [ ] Monorepo 项目初始化（pnpm workspace）
- [ ] 创建共享包（types, utils, config）
- [ ] 初始化 NestJS 后端应用
- [ ] 初始化 Next.js 前端应用
- [ ] 数据库设计和创建
- [ ] 用户认证功能（注册、登录）
- [ ] 登录保护（路由守卫、API守卫）
- [ ] 多语言支持（i18n配置、语言切换）
- [ ] 基础页面布局

### 10.2 第二阶段：核心功能（2-3周）
- [ ] OpenAI API 集成
- [ ] 公司搜索功能
- [ ] 搜索结果展示和分页
- [ ] 数据去重逻辑
- [ ] 搜索历史记录功能
- [ ] 历史记录页面和详情页

### 10.3 第三阶段：扩展功能（1-2周）
- [ ] 邮件发送功能（单个和批量）
- [ ] 邮件模板管理
- [ ] Excel 导出功能
- [ ] 数据筛选和删除

### 10.4 第四阶段：优化和测试（1周）
- [ ] 性能优化
- [ ] 错误处理完善
- [ ] 单元测试和集成测试
- [ ] 用户体验优化

---

## 11. 测试计划

### 11.1 单元测试
- 服务层逻辑测试
- 工具函数测试
- 数据验证测试

### 11.2 集成测试
- API 端点测试
- 数据库操作测试
- 第三方服务集成测试

### 11.3 端到端测试
- 用户注册登录流程
- 搜索和展示流程
- 邮件发送流程

---

## 12. 后续扩展功能

### 12.1 功能扩展
- 支持更多国家/地区
- 支持更多搜索条件（行业、规模等）
- 公司信息详情页面
- 数据统计分析（图表展示）
- 邮件模板自定义（可视化编辑器）
- 定时任务（定时搜索、定时发送邮件）
- 更多语言支持（日语、韩语等）
- 深色模式支持

### 12.2 技术扩展
- 移动端适配（响应式设计优化）
- 实时通知（WebSocket）
- 数据可视化图表（ECharts / Chart.js）
- 单元测试覆盖率提升
- E2E 测试（Playwright / Cypress）
- 性能监控（APM工具）

---

## 13. 附录

### 13.1 技术选型说明

**NestJS**: 
- 企业级 Node.js 框架
- 支持 TypeScript
- 模块化架构
- 丰富的生态系统

**Next.js**:
- React 全栈框架
- 服务端渲染（SSR）
- 优秀的开发体验
- 自动代码分割

**PostgreSQL**:
- 强大的关系型数据库
- 支持复杂查询
- 数据完整性保证

### 13.2 参考资源
- NestJS 官方文档: https://docs.nestjs.com/
- Next.js 官方文档: https://nextjs.org/docs
- OpenAI API 文档: https://platform.openai.com/docs
- TypeORM 文档: https://typeorm.io/

---

**文档版本**: v1.1  
**创建日期**: 2024  
**最后更新**: 2024

## 更新日志

### v1.1 (2024)
- ✅ 新增登录保护功能说明
- ✅ 新增多语言支持（中文、英文）
- ✅ 新增搜索历史记录模块
- ✅ 更新数据库设计（新增搜索历史表）
- ✅ 更新API端点设计
- ✅ 更新前端架构设计
- ✅ 更新开发计划

### v1.0 (2024)
- 初始版本发布

