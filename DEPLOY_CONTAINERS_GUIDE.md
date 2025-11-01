# 🚀 Guia Completo: Deploy de Containers em Servidores

Este guia ensina como subir os containers do Sistema de Gestão de Sala de Aula em servidores **Linux** e **Windows**.

## 📋 Pré-requisitos

### Para Ambos os Sistemas:
- **Docker** instalado e funcionando
- **Docker Compose** instalado
- **Git** para clonar o repositório
- Acesso de administrador/root
- Portas **80** e **443** liberadas no firewall

### Verificação Rápida:
```bash
# Linux/macOS
docker --version
docker-compose --version

# Windows (PowerShell)
docker --version
docker-compose --version
```

---

## 🐧 Deploy em Servidor Linux (Ubuntu/CentOS/Debian)

### 1️⃣ Preparação do Ambiente

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
# ou
sudo yum update -y                       # CentOS/RHEL

# Instalar Docker (se não estiver instalado)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reiniciar para aplicar permissões
sudo reboot
```

### 2️⃣ Clonagem e Configuração

```bash
# Clonar o projeto
git clone <SEU_REPOSITORIO_URL>
cd management_system

# Copiar arquivo de ambiente
cp .env.example .env

# Editar configurações (use nano, vim ou outro editor)
nano .env
```

### 3️⃣ Configuração do .env para Produção

```bash
# Configurações essenciais para produção
DEBUG=False
SECRET_KEY=sua_chave_secreta_muito_forte_aqui_com_50_caracteres
ALLOWED_HOSTS=seu-dominio.com,www.seu-dominio.com,IP_DO_SERVIDOR

# Banco de dados
DB_NAME=management_system_prod
DB_USER=postgres
DB_PASSWORD=senha_forte_do_banco
DB_HOST=db
DB_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/0

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua_senha_de_app

# Domínio
DOMAIN=seu-dominio.com
```

### 4️⃣ Deploy Automatizado

```bash
# Dar permissão ao script
chmod +x scripts/deploy.sh

# Executar deploy
./scripts/deploy.sh

# Ou deploy manual
docker-compose -f docker-compose.prod.yml up -d --build
```

### 5️⃣ Configuração do Firewall

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable

# CentOS/RHEL (Firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## 🪟 Deploy em Servidor Windows

### 1️⃣ Preparação do Ambiente

1. **Instalar Docker Desktop:**
   - Baixar de: https://www.docker.com/products/docker-desktop
   - Executar como Administrador
   - Reiniciar o sistema

2. **Instalar Git:**
   - Baixar de: https://git-scm.com/download/win
   - Instalar com configurações padrão

3. **Configurar PowerShell:**
   ```powershell
   # Executar como Administrador
   Set-ExecutionPolicy RemoteSigned -Force
   ```

### 2️⃣ Clonagem e Configuração

```powershell
# Abrir PowerShell como Administrador
# Navegar para diretório desejado
cd C:\

# Clonar o projeto
git clone <SEU_REPOSITORIO_URL>
cd management_system

# Copiar arquivo de ambiente
Copy-Item .env.example .env

# Editar .env (usar Notepad ou outro editor)
notepad .env
```

### 3️⃣ Configuração do .env (mesmo conteúdo do Linux)

```bash
DEBUG=False
SECRET_KEY=sua_chave_secreta_muito_forte_aqui_com_50_caracteres
ALLOWED_HOSTS=seu-dominio.com,www.seu-dominio.com,IP_DO_SERVIDOR
# ... resto das configurações igual ao Linux
```

### 4️⃣ Deploy Automatizado

```powershell
# Executar script de deploy
.\scripts\deploy.ps1

# Ou deploy manual
docker-compose -f docker-compose.prod.yml up -d --build
```

### 5️⃣ Configuração do Firewall Windows

```powershell
# Executar como Administrador
# Liberar porta 80 (HTTP)
New-NetFirewallRule -DisplayName "HTTP-In" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

# Liberar porta 443 (HTTPS)
New-NetFirewallRule -DisplayName "HTTPS-In" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow

# Verificar regras
Get-NetFirewallRule -DisplayName "*HTTP*"
```

---

## 🔧 Comandos Essenciais Pós-Deploy

### Verificação de Status:
```bash
# Linux/macOS
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f

# Windows
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

### Acesso ao Sistema:
- **Frontend:** http://SEU_SERVIDOR
- **Admin Django:** http://SEU_SERVIDOR/admin/
- **API:** http://SEU_SERVIDOR/api/

### Credenciais Padrão:
- **Usuário:** admin
- **Senha:** admin123

---

## 🛠️ Scripts de Automação Disponíveis

### Linux/macOS:
```bash
./scripts/deploy.sh          # Deploy automatizado
./scripts/backup.sh          # Backup completo
./scripts/restore.sh         # Restauração
```

### Windows:
```powershell
.\scripts\deploy.ps1         # Deploy automatizado
.\scripts\backup.ps1         # Backup completo
.\scripts\monitor.ps1        # Monitoramento
```

---

## 🔍 Monitoramento e Manutenção

### Verificar Saúde dos Containers:
```bash
# Status dos containers
docker-compose -f docker-compose.prod.yml ps

# Logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f

# Uso de recursos
docker stats
```

### Comandos de Manutenção:
```bash
# Reiniciar todos os serviços
docker-compose -f docker-compose.prod.yml restart

# Parar todos os serviços
docker-compose -f docker-compose.prod.yml down

# Atualizar e reiniciar
git pull
docker-compose -f docker-compose.prod.yml up -d --build

# Limpeza do Docker
docker system prune -f
```

---

## 🚨 Solução de Problemas Comuns

### 1. Container não inicia:
```bash
# Verificar logs
docker-compose -f docker-compose.prod.yml logs nome_do_container

# Verificar configurações
docker-compose -f docker-compose.prod.yml config
```

### 2. Erro de permissão (Linux):
```bash
# Ajustar permissões
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh
```

### 3. Porta já em uso:
```bash
# Verificar processos usando a porta
sudo netstat -tulpn | grep :80
# ou no Windows
netstat -ano | findstr :80

# Parar processo conflitante
sudo kill -9 PID_DO_PROCESSO
```

### 4. Problemas de DNS/Domínio:
```bash
# Testar conectividade
curl -I http://localhost
ping seu-dominio.com

# Verificar configuração do Nginx
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

---

## 🔐 Segurança Pós-Deploy

### 1. Alterar Credenciais Padrão:
```bash
# Acessar container Django
docker-compose -f docker-compose.prod.yml exec backend python manage.py changepassword admin
```

### 2. Configurar SSL/HTTPS:
- Use Let's Encrypt com Certbot
- Configure reverse proxy no Nginx
- Redirecione HTTP para HTTPS

### 3. Backup Regular:
```bash
# Configurar cron job (Linux)
crontab -e
# Adicionar: 0 2 * * * /caminho/para/scripts/backup.sh

# Configurar Task Scheduler (Windows)
# Usar scripts/backup.ps1
```

---

## 📞 Suporte e Documentação

- **Documentação Completa:** `SERVER_DEPLOY_GUIDE.md`
- **Deploy Rápido:** `QUICK_DEPLOY.md`
- **Scripts:** `scripts/README.md`
- **Logs:** `/var/log/` (Linux) ou `C:\ProgramData\Docker\` (Windows)

---

## ✅ Checklist Final

- [ ] Docker e Docker Compose instalados
- [ ] Repositório clonado e configurado
- [ ] Arquivo `.env` configurado para produção
- [ ] Firewall configurado (portas 80 e 443)
- [ ] Deploy executado com sucesso
- [ ] Containers rodando (verificar com `docker ps`)
- [ ] Sistema acessível via navegador
- [ ] Credenciais padrão alteradas
- [ ] Backup configurado
- [ ] Monitoramento ativo

**🎉 Parabéns! Seu sistema está rodando em produção!**