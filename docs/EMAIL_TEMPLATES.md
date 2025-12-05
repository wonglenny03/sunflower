# 邮件模板管理功能

## 概述

邮件模板管理功能允许用户创建、编辑、选择和管理邮件模板，用于批量发送商务邮件。

## 功能特性

1. **模板创建**：创建自定义邮件模板
2. **模板编辑**：编辑现有模板
3. **模板选择**：发送邮件时选择使用的模板
4. **默认模板**：设置默认模板，发送邮件时自动使用
5. **模板变量**：支持在模板中使用变量，自动替换为公司信息

## API 端点

### 邮件模板管理

#### 1. 创建模板
```
POST /email-templates
```

**请求体**:
```json
{
  "name": "模板名称",
  "subject": "邮件主题 - {{companyName}}",
  "content": "<html>邮件内容HTML</html>",
  "isDefault": false
}
```

#### 2. 获取所有模板
```
GET /email-templates
```

#### 3. 获取默认模板
```
GET /email-templates/default
```

#### 4. 获取单个模板
```
GET /email-templates/:id
```

#### 5. 更新模板
```
PUT /email-templates/:id
```

**请求体**:
```json
{
  "name": "更新后的模板名称",
  "subject": "更新后的主题",
  "content": "更新后的内容",
  "isDefault": true
}
```

#### 6. 设置默认模板
```
PUT /email-templates/:id/set-default
```

#### 7. 删除模板
```
DELETE /email-templates/:id
```

#### 8. 初始化默认模板
```
POST /email-templates/init-defaults
```

首次使用时调用此端点，系统会为用户创建默认的 Global Headhunters 模板。

### 发送邮件（支持模板）

#### 发送单个邮件
```
POST /email/send
```

**请求体**:
```json
{
  "companyId": "公司ID",
  "templateId": "模板ID（可选）",
  "customSubject": "自定义主题（可选）",
  "customContent": "自定义内容（可选）"
}
```

**优先级**:
1. 如果提供了 `customSubject` 和 `customContent`，使用自定义内容
2. 如果提供了 `templateId`，使用指定模板
3. 如果用户有默认模板，使用默认模板
4. 否则使用系统默认模板

#### 批量发送邮件
```
POST /email/batch-send
```

**请求体**:
```json
{
  "companyIds": ["公司ID1", "公司ID2"],
  "templateId": "模板ID（可选）"
}
```

## 模板变量

在模板的主题和内容中，可以使用以下变量：

- `{{companyName}}` - 公司名称
- `{{keywords}}` - 关键词
- `{{email}}` - 邮箱
- `{{phone}}` - 电话
- `{{website}}` - 网站
- `{{country}}` - 国家

**示例**:
```html
<p>尊敬的 {{companyName}} 团队：</p>
<p>我们注意到贵公司在 {{keywords}} 领域有着卓越的表现。</p>
```

## 默认模板

系统提供了一个基于 Global Headhunters 邮件的默认模板，包含：

- 专业的 HTML 格式
- 完整的邮件结构
- 签名信息

首次使用模板功能时，调用 `POST /email-templates/init-defaults` 即可创建默认模板。

## 使用示例

### 1. 初始化默认模板

```bash
curl -X POST http://localhost:3000/api/email-templates/init-defaults \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. 创建自定义模板

```bash
curl -X POST http://localhost:3000/api/email-templates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "我的商务邮件模板",
    "subject": "商务合作咨询 - {{companyName}}",
    "content": "<html><body><p>尊敬的 {{companyName}} 团队...</p></body></html>",
    "isDefault": true
  }'
```

### 3. 使用模板发送邮件

```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "company-uuid",
    "templateId": "template-uuid"
  }'
```

### 4. 批量发送邮件（使用模板）

```bash
curl -X POST http://localhost:3000/api/email/batch-send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyIds": ["company-uuid-1", "company-uuid-2"],
    "templateId": "template-uuid"
  }'
```

## 数据库表结构

### email_templates 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(255) | 模板名称 |
| subject | VARCHAR(500) | 邮件主题 |
| content | TEXT | 邮件内容（HTML） |
| isDefault | BOOLEAN | 是否为默认模板 |
| userId | UUID | 用户ID（外键） |
| createdAt | TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | 更新时间 |

## 注意事项

1. **用户隔离**：每个用户只能访问和管理自己的模板
2. **默认模板唯一性**：每个用户只能有一个默认模板，设置新的默认模板会自动取消旧的
3. **模板变量**：变量使用双大括号格式 `{{variableName}}`
4. **HTML 格式**：模板内容必须是有效的 HTML
5. **测试模式**：当前系统处于测试模式，所有邮件都会发送到测试邮箱

## 未来改进

- [ ] 模板预览功能
- [ ] 模板导入/导出
- [ ] 模板分类和标签
- [ ] 模板使用统计
- [ ] 富文本编辑器支持

