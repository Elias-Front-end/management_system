# Projeto Teste - StrataSec

## Objetivo e Limitações

### 1. Objetivo
Desenvolver uma **aplicação web** composta por um **front-end** e um **back-end**, conforme os requisitos descritos neste documento.

#### Back-end
- Deve ser implementado utilizando **Python 3.10 ou superior**.  
- Frameworks obrigatórios:  
  - **Django**  
  - **Django Rest Framework (DRF)**  
- Arquitetura: **Web + API RESTful**.

#### Front-end
Pode ser desenvolvido utilizando **uma das seguintes estratégias**:
1. Utilização de **templates HTML no Django**;  
2. Utilização de **frameworks de front-end** modernos como **React** — 

---

### 2. Limitações
Este processo de seleção é **privado da StrataSec** e possui as seguintes restrições:

- É **proibido compartilhar** os objetivos propostos em fóruns, repositórios públicos de código-fonte ou quaisquer outros meios.  
- É **vetado o compartilhamento total ou parcial** do código desenvolvido durante este processo de seleção.

---

### 3. Entregáveis
O candidato deve entregar:

1. **Aplicação funcional** conforme os requisitos deste escopo.  
2. **Código-fonte** estruturado e versionado, demonstrando boas práticas de desenvolvimento.  
3. **Documento de deploy e testes**, descrevendo:
   - Passos para executar o projeto;
   - Dependências necessárias;
   - Como realizar os testes locais ou em ambiente de homologacão.

> Caso o candidato enfrente dificuldades durante o desenvolvimento que impeçam a conclusão total do projeto, deve-se enviar:
> - O **código desenvolvido até o momento**;
> - Uma **descrição das dificuldades encontradas**;
> - **Próximos passos e possíveis soluções** para finalização.

---

## Escopo do Projeto

### Descrição Geral
Desenvolver uma **aplicação de gestão de sala de aula**, onde:
- O **administrador** poderá **cadastrar treinamentos, turmas e recursos** com um front-end intuitivo para os cadastros e gerenciamento;
- O **aluno** poderá **visualizar seus treinamentos e turmas matriculadas** e **acessar os recursos** disponibilizados, respeitando as regras de acesso previo e draft em um front-end intuitivo que suporte multiplos usuarios, para que tenha uma experiência de usuário intuitiva e intuitiva.

---

## 1. Estrutura de Dados

### 1.1 Treinamento
| Campo | Tipo | Descrição |
|--------|------|-----------|
| `nome` | Texto | Nome do treinamento |
| `descricao` | Texto | Descrição do treinamento |

---

### 1.2 Turma
| Campo | Tipo | Descrição |
|--------|------|-----------|
| `treinamento` | Relacionamento | Referência ao treinamento |
| `nome` | Texto | Nome da turma |
| `data_inicio` | Data | Data de início da turma |
| `data_conclusao` | Data | Data de término |
| `link_acesso` | URL | Link de acesso à turma |

---

### 1.3 Recurso
| Campo | Tipo | Descrição |
|--------|------|-----------|
| `turma` | Relacionamento | Turma associada |
| `tipo_recurso` | Enum | Tipo do recurso: `vídeo`, `arquivo_pdf`, `arquivo_zip` |
| `acesso_previo` | Booleano | Indica se o recurso tem acesso prévio |
| `draft` | Booleano | Indica se o recurso está em rascunho |
| `nome_recurso` | Texto | Nome do recurso |
| `descricao_recurso` | Texto | Descrição do recurso |

---

### 1.4 Aluno
| Campo | Tipo | Descrição |
|--------|------|-----------|
| `nome` | Texto | Nome completo do aluno |
| `email` | E-mail | E-mail do aluno |
| `telefone` | Texto | Telefone de contato |

---

### 1.5 Matrícula
| Campo | Tipo | Descrição |
|--------|------|-----------|
| `turma` | Relacionamento | Turma associada |
| `aluno` | Relacionamento | Aluno associado |

---

## 2. Regras de Negócio

1. No painel do aluno, deve ser exibida a **listagem de treinamentos e turmas** em que o aluno está matriculado.  
2. **Antes da data de início da turma**, o aluno poderá acessar **somente os recursos com “Acesso Prévio = Sim”**.  
3. **Após a data de início**, o aluno poderá acessar **todos os recursos que não estejam marcados como “Draft = Sim”**.  
4. Quando o tipo de recurso for **“vídeo”**, o sistema deve:
   - Exibir o recurso em um **player de vídeo**;
   - Oferecer a **opção de download**.  
5. Devem ser implementadas **regras de segurança** para garantir que **apenas usuários autorizados** possam acessar dados e recursos.

---

## 2.2 Dúvidas Adicionais
Em caso de dúvidas, o candidato deve entrar em contato com a equipe de recrutamento da **StrataSec** para esclarecimentos técnicos ou administrativos referentes ao processo seletivo.

