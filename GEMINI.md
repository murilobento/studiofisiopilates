# Histórico de Desenvolvimento - Gemini Pilates Studio

Este documento serve como um registro das funcionalidades solicitadas, o que foi implementado e os próximos passos.

## Funcionalidades Principais

- [ ] **Planos**: Gerenciamento de planos de aulas.
- [ ] **Alunos**: Cadastro e gerenciamento de alunos.
- [ ] **Instrutores**: Cadastro e gerenciamento de instrutores e suas comissões.
- [ ] **Agenda**: Agenda de aulas do estúdio.
- [ ] **Evolução**: Registro da evolução dos alunos nas aulas.
- [ ] **Financeiro**: Controle de entradas e saídas.

---

## Roadmap de Desenvolvimento

### Fase 1: Planos e Alunos

- **Planos**:
  - [x] **Banco de Dados**: Criar migration para a tabela `plans` com os campos:
    - `description` (text)
    - `frequency` (integer) - Frequência semanal
    - `price` (decimal) - Valor padrão do plano
  - [x] **Backend**: Criar Model, Controller e Rotas para o CRUD de Planos.
  - [x] **Frontend**: Criar as páginas em React (utilizando Inertia.js) para:
    - Listar planos existentes.
    - Criar um novo plano.
    - Editar um plano existente.
- **Alunos**:
  - [x] **Banco de Dados**: Criar migration para a tabela `students` com os campos:
    - `name` (string)
    - `email` (string)
    - `phone` (string)
    - `plan_id` (foreign key para `plans`)
    - `custom_price` (decimal, nullable) - Para casos de preço negociado.
  - [x] **Backend**: Criar Model, Controller e Rotas para o CRUD de Alunos.
  - [x] **Frontend**: Criar as páginas em React para:
    - Listar alunos.
    - Cadastrar um novo aluno, associando a um plano e permitindo alteração de valor.
    - Editar um aluno existente.

### Fase 2: Instrutores e Agenda (Após aprovação da Fase 1)

- [ ] **Instrutores**
- [ ] **Agenda de Aulas**

### Fase 3: Funcionalidades Adicionais

- [ ] **Evolução das Aulas**
- [ ] **Controle Financeiro**
---

**Instruções para o Gemini CLI:**

- Fale sempre em português (pt-br).
- **Shadcn UI**: Sempre utilize os componentes do Shadcn UI quando aplicável.
