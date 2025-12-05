#!/usr/bin/env node

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../apps/api/.env') })

async function resetDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    console.log('✅ 已连接到数据库')

    // 清空所有表（按依赖顺序）
    console.log('正在清空表数据...')
    
    await client.query('TRUNCATE TABLE companies CASCADE')
    console.log('✅ 已清空 companies 表')
    
    await client.query('TRUNCATE TABLE search_history CASCADE')
    console.log('✅ 已清空 search_history 表')
    
    await client.query('TRUNCATE TABLE email_logs CASCADE')
    console.log('✅ 已清空 email_logs 表')
    
    // 注意：users 表保留，因为需要登录
    // await client.query('TRUNCATE TABLE users CASCADE')
    // console.log('✅ 已清空 users 表')

    console.log('')
    console.log('✅ 数据库重置完成！')
    console.log('注意：用户表保留，但所有搜索记录和公司数据已清空')
  } catch (error) {
    console.error('❌ 数据库重置失败:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

resetDatabase()


