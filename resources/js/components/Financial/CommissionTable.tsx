import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DollarSignIcon, DownloadIcon, FilterIcon, MoreVerticalIcon, SearchIcon } from 'lucide-react';

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

interface CommissionTableProps {
  commissions: CommissionEntry[];
  instructors: Instructor[];
  onProcessPayment?: (commissionId: number) => void;
  onProcessBatchPayment?: (commissionIds: number[]) => void;
  onExport?: () => void;
  showFilters?: boolean;
  showSearch?: boolean;
  showActions?: boolean;
  showCheckboxes?: boolean;
  showPagination?: boolean;
}

export default function CommissionTable({
  commissions,
  instructors,
  onProcessPayment,
  onProcessBatchPayment,
  onExport,
  showFilters = true,
  showSearch = true,
  showActions = true,
  showCheckboxes = true,
  showPagination = false,
}: CommissionTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
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
    let matches = true;
    
    // Filtro de pesquisa
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      matches = matches && (
        commission.instructor.name.toLowerCase().includes(searchLower) ||
        commission.monthly_payment.student.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtro de instrutor
    if (selectedInstructor) {
      matches = matches && commission.instructor_id.toString() === selectedInstructor;
    }
    
    // Filtro de status
    if (selectedStatus) {
      matches = matches && commission.status === selectedStatus;
    }
    
    return matches;
  });

  // Processar pagamento de comissão
  const processPayment = (commissionId: number) => {
    if (onProcessPayment) {
      onProcessPayment(commissionId);
    } else {
      router.post(route('commissions.process-payment', commissionId));
    }
  };

  // Processar pagamento em lote
  const processBatchPayment = () => {
    if (onProcessBatchPayment) {
      onProcessBatchPayment(selectedCommissions);
    } else {
      router.post(route('commissions.process-batch-payment'), {
        commission_ids: selectedCommissions,
      }, {
        onSuccess: () => {
          setSelectedCommissions([]);
          setShowBatchPaymentDialog(false);
        }
      });
    }
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

  // Aplicar filtros
  const applyFilters = () => {
    // Implementação opcional para filtros externos
  };

  // Resetar filtros
  const resetFilters = () => {
    setSelectedInstructor('');
    setSelectedStatus('');
  };

  return (
    <div className="space-y-4">
      {/* Barra de pesquisa e ações */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {showSearch && (
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar comissões..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        )}
        
        <div className="flex gap-2 ml-auto">
          {showFilters && (
            <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos os instrutores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os instrutores</SelectItem>
                {instructors.map((instructor) => (
                  <SelectItem key={instructor.id} value={instructor.id.toString()}>{instructor.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {showFilters && (
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          {selectedCommissions.length > 0 && showActions && (
            <Button onClick={() => setShowBatchPaymentDialog(true)}>
              <DollarSignIcon className="mr-2 h-4 w-4" />
              Pagar ({selectedCommissions.length})
            </Button>
          )}
          
          {onExport && (
            <Button variant="outline" onClick={onExport}>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          )}
        </div>
      </div>

      {/* Tabela de comissões */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {showCheckboxes && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    disabled={filteredCommissions.filter(c => c.status === 'pending').length === 0}
                  />
                </TableHead>
              )}
              <TableHead>Instrutor</TableHead>
              <TableHead>Aluno</TableHead>
              <TableHead>Valor Base</TableHead>
              <TableHead>Taxa</TableHead>
              <TableHead>Comissão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              {showActions && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCommissions.length > 0 ? (
              filteredCommissions.map((commission) => (
                <TableRow key={commission.id}>
                  {showCheckboxes && (
                    <TableCell>
                      {commission.status === 'pending' && (
                        <Checkbox
                          checked={selectedCommissions.includes(commission.id)}
                          onCheckedChange={() => toggleCommissionSelection(commission.id)}
                        />
                      )}
                    </TableCell>
                  )}
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
                  {showActions && (
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
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={showCheckboxes ? 9 : 8} className="text-center py-4">
                  Nenhuma comissão encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Resumo e totais */}
      <div className="flex justify-between items-center">
        <div>
          Total: {filteredCommissions.length} comissões
        </div>
        <div>
          Valor Total: {formatCurrency(
            filteredCommissions.reduce((sum, c) => sum + c.commission_amount, 0)
          )}
        </div>
      </div>

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
  );
}