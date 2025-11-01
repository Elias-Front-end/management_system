#!/bin/bash

# Script de Backup Automatizado - Linux
# Sistema de Gestão de Sala de Aula
# Autor: Desenvolvimento Elias Moraes

set -e

# Configurações
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"
MEDIA_BACKUP="media_backup_${DATE}.tar.gz"
RETENTION_DAYS=7

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Criar diretório de backup
mkdir -p "$BACKUP_DIR"

log "🗄️ Iniciando backup do sistema..."

# Verificar se containers estão rodando
if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    error "Containers não estão rodando. Inicie o sistema primeiro."
fi

# Backup do banco de dados
log "Fazendo backup do banco de dados..."
if docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U postgres management_system_db > "${BACKUP_DIR}/${BACKUP_FILE}"; then
    log "✅ Backup do banco salvo: ${BACKUP_DIR}/${BACKUP_FILE}"
else
    error "Falha no backup do banco de dados"
fi

# Backup dos arquivos de mídia
log "Fazendo backup dos arquivos de mídia..."
if [ -d "media" ]; then
    if tar -czf "${BACKUP_DIR}/${MEDIA_BACKUP}" media/; then
        log "✅ Backup de mídia salvo: ${BACKUP_DIR}/${MEDIA_BACKUP}"
    else
        warning "Falha no backup dos arquivos de mídia"
    fi
else
    log "Diretório de mídia não encontrado - pulando backup de mídia"
fi

# Backup das configurações
log "Fazendo backup das configurações..."
CONFIG_BACKUP="config_backup_${DATE}.tar.gz"
if tar -czf "${BACKUP_DIR}/${CONFIG_BACKUP}" .env docker-compose.prod.yml nginx/ 2>/dev/null; then
    log "✅ Backup de configurações salvo: ${BACKUP_DIR}/${CONFIG_BACKUP}"
else
    warning "Falha no backup das configurações"
fi

# Limpeza de backups antigos
log "Limpando backups antigos (mais de ${RETENTION_DAYS} dias)..."
find "$BACKUP_DIR" -name "*.sql" -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true

# Listar backups disponíveis
log "📋 Backups disponíveis:"
ls -lh "$BACKUP_DIR"

log "✅ Backup concluído com sucesso!"

# Informações do backup
echo ""
echo "📊 Informações do backup:"
echo "   Data/Hora: $(date)"
echo "   Banco:     ${BACKUP_DIR}/${BACKUP_FILE}"
echo "   Mídia:     ${BACKUP_DIR}/${MEDIA_BACKUP}"
echo "   Config:    ${BACKUP_DIR}/${CONFIG_BACKUP}"
echo ""