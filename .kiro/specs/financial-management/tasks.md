# Implementation Plan - Módulo de Gestão Financeira

- [x] 1. Criar estrutura de banco de dados para o módulo financeiro
  - Criar migration para tabela recurring_expenses
  - Criar migration para tabela commission_entries  
  - Criar migration para tabela occasional_expenses
  - Criar migration para tabela financial_transactions
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2_

- [x] 2. Implementar modelos Eloquent com relacionamentos
  - [x] 2.1 Criar modelo RecurringExpense com validações e relacionamentos
    - Implementar validações para valores fixos e variáveis
    - Definir relacionamentos com User
    - Criar scopes para contas ativas e vencimentos
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.2 Criar modelo CommissionEntry com cálculos automáticos
    - Implementar relacionamentos com User e MonthlyPayment
    - Criar métodos para cálculo de comissões
    - Definir scopes para status pendente e pago
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 2.3 Criar modelo OccasionalExpense com suporte a anexos
    - Implementar validações para categorias e valores
    - Definir relacionamento com User
    - Criar métodos para gerenciamento de arquivos
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 2.4 Criar modelo FinancialTransaction para registro unificado
    - Implementar polimorfismo para diferentes tipos de transação
    - Definir relacionamentos e scopes por tipo
    - Criar métodos para consolidação de dados
    - _Requirements: 4.1, 4.2, 5.1_

- [x] 3. Implementar serviços de negócio
  - [x] 3.1 Criar CommissionService para cálculos automáticos
    - Implementar método calculateCommission para pagamentos confirmados
    - Criar integração com PaymentService existente
    - Implementar processamento de pagamentos de comissões
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.2 Criar ExpenseService para gerenciamento de despesas
    - Implementar CRUD para contas recorrentes
    - Criar sistema de notificações de vencimento
    - Implementar processamento de uploads de comprovantes
    - _Requirements: 1.1, 1.2, 1.5, 3.2, 3.3_

  - [x] 3.3 Criar FinancialService para consolidação de dados
    - Implementar geração de relatórios consolidados
    - Criar cálculos de indicadores financeiros
    - Implementar exportação de dados em PDF e Excel
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4. Implementar controllers para API e interface web
  - [x] 4.1 Criar RecurringExpenseController com CRUD completo
    - Implementar métodos index, create, store, show, edit, update, destroy
    - Criar validações específicas para valores fixos e variáveis
    - Implementar filtros por categoria e status
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 4.2 Criar CommissionController para gestão de comissões
    - Implementar listagem de comissões por instrutor
    - Criar método para processamento de pagamentos
    - Implementar relatórios detalhados por período
    - _Requirements: 2.4, 2.5, 2.6_

  - [x] 4.3 Criar OccasionalExpenseController com upload de arquivos
    - Implementar CRUD com validação de uploads
    - Criar sistema de categorização
    - Implementar filtros por período e categoria
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.4 Criar FinancialController para dashboard e relatórios
    - Implementar dashboard com indicadores principais
    - Criar endpoints para gráficos e análises
    - Implementar exportação de relatórios
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5. Integrar com sistema de pagamentos existente
  - [x] 5.1 Modificar PaymentService para cálculo automático de comissões
    - Adicionar hook no método processPayment
    - Implementar chamada para CommissionService
    - Criar registro automático em FinancialTransaction
    - _Requirements: 2.1, 2.2, 5.1, 5.2_

  - [x] 5.2 Criar listeners para eventos de pagamento
    - Implementar PaymentConfirmedListener
    - Criar integração com sistema de notificações
    - Implementar log de auditoria para integrações
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 6. Implementar interface frontend com React/TypeScript
  - [x] 6.1 Criar página Financial/Dashboard com indicadores
    - Implementar componentes de gráficos financeiros
    - Criar widgets de resumo mensal
    - Implementar filtros por período
    - _Requirements: 4.1, 4.2, 4.4_

  - [x] 6.2 Criar página Financial/RecurringExpenses
    - Implementar lista com filtros e ordenação
    - Criar formulários para valores fixos e variáveis
    - Implementar calendário de vencimentos
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 6.3 Criar página Financial/Commissions
    - Implementar tabela de comissões por instrutor
    - Criar interface para processamento de pagamentos
    - Implementar filtros por período e status
    - _Requirements: 2.4, 2.5, 2.6_

  - [x] 6.4 Criar página Financial/OccasionalExpenses
    - Implementar CRUD com upload de comprovantes
    - Criar sistema de categorização visual
    - Implementar filtros avançados
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 6.5 Criar página Financial/Reports com exportação
    - Implementar interface de geração de relatórios
    - Criar seletor de formatos de exportação
    - Implementar preview de relatórios
    - _Requirements: 4.3, 4.4, 4.5_

- [x] 7. Implementar componentes reutilizáveis
  - [x] 7.1 Criar componente ExpenseCard para exibição de despesas
    - Implementar design responsivo
    - Criar ações rápidas (pagar, editar, excluir)
    - Implementar indicadores visuais de status
    - _Requirements: 1.4, 3.4_

  - [x] 7.2 Criar componente CommissionTable para listagem
    - Implementar tabela com ordenação e filtros
    - Criar ações em lote para pagamentos
    - Implementar exportação de dados
    - _Requirements: 2.4, 2.5, 2.6_

  - [x] 7.3 Criar componente FinancialChart para gráficos
    - Implementar gráficos de linha para evolução
    - Criar gráficos de pizza para categorias
    - Implementar comparativos por período
    - _Requirements: 4.2, 4.4_

- [x] 8. Implementar sistema de notificações
  - [x] 8.1 Criar notificações de vencimento de contas
    - Implementar job para verificação diária
    - Criar templates de email para notificações
    - Implementar configuração de dias de antecedência
    - _Requirements: 1.6_

  - [x] 8.2 Criar notificações de comissões pendentes
    - Implementar alertas para administradores
    - Criar resumos semanais por email
    - Implementar notificações in-app
    - _Requirements: 2.5_

- [ ] 9. Implementar testes automatizados
  - [ ] 9.1 Criar testes unitários para modelos
    - Testar validações e relacionamentos
    - Testar métodos de cálculo de comissões
    - Testar scopes e accessors
    - _Requirements: Todos os requisitos de modelos_

  - [ ] 9.2 Criar testes de integração para serviços
    - Testar integração com PaymentService
    - Testar cálculos automáticos de comissões
    - Testar geração de relatórios
    - _Requirements: 2.1, 2.2, 4.1, 5.1_

  - [ ] 9.3 Criar testes de feature para controllers
    - Testar fluxos completos de CRUD
    - Testar upload de arquivos
    - Testar exportação de relatórios
    - _Requirements: 3.2, 4.5_

- [ ] 10. Configurar rotas e middleware de segurança
  - [ ] 10.1 Criar rotas para módulo financeiro
    - Definir rotas RESTful para todos os controllers
    - Implementar middleware de autenticação
    - Criar middleware de autorização por role
    - _Requirements: 5.6_

  - [ ] 10.2 Implementar controle de acesso granular
    - Criar policies para cada modelo
    - Implementar verificações de permissão
    - Criar middleware para auditoria
    - _Requirements: 5.6_

- [ ] 11. Implementar sistema de auditoria e logs
  - [ ] 11.1 Criar sistema de auditoria para operações financeiras
    - Implementar log de todas as alterações
    - Criar rastreamento de usuário responsável
    - Implementar backup automático de dados críticos
    - _Requirements: 5.4, 5.5_

  - [ ] 11.2 Criar relatórios de auditoria
    - Implementar visualização de logs de alterações
    - Criar filtros por usuário e período
    - Implementar exportação de logs
    - _Requirements: 5.4, 5.5_

- [ ] 12. Integrar com navegação e dashboard principal
  - [ ] 12.1 Adicionar menu de navegação para módulo financeiro
    - Criar itens de menu no sidebar principal
    - Implementar ícones e indicadores visuais
    - Criar breadcrumbs para navegação
    - _Requirements: 4.1_

  - [ ] 12.2 Integrar widgets financeiros no dashboard principal
    - Criar resumo financeiro na página inicial
    - Implementar alertas de vencimentos próximos
    - Criar indicadores de performance
    - _Requirements: 4.1, 4.4_