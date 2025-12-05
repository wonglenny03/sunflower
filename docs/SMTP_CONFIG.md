# SMTP 邮件配置指南

## 概述

本项目使用 `nodemailer` 发送邮件，支持所有标准的 SMTP 服务器。

## 配置步骤

### 1. 创建或编辑环境变量文件

在 `apps/api/` 目录下创建或编辑 `.env` 文件：

```bash
cd apps/api
touch .env  # 如果文件不存在
```

### 2. 添加 SMTP 配置

在 `.env` 文件中添加以下环境变量：

```env
# SMTP 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

## 常用邮件服务商配置

### Gmail（推荐用于测试）

**配置步骤**：

1. **启用两步验证**：
   - 访问 https://myaccount.google.com/security
   - 启用"两步验证"

2. **生成应用专用密码**：
   - 访问 https://myaccount.google.com/apppasswords
   - 选择"邮件"和"其他（自定义名称）"
   - 输入应用名称（如：Company Search）
   - 复制生成的 16 位密码

3. **配置 .env**：
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # 16位应用专用密码（去掉空格）
SMTP_FROM=your-email@gmail.com
```

**注意**：
- 不能使用普通密码，必须使用应用专用密码
- 如果使用企业 Gmail，可能需要管理员授权

### Outlook / Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=your-email@outlook.com
```

### 163 邮箱

```env
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_USER=your-email@163.com
SMTP_PASS=your-authorization-code  # 需要开启SMTP服务并获取授权码
SMTP_FROM=your-email@163.com
```

**注意**：163 邮箱需要使用授权码，不是登录密码。获取方式：
1. 登录 163 邮箱
2. 设置 → POP3/SMTP/IMAP
3. 开启 SMTP 服务
4. 获取授权码

### QQ 邮箱

```env
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_USER=your-email@qq.com
SMTP_PASS=your-authorization-code  # 需要开启SMTP服务并获取授权码
SMTP_FROM=your-email@qq.com
```

**获取授权码**：
1. 登录 QQ 邮箱
2. 设置 → 账户
3. 开启"POP3/SMTP服务"
4. 获取授权码

### 企业邮箱（通用）

```env
SMTP_HOST=smtp.yourdomain.com  # 替换为你的企业邮箱SMTP服务器
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
SMTP_FROM=noreply@yourdomain.com
```

### SendGrid（推荐用于生产环境）

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com
```

### AWS SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com  # 根据你的区域调整
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@yourdomain.com
```

## 端口说明

- **587**：STARTTLS（推荐，当前配置）
- **465**：SSL/TLS（需要设置 `secure: true`）
- **25**：通常被 ISP 阻止，不推荐

## 安全配置

### 使用 SSL/TLS（端口 465）

如果需要使用 SSL/TLS（端口 465），需要修改 `email.service.ts`：

```typescript
this.transporter = nodemailer.createTransport({
  host: this.configService.get<string>('SMTP_HOST'),
  port: 465,
  secure: true,  // 改为 true
  auth: {
    user: this.configService.get<string>('SMTP_USER'),
    pass: this.configService.get<string>('SMTP_PASS'),
  },
})
```

## 测试配置

### 方法 1：使用项目测试功能

1. 配置好 `.env` 文件
2. 启动后端服务：`pnpm dev:api`
3. 在前端页面发送测试邮件
4. 检查测试邮箱 `wonglenny03@gmail.com` 是否收到邮件

### 方法 2：使用 Node.js 脚本测试

创建测试脚本 `test-smtp.js`：

```javascript
const nodemailer = require('nodemailer');
require('dotenv').config({ path: './apps/api/.env' });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function test() {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: 'wonglenny03@gmail.com',
      subject: 'SMTP 配置测试',
      html: '<p>这是一封测试邮件，如果您收到此邮件，说明 SMTP 配置成功！</p>',
    });
    console.log('✅ 邮件发送成功！', info.messageId);
  } catch (error) {
    console.error('❌ 邮件发送失败：', error.message);
  }
}

test();
```

运行测试：
```bash
cd apps/api
node test-smtp.js
```

## 常见问题

### 1. Gmail 提示"不允许使用安全性较低的应用"

**解决方案**：
- 使用应用专用密码（推荐）
- 或者启用"允许不够安全的应用"（不推荐，已废弃）

### 2. 连接超时

**可能原因**：
- 防火墙阻止了端口 587
- SMTP 服务器地址错误
- 网络连接问题

**解决方案**：
- 检查防火墙设置
- 确认 SMTP 服务器地址正确
- 尝试使用端口 465（SSL）

### 3. 认证失败

**可能原因**：
- 用户名或密码错误
- 需要使用应用专用密码（Gmail）
- 需要使用授权码（163/QQ）

**解决方案**：
- 确认用户名和密码正确
- 检查是否需要特殊密码格式

### 4. 邮件进入垃圾箱

**解决方案**：
- 配置 SPF、DKIM、DMARC 记录（生产环境）
- 使用专业的邮件服务（SendGrid、AWS SES）
- 避免发送大量邮件

## 生产环境建议

1. **使用专业邮件服务**：
   - SendGrid（推荐）
   - AWS SES
   - Mailgun
   - Postmark

2. **配置域名验证**：
   - 设置 SPF 记录
   - 配置 DKIM
   - 设置 DMARC

3. **监控邮件发送**：
   - 记录发送日志
   - 监控发送成功率
   - 设置告警

## 参考链接

- [Nodemailer 文档](https://nodemailer.com/about/)
- [Gmail 应用专用密码](https://support.google.com/accounts/answer/185833)
- [SendGrid 文档](https://docs.sendgrid.com/)
- [AWS SES 文档](https://docs.aws.amazon.com/ses/)

