# 🐧 COMANDOS PARA DEPLOY EM LINUX - MANAGEMENT SYSTEM

## **Skeleton of Thought (SoT):**
1. Pré-requisitos do sistema
2. Comandos de preparação do ambiente
3. Execução do deploy automatizado
4. Validação e testes
5. Comandos de manutenção

## **Chain of Thought (CoT):**

### 📋 **PRÉ-REQUISITOS**

```bash
# 1. Instalar Docker e Docker Compose
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

# 2. Instalar Git
sudo apt install -y git curl

# 3. Reiniciar sessão para aplicar grupo docker
# (logout/login ou usar: newgrp docker)
```

### 🚀 **DEPLOY COMPLETO - COMANDO ÚNICO**

```bash
# Clone do repositório e execução do deploy
git clone https://github.com/Elias-Front-end/management_system.git
cd management_system
bash deploy/linux/scripts/deploy.sh
```

### 📝 **COMANDOS PASSO A PASSO DETALHADOS**

#### **1. Preparação do Ambiente**
```bash
# Criar diretório de trabalho
mkdir -p ~/management_system_deploy
cd ~/management_system_deploy

# Clonar repositório
git clone https://github.com/Elias-Front-end/management_system.git
cd management_system
```

#### **2. Configuração do Ambiente**
```bash
# O script deploy.sh automaticamente:
# - Gera senhas seguras
# - Cria arquivo .env.production
# - Configura variáveis de ambiente
# - Define configurações de segurança
```

#### **3. Build e Execução**
```bash
# Executar deploy (faz tudo automaticamente)
bash deploy/linux/scripts/deploy.sh

# OU executar manualmente:
docker-compose -f deploy/linux/config/docker-compose.linux.yml build
docker-compose -f deploy/linux/config/docker-compose.linux.yml up -d
```

#### **4. Validação do Deploy**
```bash
# Executar testes de validação
bash deploy/linux/scripts/test-deploy.sh

# Verificar status dos containers
docker ps

# Verificar logs
docker logs management_system_backend_linux
docker logs management_system_db_linux
```

### 🔧 **COMANDOS DE MANUTENÇÃO**

#### **Verificar Status**
```bash
# Status dos containers
docker ps -a

# Logs em tempo real
docker logs -f management_system_backend_linux

# Verificar saúde dos containers
docker inspect management_system_backend_linux | grep Health -A 10
```

#### **Restart dos Serviços**
```bash
# Reiniciar todos os containers
docker-compose -f deploy/linux/config/docker-compose.linux.yml restart

# Reiniciar apenas o backend
docker restart management_system_backend_linux

# Parar todos os serviços
docker-compose -f deploy/linux/config/docker-compose.linux.yml down

# Iniciar novamente
docker-compose -f deploy/linux/config/docker-compose.linux.yml up -d
```

#### **Backup e Restore**
```bash
# Backup do banco de dados
docker exec management_system_db_linux pg_dump -U management_user management_db > backup.sql

# Restore do banco de dados
docker exec -i management_system_db_linux psql -U management_user management_db < backup.sql
```

#### **Atualização do Sistema**
```bash
# Atualizar código
git pull origin main

# Rebuild e restart
docker-compose -f deploy/linux/config/docker-compose.linux.yml build
docker-compose -f deploy/linux/config/docker-compose.linux.yml up -d
```

### 🌐 **ACESSOS DO SISTEMA**

#### **URLs de Acesso**
- **API Backend**: http://localhost:8000/api/
- **Admin Django**: http://localhost:8000/admin/
- **Documentação API**: http://localhost:8000/api/docs/ (se configurado)

#### **Credenciais Padrão**
- **Admin Django**: admin / admin123 (alterar após primeiro acesso)
- **Banco de dados**: Gerado automaticamente no .env.production

### 🐛 **TROUBLESHOOTING**

#### **Container Backend Unhealthy**
```bash
# Verificar logs detalhados
docker logs management_system_backend_linux --tail 50

# Verificar conectividade com banco
docker exec management_system_backend_linux python manage.py dbshell

# Executar migrações manualmente
docker exec management_system_backend_linux python manage.py migrate
```

#### **Problemas de Permissão**
```bash
# Corrigir permissões de arquivos
sudo chown -R $USER:$USER ~/management_system_deploy

# Verificar se usuário está no grupo docker
groups $USER
```

#### **Problemas de Rede**
```bash
# Verificar portas em uso
sudo netstat -tlnp | grep :8000

# Verificar conectividade entre containers
docker network ls
docker network inspect management_system_network_linux
```

### 📊 **MONITORAMENTO**

#### **Verificar Performance**
```bash
# Uso de recursos dos containers
docker stats

# Espaço em disco
docker system df

# Limpeza de recursos não utilizados
docker system prune -f
```

#### **Logs Estruturados**
```bash
# Logs do backend com timestamp
docker logs management_system_backend_linux --timestamps

# Logs do PostgreSQL
docker logs management_system_db_linux --timestamps

# Logs do Redis
docker logs management_system_redis_linux --timestamps
```

---

## **Tree of Thought (ToT):**

### **Abordagem 1: Deploy Automatizado (Recomendado)**
- ✅ **Prós**: Rápido, confiável, configuração automática
- ✅ **Uso**: `bash deploy/linux/scripts/deploy.sh`

### **Abordagem 2: Deploy Manual**
- ✅ **Prós**: Controle total, debug fácil
- ⚠️ **Contras**: Mais propenso a erros
- ✅ **Uso**: Comandos docker-compose individuais

## **Self-consistency:**

A **abordagem automatizada** é mais confiável pois:
- Gera configurações seguras automaticamente
- Faz backup antes de alterações
- Valida pré-requisitos
- Fornece logs detalhados
- Testada em múltiplos ambientes

---

**📅 Última atualização**: 02/11/2025  
**🔧 Versão testada**: Ubuntu 22.04 LTS  
**🐳 Docker**: 24.0+ | Docker Compose: 2.0+