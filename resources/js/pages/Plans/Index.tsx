import { useState } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { DataTable } from "@/components/ui/data-table";
import { columns, Plan } from "./components/columns";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Calendar, Users, Target, Filter, CreditCard } from 'lucide-react';
import { ColumnFiltersState, SortingState, VisibilityState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import SuccessAlert from '@/components/success-alert';
import { PageProps } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { Pagination } from '@/components/ui/pagination';

interface PlansIndexProps extends PageProps {
    plans: Plan[];
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
        title: 'Planos',
        href: '/plans',
    },
];

const Index: React.FC<PlansIndexProps> = ({ auth, plans, flash }) => {
    const { delete: destroy } = useForm();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const handleDelete = (planId: number) => {
        console.log('Iniciando delete do plano:', planId);
        destroy(route('plans.destroy', planId), {
            onSuccess: () => {
                console.log('Plano deletado com sucesso');
            },
            onError: (errors) => {
                console.error('Erro ao deletar plano:', errors);
            }
        });
    };

    const tableColumns = columns(handleDelete);

    const table = useReactTable({
        data: plans,
        columns: tableColumns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
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
        },
        enableColumnFilters: true,
    });

    // Calcular estatísticas
    const totalPlans = plans.length;
    const weeklyPlans = plans.filter(plan => plan.frequency <= 2).length;
    const regularPlans = plans.filter(plan => plan.frequency > 2 && plan.frequency <= 4).length;
    const intensivePlans = plans.filter(plan => plan.frequency > 4).length;

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="Planos" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header moderno */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Planos</h1>
                            <p className="text-muted-foreground">Gerencie todos os planos de aulas disponíveis</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div></div>
                        <Button asChild>
                            <Link href={route('plans.create')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Novo Plano
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
                                <CardTitle className="text-sm font-medium">Total de Planos</CardTitle>
                                <Target className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalPlans}</div>
                                <p className="text-xs text-muted-foreground">
                                    Todos os planos cadastrados
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Planos Leves</CardTitle>
                                <Calendar className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{weeklyPlans}</div>
                                <p className="text-xs text-muted-foreground">
                                    Até 2x por semana
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Planos Regulares</CardTitle>
                                <Users className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{regularPlans}</div>
                                <p className="text-xs text-muted-foreground">
                                    3x a 4x por semana
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Planos Intensivos</CardTitle>
                                <Target className="h-4 w-4 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">{intensivePlans}</div>
                                <p className="text-xs text-muted-foreground">
                                    Mais de 4x por semana
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabela de Dados */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Planos</CardTitle>
                            <CardDescription>
                                Visualize e gerencie todos os planos disponíveis
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Filtros */}
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Filtrar por descrição..."
                                        value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
                                        onChange={(event) =>
                                            table.getColumn("description")?.setFilterValue(event.target.value)
                                        }
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
                                <DataTable columns={tableColumns} data={plans} table={table} />
                            </div>

                            <Pagination 
                                type="client" 
                                data={{
                                    currentPage: table.getState().pagination.pageIndex + 1,
                                    totalPages: table.getPageCount(),
                                    from: table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1,
                                    to: Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length),
                                    total: table.getFilteredRowModel().rows.length,
                                    onPageChange: (page: number) => table.setPageIndex(page - 1)
                                }}
                                itemName="planos" 
                            />
                        </CardContent>
                    </Card>
            </div>
        </AuthenticatedLayout>
    );
};

export default Index;
