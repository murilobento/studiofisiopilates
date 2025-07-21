import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Eye, DollarSign, XCircle, CheckCircle, Plus, Filter, Search, AlertTriangle, Receipt, Undo2, RotateCcw } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { Label } from '@/components/ui/label';
import SuccessAlert from '@/components/success-alert';

interface MonthlyPayment {
    id: number;
    student: {
        id: number;
        name: string;
        email: string;
    };
    plan: {
        id: number;
        description: string;
    };
    instructor: {
        id: number;
        name: string;
    };
    original_amount: number;
    discount: number;
    late_fee: number;
    interest: number;
    amount: number;
    due_date: string;
    reference_month: string;
    formatted_reference_month: string;
    paid_at: string | null;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    payment_method: string | null;
    notes: string | null;
    receipt_number: string | null;
    created_at: string;
    updated_at: string;
}

interface PageProps {
    payments: {
        data: MonthlyPayment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: {
        search?: string;
        status?: string;
        month?: string;
        year?: string;
        instructor_id?: string;
        student_id?: string;
        payment_method?: string;
        [key: string]: string | undefined;
    };
    stats: {
        total_pending: number;
        total_paid: number;
        total_overdue: number;
        amount_pending: number;
        amount_paid: number;
        amount_overdue: number;
    };
    instructors: Array<{
        id: number;
        name: string;
    }>;
    students: Array<{
        id: number;
        name: string;
    }>;
    flash?: {
        success?: string;
        created?: number;
        already_exists?: number;
        total_students?: number;
    };
    [key: string]: any;
}

const statusConfig = {
    pending: {
        label: 'Pendente',
        variant: 'secondary' as const,
        icon: DollarSign,
        color: 'text-yellow-600',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    paid: {
        label: 'Pago',
        variant: 'secondary' as const,
        icon: CheckCircle,
        color: 'text-green-600',
        className: 'bg-green-100 text-green-800 border-green-200'
    },
    overdue: {
        label: 'Vencido',
        variant: 'secondary' as const,
        icon: XCircle,
        color: 'text-yellow-600',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    cancelled: {
        label: 'Cancelado',
        variant: 'destructive' as const,
        icon: XCircle,
        color: 'text-red-600',
        className: 'bg-red-100 text-red-800 border-red-200'
    }
};

const paymentMethodConfig: Record<string, string> = {
    cash: 'Dinheiro',
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito',
    pix: 'PIX',
    bank_transfer: 'Transferência Bancária',
    check: 'Cheque'
};

export default function PaymentsIndex() {
    const { payments, filters, stats, instructors, students, flash } = usePage<PageProps>().props;
    
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Pagamentos',
            href: '/payments',
        },
    ];
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<MonthlyPayment | null>(null);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [paymentToCancel, setPaymentToCancel] = useState<MonthlyPayment | null>(null);
    const [showUndoPaymentDialog, setShowUndoPaymentDialog] = useState(false);
    const [paymentToUndo, setPaymentToUndo] = useState<MonthlyPayment | null>(null);
    const [showUndoCancelDialog, setShowUndoCancelDialog] = useState(false);
    const [paymentToUndoCancel, setPaymentToUndoCancel] = useState<MonthlyPayment | null>(null);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        payment_method: '',
        receipt_number: '',
        notes: '',
    });

    const { data: cancelData, setData: setCancelData, post: postCancel, processing: processingCancel, errors: cancelErrors, reset: resetCancel } = useForm({
        reason: '',
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
        } catch {
            return '-';
        }
    };

    const formatMonth = (monthString: string) => {
        try {
            if (!monthString) return '-';
            const date = new Date(monthString + '-01');
            if (isNaN(date.getTime())) return '-';
            return format(date, 'MMMM/yyyy', { locale: ptBR });
        } catch (error) {
            return '-';
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('payments.index'), { ...filters, search: searchTerm }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        if (value === '' || value === 'all') {
            delete newFilters[key];
        }
        router.get(route('payments.index'), newFilters, { preserveState: true });
    };

    const handleProcessPayment = (payment: MonthlyPayment) => {
        setSelectedPayment(payment);
        setShowPaymentDialog(true);
        reset();
    };

    const handleSubmitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPayment) return;
        post(route('payments.process', selectedPayment.id), {
            onSuccess: () => {
                setShowPaymentDialog(false);
                setSelectedPayment(null);
                reset();
            }
        });
    };

    const handleCancelPayment = (payment: MonthlyPayment) => {
        setPaymentToCancel(payment);
        setShowCancelDialog(true);
        resetCancel();
    };

    const handleSubmitCancel = (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentToCancel) return;
        postCancel(route('payments.cancel', paymentToCancel.id), {
            onSuccess: () => {
                setShowCancelDialog(false);
                setPaymentToCancel(null);
                resetCancel();
            }
        });
    };

    const handleUndoPayment = (payment: MonthlyPayment) => {
        setPaymentToUndo(payment);
        setShowUndoPaymentDialog(true);
    };

    const confirmUndoPayment = () => {
        if (paymentToUndo) {
            router.post(route('payments.undo', paymentToUndo.id), {}, {
                onSuccess: () => {
                    setShowUndoPaymentDialog(false);
                    setPaymentToUndo(null);
                }
            });
        }
    };

    const handleUndoCancel = (payment: MonthlyPayment) => {
        setPaymentToUndoCancel(payment);
        setShowUndoCancelDialog(true);
    };

    const confirmUndoCancel = () => {
        if (paymentToUndoCancel) {
            router.post(route('payments.undo-cancel', paymentToUndoCancel.id), {}, {
                onSuccess: () => {
                    setShowUndoCancelDialog(false);
                    setPaymentToUndoCancel(null);
                }
            });
        }
    };

    const columns: ColumnDef<MonthlyPayment>[] = [
        {
            accessorKey: 'student.name',
            header: 'Aluno',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.student.name}</div>
                    <div className="text-xs text-muted-foreground">{row.original.student.email}</div>
                </div>
            ),
        },
        {
            accessorKey: 'plan.description',
            header: 'Plano',
        },
        {
            accessorKey: 'instructor.name',
            header: 'Instrutor',
        },
        {
            accessorKey: 'formatted_reference_month',
            header: 'Mês/Ano',
            cell: ({ row }) => row.original.formatted_reference_month || '-',
        },
        {
            accessorKey: 'amount',
            header: 'Valor',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{formatCurrency(row.original.amount)}</div>
                    {row.original.original_amount !== row.original.amount && (
                        <div className="text-xs text-muted-foreground">
                            Original: {formatCurrency(row.original.original_amount)}
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = statusConfig[row.original.status];
                const Icon = status.icon;
                return (
                    <Badge 
                        variant={status.variant} 
                        className={`flex items-center gap-1 ${status.className}`}
                    >
                        <Icon className="h-3 w-3" />
                        {status.label}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'payment_method',
            header: 'Método',
            cell: ({ row }) => {
                const method = row.original.payment_method;
                return method ? paymentMethodConfig[method] || method : '-';
            },
        },
        {
            accessorKey: 'paid_at',
            header: 'Pago em',
            cell: ({ row }) => {
                return row.original.paid_at ? formatDate(row.original.paid_at) : '-';
            },
        },
        {
            id: 'actions',
            header: 'Ações',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        title="Ver Detalhes"
                    >
                        <Link href={route('payments.show', row.original.id)}>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                    
                    {/* Ações para status pendente ou vencido */}
                    {(row.original.status === 'pending' || row.original.status === 'overdue') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleProcessPayment(row.original)}
                            title="Confirmar Pagamento"
                        >
                            <DollarSign className="h-4 w-4" />
                        </Button>
                    )}
                    
                    {/* Ações para status pago */}
                    {row.original.status === 'paid' && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUndoPayment(row.original)}
                                title="Estornar Pagamento"
                            >
                                <Undo2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelPayment(row.original)}
                                title="Cancelar Pagamento"
                            >
                                <XCircle className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                    
                    {/* Ações para status cancelado */}
                    {row.original.status === 'cancelled' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUndoCancel(row.original)}
                            title="Estornar Cancelamento"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="Mensalidades" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header moderno */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <Receipt className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Mensalidades</h1>
                            <p className="text-muted-foreground">Gerencie os pagamentos mensais dos alunos</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div></div>
                        <Button asChild>
                            <Link href={route('payments.generate')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Gerar Mensalidades
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Alertas */}
                {flash?.success && (
                    <SuccessAlert message={flash.success} />
                )}

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_pending}</div>
                            <p className="text-xs text-muted-foreground">
                                {formatCurrency(stats.amount_pending)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pagos</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_paid}</div>
                            <p className="text-xs text-muted-foreground">
                                {formatCurrency(stats.amount_paid)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_overdue}</div>
                            <p className="text-xs text-muted-foreground">
                                {formatCurrency(stats.amount_overdue)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtros */}
                <Card className="mb-4">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Filtros</CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-4">
                            <Input
                                placeholder="Buscar por aluno, plano ou instrutor..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit">
                                <Search className="h-4 w-4 mr-2" />
                                Buscar
                            </Button>
                        </form>
                        {showFilters && (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={(value) => handleFilterChange('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="pending">Pendente</SelectItem>
                                        <SelectItem value="paid">Pago</SelectItem>
                                        <SelectItem value="overdue">Vencido</SelectItem>
                                        <SelectItem value="cancelled">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.month || 'all'}
                                    onValueChange={(value) => handleFilterChange('month', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Mês" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="1">Janeiro</SelectItem>
                                        <SelectItem value="2">Fevereiro</SelectItem>
                                        <SelectItem value="3">Março</SelectItem>
                                        <SelectItem value="4">Abril</SelectItem>
                                        <SelectItem value="5">Maio</SelectItem>
                                        <SelectItem value="6">Junho</SelectItem>
                                        <SelectItem value="7">Julho</SelectItem>
                                        <SelectItem value="8">Agosto</SelectItem>
                                        <SelectItem value="9">Setembro</SelectItem>
                                        <SelectItem value="10">Outubro</SelectItem>
                                        <SelectItem value="11">Novembro</SelectItem>
                                        <SelectItem value="12">Dezembro</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.year || 'all'}
                                    onValueChange={(value) => handleFilterChange('year', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Ano" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="2024">2024</SelectItem>
                                        <SelectItem value="2025">2025</SelectItem>
                                        <SelectItem value="2026">2026</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.instructor_id || 'all'}
                                    onValueChange={(value) => handleFilterChange('instructor_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Instrutor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {instructors.map((instructor) => (
                                            <SelectItem key={instructor.id} value={instructor.id.toString()}>
                                                {instructor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.student_id || 'all'}
                                    onValueChange={(value) => handleFilterChange('student_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Aluno" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {students.map((student) => (
                                            <SelectItem key={student.id} value={student.id.toString()}>
                                                {student.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.payment_method || 'all'}
                                    onValueChange={(value) => handleFilterChange('payment_method', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Método" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="cash">Dinheiro</SelectItem>
                                        <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                                        <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                                        <SelectItem value="pix">PIX</SelectItem>
                                        <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                                        <SelectItem value="check">Cheque</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Mensalidades ({payments.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={payments.data}
                        />
                        <Pagination 
                            type="server" 
                            data={payments} 
                            itemName="mensalidades" 
                        />
                    </CardContent>
                </Card>

                {/* Modal de Pagamento */}
                <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmar Pagamento</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmitPayment} className="space-y-4">
                            <div>
                                <Label htmlFor="payment_method">Método de Pagamento</Label>
                                <Select
                                    value={data.payment_method}
                                    onValueChange={(value) => setData('payment_method', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o método" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Dinheiro</SelectItem>
                                        <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                                        <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                                        <SelectItem value="pix">PIX</SelectItem>
                                        <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                                        <SelectItem value="check">Cheque</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.payment_method && (
                                    <p className="text-sm text-red-600">{errors.payment_method}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="receipt_number">Número do Recibo/Comprovante</Label>
                                <Input
                                    id="receipt_number"
                                    value={data.receipt_number}
                                    onChange={(e) => setData('receipt_number', e.target.value)}
                                    placeholder="Opcional"
                                />
                            </div>
                            <div>
                                <Label htmlFor="notes">Observações</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Observações sobre o pagamento"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowPaymentDialog(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Processando...' : 'Confirmar Pagamento'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal de Cancelamento */}
                <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    Cancelar Pagamento
                                </div>
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmitCancel} className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Tem certeza que deseja cancelar este pagamento? Esta ação não pode ser desfeita.
                                </p>
                                <Label htmlFor="reason">Motivo do Cancelamento (Opcional)</Label>
                                <Textarea
                                    id="reason"
                                    value={cancelData.reason}
                                    onChange={(e) => setCancelData('reason', e.target.value)}
                                    placeholder="Descreva o motivo do cancelamento..."
                                    rows={3}
                                />
                                {cancelErrors.reason && (
                                    <p className="text-sm text-red-600">{cancelErrors.reason}</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCancelDialog(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="destructive" disabled={processingCancel}>
                                    {processingCancel ? 'Cancelando...' : 'Confirmar Cancelamento'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* AlertDialog para Estornar Pagamento */}
                <AlertDialog open={showUndoPaymentDialog} onOpenChange={setShowUndoPaymentDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Estornar Pagamento</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem certeza que deseja estornar este pagamento? O status voltará para pendente.
                                Esta ação pode ser revertida posteriormente.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmUndoPayment}>
                                Estornar Pagamento
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* AlertDialog para Estornar Cancelamento */}
                <AlertDialog open={showUndoCancelDialog} onOpenChange={setShowUndoCancelDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Estornar Cancelamento</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem certeza que deseja estornar este cancelamento? O status voltará para pendente.
                                Esta ação pode ser revertida posteriormente.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmUndoCancel}>
                                Estornar Cancelamento
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AuthenticatedLayout>
    );
} 