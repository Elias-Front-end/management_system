#!/bin/bash
# Script para configurar SSL com Let's Encrypt
# Uso: ./setup_ssl.sh seu-dominio.com

set -e

DOMAIN=${1}
EMAIL="admin@${DOMAIN}"

if [ -z "$DOMAIN" ]; then
    echo "❌ Erro: Domínio não especificado"
    echo "Uso: ./setup_ssl.sh seu-dominio.com"
    exit 1
fi

echo "🔒 Configurando SSL para o domínio: $DOMAIN"

# Verificar se o Docker e Docker Compose estão instalados
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado"
    exit 1
fi

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p ./certbot/conf
mkdir -p ./certbot/www

# Baixar configurações recomendadas do SSL
echo "⬇️ Baixando configurações SSL recomendadas..."
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > ./certbot/conf/options-ssl-nginx.conf
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > ./certbot/conf/ssl-dhparams.pem

# Criar configuração temporária do Nginx para validação
echo "🔧 Criando configuração temporária do Nginx..."
cat > ./nginx/nginx-temp.conf << EOF
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name $DOMAIN www.$DOMAIN;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            return 301 https://\$server_name\$request_uri;
        }
    }
}
EOF

# Parar containers se estiverem rodando
echo "⏹️ Parando containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Subir Nginx temporário
echo "🚀 Subindo Nginx temporário..."
docker run --rm -d \
    --name nginx-temp \
    -p 80:80 \
    -v $(pwd)/nginx/nginx-temp.conf:/etc/nginx/nginx.conf \
    -v $(pwd)/certbot/www:/var/www/certbot \
    nginx:alpine

# Aguardar Nginx inicializar
sleep 5

# Obter certificado SSL
echo "🔐 Obtendo certificado SSL..."
docker run --rm \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    -v $(pwd)/certbot/www:/var/www/certbot \
    certbot/certbot \
    certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

# Parar Nginx temporário
echo "⏹️ Parando Nginx temporário..."
docker stop nginx-temp

# Atualizar configuração do Nginx com o domínio correto
echo "🔧 Atualizando configuração do Nginx..."
sed -i "s/seu-dominio.com/$DOMAIN/g" ./nginx/nginx.conf

# Criar docker-compose para produção com SSL
echo "🐳 Atualizando docker-compose para produção..."
cat > docker-compose.ssl.yml << EOF
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    volumes:
      - media_data:/app/media
      - static_data:/app/static
    env_file:
      - .env.production
    depends_on:
      - db
    restart: unless-stopped
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: unless-stopped
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: management_system
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres_prod_password_123
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
      - static_data:/app/static
      - media_data:/app/media
    depends_on:
      - backend
      - frontend
    restart: unless-stopped
    networks:
      - app-network

  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait \$\${!}; done;'"
    restart: unless-stopped

volumes:
  postgres_data:
  media_data:
  static_data:

networks:
  app-network:
    driver: bridge
EOF

# Criar script de renovação automática
echo "🔄 Criando script de renovação automática..."
cat > ./deploy/linux/scripts/renew_ssl.sh << 'EOF'
#!/bin/bash
# Script de renovação automática do SSL

echo "🔄 Verificando renovação de certificados SSL..."

# Renovar certificados
docker-compose -f docker-compose.ssl.yml exec certbot certbot renew --quiet

# Recarregar Nginx se houve renovação
if [ $? -eq 0 ]; then
    echo "✅ Certificados verificados/renovados"
    docker-compose -f docker-compose.ssl.yml exec nginx nginx -s reload
    echo "🔄 Nginx recarregado"
else
    echo "❌ Erro na renovação dos certificados"
fi
EOF

chmod +x ./deploy/linux/scripts/renew_ssl.sh

# Criar cron job para renovação automática
echo "⏰ Configurando renovação automática (cron)..."
(crontab -l 2>/dev/null; echo "0 12 * * * $(pwd)/deploy/linux/scripts/renew_ssl.sh >> $(pwd)/logs/ssl_renewal.log 2>&1") | crontab -

# Subir aplicação com SSL
echo "🚀 Subindo aplicação com SSL..."
docker-compose -f docker-compose.ssl.yml up -d

# Aguardar inicialização
echo "⏳ Aguardando inicialização..."
sleep 30

# Verificar status
echo "✅ Verificando status..."
docker-compose -f docker-compose.ssl.yml ps

# Testar HTTPS
echo "🔍 Testando HTTPS..."
if curl -f -s https://$DOMAIN/ > /dev/null; then
    echo "✅ HTTPS funcionando corretamente!"
else
    echo "❌ Erro ao acessar HTTPS"
fi

echo ""
echo "🎉 Configuração SSL concluída!"
echo "📋 Próximos passos:"
echo "1. Verifique se o site está acessível em https://$DOMAIN"
echo "2. Configure o DNS para apontar para este servidor"
echo "3. Teste a renovação automática: ./deploy/linux/scripts/renew_ssl.sh"
echo "4. Monitore os logs: docker-compose -f docker-compose.ssl.yml logs -f"
echo ""
echo "📁 Arquivos criados:"
echo "- docker-compose.ssl.yml: Configuração com SSL"
echo "- ./deploy/linux/scripts/renew_ssl.sh: Script de renovação"
echo "- ./certbot/: Certificados SSL"
echo ""
echo "⚠️ Lembre-se de:"
echo "- Fazer backup dos certificados regularmente"
echo "- Monitorar a expiração dos certificados"
echo "- Manter o sistema atualizado"
EOF

chmod +x ./deploy/linux/scripts/setup_ssl.sh