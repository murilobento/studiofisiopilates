# Studio FisioPilates

Sistema web completo para gestão de estúdio de fisioterapia e pilates, desenvolvido com **Laravel 11**, **React + Inertia** e **Tailwind CSS** com design **mobile-first**.

## ✨ Funcionalidades Principais

### 🔐 **Autenticação & Segurança**
- Login, registro, redefinição de senha, verificação de e-mail
- Proteção CSRF em requisições fetch e Inertia
- Middleware de autenticação e autorização por papéis

### 👥 **Gestão de Usuários**
- Papéis: `admin`, `instrutor`, `aluno`
- CRUD completo com permissões via *policies* e *middlewares*
- Interface padronizada com cards e formulários responsivos

### 📋 **Gestão de Planos**
- Cadastro de planos com frequência semanal e preços
- Cálculo automático de preços em tempo real
- Layout padronizado com validação de formulários

### 🎓 **Gestão de Alunos**
- CRUD completo com integração ViaCEP (consulta automática de endereço)
- Status de matrícula (ativo, inativo, cancelado)
- Campos completos: dados pessoais, contato, endereço, plano e instrutor
- Validação de CPF e formatação automática de telefone

### 📅 **Gestão de Aulas**
- **CRUD completo** (listar, criar, editar, detalhes)
- **Aulas Avulsas**: Criação individual de aulas
- **Aulas Recorrentes**: Sistema automatizado para gerar aulas semanais
- **Calendário Interativo** (FullCalendar) com:
  - Visualização semanal/mensal/diária
  - Drag-and-drop para reagendar horários
  - Filtro por instrutor
  - Criação rápida ao selecionar horário vazio
  - Responsividade mobile-first
- **Relação many-to-many** entre aulas e alunos
- **Controle de capacidade** (máximo de alunos por aula)

### 📊 **Dashboard**
- Indicadores e métricas do sistema
- Atalhos rápidos para funcionalidades principais
- Layout responsivo e intuitivo

### 🎨 **UI/UX Moderna**
- **Design System** baseado em shadcn/ui
- **Layout mobile-first** com responsividade completa
- **Componentes padronizados**: Cards, botões, formulários, tabelas
- **Tema claro/escuro** (auto pelo sistema ou escolha do usuário)
- **Breadcrumbs** e navegação intuitiva
- **Sidebar dinâmica** com menu colapsável
- **Feedback visual** com transições suaves

## 🛠️ Tecnologias & Pacotes

### Backend
- **Laravel 11** + PHP 8.4
- **MySQL** para banco de dados
- **Pest PHP** para testes automatizados
- **Policies** e **Middlewares** para autorização

### Frontend
- **React 18** + TypeScript
- **Inertia.js** para SPA sem API
- **Tailwind CSS 4** para estilização
- **shadcn/ui** para componentes
- **FullCalendar 6** para calendário interativo
- **Lucide React** para ícones
- **Vite** para build e desenvolvimento

### Integrações
- **ViaCEP** para consulta automática de endereços
- **Comando artisan** para replicação de aulas recorrentes

## 🎯 Funcionalidades Avançadas

### 🔄 **Sistema de Aulas Recorrentes**
- Criação de aulas que se repetem semanalmente
- Comando `php artisan replicate:classes` para gerar próxima semana
- Gestão automática de horários e instrutores

### 📱 **Responsividade Mobile-First**
- Interface otimizada para dispositivos móveis
- Tabelas responsivas com scroll horizontal
- Formulários adaptáveis a diferentes tamanhos de tela
- Calendário com navegação touch-friendly

### 🎨 **Design System Consistente**
- Componentes padronizados em todas as páginas
- Layout unificado para Create/Edit/Index
- Botões com estados visuais consistentes
- Cards organizados por seções lógicas

## ✅ Checklist Completo

### Funcionalidades Base
- [x] Configuração inicial do projeto Laravel + Inertia
- [x] Autenticação completa com verificação de e-mail
- [x] Middleware de papéis (`RoleMiddleware`) e *policies*
- [x] CRUD de usuários, planos, alunos e aulas
- [x] Relações corretas (`class_student` pivot) e *Eloquent*
- [x] API `/api/classes` protegida e filtrável
- [x] Integração ViaCEP no cadastro de alunos
- [x] Testes automatizados (auth, settings, dashboard)

### Funcionalidades Avançadas
- [x] Sistema de aulas recorrentes
- [x] Comando para replicação semanal de aulas
- [x] Calendário interativo com drag-and-drop
- [x] Filtros por instrutor no calendário
- [x] Criação rápida de aulas no calendário
- [x] Controle de capacidade de alunos por aula

### UI/UX e Design
- [x] Layout padronizado em todas as páginas
- [x] Design system baseado em shadcn/ui
- [x] Responsividade mobile-first
- [x] Tema claro/escuro
- [x] Breadcrumbs e navegação intuitiva
- [x] Sidebar dinâmica e colapsável
- [x] Componentes de formulário padronizados
- [x] Tabelas responsivas com filtros
- [x] Feedback visual e transições suaves

## 🚀 Como Executar Localmente

```bash
# Clonar e instalar dependências
git clone https://github.com/murilobento/studiofisiopilates.git
cd studiofisiopilates

composer install
npm install

# Configurar .env e chave da aplicação
cp .env.example .env
php artisan key:generate

# Configurar banco de dados no .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=studiofisiopilates
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha

# Migrar banco e popular dados fake
php artisan migrate --seed

# Rodar aplicações
php artisan serve        # backend API (http://localhost:8000)
npm run dev              # frontend Vite

# Para replicar aulas recorrentes semanalmente
php artisan replicate:classes
```

## 📱 Recursos Mobile-First

- **Interface otimizada** para smartphones e tablets
- **Navegação touch-friendly** com botões adequados
- **Calendário responsivo** com visualizações adaptáveis
- **Formulários mobile** com campos organizados
- **Tabelas com scroll** horizontal em telas pequenas
- **Menu lateral** colapsável em dispositivos móveis

## 🎨 Componentes de UI

- **Cards padronizados** para organização de conteúdo
- **Botões consistentes** com variantes (default, outline, secondary)
- **Formulários organizados** por seções lógicas
- **Tabelas responsivas** com filtros e paginação
- **Calendário interativo** com drag-and-drop
- **Breadcrumbs** para navegação
- **Sidebar dinâmica** com menu colapsável

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Executar Vite em modo desenvolvimento
npm run build            # Build para produção
php artisan serve        # Servidor Laravel

# Banco de dados
php artisan migrate      # Executar migrações
php artisan db:seed      # Popular dados fake
php artisan migrate:fresh --seed  # Recriar banco com dados

# Aulas recorrentes
php artisan replicate:classes  # Replicar aulas para próxima semana

# Testes
php artisan test         # Executar testes
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com ❤️ para gestão eficiente de estúdios de fisioterapia e pilates**

Sinta-se à vontade para abrir *issues* ou *pull requests* com melhorias! 🚀
