#!/bin/bash

# Script de Restauração Automatizada - Linux
# Sistema de Gestão de Sala de Aula
# Autor: Desenvolvimento Elias Moraes

set -e

# Configurações
BACKUP_DIR="./backups"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Função para listar backups disponíveis
list_backups() {
    echo ""
    echo "📋 Backups disponíveis:"
    echo ""
    
    if [ ! -d "$BACKUP_DIR" ]; then
        error "Diretório de backup não encontrado: $BACKUP_DIR"
    fi
    
    local sql_backups=($(ls -1 "$BACKUP_DIR"/*.sql 2>/dev/null | sort -r))
    local media_backups=($(ls -1 "$BACKUP_DIR"/media_backup_*.zip 2>/dev/null | sort -r))
    local config_backups=($(ls -1 "$BACKUP_DIR"/config_backup_*.zip 2>/dev/null | sort -r))
    
    if [ ${#sql_backups[@]} -eq 0 ]; then
        error "Nenhum backup de banco de dados encontrado em $BACKUP_DIR"
    fi
    
    echo "🗄️ Backups de Banco de Dados:"
    for i in "${!sql_backups[@]}"; do
        local file=$(basename "${sql_backups[$i]}")
        local size=$(du -h "${sql_backups[$i]}" | cut -f1)
        local date=$(stat -c %y "${sql_backups[$i]}" | cut -d' ' -f1,2 | cut -d'.' -f1)
        echo "   [$((i+1))] $file ($size) - $date"
    done
    
    echo ""
    echo "📁 Backups de Mídia:"
    for i in "${!media_backups[@]}"; do
        local file=$(basename "${media_backups[$i]}")
        local size=$(du -h "${media_backups[$i]}" | cut -f1)
        local date=$(stat -c %y "${media_backups[$i]}" | cut -d' ' -f1,2 | cut -d'.' -f1)
        echo "   [$((i+1))] $file ($size) - $date"
    done
    
    echo ""
    echo "⚙️ Backups de Configuração:"
    for i in "${!config_backups[@]}"; do
        local file=$(basename "${config_backups[$i]}")
        local size=$(du -h "${config_backups[$i]}" | cut -f1)
        local date=$(stat -c %y "${config_backups[$i]}" | cut -d' ' -f1,2 | cut -d'.' -f1)
        echo "   [$((i+1))] $file ($size) - $date"
    done
    
    echo ""
}

# Função para selecionar backup
select_backup() {
    local backup_type="$1"
    local backups=()
    
    case "$backup_type" in
        "sql")
            backups=($(ls -1 "$BACKUP_DIR"/*.sql 2>/dev/null | sort -r))
            ;;
        "media")
            backups=($(ls -1 "$BACKUP_DIR"/media_backup_*.zip 2>/dev/null | sort -r))
            ;;
        "config")
            backups=($(ls -1 "$BACKUP_DIR"/config_backup_*.zip 2>/dev/null | sort -r))
            ;;
    esac
    
    if [ ${#backups[@]} -eq 0 ]; then
        return 1
    fi
    
    echo "Selecione o backup de $backup_type (1-${#backups[@]}) ou 0 para pular:"
    read -r selection
    
    if [ "$selection" = "0" ]; then
        return 1
    fi
    
    if [ "$selection" -ge 1 ] && [ "$selection" -le ${#backups[@]} ]; then
        echo "${backups[$((selection-1))]}"
        return 0
    else
        error "Seleção inválida"
    fi
}

# Banner
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    SISTEMA DE GESTÃO                         ║"
echo "║                 RESTAURAÇÃO DE BACKUP                        ║"
echo "║                      Versão 1.0.0                           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

log "🔄 Iniciando processo de restauração..."

# Listar backups disponíveis
list_backups

# Verificar se containers estão rodando
info "Verificando status dos containers..."
if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    warning "Containers não estão rodando. Iniciando containers..."
    docker-compose -f docker-compose.prod.yml up -d
    sleep 10
fi

# Aguardar banco estar pronto
info "Aguardando banco de dados ficar disponível..."
for i in {1..30}; do
    if docker-compose -f docker-compose.prod.yml exec -T db pg_isready -U postgres > /dev/null 2>&1; then
        log "✅ Banco de dados está pronto"
        break
    fi
    if [ $i -eq 30 ]; then
        error "Timeout aguardando banco de dados"
    fi
    sleep 2
done

# Selecionar e restaurar backup do banco
echo ""
info "=== RESTAURAÇÃO DO BANCO DE DADOS ==="
selected_sql=$(select_backup "sql")
if [ $? -eq 0 ]; then
    warning "⚠️  ATENÇÃO: Esta operação irá SUBSTITUIR todos os dados atuais do banco!"
    echo "Deseja continuar? (s/N)"
    read -r confirm
    
    if [ "$confirm" = "s" ] || [ "$confirm" = "S" ]; then
        log "Restaurando banco de dados de: $(basename "$selected_sql")"
        
        # Fazer backup atual antes de restaurar
        current_backup="backup_before_restore_$(date +%Y%m%d_%H%M%S).sql"
        log "Fazendo backup atual antes da restauração..."
        docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U postgres management_system_db > "$BACKUP_DIR/$current_backup"
        
        # Restaurar banco
        log "Restaurando banco de dados..."
        docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres -d management_system_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
        docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres -d management_system_db < "$selected_sql"
        
        if [ $? -eq 0 ]; then
            log "✅ Banco de dados restaurado com sucesso"
        else
            error "Falha na restauração do banco de dados"
        fi
    else
        info "Restauração do banco cancelada"
    fi
else
    info "Restauração do banco pulada"
fi

# Selecionar e restaurar backup de mídia
echo ""
info "=== RESTAURAÇÃO DE ARQUIVOS DE MÍDIA ==="
selected_media=$(select_backup "media")
if [ $? -eq 0 ]; then
    warning "⚠️  ATENÇÃO: Esta operação irá SUBSTITUIR todos os arquivos de mídia atuais!"
    echo "Deseja continuar? (s/N)"
    read -r confirm
    
    if [ "$confirm" = "s" ] || [ "$confirm" = "S" ]; then
        log "Restaurando arquivos de mídia de: $(basename "$selected_media")"
        
        # Backup atual da mídia
        if [ -d "media" ]; then
            log "Fazendo backup da mídia atual..."
            tar -czf "$BACKUP_DIR/media_before_restore_$(date +%Y%m%d_%H%M%S).tar.gz" media/
        fi
        
        # Restaurar mídia
        log "Extraindo arquivos de mídia..."
        rm -rf media/
        unzip -q "$selected_media" -d .
        
        if [ $? -eq 0 ]; then
            log "✅ Arquivos de mídia restaurados com sucesso"
        else
            error "Falha na restauração dos arquivos de mídia"
        fi
    else
        info "Restauração de mídia cancelada"
    fi
else
    info "Restauração de mídia pulada"
fi

# Selecionar e restaurar backup de configuração
echo ""
info "=== RESTAURAÇÃO DE CONFIGURAÇÕES ==="
selected_config=$(select_backup "config")
if [ $? -eq 0 ]; then
    warning "⚠️  ATENÇÃO: Esta operação irá SUBSTITUIR as configurações atuais!"
    echo "Deseja continuar? (s/N)"
    read -r confirm
    
    if [ "$confirm" = "s" ] || [ "$confirm" = "S" ]; then
        log "Restaurando configurações de: $(basename "$selected_config")"
        
        # Backup das configurações atuais
        log "Fazendo backup das configurações atuais..."
        tar -czf "$BACKUP_DIR/config_before_restore_$(date +%Y%m%d_%H%M%S).tar.gz" .env docker-compose.prod.yml nginx/ 2>/dev/null || true
        
        # Restaurar configurações
        log "Extraindo configurações..."
        unzip -o "$selected_config" -d .
        
        if [ $? -eq 0 ]; then
            log "✅ Configurações restauradas com sucesso"
            warning "⚠️  Reinicie os containers para aplicar as novas configurações:"
            warning "   docker-compose -f docker-compose.prod.yml down"
            warning "   docker-compose -f docker-compose.prod.yml up -d"
        else
            error "Falha na restauração das configurações"
        fi
    else
        info "Restauração de configurações cancelada"
    fi
else
    info "Restauração de configurações pulada"
fi

# Executar migrações após restauração
echo ""
info "=== PÓS-RESTAURAÇÃO ==="
log "Executando migrações do banco..."
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

log "Coletando arquivos estáticos..."
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

# Status final
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                 RESTAURAÇÃO CONCLUÍDA                        ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

log "📊 Status dos containers:"
docker-compose -f docker-compose.prod.yml ps

echo ""
log "🌐 Sistema disponível em:"
echo -e "   ${BLUE}Frontend:${NC} http://localhost/"
echo -e "   ${BLUE}Admin:${NC}    http://localhost/admin/"

echo ""
log "✅ Restauração finalizada!"