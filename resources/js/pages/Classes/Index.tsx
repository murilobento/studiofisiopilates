import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, Eye, Edit, Trash2, Clock, Users, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import SuccessAlert from '@/components/success-alert';
import { PageProps } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { Pagination } from '@/components/ui/pagination';

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

interface PaginatedClasses {
    data: ClassItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface ClassesIndexProps extends PageProps {
    classes: PaginatedClasses;
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
    const totalClasses = classes.total;
    const scheduledClasses = classes.data.filter(classItem => classItem.status.value === 'scheduled').length;
    const completedClasses = classes.data.filter(classItem => classItem.status.value === 'completed').length;
    const cancelledClasses = classes.data.filter(classItem => classItem.status.value === 'cancelled').length;

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="Aulas" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header moderno */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Aulas</h1>
                            <p className="text-muted-foreground">Gerencie todas as aulas agendadas no sistema</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div></div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/calendar">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Calendário
                                </Link>
                            </Button>
                            {can.create && (
                                <Button asChild>
                                    <Link href="/classes/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Nova Aula
                                    </Link>
                                </Button>
                            )}
                        </div>
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
                                                        <div className="text-sm whitespace-nowrap">
                                                            {format(new Date(classItem.start_time), 'dd/MM/yyyy HH:mm')} - {format(new Date(classItem.end_time), 'HH:mm')}
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
                        <CardContent>
                            <Pagination 
                                type="server" 
                                data={classes} 
                                itemName="aulas" 
                            />
                        </CardContent>
                    </Card>
            </div>
        </AuthenticatedLayout>
    );
} 