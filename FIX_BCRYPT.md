# 修复 bcrypt 问题

如果遇到 bcrypt 模块找不到的错误，使用以下方法修复：

## 方法 1: 手动重建 bcrypt（推荐）

```bash
# 找到 bcrypt 目录
BCrypt_DIR=$(find node_modules/.pnpm -path "*/bcrypt@*/node_modules/bcrypt" -type d | head -1)

# 进入目录并重建
cd "$BCrypt_DIR"
npm rebuild
```

## 方法 2: 配置 pnpm 允许构建脚本

在项目根目录创建或编辑 `.npmrc` 文件：

```
enable-pre-post-scripts=true
shamefully-hoist=true
ignore-scripts=false
```

然后重新安装：

```bash
pnpm install --ignore-scripts=false
```

## 方法 3: 使用 pnpm approve-builds

```bash
pnpm approve-builds bcrypt
```

然后重新安装 bcrypt：

```bash
pnpm install bcrypt --force
```

## 验证修复

```bash
node -e "require('bcrypt')"
```

如果没有任何错误输出，说明修复成功。

