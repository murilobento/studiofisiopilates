import React, { useState } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { DataTable } from "@/components/ui/data-table";
import { columns, Student } from "./components/columns";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Users, UserCheck, UserX, Filter } from 'lucide-react';
import { ColumnFiltersState, SortingState, VisibilityState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import SuccessAlert from '@/components/success-alert';
import { PageProps } from '@/types';
import { type BreadcrumbItem } from '@/types';

interface Plan {
    id: number;
    description: string;
}

interface StudentsIndexProps extends PageProps {
    students: Student[];
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
        title: 'Alunos',
        href: '/students',
    },
];

const Index: React.FC<StudentsIndexProps> = ({ auth, students, flash }) => {
    const { delete: destroy } = useForm();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState('');

    const handleDelete = (studentId: number) => {
        console.log('Iniciando delete do aluno:', studentId);
        destroy(route('students.destroy', studentId), {
            onSuccess: () => {
                console.log('Aluno deletado com sucesso');
            },
            onError: (errors) => {
                console.error('Erro ao deletar aluno:', errors);
            }
        });
    };

    const tableColumns = columns(handleDelete);

    const table = useReactTable({
        data: students,
        columns: tableColumns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
        enableColumnFilters: true,
        globalFilterFn: 'includesString',
    });

    // Calcular estatísticas
    const totalStudents = students.length;
    const activeStudents = students.filter(student => student.status === 'active').length;
    const inactiveStudents = students.filter(student => student.status === 'inactive').length;
    const cancelledStudents = students.filter(student => student.status === 'cancelled').length;

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="Alunos" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Alunos</h1>
                        <p className="text-muted-foreground">
                            Gerencie todos os alunos cadastrados no sistema
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link
                            href={route('students.create')}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Aluno
                        </Link>
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
                            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalStudents}</div>
                            <p className="text-xs text-muted-foreground">
                                Todos os alunos cadastrados
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
                            <UserCheck className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{activeStudents}</div>
                            <p className="text-xs text-muted-foreground">
                                Com matrícula ativa
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Alunos Inativos</CardTitle>
                            <UserX className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{inactiveStudents}</div>
                            <p className="text-xs text-muted-foreground">
                                Com matrícula inativa
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
                            <UserX className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{cancelledStudents}</div>
                            <p className="text-xs text-muted-foreground">
                                Com matrícula cancelada
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabela de Dados */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Alunos</CardTitle>
                        <CardDescription>
                            Visualize e gerencie todos os alunos cadastrados
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Filtros */}
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Pesquisar por nome, telefone ou status..."
                                    value={globalFilter ?? ""}
                                    onChange={(event) => setGlobalFilter(event.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Filtros
                            </Button>
                        </div>

                        {/* Tabela */}
                        <div className="rounded-md border">
                            <DataTable columns={tableColumns} data={students} table={table} />
                        </div>

                        {/* Paginação */}
                        <div className="flex items-center justify-between space-x-2 py-4">
                            <div className="flex-1 text-sm text-muted-foreground">
                                {table.getFilteredSelectedRowModel().rows.length} de{" "}
                                {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    Próximo
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
};

export default Index;
