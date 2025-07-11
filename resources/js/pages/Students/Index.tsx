import React, { useState } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { DataTable } from "@/components/ui/data-table";
import { columns, Student } from "./components/columns";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="Alunos" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {flash?.success && (
                                <div className="mb-4">
                                    <SuccessAlert message={flash.success} />
                                </div>
                            )}
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Lista de Alunos</h3>
                                <Link
                                    href={route('students.create')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    Adicionar Aluno
                                </Link>
                            </div>

                            <div className="flex items-center py-4">
                                <Input
                                    placeholder="Pesquisar por nome, telefone ou status..."
                                    value={globalFilter ?? ""}
                                    onChange={(event) => setGlobalFilter(event.target.value)}
                                    className="max-w-md"
                                />
                            </div>

                            <div className="rounded-md border">
                                <DataTable columns={tableColumns} data={students} table={table} />
                            </div>

                            <div className="flex items-center justify-end space-x-2 py-4">
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
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Index;
