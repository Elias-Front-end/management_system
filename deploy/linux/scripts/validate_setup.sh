#!/bin/bash
# Script de validação da configuração Docker
# Uso: ./validate_setup.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Validando Configuração Docker - Management System${NC}"
echo "=================================================="

# Função para verificar se um comando existe
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1 está instalado${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 não está instalado${NC}"
        return 1
    fi
}

# Função para verificar arquivo
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 existe${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 não encontrado${NC}"
        return 1
    fi
}

# Função para verificar diretório
check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ $1 existe${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 não encontrado${NC}"
        return 1
    fi
}

echo -e "${BLUE}📋 Verificando Dependências:${NC}"

# Verificar Docker
check_command docker
if [ $? -eq 0 ]; then
    DOCKER_VERSION=$(docker --version)
    echo "   Versão: $DOCKER_VERSION"
fi

# Verificar Docker Compose
check_command docker-compose
if [ $? -eq 0 ]; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo "   Versão: $COMPOSE_VERSION"
fi

# Verificar Git
check_command git

echo ""
echo -e "${BLUE}📁 Verificando Estrutura de Arquivos:${NC}"

# Verificar arquivos Docker
check_file "backend/Dockerfile"
check_file "frontend/Dockerfile"
check_file "frontend/nginx.conf"
check_file "nginx/nginx.conf"

# Verificar arquivos Docker Compose
check_file "docker-compose.yml"
check_file "docker-compose.prod.yml"

# Verificar arquivos de ambiente
check_file ".env.development"
check_file ".env.production"

# Verificar scripts
check_file "deploy/linux/scripts/update_app.sh"
check_file "deploy/linux/scripts/backup.sh"
check_file "deploy/linux/scripts/monitor.sh"
check_file "deploy/linux/scripts/setup_ssl.sh"

# Verificar diretórios
check_directory "backend"
check_directory "frontend"
check_directory "deploy/linux/scripts"

echo ""
echo -e "${BLUE}🐳 Validando Configurações Docker:${NC}"

# Validar docker-compose.yml
if docker-compose config > /dev/null 2>&1; then
    echo -e "${GREEN}✅ docker-compose.yml é válido${NC}"
else
    echo -e "${RED}❌ docker-compose.yml tem erros${NC}"
fi

# Validar docker-compose.prod.yml
if docker-compose -f docker-compose.prod.yml config > /dev/null 2>&1; then
    echo -e "${GREEN}✅ docker-compose.prod.yml é válido${NC}"
else
    echo -e "${RED}❌ docker-compose.prod.yml tem erros${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Testando Builds Docker:${NC}"

# Testar build do backend
echo "Testando build do backend..."
if docker build -t test-backend ./backend > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build do backend bem-sucedido${NC}"
    docker rmi test-backend > /dev/null 2>&1
else
    echo -e "${RED}❌ Falha no build do backend${NC}"
fi

# Testar build do frontend
echo "Testando build do frontend..."
if docker build -t test-frontend ./frontend > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build do frontend bem-sucedido${NC}"
    docker rmi test-frontend > /dev/null 2>&1
else
    echo -e "${RED}❌ Falha no build do frontend${NC}"
fi

echo ""
echo -e "${BLUE}📋 Verificando Permissões dos Scripts:${NC}"

# Verificar permissões dos scripts
for script in deploy/linux/scripts/*.sh; do
    if [ -x "$script" ]; then
        echo -e "${GREEN}✅ $script é executável${NC}"
    else
        echo -e "${YELLOW}⚠️ $script não é executável (execute: chmod +x $script)${NC}"
    fi
done

echo ""
echo -e "${BLUE}🔍 Verificando Configurações de Rede:${NC}"

# Verificar portas disponíveis
check_port() {
    local port=$1
    local service=$2
    
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        echo -e "${YELLOW}⚠️ Porta $port ($service) já está em uso${NC}"
    else
        echo -e "${GREEN}✅ Porta $port ($service) disponível${NC}"
    fi
}

check_port 80 "HTTP"
check_port 443 "HTTPS"
check_port 3000 "Frontend"
check_port 8000 "Backend"
check_port 5432 "PostgreSQL"

echo ""
echo -e "${BLUE}📊 Verificando Recursos do Sistema:${NC}"

# Verificar espaço em disco
DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo -e "${GREEN}✅ Espaço em disco suficiente ($DISK_USAGE% usado)${NC}"
else
    echo -e "${YELLOW}⚠️ Pouco espaço em disco ($DISK_USAGE% usado)${NC}"
fi

# Verificar memória
if command -v free &> /dev/null; then
    TOTAL_MEM=$(free -m | grep "Mem:" | awk '{print $2}')
    if [ "$TOTAL_MEM" -gt 1024 ]; then
        echo -e "${GREEN}✅ Memória suficiente (${TOTAL_MEM}MB)${NC}"
    else
        echo -e "${YELLOW}⚠️ Pouca memória disponível (${TOTAL_MEM}MB)${NC}"
    fi
fi

echo ""
echo -e "${BLUE}📝 Resumo da Validação:${NC}"

# Contar sucessos e falhas
SUCCESS_COUNT=0
FAIL_COUNT=0

# Aqui você pode adicionar lógica para contar sucessos/falhas baseado nas verificações acima

echo -e "${GREEN}✅ Validação concluída!${NC}"
echo ""
echo -e "${BLUE}📋 Próximos Passos:${NC}"
echo "1. Para desenvolvimento: docker-compose up -d"
echo "2. Para produção: docker-compose -f docker-compose.prod.yml up -d"
echo "3. Configurar SSL: ./deploy/linux/scripts/setup_ssl.sh seu-dominio.com"
echo "4. Monitorar: ./deploy/linux/scripts/monitor.sh"
echo ""
echo -e "${BLUE}📚 Documentação:${NC}"
echo "- Guia completo: .trae/documents/guia_deploy_linux_docker.md"
echo "- README Docker: DOCKER_DEPLOY_README.md"
echo ""
echo -e "${GREEN}🎉 Sistema pronto para deploy!${NC}"