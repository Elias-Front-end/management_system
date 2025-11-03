# 🐳 Deploy Docker - Management System

Este README contém instruções para fazer o deploy da aplicação Management System usando Docker no Linux.

## 📋 Pré-requisitos

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git
- Servidor Linux (Ubuntu 20.04+ recomendado)
- Domínio configurado (para produção com SSL)

## 🚀 Deploy Rápido

### Desenvolvimento Local

```bash
# 1. Clonar o repositório
git clone <seu-repositorio>
cd management_system

# 2. Configurar variáveis de ambiente
cp .env.development .env

# 3. Subir a aplicação
docker-compose up -d

# 4. Verificar status
docker-compose ps
```

Acesse:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Django: http://localhost:8000/admin

### Produção

```bash
# 1. Configurar variáveis de ambiente
cp .env.production .env
# Editar .env com suas configurações reais

# 2. Subir em produção
docker-compose -f docker-compose.prod.yml up -d

# 3. Executar migrações
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# 4. Criar superusuário
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# 5. Coletar arquivos estáticos
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

## 🔒 Configuração SSL (Produção)

Para configurar SSL com Let's Encrypt:

```bash
# Executar script de configuração SSL
chmod +x ./deploy/linux/scripts/setup_ssl.sh
./deploy/linux/scripts/setup_ssl.sh seu-dominio.com
```

## 🛠️ Scripts de Automação

### Atualização da Aplicação

```bash
# Desenvolvimento
./deploy/linux/scripts/update_app.sh development

# Produção
./deploy/linux/scripts/update_app.sh production
```

### Backup

```bash
# Fazer backup completo
./deploy/linux/scripts/backup.sh production

# Backups são salvos em ./backups/management_system/
```

### Monitoramento

```bash
# Verificação única
./deploy/linux/scripts/monitor.sh production

# Monitoramento contínuo
./deploy/linux/scripts/monitor.sh production --continuous
```

## 📁 Estrutura de Arquivos

```
management_system/
├── backend/
│   ├── Dockerfile              # Imagem Django
│   └── requirements.txt
├── frontend/
│   ├── Dockerfile              # Imagem React/Vite
│   ├── nginx.conf              # Configuração Nginx para SPA
│   └── package.json
├── nginx/
│   └── nginx.conf              # Configuração Nginx produção
├── deploy/linux/scripts/
│   ├── update_app.sh           # Script de atualização
│   ├── backup.sh               # Script de backup
│   ├── monitor.sh              # Script de monitoramento
│   └── setup_ssl.sh            # Configuração SSL
├── docker-compose.yml          # Desenvolvimento
├── docker-compose.prod.yml     # Produção
├── .env.development            # Variáveis desenvolvimento
└── .env.production             # Variáveis produção
```

## ⚙️ Configuração de Variáveis de Ambiente

### Desenvolvimento (.env.development)

```env
DJANGO_SECRET_KEY=sua-chave-secreta-aqui
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

### Produção (.env.production)

```env
DJANGO_SECRET_KEY=CHAVE_SUPER_SEGURA_AQUI
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=seu-dominio.com,www.seu-dominio.com
DATABASE_URL=postgresql://postgres:senha@db:5432/management_system
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-senha-app
```

## 🔧 Comandos Úteis

### Docker Compose

```bash
# Ver logs
docker-compose logs -f [serviço]

# Reiniciar serviço
docker-compose restart [serviço]

# Parar tudo
docker-compose down

# Rebuild e restart
docker-compose up -d --build

# Ver uso de recursos
docker-compose top
```

### Django (Backend)

```bash
# Executar migrações
docker-compose exec backend python manage.py migrate

# Criar superusuário
docker-compose exec backend python manage.py createsuperuser

# Coletar arquivos estáticos
docker-compose exec backend python manage.py collectstatic

# Shell Django
docker-compose exec backend python manage.py shell

# Executar testes
docker-compose exec backend python manage.py test
```

### PostgreSQL

```bash
# Conectar ao banco
docker-compose exec db psql -U postgres management_system

# Backup manual
docker-compose exec db pg_dump -U postgres management_system > backup.sql

# Restaurar backup
docker-compose exec -T db psql -U postgres management_system < backup.sql
```

## 📊 Monitoramento e Logs

### Verificar Status dos Serviços

```bash
# Status dos containers
docker-compose ps

# Uso de recursos
docker stats

# Logs em tempo real
docker-compose logs -f

# Logs específicos
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx
docker-compose logs db
```

### Health Checks

```bash
# Backend
curl http://localhost:8000/admin/

# Frontend
curl http://localhost:3000/

# Nginx
curl http://localhost/health
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de permissão nos volumes**
   ```bash
   sudo chown -R $USER:$USER ./media ./static
   ```

2. **Banco de dados não conecta**
   ```bash
   docker-compose logs db
   docker-compose restart db
   ```

3. **Frontend não carrega**
   ```bash
   docker-compose logs frontend
   docker-compose logs nginx
   ```

4. **SSL não funciona**
   ```bash
   # Verificar certificados
   docker-compose exec nginx ls -la /etc/letsencrypt/live/
   
   # Renovar certificados
   ./deploy/linux/scripts/renew_ssl.sh
   ```

### Limpeza do Sistema

```bash
# Remover containers parados
docker container prune

# Remover imagens não utilizadas
docker image prune

# Remover volumes não utilizados
docker volume prune

# Limpeza completa (CUIDADO!)
docker system prune -a
```

## 🔐 Segurança

### Checklist de Segurança

- [ ] Alterar senhas padrão
- [ ] Configurar firewall (UFW)
- [ ] Configurar SSL/TLS
- [ ] Configurar backup automático
- [ ] Monitorar logs de segurança
- [ ] Atualizar sistema regularmente
- [ ] Configurar rate limiting
- [ ] Validar configurações de CORS

### Configuração de Firewall

```bash
# Instalar UFW
sudo apt install ufw

# Configurar regras básicas
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir SSH, HTTP e HTTPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Ativar firewall
sudo ufw enable
```

## 📈 Performance

### Otimizações Recomendadas

1. **Nginx**
   - Configurar cache de arquivos estáticos
   - Habilitar compressão gzip
   - Configurar rate limiting

2. **PostgreSQL**
   - Configurar shared_buffers
   - Otimizar work_mem
   - Configurar checkpoint_segments

3. **Django**
   - Usar cache (Redis/Memcached)
   - Otimizar queries do banco
   - Configurar logging adequado

## 📞 Suporte

Para problemas ou dúvidas:

1. Verificar logs: `docker-compose logs`
2. Consultar documentação do Django/React
3. Verificar issues no repositório
4. Executar script de monitoramento

## 📝 Changelog

### v1.0.0
- Deploy inicial com Docker
- Configuração SSL automática
- Scripts de automação
- Monitoramento básico
- Backup automático

---

**Nota**: Sempre teste as configurações em ambiente de desenvolvimento antes de aplicar em produção.