# 🎓 Sistema de Gestão de Treinamentos

Sistema completo para gestão de treinamentos, turmas e recursos educacionais, desenvolvido com Django REST Framework (backend) e React + TypeScript (frontend).

## 📋 Índice

- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Executando o Sistema](#-executando-o-sistema)
- [Criando Usuários e Dados](#-criando-usuários-e-dados)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Funcionalidades](#-funcionalidades)
- [Troubleshooting](#-troubleshooting)

## 🛠️ Pré-requisitos

### Software Necessário

1. **Python 3.10 ou superior**
   - Download: https://www.python.org/downloads/
   - ✅ Marque "Add Python to PATH" durante a instalação

2. **Node.js 18 ou superior**
   - Download: https://nodejs.org/
   - Inclui npm automaticamente

3. **Git**
   - Download: https://git-scm.com/downloads

4. **PowerShell** (já incluído no Windows)

### Verificando Instalações

Abra o PowerShell e execute os comandos para verificar:

```powershell
# Verificar Python
python --version
# Deve retornar: Python 3.10.x ou superior

# Verificar Node.js
node --version
# Deve retornar: v18.x.x ou superior

# Verificar npm
npm --version
# Deve retornar: 9.x.x ou superior

# Verificar Git
git --version
# Deve retornar: git version 2.x.x
```

## 🚀 Instalação e Configuração

### 1. Clonando o Repositório

```powershell
# Clone o repositório
git clone <URL_DO_REPOSITORIO>
cd management_system
```

### 2. Configurando o Backend (Django)

```powershell
# Navegue para o diretório do backend
cd backend

# Crie um ambiente virtual Python
python -m venv .venv

# Ative o ambiente virtual
.\.venv\Scripts\Activate.ps1

# Se houver erro de execução de scripts, execute:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Instale as dependências
pip install -r requirements.txt
```

### 3. Configurando Variáveis de Ambiente do Backend

Crie o arquivo `.env` no diretório `backend`:

```powershell
# Copie o arquivo de exemplo
copy .env.example .env
```

Edite o arquivo `.env` com as seguintes configurações para desenvolvimento:

```env
# Configurações do Django
SECRET_KEY=sua-chave-secreta-aqui-desenvolvimento
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Banco de Dados (SQLite para desenvolvimento)
DATABASE_ENGINE=sqlite
DATABASE_NAME=db.sqlite3

# CORS (para permitir frontend)
CORS_ALLOWED_ORIGINS=http://localhost:5174,http://127.0.0.1:5174
CSRF_TRUSTED_ORIGINS=http://localhost:5174,http://127.0.0.1:5174
CORS_ALLOW_CREDENTIALS=True

# JWT
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# Email (desenvolvimento)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# Arquivos
MEDIA_ROOT=media
STATIC_ROOT=staticfiles

# Aplicação
APP_NAME=Sistema de Gestão de Treinamentos
APP_VERSION=1.0.0
API_BASE_URL=http://localhost:8000/api
FRONTEND_URL=http://localhost:5174
```

### 4. Configurando o Frontend (React)

```powershell
# Volte para o diretório raiz e vá para frontend
cd ..
cd frontend

# Instale as dependências
npm install
```

Crie o arquivo `.env` no diretório `frontend`:

```env
# Frontend Environment Variables - Development
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Sistema de Gestão de Treinamentos
VITE_APP_VERSION=1.0.0
VITE_DEBUG=true
```

## 🏃‍♂️ Executando o Sistema

### 1. Preparando o Banco de Dados

```powershell
# No diretório backend (com ambiente virtual ativo)
cd backend

# Execute as migrações
python manage.py migrate

# Crie um superusuário
python manage.py createsuperuser
# OU use o script automático:
python set_admin_password.py
```

### 2. Iniciando os Servidores

**Terminal 1 - Backend:**
```powershell
# Navegue para o backend
cd backend

# Ative o ambiente virtual (se não estiver ativo)
.\.venv\Scripts\Activate.ps1

# Inicie o servidor Django
python manage.py runserver 0.0.0.0:8000
```

**Terminal 2 - Frontend:**
```powershell
# Abra um novo terminal PowerShell
# Navegue para o frontend
cd frontend

# Inicie o servidor React
npm run dev
```

### 3. Acessando o Sistema

- **Frontend (Aplicação Principal):** http://localhost:5174/
- **Backend API:** http://localhost:8000/api/
- **Admin Django:** http://localhost:8000/admin/

## 👥 Criando Usuários e Dados

### Credenciais Padrão

Se você usou o script `set_admin_password.py`:
- **Usuário:** admin
- **Senha:** admin123

### Criando Dados via Admin Django

1. Acesse: http://localhost:8000/admin/
2. Faça login com as credenciais do superusuário
3. Crie os dados na seguinte ordem:

#### 1. Treinamentos
- Clique em "Treinamentos" → "Adicionar"
- Preencha: Nome, Descrição
- Salve

#### 2. Turmas
- Clique em "Turmas" → "Adicionar"
- Selecione o Treinamento criado
- Preencha: Nome, Data de Início, Data de Conclusão
- Adicione Link de Acesso (opcional)
- Salve

#### 3. Alunos
- Clique em "Alunos" → "Adicionar"
- Preencha: Nome, Email, Telefone
- Salve

#### 4. Matrículas
- Clique em "Matrículas" → "Adicionar"
- Selecione a Turma e o Aluno
- Salve

#### 5. Recursos
- Clique em "Recursos" → "Adicionar"
- Selecione a Turma
- Escolha o Tipo (video, pdf, zip, link)
- Configure Acesso Prévio e Draft conforme necessário
- Faça upload do arquivo ou adicione URL
- Salve

### Criando Usuários via API

```powershell
# Exemplo usando PowerShell para criar usuário via API
$body = @{
    username = "novo_usuario"
    email = "usuario@exemplo.com"
    password = "senha123"
    first_name = "Nome"
    last_name = "Sobrenome"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/auth/register/" -Method POST -Body $body -ContentType "application/json"
```

## 📁 Estrutura do Projeto

```
management_system/
├── backend/                 # Django REST Framework
│   ├── backend/            # Configurações do Django
│   ├── core/               # App principal
│   ├── manage.py           # Comando Django
│   ├── requirements.txt    # Dependências Python
│   └── .env               # Variáveis de ambiente
├── frontend/               # React + TypeScript
│   ├── src/               # Código fonte
│   ├── public/            # Arquivos públicos
│   ├── package.json       # Dependências Node.js
│   └── .env              # Variáveis de ambiente
├── docker-compose.yml     # Docker para produção
└── README.md             # Este arquivo
```

## ⚡ Funcionalidades

### Para Administradores
- ✅ Cadastro de Treinamentos
- ✅ Gestão de Turmas
- ✅ Upload e gestão de Recursos
- ✅ Controle de Matrículas
- ✅ Relatórios e estatísticas

### Para Alunos
- ✅ Visualização de Treinamentos matriculados
- ✅ Acesso a Recursos por regras de negócio
- ✅ Download de materiais
- ✅ Player de vídeo integrado

### Regras de Negócio
- 📅 **Antes do início:** Alunos acessam apenas recursos com "Acesso Prévio"
- 🚀 **Após o início:** Alunos acessam recursos que não estão em "Draft"
- 🎥 **Vídeos:** Player integrado com opção de download
- 🔒 **Segurança:** Autenticação JWT obrigatória

## 🧪 Testes e Validação

### Validação Rápida do Sistema
Após seguir todos os passos de instalação, execute estes comandos para validar:

```powershell
# 1. Verificar Backend
Invoke-WebRequest -Uri "http://localhost:8000/admin/" -Method GET
# Resultado esperado: Status 200 OK

# 2. Verificar Frontend  
Invoke-WebRequest -Uri "http://localhost:5174/" -Method GET
# Resultado esperado: Status 200 OK

# 3. Verificar Integração (Proxy)
Invoke-WebRequest -Uri "http://localhost:5174/api/treinamentos/" -Method GET
# Resultado esperado: Status 401 (autenticação necessária - isso é correto!)
```

### Testes Completos
Para uma validação completa do sistema, consulte o arquivo `GUIA_TESTES.md` que contém:
- ✅ Testes de todos os endpoints da API
- ✅ Validação da interface administrativa
- ✅ Verificação de segurança e autenticação
- ✅ Testes de integração frontend-backend
- ✅ Checklist completo de validação

### Status dos Testes (Última Validação)
- 🟢 **Backend Django:** ✅ Funcionando na porta 8000
- 🟢 **Frontend React:** ✅ Funcionando na porta 5174  
- 🟢 **API Endpoints:** ✅ Protegidos por autenticação
- 🟢 **Django Admin:** ✅ Acessível (admin/admin123)
- 🟢 **Proxy Vite:** ✅ Redirecionamento funcionando
- 🟢 **Segurança:** ✅ Endpoints protegidos corretamente
- 🟢 **Banco de Dados:** ✅ SQLite funcionando

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Execução de Scripts PowerShell
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 2. Erro "psycopg2-binary" na Instalação
Para desenvolvimento local, comente a linha no `requirements.txt`:
```
# psycopg2-binary==2.9.9  # Comentado para desenvolvimento local com SQLite
```

#### 3. Erro de CORS no Frontend
Verifique se as URLs no `.env` do backend estão corretas:
```env
CORS_ALLOWED_ORIGINS=http://localhost:5174,http://127.0.0.1:5174
```

#### 4. Porta já em Uso
Se as portas 8000 ou 5174 estiverem ocupadas:
```powershell
# Para backend (mude a porta)
python manage.py runserver 0.0.0.0:8001

# Para frontend (mude no package.json ou use)
npm run dev -- --port 5175
```

#### 5. Problemas com Ambiente Virtual
```powershell
# Desative e reative o ambiente
deactivate
.\.venv\Scripts\Activate.ps1

# Se não funcionar, recrie o ambiente
Remove-Item -Recurse -Force .venv
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Comandos Úteis

```powershell
# Verificar status dos servidores
netstat -an | findstr :8000    # Backend
netstat -an | findstr :5174    # Frontend

# Limpar cache do npm
npm cache clean --force

# Resetar migrações Django (cuidado!)
Remove-Item -Recurse -Force core\migrations\0*.py
python manage.py makemigrations
python manage.py migrate

# Coletar arquivos estáticos
python manage.py collectstatic --noinput
```

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique a seção [Troubleshooting](#-troubleshooting)
2. Consulte os logs dos servidores
3. Verifique as configurações dos arquivos `.env`

---

**Desenvolvido usando Django REST Framework + React + TypeScript**