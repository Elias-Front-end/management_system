# 🐧 Deploy Linux - Management System

## 📋 Visão Geral

Este diretório contém todos os recursos necessários para fazer deploy do Management System em servidores Linux usando Docker e Docker Compose.

## 🎯 Estrutura do Deploy

```
deploy/linux/
├── README.md                 # Este arquivo
├── scripts/
│   ├── setup-server.sh      # Configuração inicial do servidor
│   ├── deploy.sh            # Script de deploy automatizado
│   ├── test-deploy.sh       # Testes de validação
│   └── utils.sh             # Funções utilitárias
├── config/
│   ├── .env.production      # Variáveis de ambiente para produção
│   ├── nginx.conf           # Configuração Nginx customizada
│   └── docker-compose.linux.yml  # Docker Compose para Linux
└── docs/
    ├── SETUP.md             # Configuração detalhada do servidor
    ├── DEPLOY.md            # Processo de deploy passo a passo
    └── TROUBLESHOOTING.md   # Solução de problemas
```

## 🚀 Início Rápido

### 1. Configuração do Servidor (Uma vez apenas)
```bash
# Baixar e executar script de configuração
curl -fsSL https://raw.githubusercontent.com/seu-repo/management_system/main/deploy/linux/scripts/setup-server.sh | bash
```

### 2. Deploy da Aplicação
```bash
# Clonar repositório
git clone https://github.com/seu-repo/management_system.git
cd management_system/deploy/linux

# Executar deploy
./scripts/deploy.sh
```

### 3. Validar Deploy
```bash
# Executar testes
./scripts/test-deploy.sh
```

## 📊 Status dos Serviços

Após o deploy, os seguintes serviços estarão disponíveis:

- **Frontend:** http://seu-servidor/
- **Backend API:** http://seu-servidor/api/
- **Django Admin:** http://seu-servidor/admin/
- **Nginx Status:** http://seu-servidor/nginx-status

## 🔧 Comandos Úteis

```bash
# Ver status dos containers
docker-compose -f config/docker-compose.linux.yml ps

# Ver logs
docker-compose -f config/docker-compose.linux.yml logs -f

# Parar serviços
docker-compose -f config/docker-compose.linux.yml down

# Reiniciar serviços
docker-compose -f config/docker-compose.linux.yml restart
```

## 📚 Documentação Detalhada

- [📋 Configuração do Servidor](docs/SETUP.md)
- [🚀 Processo de Deploy](docs/DEPLOY.md)
- [🔧 Solução de Problemas](docs/TROUBLESHOOTING.md)

## 🆘 Suporte

Em caso de problemas:
1. Consulte [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
2. Verifique os logs: `docker-compose logs`
3. Execute os testes: `./scripts/test-deploy.sh`

---
**Desenvolvido para Ubuntu 20.04+ / CentOS 8+ / Debian 11+**