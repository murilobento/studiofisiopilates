import React, { useState } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Edit, Trash2 } from 'lucide-react';
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

            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Aulas Recorrentes</h1>
                        <p className="text-muted-foreground">Gerencie as aulas que se repetem semanalmente</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link
                            href={route('recurring-classes.create')}
                            className="inline-flex items-center px-4 py-2 bg-primary border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Aula Recorrente
                        </Link>
                    </div>
                </div>

                {/* Alertas */}
                {flash?.success && (
                    <SuccessAlert message={flash.success} />
                )}

                <div className="rounded-md border">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Título
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dia da Semana
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Horário
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Instrutor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginated.map((rc) => (
                                    <tr key={rc.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{rc.title}</div>
                                            <div className="text-sm text-gray-500">
                                                {rc.max_students} alunos máx.
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDayOfWeek(rc.day_of_week)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {rc.start_time.slice(0,5)} - {rc.end_time.slice(0,5)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {rc.instructor.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={rc.is_active ? "default" : "secondary"}>
                                                {rc.is_active ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={route('recurring-classes.edit', rc.id)}
                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    <Edit className="h-3 w-3 mr-1" />
                                                    Editar
                                                </Link>
                                                
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-3 w-3 mr-1" />
                                                            Excluir
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
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
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