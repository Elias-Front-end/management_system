#!/bin/bash

# ======================================================
# 🚀 SCRIPT DE DEPLOY AUTOMÁTICO - LINUX
# ======================================================
# 
# Este script automatiza o deploy do Sistema de Gestão
# de Sala de Aula em servidores Linux
# 
# Requisitos:
# - Docker e Docker Compose instalados
# - Git instalado (para deploy via Git)
# - Permissões adequadas no diretório
# 
# ======================================================

set -e  # Parar execução em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

# Configurações padrão
PROJECT_NAME="management_system"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deploy.log"

# Funções auxiliares
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE" 2>/dev/null || true
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
    log "SUCCESS: $1"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    log "WARNING: $1"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    log "ERROR: $1"
    exit 1
}

show_help() {
    echo -e "${BLUE}🚀 SCRIPT DE DEPLOY - SISTEMA DE GESTÃO${NC}"
    echo ""
    echo -e "${YELLOW}USO:${NC}"
    echo "  ./deploy.sh [OPÇÃO]"
    echo ""
    echo -e "${YELLOW}OPÇÕES:${NC}"
    echo "  install     Instalação inicial completa"
    echo "  update      Atualizar aplicação existente"
    echo "  restart     Reiniciar serviços"
    echo "  stop        Parar todos os serviços"
    echo "  backup      Criar backup do banco de dados"
    echo "  restore     Restaurar backup do banco"
    echo "  logs        Mostrar logs dos containers"
    echo "  status      Verificar status dos serviços"
    echo "  cleanup     Limpar containers e imagens não utilizados"
    echo "  help        Mostrar esta ajuda"
    echo ""
    echo -e "${YELLOW}EXEMPLOS:${NC}"
    echo "  ./deploy.sh install    # Primeira instalação"
    echo "  ./deploy.sh update     # Atualizar código e reiniciar"
    echo "  ./deploy.sh backup     # Criar backup antes de atualizar"
    exit 0
}

check_dependencies() {
    log "🔍 Verificando dependências..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado!"
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose não está instalado!"
    fi
    
    # Verificar se Docker está rodando
    if ! docker info &> /dev/null; then
        error "Docker não está rodando! Execute: sudo systemctl start docker"
    fi
    
    success "Todas as dependências estão OK"
}

setup_directories() {
    log "📁 Configurando diretórios..."
    
    # Criar diretórios necessários
    mkdir -p "$BACKUP_DIR"
    mkdir -p "./logs"
    mkdir -p "./nginx/ssl"
    mkdir -p "./media"
    mkdir -p "./static"
    
    # Definir permissões
    chmod 755 "$BACKUP_DIR"
    chmod 755 "./logs"
    
    success "Diretórios configurados"
}

setup_environment() {
    log "🔧 Configurando ambiente..."
    
    # Verificar se .env existe
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            warning "Arquivo .env não encontrado. Copiando de .env.example..."
            cp ".env.example" ".env"
            warning "IMPORTANTE: Edite o arquivo .env com suas configurações de produção!"
            echo ""
            echo -e "${YELLOW}Configurações obrigatórias para produção:${NC}"
            echo "- SECRET_KEY (gere uma nova chave)"
            echo "- DATABASE_PASSWORD (senha segura)"
            echo "- ALLOWED_HOSTS (seu domínio)"
            echo "- CORS_ALLOWED_ORIGINS (URL do frontend)"
            echo ""
            read -p "Pressione Enter após editar o arquivo .env..."
        else
            error "Arquivo .env.example não encontrado!"
        fi
    fi
    
    success "Ambiente configurado"
}

build_application() {
    log "🏗️ Construindo aplicação..."
    
    # Parar containers existentes
    docker-compose -f "$COMPOSE_FILE" down 2>/dev/null || true
    
    # Construir imagens
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    
    success "Aplicação construída"
}

start_services() {
    log "🚀 Iniciando serviços..."
    
    # Iniciar em modo detached
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Aguardar serviços ficarem prontos
    log "⏳ Aguardando serviços ficarem prontos..."
    sleep 30
    
    # Verificar se containers estão rodando
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        success "Serviços iniciados com sucesso"
    else
        error "Falha ao iniciar serviços"
    fi
}

run_migrations() {
    log "🗄️ Executando migrações do banco..."
    
    # Executar migrações
    docker-compose -f "$COMPOSE_FILE" exec -T backend python manage.py migrate
    
    # Coletar arquivos estáticos
    docker-compose -f "$COMPOSE_FILE" exec -T backend python manage.py collectstatic --noinput
    
    success "Migrações executadas"
}

create_backup() {
    log "💾 Criando backup do banco de dados..."
    
    BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
    
    # Criar backup
    docker-compose -f "$COMPOSE_FILE" exec -T db pg_dump -U postgres management_system > "$BACKUP_FILE"
    
    # Comprimir backup
    gzip "$BACKUP_FILE"
    
    success "Backup criado: ${BACKUP_FILE}.gz"
    
    # Manter apenas os 10 backups mais recentes
    find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f -printf '%T@ %p\n' | sort -n | head -n -10 | cut -d' ' -f2- | xargs -r rm
}

restore_backup() {
    log "🔄 Restaurando backup do banco de dados..."
    
    # Listar backups disponíveis
    echo -e "${YELLOW}Backups disponíveis:${NC}"
    ls -la "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null || error "Nenhum backup encontrado!"
    
    echo ""
    read -p "Digite o nome do arquivo de backup (sem o caminho): " BACKUP_NAME
    
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    if [ ! -f "$BACKUP_PATH" ]; then
        error "Arquivo de backup não encontrado: $BACKUP_PATH"
    fi
    
    # Parar aplicação
    docker-compose -f "$COMPOSE_FILE" stop backend
    
    # Restaurar backup
    gunzip -c "$BACKUP_PATH" | docker-compose -f "$COMPOSE_FILE" exec -T db psql -U postgres -d management_system
    
    # Reiniciar aplicação
    docker-compose -f "$COMPOSE_FILE" start backend
    
    success "Backup restaurado com sucesso"
}

show_logs() {
    log "📋 Mostrando logs dos containers..."
    docker-compose -f "$COMPOSE_FILE" logs -f --tail=100
}

show_status() {
    log "📊 Status dos serviços:"
    echo ""
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    
    # Verificar saúde dos serviços
    log "🔍 Verificando conectividade..."
    
    # Testar backend
    if curl -s http://localhost:8000/api/health/ > /dev/null 2>&1; then
        success "Backend: OK"
    else
        warning "Backend: Não responsivo"
    fi
    
    # Testar nginx
    if curl -s http://localhost/ > /dev/null 2>&1; then
        success "Nginx: OK"
    else
        warning "Nginx: Não responsivo"
    fi
}

cleanup_docker() {
    log "🧹 Limpando containers e imagens não utilizados..."
    
    # Remover containers parados
    docker container prune -f
    
    # Remover imagens não utilizadas
    docker image prune -f
    
    # Remover volumes não utilizados
    docker volume prune -f
    
    success "Limpeza concluída"
}

install_application() {
    log "🚀 INICIANDO INSTALAÇÃO COMPLETA"
    echo "=================================="
    
    check_dependencies
    setup_directories
    setup_environment
    build_application
    start_services
    run_migrations
    
    echo ""
    success "🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
    echo ""
    echo -e "${BLUE}📋 INFORMAÇÕES DE ACESSO:${NC}"
    echo "  Frontend: http://seu-servidor/"
    echo "  Backend:  http://seu-servidor/api/"
    echo "  Admin:    http://seu-servidor/admin/"
    echo ""
    echo -e "${YELLOW}📚 PRÓXIMOS PASSOS:${NC}"
    echo "  1. Configure seu domínio no DNS"
    echo "  2. Configure SSL/HTTPS no Nginx"
    echo "  3. Crie um superusuário: docker-compose -f $COMPOSE_FILE exec backend python manage.py createsuperuser"
    echo "  4. Configure backups automáticos"
    echo ""
}

update_application() {
    log "🔄 INICIANDO ATUALIZAÇÃO"
    echo "========================"
    
    # Criar backup antes da atualização
    create_backup
    
    # Atualizar código (se usando Git)
    if [ -d ".git" ]; then
        log "📥 Atualizando código do repositório..."
        git pull origin main || git pull origin master
    fi
    
    # Reconstruir e reiniciar
    build_application
    start_services
    run_migrations
    
    success "🎉 ATUALIZAÇÃO CONCLUÍDA!"
}

# ======================================================
# EXECUÇÃO PRINCIPAL
# ======================================================

# Criar diretório de logs se não existir
mkdir -p "$(dirname "$LOG_FILE")"

case "${1:-help}" in
    "install")
        install_application
        ;;
    "update")
        update_application
        ;;
    "restart")
        log "🔄 Reiniciando serviços..."
        docker-compose -f "$COMPOSE_FILE" restart
        success "Serviços reiniciados"
        ;;
    "stop")
        log "⏹️ Parando serviços..."
        docker-compose -f "$COMPOSE_FILE" down
        success "Serviços parados"
        ;;
    "backup")
        create_backup
        ;;
    "restore")
        restore_backup
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        cleanup_docker
        ;;
    "help"|*)
        show_help
        ;;
esac