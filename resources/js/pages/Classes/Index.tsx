import { Button } from '@/components/ui/button';
import { Link, router } from '@inertiajs/react';
import { Plus, Calendar, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';

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

interface Props {
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
}

export default function Index({ classes, instructors, filters, can }: Props) {
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
        <AppLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Aulas</h1>
                        <p className="text-gray-600">Gerencie as aulas do estúdio</p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
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

                {/* Filtros */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filtros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {can.chooseInstructor && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Instrutor
                                    </label>
                                    <select
                                        className="w-full border rounded-md px-3 py-2"
                                        value={filters.instructor_id || ''}
                                        onChange={(e) => {
                                            router.get('/classes', { 
                                                ...filters, 
                                                instructor_id: e.target.value || undefined 
                                            }, { preserveState: true });
                                        }}
                                    >
                                        <option value="">Todos</option>
                                        {instructors.map((instructor) => (
                                            <option key={instructor.id} value={instructor.id}>
                                                {instructor.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Status
                                </label>
                                <select
                                    className="w-full border rounded-md px-3 py-2"
                                    value={filters.status || ''}
                                    onChange={(e) => {
                                        router.get('/classes', { 
                                            ...filters, 
                                            status: e.target.value || undefined 
                                        }, { preserveState: true });
                                    }}
                                >
                                    <option value="">Todos</option>
                                    <option value="scheduled">Agendada</option>
                                    <option value="completed">Concluída</option>
                                    <option value="cancelled">Cancelada</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Data
                                </label>
                                <input
                                    type="date"
                                    className="w-full border rounded-md px-3 py-2"
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
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-medium">Aula</th>
                                        <th className="text-left py-3 px-4 font-medium">Instrutor</th>
                                        <th className="text-left py-3 px-4 font-medium">Data/Hora</th>
                                        <th className="text-left py-3 px-4 font-medium">Alunos</th>
                                        <th className="text-left py-3 px-4 font-medium">Status</th>
                                        <th className="text-left py-3 px-4 font-medium">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classes.data.map((classItem) => (
                                        <tr key={classItem.id} className="border-b">
                                            <td className="py-3 px-4">
                                                <div className="font-medium">{classItem.title}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {classItem.instructor.name}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div>
                                                    {new Date(classItem.start_time).toLocaleDateString('pt-BR')}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(classItem.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(classItem.end_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm">
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
                    </CardContent>
                </Card>

                {classes.data.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-6">
                            <p className="text-gray-500">Nenhuma aula encontrada.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
} 