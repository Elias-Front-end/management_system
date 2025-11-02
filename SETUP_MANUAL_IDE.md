# 💻 Setup Manual - Desenvolvimento IDE (Windows/macOS/Linux)

## 📋 **Pré-requisitos**
- Windows 10+, macOS 10.15+, ou Linux Ubuntu 20.04+
- IDE de sua preferência (VS Code, PyCharm, etc.)
- Conexão com internet
- Privilégios de administrador

---

## 🔧 **Passo 1: Instalação do Python**

### Windows
```powershell
# Opção 1: Download direto
# Baixar Python 3.11+ de: https://www.python.org/downloads/
# Marcar "Add Python to PATH" durante instalação

# Opção 2: Via Chocolatey
choco install python

# Opção 3: Via Microsoft Store
# Buscar "Python 3.11" na Microsoft Store
```

### macOS
```bash
# Opção 1: Via Homebrew
brew install python@3.11

# Opção 2: Download direto
# Baixar de: https://www.python.org/downloads/macos/
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv python3-dev
```

### Verificar instalação
```bash
python --version  # Deve mostrar Python 3.10+
pip --version     # Deve mostrar pip 22.0+
```

---

## 🟢 **Passo 2: Instalação do Node.js**

### Windows
```powershell
# Opção 1: Download direto
# Baixar Node.js 18 LTS de: https://nodejs.org/

# Opção 2: Via Chocolatey
choco install nodejs

# Opção 3: Via Winget
winget install OpenJS.NodeJS
```

### macOS
```bash
# Opção 1: Via Homebrew
brew install node@18

# Opção 2: Download direto
# Baixar de: https://nodejs.org/
```

### Linux (Ubuntu/Debian)
```bash
# Via NodeSource (recomendado)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar se npm está incluído
npm --version
```

### Verificar instalação
```bash
node --version  # Deve mostrar v18.x.x+
npm --version   # Deve mostrar 9.x.x+
```

---

## 🗄️ **Passo 3: Instalação do PostgreSQL**

### Windows
```powershell
# Opção 1: Download direto
# Baixar de: https://www.postgresql.org/download/windows/
# Instalar com pgAdmin incluído

# Opção 2: Via Chocolatey
choco install postgresql

# Durante instalação, definir:
# - Senha do usuário postgres
# - Porta: 5432 (padrão)
```

### macOS
```bash
# Via Homebrew
brew install postgresql@14
brew services start postgresql@14

# Criar usuário postgres
createuser -s postgres
```

### Linux (Ubuntu/Debian)
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Configurar PostgreSQL
```bash
# Acessar PostgreSQL
sudo -u postgres psql

# Dentro do PostgreSQL:
CREATE USER dev_user WITH PASSWORD 'dev_password';
CREATE DATABASE management_system_dev OWNER dev_user;
GRANT ALL PRIVILEGES ON DATABASE management_system_dev TO dev_user;
\q
```

---

## 📁 **Passo 4: Clonagem do Projeto**

### 4.1 Clonar repositório
```bash
# Escolher diretório de trabalho
cd C:\Projetos  # Windows
cd ~/Projetos   # macOS/Linux

# Clonar projeto
git clone https://github.com/Elias-Front-end/management_system.git
cd management_system
```

### 4.2 Estrutura do projeto
```
management_system/
├── backend/          # Django API
├── frontend/         # React App
├── nginx/           # Configurações Nginx
├── docker-compose.yml
├── README.md
└── ...
```

---

## 🐍 **Passo 5: Configuração do Backend (Django)**

### 5.1 Criar ambiente virtual
```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate
```

### 5.2 Instalar dependências
```bash
# Atualizar pip
python -m pip install --upgrade pip

# Instalar dependências
pip install -r requirements.txt
```

### 5.3 Configurar variáveis de ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar arquivo .env
```

**Configurar no arquivo .env:**
```env
# Configurações de desenvolvimento
SECRET_KEY=django-insecure-sua-chave-de-desenvolvimento-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Banco de dados local
DATABASE_URL=postgresql://dev_user:dev_password@localhost:5432/management_system_dev

# Configurações de email (opcional para dev)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# Configurações de arquivos
STATIC_URL=/static/
MEDIA_URL=/media/
STATIC_ROOT=staticfiles/
MEDIA_ROOT=media/
```

### 5.4 Executar migrações
```bash
# Criar migrações
python manage.py makemigrations

# Aplicar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser
# Seguir instruções para criar usuário admin
```

### 5.5 Testar backend
```bash
# Iniciar servidor de desenvolvimento
python manage.py runserver

# Acessar:
# http://127.0.0.1:8000/api/ - API
# http://127.0.0.1:8000/admin/ - Admin Django
```

---

## ⚛️ **Passo 6: Configuração do Frontend (React)**

### 6.1 Instalar dependências
```bash
# Abrir novo terminal e ir para frontend
cd frontend

# Instalar dependências
npm install
```

### 6.2 Configurar variáveis de ambiente
```bash
# Criar arquivo de configuração
# Windows:
copy .env.example .env

# macOS/Linux:
cp .env.example .env
```

**Configurar no arquivo .env:**
```env
# URL da API local
VITE_API_URL=http://127.0.0.1:8000/api

# Nome da aplicação
VITE_APP_NAME=Sistema de Gestão - DEV

# Modo de desenvolvimento
VITE_NODE_ENV=development
```

### 6.3 Testar frontend
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Acessar:
# http://localhost:5173/ - Aplicação React
```

---

## 🔧 **Passo 7: Configuração do IDE**

### VS Code
```json
// .vscode/settings.json
{
    "python.defaultInterpreterPath": "./backend/venv/Scripts/python.exe",
    "python.terminal.activateEnvironment": true,
    "eslint.workingDirectories": ["frontend"],
    "typescript.preferences.importModuleSpecifier": "relative",
    "files.associations": {
        "*.env": "dotenv"
    },
    "emmet.includeLanguages": {
        "django-html": "html"
    }
}
```

```json
// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Django",
            "type": "python",
            "request": "launch",
            "program": "${workspaceFolder}/backend/manage.py",
            "args": ["runserver"],
            "django": true,
            "cwd": "${workspaceFolder}/backend",
            "env": {
                "DJANGO_SETTINGS_MODULE": "backend.settings"
            }
        }
    ]
}
```

### PyCharm
1. **Abrir projeto:** File → Open → Selecionar pasta `management_system`
2. **Configurar interpretador:** 
   - File → Settings → Project → Python Interpreter
   - Add → Existing environment → `backend/venv/Scripts/python.exe`
3. **Configurar Django:**
   - File → Settings → Languages & Frameworks → Django
   - Enable Django Support
   - Django project root: `backend`
   - Settings: `backend/settings.py`

---

## 🗃️ **Passo 8: Configuração do Banco de Dados**

### 8.1 Verificar conexão
```bash
# No diretório backend com venv ativo
python manage.py dbshell

# Se conectar com sucesso, sair com:
\q
```

### 8.2 Popular dados de teste (opcional)
```bash
# Criar fixtures de exemplo
python manage.py loaddata fixtures/sample_data.json

# Ou criar dados manualmente via admin
# http://127.0.0.1:8000/admin/
```

---

## 🧪 **Passo 9: Executar Testes**

### 9.1 Testes do Backend
```bash
cd backend
source venv/bin/activate  # Linux/macOS
# ou venv\Scripts\activate  # Windows

# Executar todos os testes
python manage.py test

# Executar testes específicos
python manage.py test core.tests

# Com pytest (se instalado)
pytest
```

### 9.2 Testes do Frontend
```bash
cd frontend

# Executar testes
npm test

# Executar testes com coverage
npm run test:coverage

# Executar linting
npm run lint

# Corrigir problemas de linting
npm run lint:fix
```

---

## 🚀 **Passo 10: Scripts de Desenvolvimento**

### 10.1 Criar scripts úteis

**Windows (start-dev.bat):**
```batch
@echo off
echo Iniciando ambiente de desenvolvimento...

start "Backend" cmd /k "cd backend && venv\Scripts\activate && python manage.py runserver"
timeout /t 3
start "Frontend" cmd /k "cd frontend && npm run dev"

echo Ambiente iniciado!
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
pause
```

**Linux/macOS (start-dev.sh):**
```bash
#!/bin/bash
echo "Iniciando ambiente de desenvolvimento..."

# Iniciar backend em background
cd backend
source venv/bin/activate
python manage.py runserver &
BACKEND_PID=$!

# Aguardar backend iniciar
sleep 3

# Iniciar frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Ambiente iniciado!"
echo "Backend: http://127.0.0.1:8000"
echo "Frontend: http://localhost:5173"
echo "PIDs: Backend=$BACKEND_PID, Frontend=$FRONTEND_PID"

# Aguardar Ctrl+C para parar
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
```

### 10.2 Tornar executável (Linux/macOS)
```bash
chmod +x start-dev.sh
```

---

## 📦 **Passo 11: Dependências Adicionais (Opcional)**

### Ferramentas de desenvolvimento
```bash
# Backend - Ferramentas úteis
pip install django-debug-toolbar
pip install django-extensions
pip install ipython

# Frontend - Ferramentas úteis
npm install -D @types/node
npm install -D prettier
npm install -D eslint-config-prettier
```

### Extensões VS Code recomendadas
- Python
- Django
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens

---

## 🔄 **Passo 12: Comandos Úteis para Desenvolvimento**

### Backend (Django)
```bash
# Criar nova app
python manage.py startapp nome_da_app

# Criar migrações
python manage.py makemigrations

# Aplicar migrações
python manage.py migrate

# Coletar arquivos estáticos
python manage.py collectstatic

# Shell Django
python manage.py shell

# Limpar banco de dados
python manage.py flush
```

### Frontend (React)
```bash
# Instalar nova dependência
npm install nome-do-pacote

# Instalar dependência de desenvolvimento
npm install -D nome-do-pacote

# Atualizar dependências
npm update

# Verificar dependências desatualizadas
npm outdated

# Build para produção
npm run build
```

---

## 🚨 **Solução de Problemas Comuns**

### Erro: "python não é reconhecido"
```bash
# Windows - Adicionar Python ao PATH
# Reinstalar Python marcando "Add Python to PATH"

# Ou adicionar manualmente:
# C:\Users\SeuUsuario\AppData\Local\Programs\Python\Python311\
# C:\Users\SeuUsuario\AppData\Local\Programs\Python\Python311\Scripts\
```

### Erro: "npm não é reconhecido"
```bash
# Reinstalar Node.js
# Verificar se npm está no PATH
```

### Erro: "psycopg2 installation error"
```bash
# Windows
pip install psycopg2-binary

# Linux
sudo apt-get install libpq-dev python3-dev
pip install psycopg2
```

### Erro: "Port 5173 is already in use"
```bash
# Matar processo na porta
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/macOS:
lsof -ti:5173 | xargs kill -9
```

### Erro: "Database connection failed"
```bash
# Verificar se PostgreSQL está rodando
# Windows: Services → PostgreSQL
# Linux: sudo systemctl status postgresql
# macOS: brew services list | grep postgresql

# Verificar credenciais no .env
# Testar conexão manual
```

---

## ✅ **Checklist de Desenvolvimento**

### Configuração inicial
- [ ] Python 3.10+ instalado
- [ ] Node.js 18+ instalado
- [ ] PostgreSQL instalado e rodando
- [ ] Projeto clonado
- [ ] Ambiente virtual criado
- [ ] Dependências instaladas
- [ ] Banco de dados configurado
- [ ] Migrações executadas
- [ ] Superusuário criado

### Ambiente funcionando
- [ ] Backend rodando em http://127.0.0.1:8000
- [ ] Frontend rodando em http://localhost:5173
- [ ] Admin acessível em http://127.0.0.1:8000/admin
- [ ] API respondendo em http://127.0.0.1:8000/api
- [ ] Testes passando
- [ ] IDE configurado

### Fluxo de trabalho
- [ ] Git configurado
- [ ] Scripts de desenvolvimento criados
- [ ] Extensões/plugins instalados
- [ ] Debugger configurado
- [ ] Linting funcionando

**🎉 Parabéns! Seu ambiente de desenvolvimento está pronto!**

---

## 📚 **Recursos Adicionais**

### Documentação
- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Comandos rápidos
```bash
# Iniciar tudo de uma vez (após configuração)
# Terminal 1:
cd backend && source venv/bin/activate && python manage.py runserver

# Terminal 2:
cd frontend && npm run dev
```