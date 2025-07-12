import React, { useState } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, Eye, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import SuccessAlert from '@/components/success-alert';
import { PageProps } from '@/types';
import { type BreadcrumbItem } from '@/types';

interface ClassItem {
    id: number;
    title: string;
    start_time: string;
    end_time: string;
    max_students: number;
    status: {
        value: string;
        label: string;
    };
    instructor: {
        id: number;
        name: string;
    };
    students: Array<{
        id: number;
        name: string;
    }>;
}

interface ClassesIndexProps extends PageProps {
    classes: {
        data: ClassItem[];
        links: any[];
    };
    instructors: Array<{
        id: number;
        name: string;
    }>;
    filters: {
        instructor_id?: string;
        status?: string;
        date?: string;
    };
    can: {
        create: boolean;
        chooseInstructor: boolean;
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
        title: 'Aulas',
        href: '/classes',
    },
];

export default function Index({ classes, instructors, filters, can, flash }: ClassesIndexProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const deleteClass = (id: number) => {
        if (confirm('Tem certeza que deseja excluir esta aula?')) {
            router.delete(`/classes/${id}`);
        }
    };

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="Aulas" />

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
                                <h3 className="text-lg font-medium text-gray-900">Lista de Aulas</h3>
                                <div className="flex gap-2">
                                    <Link
                                        href="/calendar"
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Calendário
                                    </Link>
                                    {can.create && (
                                        <Link
                                            href="/classes/create"
                                            className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Nova Aula
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Filtros */}
                            <div className="flex items-center py-4 space-x-4">
                                {can.chooseInstructor && (
                                    <div className="flex flex-col space-y-1">
                                        <label className="text-sm font-medium text-gray-700">
                                            Instrutor
                                        </label>
                                        <Select
                                            value={filters.instructor_id || 'all'}
                                            onValueChange={(value) => {
                                                router.get('/classes', { 
                                                    ...filters, 
                                                    instructor_id: value === 'all' ? undefined : value
                                                }, { preserveState: true });
                                            }}
                                        >
                                            <SelectTrigger className="w-48">
                                                <SelectValue placeholder="Todos os instrutores" />
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
                                    </div>
                                )}
                                <div className="flex flex-col space-y-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Status
                                    </label>
                                    <Select
                                        value={filters.status || 'all'}
                                        onValueChange={(value) => {
                                            router.get('/classes', { 
                                                ...filters, 
                                                status: value === 'all' ? undefined : value
                                            }, { preserveState: true });
                                        }}
                                    >
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Todos os status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="scheduled">Agendada</SelectItem>
                                            <SelectItem value="completed">Concluída</SelectItem>
                                            <SelectItem value="cancelled">Cancelada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Data
                                    </label>
                                    <Input
                                        type="date"
                                        className="w-48"
                                        value={filters.date || ''}
                                        onChange={(e) => {
                                            router.get('/classes', { 
                                                ...filters, 
                                                date: e.target.value || undefined 
                                            }, { preserveState: true });
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Lista de Aulas */}
                            <div className="rounded-md border">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900">Aula</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900">Instrutor</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900">Data/Hora</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900">Alunos</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {classes.data.map((classItem) => (
                                                <tr key={classItem.id} className="border-b hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        <div className="font-medium text-gray-900">{classItem.title}</div>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-900">
                                                        {classItem.instructor.name}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="text-gray-900">
                                                            {new Date(classItem.start_time).toLocaleDateString('pt-BR')}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {new Date(classItem.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(classItem.end_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-sm text-gray-900">
                                                            {classItem.students.length}/{classItem.max_students}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge className={getStatusColor(classItem.status.value)}>
                                                            {classItem.status.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex gap-2">
                                                            <Button
                                                                asChild
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                <Link href={`/classes/${classItem.id}`}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                asChild
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                <Link href={`/classes/${classItem.id}/edit`}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => deleteClass(classItem.id)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {classes.data.length === 0 && (
                                <div className="text-center py-6">
                                    <p className="text-gray-500">Nenhuma aula encontrada.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 