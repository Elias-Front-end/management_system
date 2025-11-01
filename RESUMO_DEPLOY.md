# 🚀 RESUMO EXECUTIVO - Deploy de Containers

## ⚡ Deploy Rápido - Linux

```bash
# 1. Preparar ambiente
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo usermod -aG docker $USER && sudo reboot

# 2. Clonar e configurar
git clone <SEU_REPO>
cd management_system
cp .env.example .env
nano .env  # Configurar produção

# 3. Deploy automatizado
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# 4. Firewall
sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw enable
```

## ⚡ Deploy Rápido - Windows

```powershell
# 1. Instalar Docker Desktop + Git (manual)
# 2. PowerShell como Admin
Set-ExecutionPolicy RemoteSigned -Force

# 3. Clonar e configurar
git clone <SEU_REPO>
cd management_system
Copy-Item .env.example .env
notepad .env  # Configurar produção

# 4. Deploy automatizado
.\scripts\deploy.ps1

# 5. Firewall
New-NetFirewallRule -DisplayName "HTTP-In" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "HTTPS-In" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

## 🔧 Comandos Essenciais

```bash
# Status
docker-compose -f docker-compose.prod.yml ps

# Logs
docker-compose -f docker-compose.prod.yml logs -f

# Reiniciar
docker-compose -f docker-compose.prod.yml restart

# Parar
docker-compose -f docker-compose.prod.yml down

# Backup (Linux)
./scripts/backup.sh

# Backup (Windows)
.\scripts\backup.ps1

# Monitoramento (Windows)
.\scripts\monitor.ps1
```

## 🌐 Acessos

- **Sistema:** http://SEU_SERVIDOR
- **Admin:** http://SEU_SERVIDOR/admin/
- **API:** http://SEU_SERVIDOR/api/
- **Credenciais:** admin / admin123

## 📁 Arquivos Criados

- `DEPLOY_CONTAINERS_GUIDE.md` - Guia completo
- `SERVER_DEPLOY_GUIDE.md` - Documentação detalhada
- `QUICK_DEPLOY.md` - Deploy rápido
- `scripts/deploy.sh` - Deploy Linux
- `scripts/deploy.ps1` - Deploy Windows
- `scripts/backup.sh` - Backup Linux
- `scripts/backup.ps1` - Backup Windows
- `scripts/restore.sh` - Restore Linux
- `scripts/monitor.ps1` - Monitor Windows
- `scripts/README.md` - Documentação scripts