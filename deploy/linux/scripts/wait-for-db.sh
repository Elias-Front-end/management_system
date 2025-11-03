#!/bin/bash
# ======================================================
# 🔄 WAIT FOR DATABASE - MANAGEMENT SYSTEM
# ======================================================
# Script para aguardar o banco de dados ficar disponível
# antes de iniciar a aplicação Django
# ======================================================

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

echo "🔄 Aguardando banco de dados em $host:$port..."

until pg_isready -h "$host" -p "$port" -U "$DATABASE_USER"; do
  echo "⏳ Banco de dados não está pronto - aguardando..."
  sleep 2
done

echo "✅ Banco de dados está pronto!"
echo "🚀 Executando comando: $cmd"
exec $cmd