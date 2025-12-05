#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo "=================================================="
echo "  Company Search System - Development Server"
echo "=================================================="
echo ""

# Function to check if port is in use
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}Killing process $pid on port $port...${NC}"
        kill -9 $pid 2>/dev/null
        sleep 1
    fi
}

# Check ports
echo -e "${CYAN}🔍 Checking ports...${NC}"
API_PORT=3001
WEB_PORT=3000

if check_port $API_PORT || check_port $WEB_PORT; then
    echo -e "${YELLOW}⚠️  Port conflict detected!${NC}"
    if check_port $API_PORT; then
        echo -e "${YELLOW}Port $API_PORT is in use${NC}"
    fi
    if check_port $WEB_PORT; then
        echo -e "${YELLOW}Port $WEB_PORT is in use${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}Attempting to free ports...${NC}"
    kill_port $API_PORT
    kill_port $WEB_PORT
else
    echo -e "${GREEN}✅ Ports are available${NC}"
fi

# Check dependencies
echo ""
echo -e "${CYAN}📦 Checking dependencies...${NC}"
if [ ! -d "node_modules" ] || [ ! -d "apps/api/node_modules" ] || [ ! -d "apps/web/node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    echo -e "${YELLOW}This may take a few minutes...${NC}"
    pnpm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"
else
    echo -e "${GREEN}✅ All dependencies are installed${NC}"
fi

# Build shared packages
echo ""
echo -e "${CYAN}🔨 Building shared packages...${NC}"
pnpm --filter './packages/*' build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Packages built successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Package build failed, but continuing...${NC}"
fi

# Start services
echo ""
echo -e "${CYAN}🚀 Starting services...${NC}"
echo -e "${BLUE}Backend: http://localhost:3001${NC}"
echo -e "${BLUE}Frontend: http://localhost:3000${NC}"
echo -e "${BLUE}API Docs: http://localhost:3001/api/docs${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Trap Ctrl+C
trap 'echo ""; echo -e "${YELLOW}🛑 Stopping services...${NC}"; kill 0; exit' INT TERM

# Start API and Web in background
pnpm --filter '@company-search/api' dev &
API_PID=$!

pnpm --filter '@company-search/web' dev &
WEB_PID=$!

# Wait for processes
wait $API_PID $WEB_PID

