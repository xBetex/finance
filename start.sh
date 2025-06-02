#!/bin/bash

# Financial Dashboard Startup Script
# Compatible with Linux Mint and other Ubuntu-based distributions

echo "🚀 Iniciando Financial Dashboard..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Python dependencies
install_python_deps() {
    echo -e "${BLUE}📦 Instalando dependências do Python...${NC}"
    cd backend
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}🔧 Criando ambiente virtual Python...${NC}"
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    pip install -r requirements.txt
    
    echo -e "${GREEN}✅ Dependências do Python instaladas!${NC}"
    cd ..
}

# Function to install Node.js dependencies
install_node_deps() {
    echo -e "${BLUE}📦 Instalando dependências do Node.js...${NC}"
    cd frontend
    
    # Install dependencies
    npm install
    
    echo -e "${GREEN}✅ Dependências do Node.js instaladas!${NC}"
    cd ..
}

# Function to start backend
start_backend() {
    echo -e "${BLUE}🐍 Iniciando backend Python...${NC}"
    cd backend
    source venv/bin/activate
    python main.py &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend iniciado (PID: $BACKEND_PID)${NC}"
    cd ..
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}⚛️  Iniciando frontend React...${NC}"
    cd frontend
    npm start &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend iniciado (PID: $FRONTEND_PID)${NC}"
    cd ..
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Parando serviços...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Backend parado${NC}"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Frontend parado${NC}"
    fi
    echo -e "${GREEN}👋 Financial Dashboard finalizado!${NC}"
    exit 0
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    echo -e "${GREEN}💰 Financial Dashboard - Startup Script${NC}"
    echo -e "${BLUE}Compatible with Linux Mint and Ubuntu-based systems${NC}\n"
    
    # Check prerequisites
    echo -e "${BLUE}🔍 Verificando pré-requisitos...${NC}"
    
    if ! command_exists python3; then
        echo -e "${RED}❌ Python 3 não encontrado. Instale com: sudo apt install python3${NC}"
        exit 1
    fi
    
    if ! command_exists pip; then
        echo -e "${RED}❌ pip não encontrado. Instale com: sudo apt install python3-pip${NC}"
        exit 1
    fi
    
    if ! command_exists node; then
        echo -e "${RED}❌ Node.js não encontrado. Instale com: sudo apt install nodejs${NC}"
        exit 1
    fi
    
    if ! command_exists npm; then
        echo -e "${RED}❌ npm não encontrado. Instale com: sudo apt install npm${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Todos os pré-requisitos atendidos!${NC}\n"
    
    # Install dependencies if needed
    if [ ! -d "backend/venv" ] || [ ! -d "frontend/node_modules" ]; then
        echo -e "${YELLOW}🔧 Primeira execução detectada. Instalando dependências...${NC}"
        
        if [ ! -d "backend/venv" ]; then
            install_python_deps
        fi
        
        if [ ! -d "frontend/node_modules" ]; then
            install_node_deps
        fi
        
        echo -e "${GREEN}✅ Instalação concluída!${NC}\n"
    fi
    
    # Start services
    echo -e "${BLUE}🚀 Iniciando serviços...${NC}"
    start_backend
    sleep 3  # Wait for backend to start
    start_frontend
    
    echo -e "\n${GREEN}🎉 Financial Dashboard está rodando!${NC}"
    echo -e "${BLUE}📊 Frontend: http://localhost:3000${NC}"
    echo -e "${BLUE}🔧 Backend API: http://localhost:8000${NC}"
    echo -e "${BLUE}📚 API Docs: http://localhost:8000/docs${NC}"
    echo -e "\n${YELLOW}Pressione Ctrl+C para parar todos os serviços${NC}\n"
    
    # Wait for user to stop
    wait
}

# Run main function
main 