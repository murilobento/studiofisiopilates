import { useState } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle, 
    AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Repeat, Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import SuccessAlert from '@/components/success-alert';
import { PageProps } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { Pagination } from '@/components/ui/pagination';

interface RecurringClass {
    id: number;
    title: string;
    instructor: {
        id: number;
        name: string;
    };
    day_of_week: number;
    start_time: string;
    end_time: string;
    max_students: number;
    is_active: boolean;
    auto_replicate_students: boolean;
    start_date: string;
    end_date: string | null;
}

interface IndexProps extends PageProps {
    recurringClasses: RecurringClass[];
    flash?: {
        message?: string;
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Aulas Recorrentes',
        href: '/recurring-classes',
    },
];

export default function Index({ recurringClasses, flash }: IndexProps) {
    const { delete: destroy } = useForm();
    const [globalFilter, setGlobalFilter] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 10;

    const formatDayOfWeek = (day: number) => {
        const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        return days[day-1] || 'Inválido';
    };

    const handleDelete = (recurringClassId: number) => {
        destroy(route('recurring-classes.destroy', recurringClassId), {
            onSuccess: () => {
                console.log('Aula recorrente deletada com sucesso');
            },
            onError: (errors) => {
                console.error('Erro ao deletar aula recorrente:', errors);
            }
        });
    };

    const filteredClasses = recurringClasses.filter(rc => 
        rc.title.toLowerCase().includes(globalFilter.toLowerCase()) ||
        rc.instructor.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
        formatDayOfWeek(rc.day_of_week).toLowerCase().includes(globalFilter.toLowerCase())
    );

    const pageCount = Math.ceil(filteredClasses.length / perPage);
    const paginated = filteredClasses.slice((page - 1) * perPage, page * perPage);

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="Aulas Recorrentes" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header moderno */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Repeat className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Aulas Recorrentes</h1>
                            <p className="text-muted-foreground">Gerencie as aulas que se repetem semanalmente</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div></div>
                        <Button asChild>
                            <Link href={route('recurring-classes.create')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Nova Aula Recorrente
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Alertas */}
                {flash?.success && (
                    <SuccessAlert message={flash.success} />
                )}

                {/* Cards de Estatísticas */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                            <Repeat className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{recurringClasses.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Aulas recorrentes cadastradas
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {recurringClasses.filter(rc => rc.is_active).length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Gerando aulas automaticamente
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inativas</CardTitle>
                            <XCircle className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {recurringClasses.filter(rc => !rc.is_active).length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Pausadas temporariamente
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Capacidade</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {recurringClasses.reduce((sum, rc) => sum + rc.max_students, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Total de vagas por semana
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Lista de Aulas Recorrentes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Aulas Recorrentes</CardTitle>
                        <CardDescription>
                            Visualize e gerencie todas as aulas recorrentes do sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-4 font-medium">Título</th>
                                            <th className="text-left p-4 font-medium">Dia da Semana</th>
                                            <th className="text-left p-4 font-medium">Horário</th>
                                            <th className="text-left p-4 font-medium">Instrutor</th>
                                            <th className="text-left p-4 font-medium">Status</th>
                                            <th className="text-left p-4 font-medium">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.map((rc) => (
                                            <tr key={rc.id} className="border-b hover:bg-muted/50">
                                                <td className="p-4">
                                                    <div className="font-medium">{rc.title}</div>
                                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {rc.max_students} alunos máx.
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm">{formatDayOfWeek(rc.day_of_week)}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                                        {rc.start_time.slice(0,5)} - {rc.end_time.slice(0,5)}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm">{rc.instructor.name}</td>
                                                <td className="p-4">
                                                    <Badge variant={rc.is_active ? "default" : "secondary"}>
                                                        {rc.is_active ? 'Ativo' : 'Inativo'}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={route('recurring-classes.edit', rc.id)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Tem certeza que deseja excluir a aula recorrente "{rc.title}"?
                                                                        <br /><br />
                                                                        <strong>Esta ação irá:</strong>
                                                                        <ul className="list-disc list-inside mt-2 text-sm">
                                                                            <li>Remover o molde da aula recorrente</li>
                                                                            <li>Excluir todas as aulas agendadas desta recorrência</li>
                                                                            <li>Manter apenas as aulas já concluídas ou canceladas</li>
                                                                        </ul>
                                                                        <br />
                                                                        Esta ação não pode ser desfeita.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(rc.id)}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        Excluir
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredClasses.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                                    {globalFilter 
                                                        ? 'Nenhuma aula recorrente encontrada para o filtro aplicado.'
                                                        : 'Nenhuma aula recorrente cadastrada.'
                                                    }
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Pagination 
                    type="client" 
                    data={{
                        currentPage: page,
                        totalPages: pageCount,
                        from: (page - 1) * perPage + 1,
                        to: Math.min(page * perPage, filteredClasses.length),
                        total: filteredClasses.length,
                        onPageChange: setPage
                    }}
                    itemName="aulas recorrentes" 
                />
            </div>
        </AuthenticatedLayout>
    );
} 