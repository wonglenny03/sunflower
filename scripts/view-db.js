#!/usr/bin/env node

/**
 * 快速查看数据库数据的脚本
 * 使用方法: node scripts/view-db.js
 */

const { Client } = require('pg')
const { execSync } = require('child_process')
require('dotenv').config({ path: './apps/api/.env' })

const DATABASE_URL = process.env.DATABASE_URL

// 检查是否使用 Docker
let useDocker = false
try {
  const dockerCheck = execSync('docker ps | grep "postgres.*5432"', { encoding: 'utf-8', stdio: 'pipe' })
  if (dockerCheck.trim()) {
    useDocker = true
  }
} catch (e) {
  // Docker 不可用或容器未运行
}

if (!DATABASE_URL && !useDocker) {
  console.error('❌ DATABASE_URL not found in environment variables')
  console.error('Please set DATABASE_URL in apps/api/.env')
  process.exit(1)
}

// 如果使用 Docker，使用默认连接
const connectionString = useDocker 
  ? 'postgresql://postgres:postgres@localhost:5432/company_search'
  : DATABASE_URL

const client = new Client({
  connectionString: connectionString,
})

async function viewDatabase() {
  try {
    await client.connect()
    console.log('✅ Connected to database\n')

    // 查看用户数量
    const userCount = await client.query('SELECT COUNT(*) FROM users')
    console.log(`👥 Users: ${userCount.rows[0].count}`)

    // 查看公司数量
    const companyCount = await client.query('SELECT COUNT(*) FROM companies')
    console.log(`🏢 Companies: ${companyCount.rows[0].count}`)

    // 查看搜索历史数量
    const historyCount = await client.query('SELECT COUNT(*) FROM search_history')
    console.log(`📊 Search History: ${historyCount.rows[0].count}\n`)

    // 查看最近的用户
    console.log('📋 Recent Users:')
    const recentUsers = await client.query(
      'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    )
    if (recentUsers.rows.length > 0) {
      recentUsers.rows.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.username} (${user.email}) - ${user.created_at}`)
      })
    } else {
      console.log('  No users found')
    }

    // 查看最近的公司
    console.log('\n📋 Recent Companies:')
    const recentCompanies = await client.query(
      'SELECT id, company_name, country, keywords, created_at FROM companies ORDER BY created_at DESC LIMIT 5'
    )
    if (recentCompanies.rows.length > 0) {
      recentCompanies.rows.forEach((company, index) => {
        console.log(
          `  ${index + 1}. ${company.company_name} (${company.country}) - ${company.keywords}`
        )
      })
    } else {
      console.log('  No companies found')
    }

    // 查看最近的搜索历史
    console.log('\n📋 Recent Search History:')
    const recentHistory = await client.query(
      'SELECT id, keywords, country, result_count, created_at FROM search_history ORDER BY created_at DESC LIMIT 5'
    )
    if (recentHistory.rows.length > 0) {
      recentHistory.rows.forEach((history, index) => {
        console.log(
          `  ${index + 1}. "${history.keywords}" in ${history.country} - ${history.result_count} results`
        )
      })
    } else {
      console.log('  No search history found')
    }

    // 邮件发送统计
    console.log('\n📧 Email Status:')
    const emailStats = await client.query(
      'SELECT email_status, COUNT(*) as count FROM companies GROUP BY email_status'
    )
    emailStats.rows.forEach((stat) => {
      console.log(`  ${stat.email_status}: ${stat.count}`)
    })

    console.log('\n✅ Database view completed')
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure PostgreSQL is running:')
      console.error('   brew services start postgresql  # Mac')
      console.error('   sudo systemctl start postgresql # Linux')
    }
    if (error.code === '3D000') {
      console.error('\n💡 Database does not exist. Create it first:')
      console.error('   createdb company_search')
    }
  } finally {
    await client.end()
  }
}

viewDatabase()

