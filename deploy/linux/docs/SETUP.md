# 📋 Configuração Detalhada do Servidor Linux

## 🎯 Visão Geral

Este documento fornece instruções detalhadas para configurar um servidor Linux para hospedar o Management System usando Docker e Docker Compose.

## 🖥️ Requisitos do Sistema

### Requisitos Mínimos
- **CPU:** 2 cores
- **RAM:** 4 GB
- **Armazenamento:** 20 GB livres
- **OS:** Ubuntu 20.04+, CentOS 8+, ou Debian 11+
- **Rede:** Conexão com internet estável

### Requisitos Recomendados
- **CPU:** 4+ cores
- **RAM:** 8+ GB
- **Armazenamento:** 50+ GB SSD
- **OS:** Ubuntu 22.04 LTS
- **Rede:** Largura de banda adequada para usuários esperados

## 🚀 Configuração Automática (Recomendada)

### Opção 1: Script Automatizado
```bash
# Baixar e executar script de configuração
curl -fsSL https://raw.githubusercontent.com/seu-repo/management_system/main/deploy/linux/scripts/setup-server.sh | bash

# Ou baixar primeiro e revisar
wget https://raw.githubusercontent.com/seu-repo/management_system/main/deploy/linux/scripts/setup-server.sh
chmod +x setup-server.sh
./setup-server.sh
```

## 🔧 Configuração Manual

### 1. Atualizar Sistema

#### Ubuntu/Debian
```bash
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl wget git unzip htop nano ufw fail2ban ca-certificates gnupg lsb-release
```

#### CentOS/RHEL
```bash
sudo yum update -y
sudo yum install -y curl wget git unzip htop nano firewalld fail2ban ca-certificates
```

### 2. Instalar Docker

#### Ubuntu/Debian
```bash
# Remover versões antigas
sudo apt-get remove -y docker docker-engine docker.io containerd runc

# Adicionar repositório oficial
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

#### CentOS/RHEL
```bash
# Remover versões antigas
sudo yum remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine

# Instalar repositório
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Instalar Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### 3. Configurar Docker

```bash
# Iniciar e habilitar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Adicionar usuário ao grupo docker
sudo groupadd docker
sudo usermod -aG docker $USER

# Testar instalação
docker --version
docker run hello-world
```

### 4. Instalar Docker Compose

```bash
# Baixar versão mais recente
COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dar permissão de execução
sudo chmod +x /usr/local/bin/docker-compose

# Criar link simbólico
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Verificar instalação
docker-compose --version
```

### 5. Configurar Firewall

#### Ubuntu/Debian (UFW)
```bash
# Habilitar UFW
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir serviços essenciais
sudo ufw allow ssh
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Verificar status
sudo ufw status
```

#### CentOS/RHEL (Firewalld)
```bash
# Iniciar e habilitar firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Configurar regras
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# Verificar status
sudo firewall-cmd --list-all
```

### 6. Configurar Fail2Ban

```bash
# Instalar fail2ban (se não instalado)
# Ubuntu/Debian: sudo apt-get install -y fail2ban
# CentOS/RHEL: sudo yum install -y fail2ban

# Configurar fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Verificar status
sudo fail2ban-client status
```

## 🔐 Configurações de Segurança

### 1. Configurar SSH (Recomendado)

```bash
# Editar configuração SSH
sudo nano /etc/ssh/sshd_config

# Configurações recomendadas:
# Port 22 (ou mudar para porta customizada)
# PermitRootLogin no
# PasswordAuthentication yes (ou no se usar chaves)
# PubkeyAuthentication yes

# Reiniciar SSH
sudo systemctl restart sshd
```

### 2. Configurar Usuário Não-Root

```bash
# Criar usuário para deploy
sudo adduser deploy
sudo usermod -aG sudo deploy
sudo usermod -aG docker deploy

# Trocar para usuário deploy
su - deploy
```

### 3. Configurar Chaves SSH (Opcional)

```bash
# No servidor (como usuário deploy)
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Copiar chave pública do cliente
echo "sua-chave-publica-aqui" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## 📁 Estrutura de Diretórios

```bash
# Criar diretórios de trabalho
mkdir -p ~/management_system_deploy/{logs,backups,ssl}
chmod 755 ~/management_system_deploy

# Estrutura final:
# ~/management_system_deploy/
# ├── management_system/     # Código da aplicação (criado pelo deploy)
# ├── logs/                  # Logs da aplicação
# ├── backups/              # Backups do banco de dados
# └── ssl/                  # Certificados SSL (se usar HTTPS)
```

## 🌐 Configuração de Rede

### 1. Verificar Conectividade

```bash
# Verificar IP interno
hostname -I

# Verificar IP público
curl ifconfig.me

# Testar conectividade
ping -c 4 google.com
```

### 2. Configurar DNS (Opcional)

```bash
# Editar resolv.conf se necessário
sudo nano /etc/resolv.conf

# Adicionar servidores DNS confiáveis:
# nameserver 8.8.8.8
# nameserver 8.8.4.4
```

## 🔍 Verificação da Instalação

### Script de Verificação

```bash
#!/bin/bash

echo "=== Verificação da Configuração ==="

# Verificar Docker
if docker --version &> /dev/null; then
    echo "✅ Docker: $(docker --version)"
else
    echo "❌ Docker não está instalado"
fi

# Verificar Docker Compose
if docker-compose --version &> /dev/null; then
    echo "✅ Docker Compose: $(docker-compose --version)"
else
    echo "❌ Docker Compose não está instalado"
fi

# Verificar Git
if git --version &> /dev/null; then
    echo "✅ Git: $(git --version)"
else
    echo "❌ Git não está instalado"
fi

# Testar Docker
if docker run --rm hello-world &> /dev/null; then
    echo "✅ Docker está funcionando"
else
    echo "❌ Docker não está funcionando"
fi

# Verificar portas
if ss -tlnp | grep -q ":80 "; then
    echo "⚠️  Porta 80 está em uso"
else
    echo "✅ Porta 80 está livre"
fi

if ss -tlnp | grep -q ":8000 "; then
    echo "⚠️  Porta 8000 está em uso"
else
    echo "✅ Porta 8000 está livre"
fi

echo "=== Verificação Concluída ==="
```

## 🚨 Solução de Problemas

### Problemas Comuns

#### Docker não inicia
```bash
# Verificar status
sudo systemctl status docker

# Verificar logs
sudo journalctl -u docker.service

# Reiniciar Docker
sudo systemctl restart docker
```

#### Permissões do Docker
```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Fazer logout e login novamente
# Ou usar: newgrp docker
```

#### Firewall bloqueando conexões
```bash
# Ubuntu/Debian
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 8000/tcp

# CentOS/RHEL
sudo firewall-cmd --list-all
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

#### Espaço em disco insuficiente
```bash
# Verificar uso de disco
df -h

# Limpar Docker
docker system prune -a

# Limpar logs antigos
sudo journalctl --vacuum-time=7d
```

## 📚 Próximos Passos

Após completar a configuração do servidor:

1. **Deploy da Aplicação:** Siga o [Guia de Deploy](DEPLOY.md)
2. **Testes:** Execute os testes de validação
3. **Monitoramento:** Configure monitoramento contínuo
4. **Backup:** Configure backups automáticos

## 🆘 Suporte

Se encontrar problemas durante a configuração:

1. Verifique os logs: `sudo journalctl -xe`
2. Consulte a [Solução de Problemas](TROUBLESHOOTING.md)
3. Execute o script de verificação acima
4. Verifique a documentação oficial do Docker

---
**Nota:** Este guia foi testado em Ubuntu 22.04 LTS, CentOS 8, e Debian 11. Pequenos ajustes podem ser necessários para outras distribuições.