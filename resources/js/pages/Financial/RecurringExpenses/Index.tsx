import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusIcon, FilterIcon, MoreVerticalIcon, CalendarIcon, EditIcon, TrashIcon, AlertCircleIcon } from 'lucide-react';

interface RecurringExpense {
  id: number;
  name: string;
  description: string | null;
  amount: number | null;
  type: 'fixed' | 'variable';
  category: string;
  due_day: number;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    name: string;
  };
}

interface RecurringExpensesProps {
  expenses: RecurringExpense[];
  filters: {
    is_active: boolean;
    type?: string;
    category?: string;
  };
  categories: string[];
}

export default function Index({ expenses, filters, categories }: RecurringExpensesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState(filters.type || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
  const [showInactive, setShowInactive] = useState(!filters.is_active);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<RecurringExpense | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Formatar valores monetários
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Variável';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Filtrar despesas
  const filteredExpenses = expenses.filter(expense => {
    return expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           expense.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Aplicar filtros
  const applyFilters = () => {
    router.get(route('recurring-expenses.index'), {
      type: selectedType || undefined,
      category: selectedCategory || undefined,
      is_active: !showInactive,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  // Resetar filtros
  const resetFilters = () => {
    setSelectedType('');
    setSelectedCategory('');
    setShowInactive(false);
    router.get(route('recurring-expenses.index'), {
      is_active: true,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  // Registrar pagamento
  const registerPayment = () => {
    if (!selectedExpense) return;
    
    router.post(route('recurring-expenses.register-payment', selectedExpense.id), {
      amount: parseFloat(paymentAmount),
      date: new Date().toISOString().split('T')[0],
    }, {
      onSuccess: () => {
        setShowPaymentDialog(false);
        setPaymentAmount('');
        setSelectedExpense(null);
      }
    });
  };

  // Calcular status de vencimento
  const getDueStatus = (dueDay: number) => {
    const today = new Date().getDate();
    const daysUntilDue = dueDay - today;
    
    if (daysUntilDue < 0) {
      // Vencimento no próximo mês
      return { status: 'future', label: 'Em breve' };
    } else if (daysUntilDue === 0) {
      return { status: 'due', label: 'Hoje' };
    } else if (daysUntilDue <= 3) {
      return { status: 'soon', label: `Em ${daysUntilDue} dias` };
    } else {
      return { status: 'future', label: `Em ${daysUntilDue} dias` };
    }
  };

  return (
    <>
      <Head title="Despesas Recorrentes" />
      
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Despesas Recorrentes</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <FilterIcon className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Link href={route('recurring-expenses.create')}>
              <Button size="sm">
                <PlusIcon className="mr-2 h-4 w-4" />
                Nova Despesa
              </Button>
            </Link>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os tipos</SelectItem>
                      <SelectItem value="fixed">Valor Fixo</SelectItem>
                      <SelectItem value="variable">Valor Variável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as categorias</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
                    <Label htmlFor="show-inactive">Mostrar inativas</Label>
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={applyFilters}>Aplicar Filtros</Button>
                  <Button variant="outline" onClick={resetFilters}>Resetar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Barra de pesquisa */}
        <div className="mb-6">
          <Input
            placeholder="Pesquisar despesas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Tabela de despesas */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas Recorrentes</CardTitle>
            <CardDescription>
              Gerencie suas despesas fixas e variáveis mensais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense) => {
                    const dueStatus = getDueStatus(expense.due_day);
                    return (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.name}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell>
                          <Badge variant={expense.type === 'fixed' ? 'default' : 'outline'}>
                            {expense.type === 'fixed' ? 'Fixo' : 'Variável'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(expense.amount)}</TableCell>
                        <TableCell>Dia {expense.due_day}</TableCell>
                        <TableCell>
                          {expense.is_active ? (
                            <Badge variant={
                              dueStatus.status === 'due' ? 'destructive' : 
                              dueStatus.status === 'soon' ? 'warning' : 'outline'
                            }>
                              {dueStatus.label}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inativa</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVerticalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={route('recurring-expenses.show', expense.id)}>
                                  Visualizar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={route('recurring-expenses.edit', expense.id)}>
                                  <EditIcon className="h-4 w-4 mr-2" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              {expense.type === 'variable' && (
                                <DropdownMenuItem onClick={() => {
                                  setSelectedExpense(expense);
                                  setShowPaymentDialog(true);
                                }}>
                                  <CalendarIcon className="h-4 w-4 mr-2" />
                                  Registrar Pagamento
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  if (confirm('Tem certeza que deseja desativar esta despesa?')) {
                                    router.delete(route('recurring-expenses.destroy', expense.id));
                                  }
                                }}
                              >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                {expense.is_active ? 'Desativar' : 'Excluir'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Nenhuma despesa recorrente encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog para registrar pagamento */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Pagamento</DialogTitle>
              <DialogDescription>
                Informe o valor pago para a despesa {selectedExpense?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="payment-amount">Valor</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancelar</Button>
              <Button onClick={registerPayment}>Registrar Pagamento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}