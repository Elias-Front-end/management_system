#!/bin/bash
# Script de monitoramento da aplicação
# Uso: ./monitor.sh [development|production] [--continuous]

set -e

ENVIRONMENT=${1:-development}
CONTINUOUS=${2:-false}
COMPOSE_FILE="docker-compose.yml"

if [ "$ENVIRONMENT" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
fi

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para verificar status de um serviço
check_service() {
    local service=$1
    local url=$2
    local expected_code=${3:-200}
    
    if curl -f -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_code"; then
        echo -e "${GREEN}✅ $service: OK${NC}"
        return 0
    else
        echo -e "${RED}❌ $service: FALHA${NC}"
        return 1
    fi
}

# Função para verificar uso de recursos
check_resources() {
    echo -e "${BLUE}📊 Uso de Recursos:${NC}"
    
    # CPU e Memória dos containers
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" $(docker-compose -f $COMPOSE_FILE ps -q) 2>/dev/null || echo "Nenhum container rodando"
    
    echo ""
    
    # Espaço em disco
    echo -e "${BLUE}💾 Espaço em Disco:${NC}"
    df -h / | tail -1 | awk '{print "Usado: " $3 " / " $2 " (" $5 ")"}'
    
    # Uso de memória do sistema
    echo -e "${BLUE}🧠 Memória do Sistema:${NC}"
    free -h | grep "Mem:" | awk '{print "Usado: " $3 " / " $2}'
}

# Função para verificar logs de erro
check_error_logs() {
    echo -e "${BLUE}📋 Verificando logs de erro (últimas 10 linhas):${NC}"
    
    # Logs do backend
    echo -e "${YELLOW}Backend:${NC}"
    docker-compose -f $COMPOSE_FILE logs --tail=10 backend 2>/dev/null | grep -i "error\|exception\|critical" || echo "Nenhum erro encontrado"
    
    # Logs do frontend
    echo -e "${YELLOW}Frontend:${NC}"
    docker-compose -f $COMPOSE_FILE logs --tail=10 frontend 2>/dev/null | grep -i "error\|exception\|critical" || echo "Nenhum erro encontrado"
    
    # Logs do nginx
    echo -e "${YELLOW}Nginx:${NC}"
    docker-compose -f $COMPOSE_FILE logs --tail=10 nginx 2>/dev/null | grep -i "error\|exception\|critical" || echo "Nenhum erro encontrado"
}

# Função para verificar conectividade do banco
check_database() {
    echo -e "${BLUE}🗄️ Verificando banco de dados:${NC}"
    
    if docker-compose -f $COMPOSE_FILE exec -T db pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL: Conectado${NC}"
        
        # Verificar número de conexões
        CONNECTIONS=$(docker-compose -f $COMPOSE_FILE exec -T db psql -U postgres -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | xargs)
        echo "Conexões ativas: $CONNECTIONS"
        
        # Verificar tamanho do banco
        DB_SIZE=$(docker-compose -f $COMPOSE_FILE exec -T db psql -U postgres -t -c "SELECT pg_size_pretty(pg_database_size('management_system'));" 2>/dev/null | xargs)
        echo "Tamanho do banco: $DB_SIZE"
    else
        echo -e "${RED}❌ PostgreSQL: Desconectado${NC}"
    fi
}

# Função principal de monitoramento
monitor_application() {
    clear
    echo -e "${BLUE}🔍 Monitoramento da Aplicação Management System${NC}"
    echo -e "${BLUE}Ambiente: $ENVIRONMENT | $(date)${NC}"
    echo "=================================================="
    echo ""
    
    # Status dos containers
    echo -e "${BLUE}🐳 Status dos Containers:${NC}"
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    
    # Verificar serviços web
    echo -e "${BLUE}🌐 Verificando Serviços Web:${NC}"
    
    # Backend
    check_service "Backend API" "http://localhost:8000/admin/" 200
    
    # Frontend
    check_service "Frontend" "http://localhost:3000/" 200
    
    # Nginx (se estiver rodando)
    if docker-compose -f $COMPOSE_FILE ps nginx | grep -q "Up"; then
        check_service "Nginx" "http://localhost/" 200
    fi
    
    echo ""
    
    # Verificar banco de dados
    check_database
    echo ""
    
    # Verificar recursos
    check_resources
    echo ""
    
    # Verificar logs de erro
    check_error_logs
    echo ""
    
    # Verificações específicas para produção
    if [ "$ENVIRONMENT" = "production" ]; then
        echo -e "${BLUE}🔒 Verificações de Produção:${NC}"
        
        # Verificar certificados SSL (se configurado)
        if command -v openssl &> /dev/null; then
            echo "Verificando certificados SSL..."
            # Adicionar verificação de certificados aqui se necessário
        fi
        
        # Verificar backup automático
        if [ -d "./backups" ]; then
            LAST_BACKUP=$(ls -t ./backups/management_system/full_backup_*.tar.gz 2>/dev/null | head -1)
            if [ -n "$LAST_BACKUP" ]; then
                BACKUP_AGE=$(find "$LAST_BACKUP" -mtime +1 2>/dev/null)
                if [ -n "$BACKUP_AGE" ]; then
                    echo -e "${YELLOW}⚠️ Último backup tem mais de 24h${NC}"
                else
                    echo -e "${GREEN}✅ Backup recente encontrado${NC}"
                fi
            else
                echo -e "${RED}❌ Nenhum backup encontrado${NC}"
            fi
        fi
    fi
    
    echo ""
    echo -e "${BLUE}📈 Comandos úteis:${NC}"
    echo "Ver logs em tempo real: docker-compose -f $COMPOSE_FILE logs -f"
    echo "Reiniciar serviço: docker-compose -f $COMPOSE_FILE restart [serviço]"
    echo "Verificar uso detalhado: docker-compose -f $COMPOSE_FILE top"
}

# Função para alertas
check_alerts() {
    local alerts=0
    
    # Verificar se algum container está parado
    STOPPED_CONTAINERS=$(docker-compose -f $COMPOSE_FILE ps | grep "Exit" | wc -l)
    if [ "$STOPPED_CONTAINERS" -gt 0 ]; then
        echo -e "${RED}🚨 ALERTA: $STOPPED_CONTAINERS container(s) parado(s)${NC}"
        alerts=$((alerts + 1))
    fi
    
    # Verificar uso de disco
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 85 ]; then
        echo -e "${RED}🚨 ALERTA: Uso de disco alto ($DISK_USAGE%)${NC}"
        alerts=$((alerts + 1))
    fi
    
    # Verificar uso de memória
    MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [ "$MEM_USAGE" -gt 90 ]; then
        echo -e "${RED}🚨 ALERTA: Uso de memória alto ($MEM_USAGE%)${NC}"
        alerts=$((alerts + 1))
    fi
    
    if [ "$alerts" -eq 0 ]; then
        echo -e "${GREEN}✅ Nenhum alerta crítico${NC}"
    fi
    
    return $alerts
}

# Execução principal
if [ "$CONTINUOUS" = "--continuous" ]; then
    echo "Iniciando monitoramento contínuo (Ctrl+C para parar)..."
    while true; do
        monitor_application
        check_alerts
        echo ""
        echo "Próxima verificação em 30 segundos..."
        sleep 30
    done
else
    monitor_application
    check_alerts
fi