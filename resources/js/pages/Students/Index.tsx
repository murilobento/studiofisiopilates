import React, { useState } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { DataTable } from "@/components/ui/data-table";
import { columns, Student } from "./components/columns";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Users, UserCheck, UserX, Filter } from 'lucide-react';
import { ColumnFiltersState, SortingState, VisibilityState, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import SuccessAlert from '@/components/success-alert';
import { PageProps } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { Pagination } from '@/components/ui/pagination';

interface Plan {
    id: number;
    description: string;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface StudentsIndexProps extends PageProps {
    students: PaginatedData<Student>;
    filters?: {
        search?: string;
        status?: string;
    };
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

const Index: React.FC<StudentsIndexProps> = ({ auth, students, filters, flash }) => {
    const { delete: destroy } = useForm();
    const { data, setData, get } = useForm({
        search: filters?.search || '',
        status: filters?.status || '',
    });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState('');

    const handleSearch = () => {
        router.get(route('students.index'), {
            search: data.search,
            status: data.status,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilterChange = (field: 'search' | 'status', value: string) => {
        setData(field, value);
        
        // Auto-submit when status changes
        if (field === 'status') {
            router.get(route('students.index'), {
                search: data.search,
                status: value,
            }, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const clearFilters = () => {
        setData({ search: '', status: '' });
        router.get(route('students.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const goToPage = (page: number) => {
        router.get(route('students.index'), {
            page,
            search: data.search,
            status: data.status,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const nextPage = () => {
        if (students.current_page < students.last_page) {
            goToPage(students.current_page + 1);
        }
    };

    const previousPage = () => {
        if (students.current_page > 1) {
            goToPage(students.current_page - 1);
        }
    };

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
        data: students.data,
        columns: tableColumns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        enableColumnFilters: true,
        globalFilterFn: 'includesString',
        manualPagination: true,
        pageCount: students.last_page,
    });

    // Calcular estatísticas
    const totalStudents = students.total;
    const activeStudents = students.data.filter(student => student.status === 'ativo').length;
    const inactiveStudents = students.data.filter(student => student.status === 'inativo').length;

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
                            <CardTitle className="text-sm font-medium">Exibindo</CardTitle>
                            <Filter className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{students.data.length}</div>
                            <p className="text-xs text-muted-foreground">
                                de {students.total} total
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
                                    placeholder="Pesquisar por nome, email ou CPF..."
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10"
                                />
                            </div>
                            <Button variant="outline" size="sm" onClick={handleSearch}>
                                <Search className="h-4 w-4 mr-2" />
                                Buscar
                            </Button>
                            <select
                                value={data.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="">Todos os status</option>
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                            </select>
                            {(data.search || data.status) && (
                                <Button variant="outline" size="sm" onClick={clearFilters}>
                                    Limpar
                                </Button>
                            )}
                        </div>

                        {/* Tabela */}
                        <div className="rounded-md border">
                            <DataTable columns={tableColumns} data={students.data} table={table} />
                        </div>

                        <Pagination 
                            type="server" 
                            data={students} 
                            itemName="alunos" 
                        />
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
};

export default Index;
