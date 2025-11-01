# 🤖 Scripts de Automação - Sistema de Gestão de Sala de Aula

Este diretório contém scripts automatizados para facilitar o deploy, backup, restauração e monitoramento do sistema.

## 📋 Scripts Disponíveis

### 🚀 Deploy Automatizado

#### `../deploy.sh` (Linux/macOS)
Script completo de deploy para sistemas Unix.

**Uso:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Funcionalidades:**
- ✅ Verificação de pré-requisitos (Docker, Docker Compose)
- ✅ Backup automático do banco atual
- ✅ Atualização de código via Git
- ✅ Build e inicialização de containers
- ✅ Execução de migrações
- ✅ Criação de usuário administrador
- ✅ Verificação de saúde da aplicação
- ✅ Limpeza de imagens antigas
- ✅ Logs coloridos e informativos

#### `../deploy.ps1` (Windows)
Script completo de deploy para Windows PowerShell.

**Uso:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\deploy.ps1
```

**Parâmetros:**
- `-SkipBackup`: Pula o backup automático
- `-SkipGitPull`: Não atualiza código via Git
- `-Verbose`: Logs detalhados

**Exemplo:**
```powershell
.\deploy.ps1 -SkipBackup -Verbose
```

### 💾 Backup e Restauração

#### `backup.sh` (Linux/macOS)
Script de backup completo para sistemas Unix.

**Uso:**
```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

**O que é feito backup:**
- 🗄️ Banco de dados PostgreSQL (dump SQL)
- 📁 Arquivos de mídia (tar.gz)
- ⚙️ Configurações (.env, docker-compose, nginx)

**Configurações:**
- Retenção: 7 dias (configurável)
- Local: `./backups/`
- Formato: `backup_YYYYMMDD_HHMMSS.sql`

#### `backup.ps1` (Windows)
Script de backup completo para Windows PowerShell.

**Uso:**
```powershell
.\scripts\backup.ps1
```

**Parâmetros:**
- `-RetentionDays`: Dias de retenção (padrão: 7)
- `-BackupDir`: Diretório de backup (padrão: `.\backups`)

**Exemplo:**
```powershell
.\scripts\backup.ps1 -RetentionDays 14 -BackupDir "C:\Backups\Sistema"
```

#### `restore.sh` (Linux/macOS)
Script interativo de restauração para sistemas Unix.

**Uso:**
```bash
chmod +x scripts/restore.sh
./scripts/restore.sh
```

**Funcionalidades:**
- 📋 Lista backups disponíveis
- 🎯 Seleção interativa de backups
- 🔒 Backup de segurança antes da restauração
- ✅ Restauração seletiva (banco, mídia, configurações)
- 🔄 Verificação pós-restauração

### 📊 Monitoramento

#### `monitor.ps1` (Windows)
Script de monitoramento completo para Windows.

**Uso:**
```powershell
.\scripts\monitor.ps1
```

**Parâmetros:**
- `-Continuous`: Monitoramento contínuo
- `-IntervalSeconds`: Intervalo de atualização (padrão: 30s)
- `-ShowLogs`: Exibir logs recentes
- `-LogLines`: Número de linhas de log (padrão: 50)

**Exemplos:**
```powershell
# Verificação única
.\scripts\monitor.ps1

# Monitoramento contínuo
.\scripts\monitor.ps1 -Continuous

# Com logs recentes
.\scripts\monitor.ps1 -ShowLogs -LogLines 100

# Intervalo personalizado
.\scripts\monitor.ps1 -Continuous -IntervalSeconds 60
```

**Informações monitoradas:**
- 📊 Status dos containers
- 💻 Uso de recursos (CPU, memória, disco)
- 🏥 Saúde dos serviços (DB, API, Frontend, Nginx)
- 🐳 Informações do Docker
- 🌐 Status da rede e portas
- 📋 Logs recentes (opcional)

## 🔧 Configuração Inicial

### Linux/macOS
```bash
# Tornar todos os scripts executáveis
chmod +x deploy.sh
chmod +x scripts/*.sh

# Verificar se Docker está rodando
docker info

# Verificar se Docker Compose está disponível
docker-compose --version
```

### Windows
```powershell
# Permitir execução de scripts PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Verificar se Docker está rodando
docker info

# Verificar se Docker Compose está disponível
docker-compose --version
```

## 📁 Estrutura de Arquivos

```
management_system/
├── deploy.sh                 # Deploy Linux/macOS
├── deploy.ps1               # Deploy Windows
├── scripts/
│   ├── README.md           # Esta documentação
│   ├── backup.sh           # Backup Linux/macOS
│   ├── backup.ps1          # Backup Windows
│   ├── restore.sh          # Restauração Linux/macOS
│   └── monitor.ps1         # Monitoramento Windows
└── backups/                # Diretório de backups (criado automaticamente)
    ├── backup_YYYYMMDD_HHMMSS.sql
    ├── media_backup_YYYYMMDD_HHMMSS.tar.gz
    └── config_backup_YYYYMMDD_HHMMSS.tar.gz
```

## 🚨 Troubleshooting

### Problemas Comuns

#### "Permission denied" (Linux/macOS)
```bash
chmod +x script_name.sh
```

#### "Execution Policy" (Windows)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Docker não está rodando
```bash
# Linux
sudo systemctl start docker

# Windows
# Inicie o Docker Desktop
```

#### Containers não respondem
```bash
# Verificar logs
docker-compose -f docker-compose.prod.yml logs -f

# Reiniciar containers
docker-compose -f docker-compose.prod.yml restart
```

### Logs de Debug

#### Ver logs detalhados do deploy
```bash
# Linux
./deploy.sh 2>&1 | tee deploy.log

# Windows
.\deploy.ps1 -Verbose *> deploy.log
```

#### Ver logs dos containers
```bash
docker-compose -f docker-compose.prod.yml logs -f [service_name]
```

## 📞 Suporte

Para problemas com os scripts:

1. **Verifique os logs** dos containers e do sistema
2. **Confirme pré-requisitos** (Docker, Docker Compose)
3. **Verifique permissões** dos arquivos e diretórios
4. **Consulte a documentação** principal em `SERVER_DEPLOY_GUIDE.md`

## 🔄 Atualizações

Os scripts são versionados junto com o sistema. Para atualizar:

```bash
# Se usando Git
git pull origin main

# Ou baixe a versão mais recente do repositório
```

---

**Desenvolvido por:** Elias Moraes  
**Versão:** 1.0.0  
**Data:** $(date)