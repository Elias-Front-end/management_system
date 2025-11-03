#!/bin/bash
# Script de backup completo da aplicação
# Uso: ./backup.sh [development|production]

set -e  # Parar execução em caso de erro

ENVIRONMENT=${1:-development}
COMPOSE_FILE="docker-compose.yml"

if [ "$ENVIRONMENT" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
fi

BACKUP_DIR="./backups/management_system"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$DATE"

mkdir -p $BACKUP_PATH

echo "📦 Iniciando backup completo (ambiente: $ENVIRONMENT)..."
echo "📁 Diretório de backup: $BACKUP_PATH"

# Backup do banco de dados
echo "🗄️ Fazendo backup do banco de dados..."
if docker-compose -f $COMPOSE_FILE ps db | grep -q "Up"; then
    docker-compose -f $COMPOSE_FILE exec -T db pg_dump -U postgres management_system > $BACKUP_PATH/db_backup.sql
    echo "✅ Backup do banco concluído"
else
    echo "⚠️ Banco de dados não está rodando, pulando backup do banco..."
fi

# Backup de arquivos de mídia
echo "📁 Fazendo backup de arquivos de mídia..."
if docker-compose -f $COMPOSE_FILE ps backend | grep -q "Up"; then
    docker cp $(docker-compose -f $COMPOSE_FILE ps -q backend):/app/media $BACKUP_PATH/media 2>/dev/null || echo "⚠️ Diretório de mídia não encontrado"
    echo "✅ Backup de mídia concluído"
else
    echo "⚠️ Container backend não está rodando, pulando backup de mídia..."
fi

# Backup de arquivos estáticos (apenas produção)
if [ "$ENVIRONMENT" = "production" ]; then
    echo "📄 Fazendo backup de arquivos estáticos..."
    if docker-compose -f $COMPOSE_FILE ps backend | grep -q "Up"; then
        docker cp $(docker-compose -f $COMPOSE_FILE ps -q backend):/app/static $BACKUP_PATH/static 2>/dev/null || echo "⚠️ Diretório static não encontrado"
        echo "✅ Backup de static concluído"
    fi
fi

# Backup de configurações
echo "⚙️ Fazendo backup de configurações..."
cp .env.$ENVIRONMENT $BACKUP_PATH/env_backup
cp $COMPOSE_FILE $BACKUP_PATH/compose_backup.yml
cp -r nginx/ $BACKUP_PATH/nginx_config 2>/dev/null || echo "⚠️ Diretório nginx não encontrado"

# Backup do código fonte (apenas arquivos importantes)
echo "💾 Fazendo backup do código fonte..."
mkdir -p $BACKUP_PATH/source
cp -r backend/ $BACKUP_PATH/source/ 2>/dev/null || echo "⚠️ Diretório backend não encontrado"
cp -r frontend/ $BACKUP_PATH/source/ 2>/dev/null || echo "⚠️ Diretório frontend não encontrado"

# Criar arquivo de informações do backup
echo "📋 Criando arquivo de informações..."
cat > $BACKUP_PATH/backup_info.txt << EOF
Backup da Aplicação Management System
=====================================
Data: $(date)
Ambiente: $ENVIRONMENT
Compose File: $COMPOSE_FILE
Hostname: $(hostname)
User: $(whoami)

Conteúdo do Backup:
- db_backup.sql: Dump do banco de dados PostgreSQL
- media/: Arquivos de mídia uploadados
- static/: Arquivos estáticos (apenas produção)
- env_backup: Variáveis de ambiente
- compose_backup.yml: Configuração Docker Compose
- nginx_config/: Configurações do Nginx
- source/: Código fonte da aplicação

Para restaurar:
1. Restaurar banco: docker-compose exec -T db psql -U postgres management_system < db_backup.sql
2. Restaurar mídia: docker cp media/. container_backend:/app/media/
3. Restaurar configurações conforme necessário
EOF

# Compactar backup
echo "🗜️ Compactando backup..."
cd $BACKUP_DIR
tar -czf "full_backup_$DATE.tar.gz" $DATE/
COMPRESSED_SIZE=$(du -h "full_backup_$DATE.tar.gz" | cut -f1)

# Limpar arquivos temporários
rm -rf $DATE/

echo "✅ Backup concluído!"
echo "📦 Arquivo: $BACKUP_DIR/full_backup_$DATE.tar.gz"
echo "📏 Tamanho: $COMPRESSED_SIZE"

# Limpeza automática de backups antigos (manter apenas os últimos 7)
echo "🧹 Limpando backups antigos..."
cd $BACKUP_DIR
ls -t full_backup_*.tar.gz | tail -n +8 | xargs -r rm
echo "✅ Limpeza concluída (mantidos os 7 backups mais recentes)"

echo ""
echo "📚 Para restaurar este backup:"
echo "1. Extrair: tar -xzf full_backup_$DATE.tar.gz"
echo "2. Seguir instruções no arquivo backup_info.txt"