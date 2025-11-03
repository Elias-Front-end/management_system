# ======================================================
# 🐳 DOCKERFILE - BACKEND DJANGO
# ======================================================

FROM python:3.10-slim

# Definir variáveis de ambiente
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=backend.settings

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar dependências Python
COPY backend/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copiar script de espera do banco (temporariamente desabilitado)
# COPY wait-for-db.sh /app/
# RUN chmod +x /app/wait-for-db.sh

# Copiar código do backend
COPY backend/ /app/

# Criar diretórios necessários
RUN mkdir -p /app/media /app/staticfiles /app/logs

# Criar usuário não-root
RUN adduser --disabled-password --gecos '' appuser \
    && chown -R appuser:appuser /app \
    && chmod -R 755 /app/logs
USER appuser

# Expor porta
EXPOSE 8000

# Comando padrão
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "backend.wsgi:application"]