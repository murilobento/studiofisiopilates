import React from 'react';
import { Link, router } from '@inertiajs/react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircleIcon, CalendarIcon, CreditCardIcon, EditIcon, FileIcon, MoreVerticalIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

interface BaseExpense {
  id: number;
  amount: number | null;
  category: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    name: string;
  };
}

interface RecurringExpense extends BaseExpense {
  name: string;
  description: string | null;
  type: 'fixed' | 'variable';
  due_day: number;
  is_active: boolean;
}

interface OccasionalExpense extends BaseExpense {
  description: string;
  expense_date: string;
  receipt_path: string | null;
  notes: string | null;
  hasReceipt?: boolean;
}

type ExpenseType = 'recurring' | 'occasional';

interface ExpenseCardProps {
  expense: RecurringExpense | OccasionalExpense;
  type: ExpenseType;
  onPayment?: (expense: RecurringExpense, amount: number) => void;
  onDelete?: (expense: RecurringExpense | OccasionalExpense) => void;
  onDownloadReceipt?: (expense: OccasionalExpense) => void;
}

export default function ExpenseCard({ expense, type, onPayment, onDelete, onDownloadReceipt }: ExpenseCardProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Formatar valores monetários
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Variável';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Calcular status de vencimento para despesas recorrentes
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

  // Registrar pagamento
  const registerPayment = () => {
    if (type === 'recurring' && onPayment) {
      onPayment(expense as RecurringExpense, parseFloat(paymentAmount));
      setShowPaymentDialog(false);
      setPaymentAmount('');
    }
  };

  // Excluir despesa
  const handleDelete = () => {
    if (onDelete) {
      onDelete(expense);
    } else {
      if (confirm('Tem certeza que deseja excluir esta despesa?')) {
        const route = type === 'recurring' 
          ? route('recurring-expenses.destroy', expense.id)
          : route('occasional-expenses.destroy', expense.id);
        router.delete(route);
      }
    }
  };

  // Download do comprovante
  const handleDownloadReceipt = () => {
    if (type === 'occasional' && onDownloadReceipt) {
      onDownloadReceipt(expense as OccasionalExpense);
    } else if (type === 'occasional') {
      window.location.href = route('occasional-expenses.download-receipt', expense.id);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            {type === 'recurring' 
              ? (expense as RecurringExpense).name
              : (expense as OccasionalExpense).description
            }
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={
                  type === 'recurring'
                    ? route('recurring-expenses.show', expense.id)
                    : route('occasional-expenses.show', expense.id)
                }>
                  Visualizar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={
                  type === 'recurring'
                    ? route('recurring-expenses.edit', expense.id)
                    : route('occasional-expenses.edit', expense.id)
                }>
                  <EditIcon className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </DropdownMenuItem>
              {type === 'recurring' && (expense as RecurringExpense).type === 'variable' && (
                <DropdownMenuItem onClick={() => setShowPaymentDialog(true)}>
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Registrar Pagamento
                </DropdownMenuItem>
              )}
              {type === 'occasional' && (expense as OccasionalExpense).hasReceipt && (
                <DropdownMenuItem onClick={handleDownloadReceipt}>
                  <FileIcon className="h-4 w-4 mr-2" />
                  Download Comprovante
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleDelete}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                {type === 'recurring' && (expense as RecurringExpense).is_active ? 'Desativar' : 'Excluir'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center mt-1">
          <Badge variant="outline" className="mr-2">
            {expense.category}
          </Badge>
          {type === 'recurring' ? (
            <Badge variant={
              (expense as RecurringExpense).type === 'fixed' ? 'default' : 'secondary'
            }>
              {(expense as RecurringExpense).type === 'fixed' ? 'Fixo' : 'Variável'}
            </Badge>
          ) : (
            (expense as OccasionalExpense).hasReceipt && (
              <Badge variant="outline" className="cursor-pointer" onClick={handleDownloadReceipt}>
                <FileIcon className="h-3 w-3 mr-1" />
                Comprovante
              </Badge>
            )
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-muted-foreground">
            {type === 'recurring' ? 'Vencimento:' : 'Data:'}
          </div>
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
            {type === 'recurring' ? (
              <span>Dia {(expense as RecurringExpense).due_day}</span>
            ) : (
              <span>{formatDate((expense as OccasionalExpense).expense_date)}</span>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">Valor:</div>
          <div className="font-medium">{formatCurrency(expense.amount)}</div>
        </div>
        {type === 'recurring' && (expense as RecurringExpense).is_active && (
          <div className="mt-4">
            {(() => {
              const dueStatus = getDueStatus((expense as RecurringExpense).due_day);
              return (
                <div className="flex items-center justify-end">
                  <Badge variant={
                    dueStatus.status === 'due' ? 'destructive' : 
                    dueStatus.status === 'soon' ? 'warning' : 'outline'
                  }>
                    {dueStatus.status === 'due' && <AlertCircleIcon className="h-3 w-3 mr-1" />}
                    {dueStatus.label}
                  </Badge>
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <div className="w-full flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            {expense.creator?.name || 'Sistema'}
          </div>
          {type === 'recurring' && (expense as RecurringExpense).type === 'variable' && (
            <Button variant="outline" size="sm" onClick={() => setShowPaymentDialog(true)}>
              <CreditCardIcon className="h-4 w-4 mr-2" />
              Pagar
            </Button>
          )}
        </div>
      </CardFooter>

      {/* Dialog para registrar pagamento */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Informe o valor pago para a despesa {type === 'recurring' && (expense as RecurringExpense).name}.
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
    </Card>
  );
}