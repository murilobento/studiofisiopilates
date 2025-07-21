# Requirements Document

## Introduction

Este documento define os requisitos para o módulo de Gestão Financeira do Studio, que permitirá o controle completo das finanças incluindo contas recorrentes, comissões de professores e lançamentos ocasionais. O módulo visa centralizar todas as informações financeiras do studio em uma interface integrada ao sistema existente.

## Requirements

### Requirement 1

**User Story:** Como administrador do studio, eu quero gerenciar contas recorrentes (aluguel, água, energia), para que eu possa controlar os gastos fixos e variáveis mensalmente.

#### Acceptance Criteria

1. WHEN o usuário acessa o módulo financeiro THEN o sistema SHALL exibir uma seção para contas recorrentes
2. WHEN o usuário cadastra uma conta recorrente THEN o sistema SHALL permitir definir se é valor fixo ou variável
3. WHEN uma conta é definida como valor fixo THEN o sistema SHALL manter o mesmo valor todos os meses
4. WHEN uma conta é definida como variável THEN o sistema SHALL permitir inserir valor diferente a cada mês
5. WHEN o usuário visualiza contas recorrentes THEN o sistema SHALL exibir histórico de pagamentos por mês
6. WHEN uma conta recorrente vence THEN o sistema SHALL notificar o usuário sobre o vencimento

### Requirement 2

**User Story:** Como administrador do studio, eu quero que as comissões dos professores sejam calculadas automaticamente baseadas nos pagamentos confirmados, para que eu tenha controle preciso dos valores devidos.

#### Acceptance Criteria

1. WHEN um pagamento é confirmado em /payments THEN o sistema SHALL calcular automaticamente a comissão do professor responsável
2. WHEN o cálculo de comissão é feito THEN o sistema SHALL usar a porcentagem definida no cadastro do professor
3. WHEN uma comissão é calculada THEN o sistema SHALL criar um lançamento automático no módulo financeiro
4. WHEN o usuário visualiza comissões THEN o sistema SHALL exibir detalhes do pagamento que originou a comissão
5. WHEN uma comissão é gerada THEN o sistema SHALL permitir marcar como paga ou pendente
6. WHEN o usuário acessa relatório de comissões THEN o sistema SHALL exibir totais por professor e período

### Requirement 3

**User Story:** Como administrador do studio, eu quero registrar lançamentos ocasionais de gastos não previstos, para que eu tenha controle completo de todas as despesas do studio.

#### Acceptance Criteria

1. WHEN o usuário acessa lançamentos ocasionais THEN o sistema SHALL permitir criar novo lançamento
2. WHEN um lançamento ocasional é criado THEN o sistema SHALL exigir descrição, valor, data e categoria
3. WHEN o usuário cria um lançamento THEN o sistema SHALL permitir anexar comprovantes ou notas fiscais
4. WHEN lançamentos são visualizados THEN o sistema SHALL permitir filtrar por categoria, período e valor
5. WHEN um lançamento é editado THEN o sistema SHALL manter histórico de alterações
6. WHEN o usuário visualiza relatórios THEN o sistema SHALL incluir lançamentos ocasionais nos totais

### Requirement 4

**User Story:** Como administrador do studio, eu quero visualizar relatórios financeiros consolidados, para que eu possa tomar decisões baseadas em dados precisos sobre a saúde financeira do negócio.

#### Acceptance Criteria

1. WHEN o usuário acessa relatórios financeiros THEN o sistema SHALL exibir dashboard com resumo mensal
2. WHEN relatórios são gerados THEN o sistema SHALL incluir receitas, despesas fixas, variáveis e comissões
3. WHEN o usuário seleciona período THEN o sistema SHALL permitir filtrar dados por mês, trimestre ou ano
4. WHEN relatórios são visualizados THEN o sistema SHALL exibir gráficos de evolução financeira
5. WHEN o usuário exporta relatórios THEN o sistema SHALL permitir download em PDF e Excel
6. WHEN dados são apresentados THEN o sistema SHALL calcular margem de lucro e indicadores financeiros

### Requirement 5

**User Story:** Como administrador do studio, eu quero que o módulo financeiro se integre com o sistema de pagamentos existente, para que os dados sejam consistentes e atualizados automaticamente.

#### Acceptance Criteria

1. WHEN um pagamento é processado THEN o sistema SHALL atualizar automaticamente as receitas no módulo financeiro
2. WHEN comissões são calculadas THEN o sistema SHALL usar dados reais dos pagamentos confirmados
3. WHEN relatórios são gerados THEN o sistema SHALL incluir dados de todas as fontes integradas
4. WHEN dados são sincronizados THEN o sistema SHALL manter consistência entre módulos
5. WHEN erros de integração ocorrem THEN o sistema SHALL notificar o usuário e permitir correção manual
6. WHEN o usuário visualiza transações THEN o sistema SHALL exibir origem dos dados (automático ou manual)