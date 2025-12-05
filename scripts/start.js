#!/usr/bin/env node

const { spawn, exec } = require('child_process')
const { promisify } = require('util')
const fs = require('fs')
const path = require('path')

const execAsync = promisify(exec)

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Check if port is in use (cross-platform)
async function checkPort(port) {
  const isWindows = process.platform === 'win32'
  
  try {
    if (isWindows) {
      // Windows: use netstat
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`)
      if (stdout) {
        // Extract PID from netstat output
        const lines = stdout.split('\n').filter(line => line.includes('LISTENING'))
        if (lines.length > 0) {
          const parts = lines[0].trim().split(/\s+/)
          return parts[parts.length - 1]
        }
      }
      return null
    } else {
      // Unix/Linux/Mac: use lsof
      const { stdout } = await execAsync(`lsof -ti:${port}`)
      return stdout.trim() || null
    }
  } catch (error) {
    return null
  }
}

// Kill process on port (cross-platform)
async function killPort(port) {
  const isWindows = process.platform === 'win32'
  
  try {
    const pid = await checkPort(port)
    if (pid) {
      log(`Killing process ${pid} on port ${port}...`, 'yellow')
      
      if (isWindows) {
        await execAsync(`taskkill /PID ${pid} /F`)
      } else {
        await execAsync(`kill -9 ${pid}`)
      }
      
      // Wait a bit for port to be released
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return true
    }
    return false
  } catch (error) {
    log(`Error killing port ${port}: ${error.message}`, 'red')
    return false
  }
}

// Check if node_modules exists
function checkDependencies() {
  const apiNodeModules = path.join(__dirname, '../apps/api/node_modules')
  const webNodeModules = path.join(__dirname, '../apps/web/node_modules')
  const rootNodeModules = path.join(__dirname, '../node_modules')

  return {
    root: fs.existsSync(rootNodeModules),
    api: fs.existsSync(apiNodeModules),
    web: fs.existsSync(webNodeModules),
  }
}

// Install dependencies
async function installDependencies() {
  log('\n📦 Checking dependencies...', 'cyan')
  const deps = checkDependencies()

  if (!deps.root || !deps.api || !deps.web) {
    log('Installing dependencies...', 'yellow')
    log('This may take a few minutes...', 'yellow')
    
    return new Promise((resolve, reject) => {
      const install = spawn('pnpm', ['install'], {
        stdio: 'inherit',
        shell: true,
        cwd: path.join(__dirname, '..'),
      })

      install.on('close', (code) => {
        if (code === 0) {
          log('✅ Dependencies installed successfully!', 'green')
          resolve()
        } else {
          log('❌ Failed to install dependencies', 'red')
          reject(new Error(`Installation failed with code ${code}`))
        }
      })
    })
  } else {
    log('✅ All dependencies are installed', 'green')
  }
}

// Build shared packages
async function buildPackages() {
  log('\n🔨 Building shared packages...', 'cyan')
  
  return new Promise((resolve, reject) => {
    const build = spawn('pnpm', ['--filter', './packages/*', 'build'], {
      stdio: 'inherit',
      shell: true,
      cwd: path.join(__dirname, '..'),
    })

    build.on('close', (code) => {
      if (code === 0) {
        log('✅ Packages built successfully!', 'green')
        resolve()
      } else {
        log('⚠️  Package build failed, but continuing...', 'yellow')
        resolve() // Continue even if build fails
      }
    })
  })
}

// Start services
async function startServices() {
  log('\n🚀 Starting services...', 'cyan')
  log('Backend: http://localhost:3001', 'blue')
  log('Frontend: http://localhost:3000', 'blue')
  log('API Docs: http://localhost:3001/api/docs', 'blue')
  log('\nPress Ctrl+C to stop all services\n', 'yellow')

  const apiProcess = spawn('pnpm', ['--filter', '@company-search/api', 'dev'], {
    stdio: 'pipe',
    shell: true,
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      FORCE_COLOR: '1',
    },
  })

  const webProcess = spawn('pnpm', ['--filter', '@company-search/web', 'dev'], {
    stdio: 'pipe',
    shell: true,
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      FORCE_COLOR: '1',
    },
  })

  // Color code output
  apiProcess.stdout.on('data', (data) => {
    process.stdout.write(`${colors.blue}[API]${colors.reset} ${data}`)
  })

  apiProcess.stderr.on('data', (data) => {
    process.stderr.write(`${colors.red}[API]${colors.reset} ${data}`)
  })

  webProcess.stdout.on('data', (data) => {
    process.stdout.write(`${colors.green}[WEB]${colors.reset} ${data}`)
  })

  webProcess.stderr.on('data', (data) => {
    process.stderr.write(`${colors.red}[WEB]${colors.reset} ${data}`)
  })

  // Handle process exit
  const cleanup = () => {
    log('\n\n🛑 Stopping services...', 'yellow')
    apiProcess.kill()
    webProcess.kill()
    process.exit(0)
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)

  apiProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      log(`\n❌ API process exited with code ${code}`, 'red')
    }
  })

  webProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      log(`\n❌ Web process exited with code ${code}`, 'red')
    }
  })
}

// Main function
async function main() {
  log('\n' + '='.repeat(50), 'bright')
  log('  Company Search System - Development Server', 'bright')
  log('='.repeat(50) + '\n', 'bright')

  // Check and handle port conflicts
  log('🔍 Checking ports...', 'cyan')
  const apiPort = 3001
  const webPort = 3000

  const apiPortInUse = await checkPort(apiPort)
  const webPortInUse = await checkPort(webPort)

  if (apiPortInUse || webPortInUse) {
    log('\n⚠️  Port conflict detected!', 'yellow')
    if (apiPortInUse) {
      log(`Port ${apiPort} is in use (PID: ${apiPortInUse})`, 'yellow')
    }
    if (webPortInUse) {
      log(`Port ${webPort} is in use (PID: ${webPortInUse})`, 'yellow')
    }

    // Auto-kill processes (can be made interactive if needed)
    log('\nAttempting to free ports...', 'yellow')
    if (apiPortInUse) await killPort(apiPort)
    if (webPortInUse) await killPort(webPort)
  } else {
    log('✅ Ports are available', 'green')
  }

  // Check and install dependencies
  await installDependencies()

  // Build shared packages
  await buildPackages()

  // Start services
  await startServices()
}

// Run main function
main().catch((error) => {
  log(`\n❌ Error: ${error.message}`, 'red')
  process.exit(1)
})

