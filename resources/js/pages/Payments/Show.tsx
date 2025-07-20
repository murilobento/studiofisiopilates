import { Head, Link, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    DollarSign,
    Clock,
    AlertCircle,
    CheckCircle,
    CreditCard,
    User,
    Calendar,
    FileText,
    Receipt,
    Eye
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface MonthlyPayment {
    id: number;
    student: {
        id: number;
        name: string;
        email: string;
        phone?: string;
    };
    plan: {
        id: number;
        description: string;
        price: number;
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
    paid_at: string | null;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    payment_method: string | null;
    notes: string | null;
    receipt_number: string | null;
    created_at: string;
    updated_at: string;
}

interface PageProps {
    payment: MonthlyPayment;
    [key: string]: any;
}

const statusConfig = {
    pending: {
        label: 'Pendente',
        variant: 'secondary' as const,
        icon: Clock,
        color: 'text-yellow-600'
    },
    paid: {
        label: 'Pago',
        variant: 'default' as const,
        icon: CheckCircle,
        color: 'text-green-600'
    },
    overdue: {
        label: 'Vencido',
        variant: 'destructive' as const,
        icon: AlertCircle,
        color: 'text-red-600'
    },
    cancelled: {
        label: 'Cancelado',
        variant: 'outline' as const,
        icon: AlertCircle,
        color: 'text-gray-600'
    }
};

const paymentMethodConfig: Record<string, string> = {
    cash: 'Dinheiro',
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito',
    pix: 'PIX',
    bank_transfer: 'Transferência',
    check: 'Cheque'
};

export default function PaymentShow() {
    const { payment } = usePage<PageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Pagamentos',
            href: '/payments',
        },
        {
            title: `Mensalidade #${payment.id}`,
            href: `/payments/${payment.id}`,
        },
    ];

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

    const formatDateTime = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
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

    const handleCancelPayment = () => {
        router.post(route('payments.cancel', payment.id));
    };

    const handleUndoPayment = () => {
        if (confirm('Tem certeza que deseja desfazer este pagamento? O status voltará para pendente.')) {
            router.post(route('payments.undo', payment.id));
        }
    };

    const handleUndoCancel = () => {
        if (confirm('Tem certeza que deseja estornar este cancelamento? O status voltará para pendente.')) {
            router.post(route('payments.undo-cancel', payment.id));
        }
    };

    const status = statusConfig[payment.status];
    const StatusIcon = status.icon;

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={`Mensalidade #${payment.id}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header moderno */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <Eye className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Mensalidade #{payment.id}</h1>
                            <p className="text-muted-foreground">
                                {payment.student.name} - {formatMonth(payment.reference_month)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <Badge variant={status.variant} className="flex items-center gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                        </Badge>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" asChild>
                                <Link href={route('payments.index')}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Voltar
                                </Link>
                            </Button>
                            {payment.status === 'paid' && (
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={handleUndoPayment}>
                                        Desfazer Pagamento
                                    </Button>
                                    <Button variant="outline" onClick={handleCancelPayment}>
                                        Cancelar Pagamento
                                    </Button>
                                </div>
                            )}
                            {payment.status === 'cancelled' && (
                                <Button variant="outline" onClick={handleUndoCancel}>
                                    Estornar Cancelamento
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Student Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Informações do Aluno
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Nome</Label>
                                <p className="text-sm">{payment.student.name}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                <p className="text-sm">{payment.student.email}</p>
                            </div>
                            {payment.student.phone && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                                    <p className="text-sm">{payment.student.phone}</p>
                                </div>
                            )}
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Plano</Label>
                                <p className="text-sm">{payment.plan.description}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Instrutor</Label>
                                <p className="text-sm">{payment.instructor.name}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Informações do Pagamento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Mês/Ano</Label>
                                <p className="text-sm">{formatMonth(payment.reference_month)}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Vencimento</Label>
                                <p className="text-sm">{formatDate(payment.due_date)}</p>
                            </div>
                            {payment.paid_at && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Pago em</Label>
                                    <p className="text-sm">{formatDateTime(payment.paid_at)}</p>
                                </div>
                            )}
                            {payment.payment_method && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Método</Label>
                                    <p className="text-sm">{paymentMethodConfig[payment.payment_method]}</p>
                                </div>
                            )}
                            {payment.receipt_number && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Recibo</Label>
                                    <p className="text-sm">{payment.receipt_number}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Amount Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Detalhamento do Valor
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm">Valor Original</span>
                                <span className="text-sm font-medium">{formatCurrency(payment.original_amount)}</span>
                            </div>
                            {payment.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span className="text-sm">Desconto</span>
                                    <span className="text-sm font-medium">-{formatCurrency(payment.discount)}</span>
                                </div>
                            )}
                            {payment.late_fee > 0 && (
                                <div className="flex justify-between text-red-600">
                                    <span className="text-sm">Multa</span>
                                    <span className="text-sm font-medium">+{formatCurrency(payment.late_fee)}</span>
                                </div>
                            )}
                            {payment.interest > 0 && (
                                <div className="flex justify-between text-red-600">
                                    <span className="text-sm">Juros</span>
                                    <span className="text-sm font-medium">+{formatCurrency(payment.interest)}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-base font-medium">Valor Final</span>
                                <span className="text-base font-bold">{formatCurrency(payment.amount)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notes */}
                {payment.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Observações
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{payment.notes}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
} 