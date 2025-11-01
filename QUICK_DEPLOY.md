# 🚀 Guia Rápido de Deploy - Sistema de Gestão de Sala de Aula

## ⚡ Deploy em 5 Minutos

### 📋 Pré-requisitos
- ✅ Docker instalado e rodando
- ✅ Docker Compose disponível
- ✅ Porta 80 livre no servidor

### 🎯 Deploy Automatizado

#### Linux/macOS
```bash
# 1. Clonar repositório
git clone <repository-url>
cd management_system

# 2. Configurar ambiente
cp .env.example .env
# Edite o .env com suas configurações

# 3. Deploy automático
chmod +x deploy.sh
./deploy.sh
```

#### Windows
```powershell
# 1. Clonar repositório
git clone <repository-url>
cd management_system

# 2. Configurar ambiente
Copy-Item .env.example .env
# Edite o .env com suas configurações

# 3. Permitir scripts PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 4. Deploy automático
.\deploy.ps1
```

### 🔧 Configuração Mínima do .env

```env
# Django
DEBUG=False
SECRET_KEY=sua-chave-secreta-super-segura-aqui
ALLOWED_HOSTS=localhost,127.0.0.1,seu-dominio.com

# Database
DB_NAME=management_system_db
DB_USER=postgres
DB_PASSWORD=sua-senha-segura
DB_HOST=db
DB_PORT=5432

# URLs
FRONTEND_URL=http://localhost
BACKEND_URL=http://localhost/api
```

## 🌐 Acesso ao Sistema

Após o deploy bem-sucedido:

- **Frontend:** http://localhost/
- **Admin:** http://localhost/admin/
- **API:** http://localhost/api/

**Credenciais do Administrador:**
- Usuário: `admin`
- Senha: `admin123`

## 📊 Verificar Status

### Linux/macOS
```bash
# Status dos containers
docker-compose -f docker-compose.prod.yml ps

# Logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f

# Verificar saúde da API
curl -I http://localhost/api/
```

### Windows
```powershell
# Status dos containers
docker-compose -f docker-compose.prod.yml ps

# Logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f

# Monitoramento completo
.\scripts\monitor.ps1

# Verificar saúde da API
Invoke-WebRequest -Uri "http://localhost/api/" -Method HEAD
```

## 🔄 Comandos Úteis

### Gerenciamento Básico
```bash
# Parar sistema
docker-compose -f docker-compose.prod.yml down

# Iniciar sistema
docker-compose -f docker-compose.prod.yml up -d

# Reiniciar sistema
docker-compose -f docker-compose.prod.yml restart

# Ver logs de um serviço específico
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Backup e Restauração

#### Linux/macOS
```bash
# Fazer backup
./scripts/backup.sh

# Restaurar backup
./scripts/restore.sh
```

#### Windows
```powershell
# Fazer backup
.\scripts\backup.ps1

# Monitoramento contínuo
.\scripts\monitor.ps1 -Continuous
```

## 🚨 Solução de Problemas Rápidos

### Problema: Containers não iniciam
```bash
# Verificar logs
docker-compose -f docker-compose.prod.yml logs

# Reconstruir containers
docker-compose -f docker-compose.prod.yml up -d --build --force-recreate
```

### Problema: Erro 502 Bad Gateway
```bash
# Verificar se backend está rodando
docker-compose -f docker-compose.prod.yml ps backend

# Reiniciar backend
docker-compose -f docker-compose.prod.yml restart backend
```

### Problema: Banco de dados não conecta
```bash
# Verificar se PostgreSQL está rodando
docker-compose -f docker-compose.prod.yml ps db

# Verificar logs do banco
docker-compose -f docker-compose.prod.yml logs db

# Executar migrações manualmente
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

### Problema: Arquivos estáticos não carregam
```bash
# Coletar arquivos estáticos
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

# Reiniciar nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

## 🔐 Segurança Pós-Deploy

### 1. Alterar Senha do Admin
```bash
# Acessar shell do Django
docker-compose -f docker-compose.prod.yml exec backend python manage.py shell

# No shell Python:
from django.contrib.auth.models import User
admin = User.objects.get(username='admin')
admin.set_password('nova-senha-segura')
admin.save()
exit()
```

### 2. Configurar HTTPS (Produção)
```bash
# Editar nginx/nginx.conf
# Adicionar certificados SSL
# Reiniciar nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### 3. Configurar Firewall
```bash
# Ubuntu/Debian
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

## 📈 Monitoramento Contínuo

### Configurar Logs Automáticos
```bash
# Criar script de log rotativo
echo '#!/bin/bash
docker-compose -f docker-compose.prod.yml logs --since 24h > logs/system_$(date +%Y%m%d).log
find logs/ -name "*.log" -mtime +7 -delete' > log_rotate.sh

chmod +x log_rotate.sh

# Adicionar ao crontab (executar diariamente)
echo "0 2 * * * /path/to/management_system/log_rotate.sh" | crontab -
```

### Monitoramento de Recursos (Windows)
```powershell
# Monitoramento contínuo com alertas
.\scripts\monitor.ps1 -Continuous -IntervalSeconds 30 -ShowLogs
```

## 🎯 Próximos Passos

1. **Configurar domínio próprio** no .env
2. **Configurar SSL/HTTPS** para produção
3. **Configurar backup automático** via cron/task scheduler
4. **Configurar monitoramento** de recursos
5. **Personalizar sistema** conforme necessidades

## 📞 Suporte

- **Documentação completa:** `SERVER_DEPLOY_GUIDE.md`
- **Scripts de automação:** `scripts/README.md`
- **Deploy local:** `DEPLOY_GUIDE.md`

---

**🎉 Sistema pronto para uso!**

Acesse http://localhost/ e comece a usar o sistema de gestão de sala de aula.