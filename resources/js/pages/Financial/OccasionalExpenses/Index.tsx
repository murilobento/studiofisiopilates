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
import { DatePicker } from '@/components/ui/date-picker';
import { PlusIcon, FilterIcon, MoreVerticalIcon, FileIcon, EditIcon, TrashIcon, DownloadIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OccasionalExpense {
  id: number;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  receipt_path: string | null;
  notes: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    name: string;
  };
  hasReceipt?: boolean;
}

interface OccasionalExpensesProps {
  expenses: OccasionalExpense[];
  filters: {
    category?: string;
    start_date?: string;
    end_date?: string;
    min_amount?: number;
    max_amount?: number;
    has_receipt?: boolean;
  };
  categories: string[];
}

export default function Index({ expenses, filters, categories }: OccasionalExpensesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.start_date ? new Date(filters.start_date) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.end_date ? new Date(filters.end_date) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  );
  const [minAmount, setMinAmount] = useState(filters.min_amount?.toString() || '');
  const [maxAmount, setMaxAmount] = useState(filters.max_amount?.toString() || '');
  const [hasReceipt, setHasReceipt] = useState(filters.has_receipt || false);

  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  // Filtrar despesas
  const filteredExpenses = expenses.filter(expense => {
    return expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           expense.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Aplicar filtros
  const applyFilters = () => {
    router.get(route('occasional-expenses.index'), {
      category: selectedCategory || undefined,
      start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      end_date: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      min_amount: minAmount ? parseFloat(minAmount) : undefined,
      max_amount: maxAmount ? parseFloat(maxAmount) : undefined,
      has_receipt: hasReceipt || undefined,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  // Resetar filtros
  const resetFilters = () => {
    setSelectedCategory('');
    setStartDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    setEndDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));
    setMinAmount('');
    setMaxAmount('');
    setHasReceipt(false);
    router.get(route('occasional-expenses.index'), {}, {
      preserveState: true,
      replace: true,
    });
  };

  // Excluir despesa
  const deleteExpense = (expenseId: number) => {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
      router.delete(route('occasional-expenses.destroy', expenseId));
    }
  };

  // Download do comprovante
  const downloadReceipt = (expenseId: number) => {
    window.location.href = route('occasional-expenses.download-receipt', expenseId);
  };

  return (
    <>
      <Head title="Despesas Ocasionais" />
      
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Despesas Ocasionais</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <FilterIcon className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Link href={route('occasional-expenses.create')}>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div>
                  <Label>Data Inicial</Label>
                  <DatePicker
                    date={startDate}
                    setDate={setStartDate}
                    locale={ptBR}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label>Data Final</Label>
                  <DatePicker
                    date={endDate}
                    setDate={setEndDate}
                    locale={ptBR}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="min-amount">Valor Mínimo</Label>
                  <Input
                    id="min-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <Label htmlFor="max-amount">Valor Máximo</Label>
                  <Input
                    id="max-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="has-receipt" checked={hasReceipt} onCheckedChange={(checked) => setHasReceipt(!!checked)} />
                    <Label htmlFor="has-receipt">Apenas com comprovante</Label>
                  </div>
                </div>
                <div className="flex items-end gap-2 md:col-span-3">
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
            <CardTitle>Despesas Ocasionais</CardTitle>
            <CardDescription>
              Gerencie suas despesas não recorrentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Comprovante</TableHead>
                  <TableHead>Criado por</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>{formatCurrency(expense.amount)}</TableCell>
                      <TableCell>{formatDate(expense.expense_date)}</TableCell>
                      <TableCell>
                        {expense.hasReceipt ? (
                          <Badge variant="outline" className="cursor-pointer" onClick={() => downloadReceipt(expense.id)}>
                            <FileIcon className="h-4 w-4 mr-1" />
                            Ver
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Não</span>
                        )}
                      </TableCell>
                      <TableCell>{expense.creator?.name || '-'}</TableCell>
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
                              <Link href={route('occasional-expenses.show', expense.id)}>
                                Visualizar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={route('occasional-expenses.edit', expense.id)}>
                                <EditIcon className="h-4 w-4 mr-2" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            {expense.hasReceipt && (
                              <DropdownMenuItem onClick={() => downloadReceipt(expense.id)}>
                                <DownloadIcon className="h-4 w-4 mr-2" />
                                Download Comprovante
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => deleteExpense(expense.id)}
                            >
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Nenhuma despesa ocasional encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              Total: {formatCurrency(filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0))}
            </div>
            <Link href={route('occasional-expenses.report')}>
              <Button variant="outline" size="sm">
                <DownloadIcon className="mr-2 h-4 w-4" />
                Relatório por Categoria
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}