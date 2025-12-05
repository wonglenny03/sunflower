#!/bin/bash

echo "⚠️  警告：此操作将清空所有数据库表！"
echo "按 Ctrl+C 取消，或按 Enter 继续..."
read

echo "正在连接数据库..."

# 从环境变量获取数据库连接信息
if [ -f "apps/api/.env" ]; then
  source apps/api/.env
fi

# 使用 psql 连接数据库并清空表
if command -v psql &> /dev/null; then
  if [ -n "$DATABASE_URL" ]; then
    echo "使用 DATABASE_URL 连接数据库..."
    psql "$DATABASE_URL" <<EOF
-- 清空所有表数据
TRUNCATE TABLE companies CASCADE;
TRUNCATE TABLE search_history CASCADE;
TRUNCATE TABLE email_logs CASCADE;
TRUNCATE TABLE users CASCADE;

-- 重置序列（如果使用自增ID）
-- ALTER SEQUENCE companies_id_seq RESTART WITH 1;
-- ALTER SEQUENCE search_history_id_seq RESTART WITH 1;

SELECT '数据库已清空！' as status;
EOF
    echo "✅ 数据库表已清空！"
  else
    echo "❌ 未找到 DATABASE_URL 环境变量"
    echo "请确保 apps/api/.env 文件存在并包含 DATABASE_URL"
    exit 1
  fi
else
  echo "❌ 未找到 psql 命令"
  echo "请安装 PostgreSQL 客户端工具"
  exit 1
fi

echo ""
echo "✅ 数据库重置完成！"
echo "注意：用户表也被清空了，需要重新注册用户"


