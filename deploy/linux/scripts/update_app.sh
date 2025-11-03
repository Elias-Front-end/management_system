#!/bin/bash
# Script de atualização da aplicação
# Uso: ./update_app.sh [development|production]

set -e  # Parar execução em caso de erro

ENVIRONMENT=${1:-development}
COMPOSE_FILE="docker-compose.yml"

if [ "$ENVIRONMENT" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
fi

echo "🔄 Iniciando atualização da aplicação (ambiente: $ENVIRONMENT)..."

# Fazer backup do banco de dados
echo "📦 Fazendo backup do banco de dados..."
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR
BACKUP_FILE="$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql"

if docker-compose -f $COMPOSE_FILE ps db | grep -q "Up"; then
    docker-compose -f $COMPOSE_FILE exec -T db pg_dump -U postgres management_system > $BACKUP_FILE
    echo "✅ Backup salvo em: $BACKUP_FILE"
else
    echo "⚠️ Banco de dados não está rodando, pulando backup..."
fi

# Parar containers
echo "⏹️ Parando containers..."
docker-compose -f $COMPOSE_FILE down

# Atualizar código
echo "📥 Atualizando código..."
git pull origin main

# Reconstruir imagens
echo "🔨 Reconstruindo imagens..."
docker-compose -f $COMPOSE_FILE build --no-cache

# Executar migrações (apenas se for produção com PostgreSQL)
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🗄️ Executando migrações..."
    docker-compose -f $COMPOSE_FILE run --rm backend python manage.py migrate

    # Coletar arquivos estáticos
    echo "📁 Coletando arquivos estáticos..."
    docker-compose -f $COMPOSE_FILE run --rm backend python manage.py collectstatic --noinput
fi

# Subir containers
echo "🚀 Subindo containers..."
docker-compose -f $COMPOSE_FILE up -d

# Verificar status
echo "✅ Verificando status..."
sleep 10
docker-compose -f $COMPOSE_FILE ps

# Verificar saúde dos serviços
echo "🏥 Verificando saúde dos serviços..."
sleep 5

# Testar backend
if curl -f -s http://localhost:8000/ > /dev/null; then
    echo "✅ Backend está respondendo"
else
    echo "❌ Backend não está respondendo"
fi

# Testar frontend
if curl -f -s http://localhost:3000/ > /dev/null; then
    echo "✅ Frontend está respondendo"
else
    echo "❌ Frontend não está respondendo"
fi

echo "🎉 Atualização concluída!"
echo "📊 Para ver logs: docker-compose -f $COMPOSE_FILE logs -f"