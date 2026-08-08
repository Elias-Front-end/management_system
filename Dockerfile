# ---------- Etapa 1: Build do frontend ----------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
# Copia arquivos de dependência do frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
# Ajuste o comando de build caso seja diferente (ex.: npm run build, npm run export)
RUN npm run build

# ---------- Etapa 2: Instalação das dependências do backend ----------
FROM python:3.12-slim AS backend-builder
WORKDIR /app/backend
# Instala dependências do sistema necessárias para compilar libs Python
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*
# Instala dependências Python do backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ---------- Etapa 3: Imagem final ----------
# Usa uma imagem que já contém Python e instalamos Nginx nela
FROM python:3.12-slim
# Instala Nginx
RUN apt-get update && apt-get install -y --no-install-recommends nginx && sed -i 's/user www-data;/user nobody;/' /etc/nginx/nginx.conf && rm -rf /var/lib/apt/lists/*

# Copia assets estáticos gerados pelo frontend para o diretório padrão do Nginx
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
# Copia código e bibliotecas do backend
COPY --from=backend-builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=backend-builder /app/backend /app/backend

# Copia a configuração do Nginx (se houver) – opcional
COPY nginx/nginx.conf /etc/nginx/nginx.conf

WORKDIR /app/backend
EXPOSE 8000 80
# Executa migrações, inicia Django (Gunicorn) e Nginx
CMD sh -c "python3 manage.py migrate && gunicorn backend.wsgi:application --bind 0.0.0.0:8000 & nginx -g 'daemon off;'"
