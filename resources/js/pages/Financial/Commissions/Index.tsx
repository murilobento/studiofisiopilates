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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FilterIcon, MoreVerticalIcon, CheckIcon, DollarSignIcon, CalendarIcon, DownloadIcon } from 'lucide-react';

interface Instructor {
  id: number;
  name: string;
}

interface MonthlyPayment {
  id: number;
  amount: number;
  student: {
    id: number;
    name: string;
  };
}

interface CommissionEntry {
  id: number;
  instructor_id: number;
  monthly_payment_id: number;
  base_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: 'pending' | 'paid';
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  instructor: {
    id: number;
    name: string;
  };
  monthly_payment: MonthlyPayment;
}

interface CommissionsProps {
  commissions: CommissionEntry[];
  filters: {
    instructor_id?: number;
    status?: string;
    month?: number;
    year?: number;
  };
  instructors: Instructor[];
}

export default function Index({ commissions, filters, instructors }: CommissionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<string>(filters.instructor_id?.toString() || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
  const [selectedMonth, setSelectedMonth] = useState((filters.month || new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState((filters.year || new Date().getFullYear()).toString());
  const [selectedCommissions, setSelectedCommissions] = useState<number[]>([]);
  const [showBatchPaymentDialog, setShowBatchPaymentDialog] = useState(false);

  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar data
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Filtrar comissões
  const filteredCommissions = commissions.filter(commission => {
    return commission.instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           commission.monthly_payment.student.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Aplicar filtros
  const applyFilters = () => {
    router.get(route('commissions.index'), {
      instructor_id: selectedInstructor || undefined,
      status: selectedStatus || undefined,
      month: selectedMonth,
      year: selectedYear,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  // Resetar filtros
  const resetFilters = () => {
    setSelectedInstructor('');
    setSelectedStatus('');
    setSelectedMonth((new Date().getMonth() + 1).toString());
    setSelectedYear(new Date().getFullYear().toString());
    router.get(route('commissions.index'), {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    }, {
      preserveState: true,
      replace: true,
    });
  };

  // Processar pagamento de comissão
  const processPayment = (commissionId: number) => {
    router.post(route('commissions.process-payment', commissionId));
  };

  // Processar pagamento em lote
  const processBatchPayment = () => {
    router.post(route('commissions.process-batch-payment'), {
      commission_ids: selectedCommissions,
    }, {
      onSuccess: () => {
        setSelectedCommissions([]);
        setShowBatchPaymentDialog(false);
      }
    });
  };

  // Calcular comissões pendentes
  const calculatePendingCommissions = () => {
    router.post(route('commissions.calculate-pending'), {
      start_date: `${selectedYear}-${selectedMonth.padStart(2, '0')}-01`,
      end_date: `${selectedYear}-${selectedMonth.padStart(2, '0')}-${new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate()}`,
    });
  };

  // Toggle seleção de comissão
  const toggleCommissionSelection = (commissionId: number) => {
    if (selectedCommissions.includes(commissionId)) {
      setSelectedCommissions(selectedCommissions.filter(id => id !== commissionId));
    } else {
      setSelectedCommissions([...selectedCommissions, commissionId]);
    }
  };

  // Verificar se todas as comissões estão selecionadas
  const allSelected = filteredCommissions.length > 0 && 
    filteredCommissions.filter(c => c.status === 'pending').every(c => 
      selectedCommissions.includes(c.id)
    );

  // Toggle seleção de todas as comissões
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedCommissions([]);
    } else {
      setSelectedCommissions(
        filteredCommissions
          .filter(c => c.status === 'pending')
          .map(c => c.id)
      );
    }
  };

  // Gerar array de anos para o filtro (últimos 5 anos)
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Gerar array de meses para o filtro
  const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  return (
    <>
      <Head title="Comissões" />
      
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Comissões</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <FilterIcon className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button size="sm" onClick={calculatePendingCommissions}>
              <CheckIcon className="mr-2 h-4 w-4" />
              Calcular Pendentes
            </Button>
            <Link href={route('commissions.report')}>
              <Button variant="outline" size="sm">
                <DownloadIcon className="mr-2 h-4 w-4" />
                Relatório
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
                  <Label htmlFor="instructor">Instrutor</Label>
                  <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os instrutores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os instrutores</SelectItem>
                      {instructors.map((instructor) => (
                        <SelectItem key={instructor.id} value={instructor.id.toString()}>{instructor.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os status</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="month">Mês</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o mês" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">Ano</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2 md:col-span-2">
                  <Button onClick={applyFilters}>Aplicar Filtros</Button>
                  <Button variant="outline" onClick={resetFilters}>Resetar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Barra de pesquisa */}
        <div className="mb-6 flex justify-between items-center">
          <Input
            placeholder="Pesquisar comissões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          
          {selectedCommissions.length > 0 && (
            <Button onClick={() => setShowBatchPaymentDialog(true)}>
              <DollarSignIcon className="mr-2 h-4 w-4" />
              Pagar Selecionadas ({selectedCommissions.length})
            </Button>
          )}
        </div>

        {/* Tabela de comissões */}
        <Card>
          <CardHeader>
            <CardTitle>Comissões</CardTitle>
            <CardDescription>
              Gerencie as comissões dos instrutores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleSelectAll}
                      disabled={filteredCommissions.filter(c => c.status === 'pending').length === 0}
                    />
                  </TableHead>
                  <TableHead>Instrutor</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Valor Base</TableHead>
                  <TableHead>Taxa</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommissions.length > 0 ? (
                  filteredCommissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>
                        {commission.status === 'pending' && (
                          <Checkbox
                            checked={selectedCommissions.includes(commission.id)}
                            onCheckedChange={() => toggleCommissionSelection(commission.id)}
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{commission.instructor.name}</TableCell>
                      <TableCell>{commission.monthly_payment.student.name}</TableCell>
                      <TableCell>{formatCurrency(commission.base_amount)}</TableCell>
                      <TableCell>{commission.commission_rate}%</TableCell>
                      <TableCell>{formatCurrency(commission.commission_amount)}</TableCell>
                      <TableCell>
                        <Badge variant={commission.status === 'paid' ? 'success' : 'outline'}>
                          {commission.status === 'paid' ? 'Pago' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(commission.created_at)}</TableCell>
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
                              <Link href={route('commissions.show', commission.id)}>
                                Visualizar
                              </Link>
                            </DropdownMenuItem>
                            {commission.status === 'pending' && (
                              <DropdownMenuItem onClick={() => processPayment(commission.id)}>
                                <DollarSignIcon className="h-4 w-4 mr-2" />
                                Marcar como Pago
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      Nenhuma comissão encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog para pagamento em lote */}
        <Dialog open={showBatchPaymentDialog} onOpenChange={setShowBatchPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pagamento em Lote</DialogTitle>
              <DialogDescription>
                Você está prestes a marcar {selectedCommissions.length} comissões como pagas.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>
                Total a pagar: {formatCurrency(
                  filteredCommissions
                    .filter(c => selectedCommissions.includes(c.id))
                    .reduce((sum, c) => sum + c.commission_amount, 0)
                )}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBatchPaymentDialog(false)}>Cancelar</Button>
              <Button onClick={processBatchPayment}>Confirmar Pagamento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}