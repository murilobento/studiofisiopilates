# Studio FisioPilates

Sistema web completo para gestão de estúdio de fisioterapia e pilates, desenvolvido com **Laravel 11**, **React + Inertia** e **Tailwind CSS**.

## ✨ Funcionalidades principais

- **Autenticação & Segurança**
  - Login, registro, redefinição de senha, verificação de e-mail
  - Proteção CSRF em requisições fetch e Inertia
- **Gestão de Usuários**
  - Papéis: `admin`, `instrutor`, `aluno`
  - CRUD de usuários com permissões via *policies* e *middlewares*
- **Gestão de Planos**
  - Cadastro de planos com frequência semanal
  - Serviço `ClassEnrollmentService` para respeitar a frequência do plano
- **Gestão de Alunos**
  - CRUD de alunos com integração ViaCEP (consulta automática de endereço)
  - Status de matrícula (ativo, inativo, cancelado)
- **Gestão de Aulas**
  - CRUD completo (listar, criar, editar, detalhes)
  - Relação *many-to-many* entre aulas e alunos
  - Calendário interativo (FullCalendar) com:
    - Visualização semanal/mensal
    - Drag-and-drop para reagendar horário
    - Filtro por instrutor
    - Criação rápida ao selecionar horário vazio
- **Dashboard**
  - Indicadores e atalhos rápidos
- **UI/UX**
  - Layout autenticado unificado, breadcrumbs, sidebar dinâmica
  - Tema claro/escuro (auto pelo sistema ou escolha do usuário)

## 🛠️ Tecnologias & Pacotes

- Laravel 11 + PHP 8.4
- React 18 + TypeScript
- Inertia.js
- Tailwind CSS 4
- FullCalendar 6
- Pest PHP (tests)

## ✅ Checklist (Concluído)

- [x] Configuração inicial do projeto Laravel + Inertia
- [x] Autenticação, verificação de e-mail e proteção CSRF
- [x] Middleware de papéis (`RoleMiddleware`) e *policies*
- [x] CRUD de usuários, planos, alunos e aulas
- [x] Relações corretas (`class_student` pivot) e *Eloquent* explicitado
- [x] API `/api/classes` protegida e filtrável
- [x] Calendário com drag-and-drop, criação rápida e filtro de instrutor
- [x] Serviço de matrícula respeitando frequência do plano
- [x] Integração ViaCEP no cadastro de alunos
- [x] Layouts padronizados, breadcrumbs e dark mode
- [x] Testes automatizados (auth, settings, dashboard)

## 🚀 Como executar localmente

```bash
# Clonar e instalar dependências
git clone https://github.com/SEU_USUARIO/studiofisiopilates.git
cd studiofisiopilates

composer install
npm install

# Configurar .env e chave da aplicação
cp .env.example .env
php artisan key:generate

# Migrar banco e popular dados fake
php artisan migrate --seed

# Rodar aplicações
php artisan serve        # backend API
npm run dev              # frontend Vite
```

Acesse `http://localhost:8000` e faça login com as credenciais geradas pelo *seeder*.

---

Sinta-se à vontade para abrir *issues* ou *pull requests* com melhorias! :rocket:
