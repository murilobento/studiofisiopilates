# CRUD Modelo - Documentação

## Visão Geral

Este diretório contém um **CRUD modelo completo** que demonstra todos os componentes do shadcn/ui disponíveis no projeto. Use-o como referência para criar páginas consistentes e funcionais.

## Arquivos Incluídos

### 1. `Index.tsx` - Página Principal
- **Demonstração completa** de todos os componentes do shadcn/ui
- Tabela com paginação, filtros e ordenação
- Cards de estatísticas com métricas
- Componentes de entrada (inputs, selects, switches, etc.)
- Componentes de navegação (dialogs, sheets, popovers)
- Skeletons para loading states
- Breadcrumbs e navegação estrutural
- Badges, alerts e tooltips

### 2. `Create.tsx` - Página de Criação
- Formulário completo com validação
- Campos organizados em cards temáticos
- Componentes de entrada avançados
- Seções colapsíveis
- Pré-visualização de dados
- Dialogs de confirmação

### 3. `Edit.tsx` - Página de Edição
- Formulário de edição com dados pré-preenchidos
- Status do item e histórico
- Alertas de confirmação
- Botões de ação (salvar, excluir, cancelar)
- Validação de formulário

## Componentes Demonstrados

### Componentes Básicos
- `Input` - Campos de texto
- `Label` - Labels para formulários
- `Button` - Botões com variações
- `Textarea` - Campos de texto longo
- `Select` - Seleção de opções

### Componentes de Layout
- `Card` - Containers organizados
- `Alert` - Mensagens de alerta
- `Badge` - Etiquetas e tags
- `Separator` - Separadores visuais
- `Skeleton` - Estados de loading

### Componentes de Entrada
- `Switch` - Interruptores
- `Checkbox` - Caixas de seleção
- `Toggle` - Botões de alternância
- `ToggleGroup` - Grupos de alternância
- `DatePicker` - Seleção de datas
- `DateTimePicker` - Seleção de data e hora

### Componentes de Navegação
- `Dialog` - Dialogs modais
- `Sheet` - Painéis laterais
- `Popover` - Popovers flutuantes
- `AlertDialog` - Dialogs de confirmação
- `Collapsible` - Seções colapsíveis
- `Breadcrumb` - Navegação estrutural

### Componentes de Dados
- `Table` - Tabelas estruturadas
- `DataTable` - Tabelas com funcionalidades
- `Avatar` - Avatares de usuário
- `DropdownMenu` - Menus dropdown

### Componentes de Feedback
- `Tooltip` - Dicas flutuantes
- `Alert` - Alertas informativos
- `Progress` - Barras de progresso

## Padrões de Layout

### Estrutura Padrão das Páginas

```tsx
<div className="flex h-full flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
    {/* Header */}
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Título da Página</h1>
            <p className="text-muted-foreground">Descrição da página</p>
        </div>
        <div className="flex items-center space-x-2">
            {/* Botões de ação */}
        </div>
    </div>

    {/* Conteúdo principal */}
    <div className="space-y-6">
        {/* Cards organizados */}
    </div>
</div>
```

### Estrutura de Cards

```tsx
<Card>
    <CardHeader>
        <CardTitle className="flex items-center">
            <IconeComponent className="h-4 w-4 mr-2" />
            Título do Card
        </CardTitle>
        <CardDescription>
            Descrição do conteúdo
        </CardDescription>
    </CardHeader>
    <CardContent>
        {/* Conteúdo do card */}
    </CardContent>
</Card>
```

### Formulários Padronizados

```tsx
<form onSubmit={submit} className="space-y-6">
    <Card>
        <CardHeader>
            <CardTitle>Seção do Formulário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campos do formulário */}
            </div>
        </CardContent>
    </Card>
</form>
```

## Como Usar

### 1. Para Criar uma Nova Página Index

1. Copie a estrutura de `Index.tsx`
2. Substitua os dados mockados pelos seus dados reais
3. Atualize as colunas da tabela
4. Modifique os cards de estatísticas
5. Ajuste os filtros conforme necessário

### 2. Para Criar uma Nova Página Create

1. Copie a estrutura de `Create.tsx`
2. Defina os campos do formulário
3. Organize os campos em cards temáticos
4. Adicione validações específicas
5. Implemente a lógica de submit

### 3. Para Criar uma Nova Página Edit

1. Copie a estrutura de `Edit.tsx`
2. Pré-preencha os campos com dados existentes
3. Adicione lógica de atualização
4. Implemente confirmações de exclusão
5. Adicione histórico de alterações

## Boas Práticas

### 1. Nomenclatura
- Use nomes descritivos para components e variáveis
- Mantenha consistência nos nomes dos props
- Use TypeScript para tipagem

### 2. Responsividade
- Use classes do Tailwind para responsividade
- Teste em diferentes tamanhos de tela
- Priorize mobile-first

### 3. Acessibilidade
- Adicione labels apropriados
- Use ARIA attributes quando necessário
- Mantenha boa estrutura semântica

### 4. Performance
- Use React.memo quando apropriado
- Evite re-renders desnecessários
- Otimize queries e filtros

## Personalização

### Cores e Temas
```tsx
// Use as variáveis CSS do tema
className="bg-primary text-primary-foreground"
className="bg-muted text-muted-foreground"
```

### Espaçamento
```tsx
// Use classes consistentes de espaçamento
className="space-y-4"        // Espaçamento vertical
className="space-x-2"        // Espaçamento horizontal
className="gap-4"           // Gap em grid/flex
```

### Animações
```tsx
// Use transições suaves
className="transition-colors duration-200"
```

## Exemplos de Uso

Veja os arquivos neste diretório para exemplos completos de:
- Tabelas com filtros avançados
- Formulários com validação
- Componentes de navegação
- Estados de loading
- Dialogs de confirmação
- Layouts responsivos

## Dicas de Desenvolvimento

1. **Sempre teste em mobile** - Use as ferramentas de desenvolvedor
2. **Mantenha consistência** - Use os mesmos padrões em todas as páginas
3. **Documente mudanças** - Atualize este README quando necessário
4. **Teste acessibilidade** - Use ferramentas como axe-core
5. **Otimize performance** - Use React DevTools para identificar gargalos

## Estrutura de Tipos

```tsx
interface CrudItem {
    id: number;
    name: string;
    email: string;
    status: 'active' | 'inactive' | 'pending';
    // ... outros campos
}

interface CrudIndexProps extends PageProps {
    items: CrudItem[];
    // ... outros props
}
```

## Contribuindo

Para contribuir com melhorias:

1. Mantenha a estrutura existente
2. Adicione documentação para novos componentes
3. Teste em diferentes cenários
4. Mantenha compatibilidade com o tema
5. Atualize este README conforme necessário

---

**Nota**: Este CRUD modelo é apenas para demonstração e referência. Adapte conforme suas necessidades específicas. 