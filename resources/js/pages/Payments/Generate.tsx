import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
    ArrowLeft, 
    Calendar, 
    Play, 
    Info, 
    AlertTriangle, 
    Lock, 
    Users, 
    CheckCircle, 
    AlertCircle,
    CreditCard,
    DollarSign,
    Clock,
    Zap
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import SuccessAlert from '@/components/success-alert';
import { PageProps } from '@/types';
import { type BreadcrumbItem } from '@/types';

interface FlashProps {
  success?: string;
  created?: number;
  already_exists?: number;
  total_students?: number;
}

interface CheckResult {
  has_existing: number;
  existing_count: number;
  total_students: number;
  new_students: number;
}

interface GenerateProps extends PageProps {
  flash?: FlashProps;
  check_result?: CheckResult;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Mensalidades',
        href: '/payments',
    },
    {
        title: 'Gerar Mensalidades',
        href: '/payments/generate',
    },
];

export default function PaymentsGenerate({ auth, flash, check_result }: GenerateProps) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const [showResultDialog, setShowResultDialog] = useState(!!flash?.success);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showAlreadyExistsDialog, setShowAlreadyExistsDialog] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        month: currentMonth.toString(),
        year: currentYear.toString(),
        force: false,
    });

    // Garante que mês/ano sempre sejam do mês vigente ao montar a página
    useEffect(() => {
        setData('month', currentMonth.toString());
        setData('year', currentYear.toString());
        // eslint-disable-next-line
    }, []);
    


    // Processar check_result quando chegar
    useEffect(() => {
        if (check_result) {
            if (check_result.has_existing == 1 && check_result.new_students > 0) {
                setShowConfirmDialog(true);
            } else if (check_result.has_existing == 1 && check_result.new_students === 0) {
                setShowAlreadyExistsDialog(true);
            } else if (check_result.has_existing == 0) {
                generatePayments();
            }
        }
    }, [check_result]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Primeiro, verificar se já existem mensalidades para este período
        post(route('payments.generate.check'), {
            onError: (errors) => {
                console.error('Erro no check:', errors);
            }
        });
    };

    const generatePayments = () => {
        router.post(route('payments.generate.store'), {
            month: data.month,
            year: data.year,
            force: true
        }, {
            onSuccess: () => {
                setShowConfirmDialog(false);
                setShowResultDialog(true);
            },
            onError: (errors) => {
                console.error('Erro na geração:', errors);
            }
        });
    };

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

    const selectedMonth = months.find(m => m.value === data.month)?.label || '';
    const selectedYear = data.year;

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="Gerar Mensalidades" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header moderno */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Gerar Mensalidades</h1>
                            <p className="text-muted-foreground">
                                Processe mensalidades para todos os alunos ativos
                            </p>
                        </div>
                    </div>
                </div>

                {/* Barra de ações */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Zap className="h-4 w-4" />
                                <span>Geração Automática de Mensalidades</span>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href={route('payments.index')}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Voltar
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Alertas */}
                {flash?.success && (
                    <SuccessAlert message={flash.success} />
                )}

                {/* Cards de Estatísticas */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Período Atual</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{selectedMonth}/{selectedYear}</div>
                            <p className="text-xs text-muted-foreground">
                                Mês vigente para geração
                            </p>
                        </CardContent>
                    </Card>
                    
                    {check_result && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Mensalidades Existentes</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{check_result.existing_count}</div>
                                <p className="text-xs text-muted-foreground">
                                    Já geradas para este período
                                </p>
                            </CardContent>
                        </Card>
                    )}
                    
                    {check_result && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Novos Alunos</CardTitle>
                                <Users className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{check_result.new_students}</div>
                                <p className="text-xs text-muted-foreground">
                                    Aguardando geração
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Form Principal */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Geração de Mensalidades
                        </CardTitle>
                        <CardDescription>
                            Configure e gere mensalidades para o mês vigente
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="month">Período de Referência</Label>
                                    <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50 mt-1">
                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">{selectedMonth}/{selectedYear}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Apenas o mês vigente pode ser selecionado para geração
                                    </p>
                                </div>

                                <div className="flex justify-start">
                                    <Button type="submit" disabled={processing}>
                                        <Play className="h-4 w-4 mr-2" />
                                        {processing ? 'Verificando...' : 'Gerar Mensalidades'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Card de Informações */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informações sobre a Geração</CardTitle>
                        <CardDescription>
                            Entenda como funciona o processo de geração de mensalidades
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-3">
                                <h4 className="font-medium text-sm">Processo de Geração:</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                    <li>Serão geradas mensalidades para todos os alunos com status "ativo"</li>
                                    <li>O valor será baseado no plano atual de cada aluno</li>
                                    <li>A data de vencimento será no último dia do mês de referência</li>
                                    <li>Mensalidades já existentes não serão duplicadas</li>
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-medium text-sm">Regras e Restrições:</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                    <li><strong>Restrição:</strong> Apenas o mês vigente pode ser selecionado</li>
                                    <li>Se houver novos alunos, você será notificado</li>
                                    <li>Mensalidades em atraso terão multa e juros aplicados</li>
                                    <li>O sistema verifica automaticamente duplicatas</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Dialog de Resultado */}
            <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                Geração Concluída
                            </div>
                        </DialogTitle>
                        <DialogDescription>
                            Resultado da geração de mensalidades para o período atual.
                        </DialogDescription>
                    </DialogHeader>
                    {flash?.success && (
                        <div className="mb-2">
                            {flash.success}
                        </div>
                    )}
                    {typeof flash?.created !== 'undefined' && typeof flash?.already_exists !== 'undefined' && (
                        <div className="text-sm text-muted-foreground space-y-1">
                            <div><strong>{flash.created}</strong> mensalidade(s) gerada(s).</div>
                            <div><strong>{flash.already_exists}</strong> já existiam para este período.</div>
                            <div>Total de alunos ativos: <strong>{flash.total_students}</strong>.</div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setShowResultDialog(false)} autoFocus>OK</Button>
                        <Button variant="outline" asChild>
                            <Link href={route('payments.index')}>Ir para Mensalidades</Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de Confirmação para Geração Parcial */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                Mensalidades Parcialmente Geradas
                            </div>
                        </DialogTitle>
                        <DialogDescription>
                            Confirmação para gerar mensalidades apenas para novos alunos.
                        </DialogDescription>
                    </DialogHeader>
                    {check_result && (
                        <div className="space-y-3">
                            <p>
                                Já existem <strong>{check_result.existing_count}</strong> mensalidades 
                                geradas para <strong>{selectedMonth}/{selectedYear}</strong>.
                            </p>
                            <p>
                                Porém, foram encontrados <strong>{check_result.new_students}</strong> novos 
                                alunos que ainda não possuem mensalidade para este período.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Deseja gerar mensalidades apenas para os novos alunos?
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={generatePayments} disabled={processing}>
                            {processing ? 'Gerando...' : 'Sim, Gerar para Novos Alunos'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de Aviso - Todas as mensalidades já existem */}
            <Dialog open={showAlreadyExistsDialog} onOpenChange={setShowAlreadyExistsDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-blue-500" />
                                Mensalidades Já Geradas
                            </div>
                        </DialogTitle>
                        <DialogDescription>
                            Informação sobre mensalidades já existentes para o período.
                        </DialogDescription>
                    </DialogHeader>
                    {check_result && (
                        <div className="space-y-3">
                            <p>
                                Todas as mensalidades de <strong>{selectedMonth}/{selectedYear}</strong> já foram geradas.
                            </p>
                            <p>
                                <strong>{check_result.existing_count}</strong> mensalidades existentes para 
                                <strong> {check_result.total_students}</strong> alunos ativos.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Não é necessário gerar novamente para este período.
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setShowAlreadyExistsDialog(false)} autoFocus>Entendi</Button>
                        <Button variant="outline" asChild>
                            <Link href={route('payments.index')}>Ver Mensalidades</Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
} 