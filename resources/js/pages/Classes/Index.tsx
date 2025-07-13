import React, { useState } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, Eye, Edit, Trash2, Clock, Users, CheckCircle, XCircle, Filter } from 'lucide-react';
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

    // Calcular estatísticas
    const totalClasses = classes.data.length;
    const scheduledClasses = classes.data.filter(classItem => classItem.status.value === 'scheduled').length;
    const completedClasses = classes.data.filter(classItem => classItem.status.value === 'completed').length;
    const cancelledClasses = classes.data.filter(classItem => classItem.status.value === 'cancelled').length;

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="Aulas" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Aulas</h1>
                            <p className="text-muted-foreground">
                                Gerencie todas as aulas agendadas no sistema
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Link
                                href="/calendar"
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                            >
                                <Calendar className="h-4 w-4 mr-2" />
                                Calendário
                            </Link>
                            {can.create && (
                                <Link
                                    href="/classes/create"
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nova Aula
                                </Link>
                            )}
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
                                <CardTitle className="text-sm font-medium">Total de Aulas</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalClasses}</div>
                                <p className="text-xs text-muted-foreground">
                                    Todas as aulas cadastradas
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
                                <Calendar className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{scheduledClasses}</div>
                                <p className="text-xs text-muted-foreground">
                                    Aulas programadas
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{completedClasses}</div>
                                <p className="text-xs text-muted-foreground">
                                    Aulas finalizadas
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
                                <XCircle className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{cancelledClasses}</div>
                                <p className="text-xs text-muted-foreground">
                                    Aulas canceladas
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filtros */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Filtros</CardTitle>
                            <CardDescription>
                                Filtre as aulas por instrutor, status ou data
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                {can.chooseInstructor && (
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-sm font-medium">
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
                                            <SelectTrigger>
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
                                <div className="flex flex-col space-y-2">
                                    <label className="text-sm font-medium">
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
                                        <SelectTrigger>
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
                                <div className="flex flex-col space-y-2">
                                    <label className="text-sm font-medium">
                                        Data
                                    </label>
                                    <Input
                                        type="date"
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
                        </CardContent>
                    </Card>

                    {/* Lista de Aulas */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Aulas</CardTitle>
                            <CardDescription>
                                Visualize e gerencie todas as aulas do sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-4 font-medium">Título</th>
                                                <th className="text-left p-4 font-medium">Horário</th>
                                                <th className="text-left p-4 font-medium">Instrutor</th>
                                                <th className="text-left p-4 font-medium">Alunos</th>
                                                <th className="text-left p-4 font-medium">Status</th>
                                                <th className="text-left p-4 font-medium">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {classes.data.map((classItem) => (
                                                <tr key={classItem.id} className="border-b hover:bg-muted/50">
                                                    <td className="p-4 font-medium">{classItem.title}</td>
                                                    <td className="p-4">
                                                        <div className="text-sm">
                                                            {classItem.start_time} - {classItem.end_time}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">{classItem.instructor.name}</td>
                                                    <td className="p-4">
                                                        <div className="flex items-center space-x-2">
                                                            <Users className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">
                                                                {classItem.students.length}/{classItem.max_students}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge className={getStatusColor(classItem.status.value)}>
                                                            {classItem.status.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center space-x-2">
                                                            <Link href={`/classes/${classItem.id}`}>
                                                                <Button variant="ghost" size="sm">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Link href={`/classes/${classItem.id}/edit`}>
                                                                <Button variant="ghost" size="sm">
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => deleteClass(classItem.id)}
                                                                className="text-red-600 hover:text-red-900"
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
                        </CardContent>
                    </Card>
            </div>
        </AuthenticatedLayout>
    );
} 