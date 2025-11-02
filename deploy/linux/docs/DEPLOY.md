# 🚀 Guia de Deploy - Management System Linux

## 🎯 Visão Geral

Este documento fornece instruções completas para fazer o deploy do Management System em ambiente Linux usando Docker e Docker Compose.

## 📋 Pré-requisitos

Antes de iniciar o deploy, certifique-se de que:

- ✅ Servidor Linux configurado (veja [SETUP.md](SETUP.md))
- ✅ Docker e Docker Compose instalados
- ✅ Git configurado
- ✅ Usuário com permissões adequadas
- ✅ Portas 80, 8000 e 5432 disponíveis

## 🚀 Deploy Automático (Recomendado)

### Opção 1: Script de Deploy Completo

```bash
# Baixar e executar script de deploy
curl -fsSL https://raw.githubusercontent.com/seu-repo/management_system/main/deploy/linux/scripts/deploy.sh | bash

# Ou baixar primeiro e revisar
wget https://raw.githubusercontent.com/seu-repo/management_system/main/deploy/linux/scripts/deploy.sh
chmod +x deploy.sh
./deploy.sh
```

### Opção 2: Deploy com Configurações Personalizadas

```bash
# Definir variáveis de ambiente antes do deploy
export REPO_URL="https://github.com/seu-usuario/management_system.git"
export BRANCH="main"
export DOMAIN="seu-dominio.com"
export EMAIL="admin@seu-dominio.com"

# Executar deploy
./deploy.sh
```

## 🔧 Deploy Manual

### 1. Preparar Ambiente

```bash
# Criar diretório de trabalho
mkdir -p ~/management_system_deploy
cd ~/management_system_deploy

# Definir variáveis
export DEPLOY_DIR="$HOME/management_system_deploy"
export APP_DIR="$DEPLOY_DIR/management_system"
```

### 2. Clonar Repositório

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/management_system.git
cd management_system

# Verificar branch (opcional)
git checkout main
git pull origin main
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar configurações
nano .env
```

#### Configurações Essenciais (.env)

```bash
# Django
DEBUG=False
SECRET_KEY=sua-chave-secreta-super-segura-aqui
ALLOWED_HOSTS=localhost,127.0.0.1,seu-dominio.com
CORS_ALLOWED_ORIGINS=http://localhost,http://127.0.0.1,http://seu-dominio.com

# Banco de Dados
DB_NAME=management_system_db
DB_USER=postgres
DB_PASSWORD=senha-super-segura-aqui
DB_HOST=postgres
DB_PORT=5432

# Redis (Cache)
REDIS_URL=redis://redis:6379/0

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-senha-de-app

# Segurança
SECURE_SSL_REDIRECT=False
SECURE_BROWSER_XSS_FILTER=True
SECURE_CONTENT_TYPE_NOSNIFF=True
X_FRAME_OPTIONS=DENY
```

### 4. Configurar Docker Compose

```bash
# Usar arquivo de produção para Linux
cp deploy/linux/config/docker-compose.linux.yml docker-compose.yml

# Ou editar arquivo existente
nano docker-compose.yml
```

### 5. Construir e Executar

```bash
# Construir imagens
docker-compose build --no-cache

# Executar em background
docker-compose up -d

# Verificar status
docker-compose ps
```

### 6. Configurar Banco de Dados

```bash
# Aguardar PostgreSQL inicializar
sleep 30

# Executar migrações
docker-compose exec backend python manage.py migrate

# Coletar arquivos estáticos
docker-compose exec backend python manage.py collectstatic --noinput

# Criar superusuário
docker-compose exec backend python manage.py createsuperuser
```

## 🔍 Verificação do Deploy

### 1. Verificar Containers

```bash
# Status dos containers
docker-compose ps

# Logs dos serviços
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
docker-compose logs nginx
```

### 2. Testar Conectividade

```bash
# Testar backend
curl -f http://localhost:8000/admin/

# Testar API
curl -f http://localhost:8000/api/

# Testar frontend (se configurado)
curl -f http://localhost/

# Testar banco de dados
docker-compose exec postgres psql -U postgres -d management_system_db -c "SELECT version();"
```

### 3. Executar Testes Automatizados

```bash
# Baixar e executar script de testes
wget https://raw.githubusercontent.com/seu-repo/management_system/main/deploy/linux/scripts/test-deploy.sh
chmod +x test-deploy.sh
./test-deploy.sh
```

## 🔧 Configurações Avançadas

### 1. SSL/HTTPS com Let's Encrypt

```bash
# Instalar Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com

# Configurar renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Configurar Nginx Personalizado

```bash
# Editar configuração do Nginx
nano deploy/linux/config/nginx.conf

# Recriar container nginx
docker-compose up -d --force-recreate nginx
```

### 3. Configurar Backup Automático

```bash
# Criar script de backup
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="$HOME/management_system_deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup do banco de dados
docker-compose exec -T postgres pg_dump -U postgres management_system_db > "$BACKUP_DIR/db_backup_$DATE.sql"

# Backup dos arquivos de mídia
tar -czf "$BACKUP_DIR/media_backup_$DATE.tar.gz" -C . media/

# Manter apenas últimos 7 backups
find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "Backup concluído: $DATE"
EOF

chmod +x backup.sh

# Configurar cron para backup diário
crontab -e
# Adicionar: 0 2 * * * /home/deploy/management_system_deploy/backup.sh
```

## 🔄 Atualizações e Manutenção

### 1. Atualizar Aplicação

```bash
# Parar serviços
docker-compose down

# Atualizar código
git pull origin main

# Reconstruir e reiniciar
docker-compose build --no-cache
docker-compose up -d

# Executar migrações se necessário
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py collectstatic --noinput
```

### 2. Monitoramento

```bash
# Verificar uso de recursos
docker stats

# Verificar logs em tempo real
docker-compose logs -f backend

# Verificar saúde dos containers
docker-compose exec backend python manage.py check --deploy
```

### 3. Limpeza do Sistema

```bash
# Limpar containers não utilizados
docker system prune -a

# Limpar volumes não utilizados
docker volume prune

# Limpar imagens antigas
docker image prune -a
```

## 🚨 Solução de Problemas

### Problemas Comuns

#### Container não inicia
```bash
# Verificar logs
docker-compose logs nome-do-container

# Verificar configuração
docker-compose config

# Recriar container
docker-compose up -d --force-recreate nome-do-container
```

#### Erro de conexão com banco de dados
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Testar conexão
docker-compose exec postgres psql -U postgres -c "SELECT 1;"

# Verificar variáveis de ambiente
docker-compose exec backend env | grep DB_
```

#### Problemas de permissão
```bash
# Verificar permissões dos arquivos
ls -la

# Corrigir permissões se necessário
sudo chown -R $USER:$USER .
chmod -R 755 .
```

#### Erro 502 Bad Gateway
```bash
# Verificar se backend está respondendo
curl -f http://localhost:8000/admin/

# Verificar configuração do Nginx
docker-compose exec nginx nginx -t

# Reiniciar Nginx
docker-compose restart nginx
```

#### Problemas de CORS
```bash
# Verificar configuração CORS no .env
grep CORS .env

# Verificar logs do backend
docker-compose logs backend | grep -i cors
```

## 📊 Monitoramento e Logs

### 1. Logs Importantes

```bash
# Logs da aplicação Django
docker-compose logs backend

# Logs do Nginx
docker-compose logs nginx

# Logs do PostgreSQL
docker-compose logs postgres

# Logs do sistema
sudo journalctl -u docker.service
```

### 2. Métricas de Performance

```bash
# Uso de recursos por container
docker stats --no-stream

# Uso de disco
df -h
docker system df

# Uso de memória
free -h

# Processos ativos
htop
```

## 🔐 Segurança

### 1. Verificações de Segurança

```bash
# Verificar configurações de segurança
docker-compose exec backend python manage.py check --deploy

# Verificar portas abertas
ss -tlnp

# Verificar firewall
sudo ufw status
```

### 2. Hardening Básico

```bash
# Atualizar sistema regularmente
sudo apt-get update && sudo apt-get upgrade -y

# Configurar fail2ban
sudo systemctl status fail2ban

# Verificar logs de segurança
sudo tail -f /var/log/auth.log
```

## 📚 Comandos Úteis

### Gerenciamento de Containers

```bash
# Parar todos os serviços
docker-compose down

# Iniciar serviços
docker-compose up -d

# Reiniciar serviço específico
docker-compose restart backend

# Ver logs em tempo real
docker-compose logs -f

# Executar comando no container
docker-compose exec backend python manage.py shell
```

### Backup e Restore

```bash
# Backup do banco
docker-compose exec postgres pg_dump -U postgres management_system_db > backup.sql

# Restore do banco
docker-compose exec -T postgres psql -U postgres management_system_db < backup.sql

# Backup completo
tar -czf backup_completo.tar.gz .
```

## 🆘 Suporte

Para problemas não cobertos neste guia:

1. Verifique os logs: `docker-compose logs`
2. Execute o script de testes: `./test-deploy.sh`
3. Consulte a [Solução de Problemas](TROUBLESHOOTING.md)
4. Verifique a documentação do Django e Docker

---
**Nota:** Este guia assume um ambiente de produção básico. Para ambientes de alta disponibilidade, considere usar orquestradores como Kubernetes ou Docker Swarm.