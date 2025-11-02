#!/bin/bash

# ======================================================
# 🔧 FUNÇÕES UTILITÁRIAS - Management System Linux
# ======================================================
# Funções auxiliares para deploy e manutenção
# ======================================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configurações
DEPLOY_DIR="$HOME/management_system_deploy/management_system"
COMPOSE_FILE="deploy/linux/config/docker-compose.linux.yml"

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

info() {
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

# Verificar se está no diretório correto
check_deploy_directory() {
    if [ ! -d "$DEPLOY_DIR" ]; then
        error "Diretório de deploy não encontrado: $DEPLOY_DIR"
        error "Execute o deploy primeiro: ./scripts/deploy.sh"
        exit 1
    fi
    cd "$DEPLOY_DIR"
}

# Mostrar status dos containers
show_status() {
    log "Status dos containers:"
    echo ""
    
    check_deploy_directory
    
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        docker-compose -f "$COMPOSE_FILE" ps
        echo ""
        
        # Mostrar URLs
        SERVER_IP=$(hostname -I | awk '{print $1}')
        echo "🔗 URLs de Acesso:"
        echo "├── 🎨 Frontend: http://$SERVER_IP/"
        echo "├── 🔧 Backend API: http://$SERVER_IP/api/"
        echo "└── 👤 Django Admin: http://$SERVER_IP/admin/"
        echo ""
    else
        warning "Nenhum container está rodando"
        echo "Execute: ./scripts/deploy.sh"
    fi
}

# Mostrar logs
show_logs() {
    local service="$1"
    local lines="${2:-50}"
    
    check_deploy_directory
    
    if [ -z "$service" ]; then
        log "Mostrando logs de todos os serviços (últimas $lines linhas):"
        docker-compose -f "$COMPOSE_FILE" logs --tail="$lines" -f
    else
        log "Mostrando logs do serviço '$service' (últimas $lines linhas):"
        docker-compose -f "$COMPOSE_FILE" logs --tail="$lines" -f "$service"
    fi
}

# Parar serviços
stop_services() {
    log "Parando todos os serviços..."
    
    check_deploy_directory
    
    docker-compose -f "$COMPOSE_FILE" down
    success "Serviços parados"
}

# Iniciar serviços
start_services() {
    log "Iniciando serviços..."
    
    check_deploy_directory
    
    docker-compose -f "$COMPOSE_FILE" up -d
    success "Serviços iniciados"
    
    # Aguardar um pouco e mostrar status
    sleep 5
    show_status
}

# Reiniciar serviços
restart_services() {
    local service="$1"
    
    check_deploy_directory
    
    if [ -z "$service" ]; then
        log "Reiniciando todos os serviços..."
        docker-compose -f "$COMPOSE_FILE" restart
        success "Todos os serviços reiniciados"
    else
        log "Reiniciando serviço '$service'..."
        docker-compose -f "$COMPOSE_FILE" restart "$service"
        success "Serviço '$service' reiniciado"
    fi
}

# Fazer backup do banco de dados
backup_database() {
    local backup_name="${1:-backup_$(date +%Y%m%d_%H%M%S)}"
    
    log "Fazendo backup do banco de dados..."
    
    check_deploy_directory
    
    # Criar diretório de backup se não existir
    mkdir -p backups
    
    # Fazer backup
    docker-compose -f "$COMPOSE_FILE" exec -T db pg_dump -U postgres management_system_prod > "backups/${backup_name}.sql"
    
    if [ -f "backups/${backup_name}.sql" ]; then
        success "Backup criado: backups/${backup_name}.sql"
        
        # Mostrar tamanho do backup
        local size=$(du -h "backups/${backup_name}.sql" | cut -f1)
        info "Tamanho do backup: $size"
    else
        error "Falha ao criar backup"
        exit 1
    fi
}

# Restaurar backup do banco de dados
restore_database() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        error "Especifique o arquivo de backup"
        echo "Uso: restore_database <arquivo.sql>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        error "Arquivo de backup não encontrado: $backup_file"
        exit 1
    fi
    
    log "Restaurando backup do banco de dados..."
    warning "ATENÇÃO: Isso irá sobrescrever todos os dados atuais!"
    
    read -p "Tem certeza? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Operação cancelada"
        exit 0
    fi
    
    check_deploy_directory
    
    # Parar backend temporariamente
    docker-compose -f "$COMPOSE_FILE" stop backend
    
    # Restaurar backup
    docker-compose -f "$COMPOSE_FILE" exec -T db psql -U postgres -d management_system_prod < "$backup_file"
    
    # Reiniciar backend
    docker-compose -f "$COMPOSE_FILE" start backend
    
    success "Backup restaurado com sucesso"
}

# Limpar recursos não utilizados
cleanup() {
    log "Limpando recursos não utilizados..."
    
    # Limpar containers parados
    docker container prune -f
    
    # Limpar imagens não utilizadas
    docker image prune -f
    
    # Limpar volumes não utilizados
    docker volume prune -f
    
    # Limpar redes não utilizadas
    docker network prune -f
    
    success "Limpeza concluída"
}

# Atualizar aplicação
update_application() {
    log "Atualizando aplicação..."
    
    check_deploy_directory
    
    # Fazer backup antes da atualização
    backup_database "pre_update_$(date +%Y%m%d_%H%M%S)"
    
    # Atualizar código
    git fetch origin
    git reset --hard origin/main
    
    # Reconstruir imagens
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    
    # Reiniciar serviços
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Executar migrações
    docker-compose -f "$COMPOSE_FILE" exec backend python manage.py migrate
    
    # Coletar arquivos estáticos
    docker-compose -f "$COMPOSE_FILE" exec backend python manage.py collectstatic --noinput
    
    success "Aplicação atualizada"
}

# Monitorar recursos
monitor_resources() {
    log "Monitorando recursos do sistema..."
    echo ""
    
    # Mostrar uso de recursos dos containers
    echo "📊 Uso de recursos dos containers:"
    docker stats --no-stream
    echo ""
    
    # Mostrar uso de disco
    echo "💾 Uso de disco:"
    df -h | grep -E "(Filesystem|/dev/)"
    echo ""
    
    # Mostrar uso de memória do sistema
    echo "🧠 Uso de memória do sistema:"
    free -h
    echo ""
    
    # Mostrar load average
    echo "⚡ Load average:"
    uptime
    echo ""
}

# Executar comando no container
exec_container() {
    local service="$1"
    shift
    local command="$@"
    
    if [ -z "$service" ] || [ -z "$command" ]; then
        error "Especifique o serviço e o comando"
        echo "Uso: exec_container <serviço> <comando>"
        echo "Exemplo: exec_container backend python manage.py shell"
        exit 1
    fi
    
    check_deploy_directory
    
    log "Executando comando no container '$service': $command"
    docker-compose -f "$COMPOSE_FILE" exec "$service" $command
}

# Mostrar ajuda
show_help() {
    echo "======================================================="
    echo "🔧 UTILITÁRIOS - Management System Linux"
    echo "======================================================="
    echo ""
    echo "Comandos disponíveis:"
    echo ""
    echo "📊 Status e Monitoramento:"
    echo "  status                    - Mostrar status dos containers"
    echo "  logs [serviço] [linhas]   - Mostrar logs (padrão: todos, 50 linhas)"
    echo "  monitor                   - Monitorar recursos do sistema"
    echo ""
    echo "🔄 Controle de Serviços:"
    echo "  start                     - Iniciar todos os serviços"
    echo "  stop                      - Parar todos os serviços"
    echo "  restart [serviço]         - Reiniciar serviços (padrão: todos)"
    echo ""
    echo "💾 Backup e Restauração:"
    echo "  backup [nome]             - Fazer backup do banco de dados"
    echo "  restore <arquivo>         - Restaurar backup do banco de dados"
    echo ""
    echo "🔧 Manutenção:"
    echo "  update                    - Atualizar aplicação"
    echo "  cleanup                   - Limpar recursos não utilizados"
    echo "  exec <serviço> <comando>  - Executar comando no container"
    echo ""
    echo "Exemplos:"
    echo "  ./utils.sh status"
    echo "  ./utils.sh logs backend 100"
    echo "  ./utils.sh backup backup_importante"
    echo "  ./utils.sh exec backend python manage.py shell"
    echo ""
}

# Função principal
main() {
    local command="$1"
    shift
    
    case "$command" in
        "status")
            show_status
            ;;
        "logs")
            show_logs "$@"
            ;;
        "start")
            start_services
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            restart_services "$@"
            ;;
        "backup")
            backup_database "$@"
            ;;
        "restore")
            restore_database "$@"
            ;;
        "update")
            update_application
            ;;
        "cleanup")
            cleanup
            ;;
        "monitor")
            monitor_resources
            ;;
        "exec")
            exec_container "$@"
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            error "Comando não reconhecido: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Executar apenas se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi