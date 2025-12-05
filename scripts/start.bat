@echo off
setlocal enabledelayedexpansion

echo.
echo ==================================================
echo   Company Search System - Development Server
echo ==================================================
echo.

REM Check if pnpm is installed
where pnpm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] pnpm is not installed. Please install it first:
    echo npm install -g pnpm
    exit /b 1
)

REM Function to check if port is in use
:check_port
set port=%1
netstat -ano | findstr :%port% >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [WARN] Port %port% is in use
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%port% ^| findstr LISTENING') do (
        echo Killing process %%a on port %port%...
        taskkill /PID %%a /F >nul 2>&1
    )
    timeout /t 1 /nobreak >nul
) else (
    echo [OK] Port %port% is available
)
goto :eof

REM Check ports
echo [INFO] Checking ports...
call :check_port 3001
call :check_port 3000

REM Check dependencies
echo.
echo [INFO] Checking dependencies...
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    echo This may take a few minutes...
    call pnpm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies
        exit /b 1
    )
    echo [OK] Dependencies installed successfully!
) else (
    echo [OK] Dependencies are installed
)

REM Build shared packages
echo.
echo [INFO] Building shared packages...
call pnpm --filter "./packages/*" build
if %ERRORLEVEL% EQU 0 (
    echo [OK] Packages built successfully!
) else (
    echo [WARN] Package build failed, but continuing...
)

REM Start services
echo.
echo [INFO] Starting services...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:3001/api/docs
echo.
echo Press Ctrl+C to stop all services
echo.

REM Start API in background
start "Company Search API" cmd /k "pnpm --filter @company-search/api dev"

REM Start Web in background
start "Company Search Web" cmd /k "pnpm --filter @company-search/web dev"

echo.
echo [INFO] Services started in separate windows
echo Close the windows or press Ctrl+C here to stop
pause

