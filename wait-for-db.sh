#!/bin/bash
# Script para aguardar o banco de dados estar pronto

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

echo "Aguardando PostgreSQL em $host:$port..."

until pg_isready -h "$host" -p "$port" -U "$DATABASE_USER"; do
  >&2 echo "PostgreSQL não está disponível - aguardando..."
  sleep 2
done

>&2 echo "PostgreSQL está disponível - executando comando"
exec $cmd