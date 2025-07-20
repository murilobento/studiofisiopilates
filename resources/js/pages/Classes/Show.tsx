import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Edit, 
    Trash2, 
    UserPlus, 
    UserMinus, 
    Users, 
    Clock, 
    Calendar,
    BookOpen,
    Activity,
    AlertTriangle,
    CheckCircle,
    User,
    Mail,
    Phone
} from 'lucide-react';
import { useState } from 'react';
import { type PageProps, type BreadcrumbItem } from '@/types';

interface Student {
    id: number;
    name: string;
    email: string;
    phone: string;
    plan?: {
        description: string;
    };
}

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
    students: Student[];
}

interface Props extends PageProps {
    classItem: ClassItem;
    availableStudents: Student[];
    can: {
        update: boolean;
        delete: boolean;
        manageStudents: boolean;
    };
}

export default function Show({ classItem, availableStudents, can }: Props) {
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    
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

    const addStudent = () => {
        if (!selectedStudentId) return;

        router.post(`/classes/${classItem.id}/students`, {
            student_id: selectedStudentId,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedStudentId('');
            },
        });
    };

    const removeStudent = (studentId: number) => {
        if (!confirm('Tem certeza que deseja remover este aluno da aula?')) return;

        router.delete(`/classes/${classItem.id}/students`, {
            data: { student_id: studentId },
            preserveScroll: true,
        });
    };

    const deleteClass = () => {
        if (confirm('Tem certeza que deseja excluir esta aula?')) {
            router.delete(`/classes/${classItem.id}`);
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('pt-BR'),
            time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };
    };

    const startDateTime = formatDateTime(classItem.start_time);
    const endDateTime = formatDateTime(classItem.end_time);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Aulas', href: '/classes' },
        { title: classItem.title, href: `/classes/${classItem.id}` },
    ];

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={classItem.title} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header moderno */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{classItem.title}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <Badge className={getStatusColor(classItem.status.value)}>
                                    {classItem.status.label}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    {startDateTime.date} • {startDateTime.time} - {endDateTime.time}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barra de ações */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Activity className="h-4 w-4" />
                                <span>Gerenciamento de Aula</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" asChild>
                                    <Link href="/classes">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Voltar
                                    </Link>
                                </Button>
                                {can.update && (
                                    <Button variant="outline" asChild>
                                        <Link href={`/classes/${classItem.id}/edit`}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Editar
                                        </Link>
                                    </Button>
                                )}
                                {can.delete && (
                                    <Button
                                        variant="outline"
                                        onClick={deleteClass}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Excluir
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Informações da Aula */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle>Detalhes da Aula</CardTitle>
                                </div>
                                <CardDescription>
                                    Informações gerais da sessão
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                                        <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-blue-900">Data e Horário</p>
                                            <p className="text-sm text-blue-700">{startDateTime.date}</p>
                                            <p className="text-sm text-blue-700">
                                                {startDateTime.time} - {endDateTime.time}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                                        <User className="h-5 w-5 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-green-900">Instrutor</p>
                                            <p className="text-sm text-green-700">{classItem.instructor.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                                        <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-purple-900">Ocupação</p>
                                            <p className="text-sm text-purple-700">
                                                {classItem.students.length} de {classItem.max_students} alunos
                                            </p>
                                            <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                                                <div 
                                                    className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                                                    style={{ 
                                                        width: `${(classItem.students.length / classItem.max_students) * 100}%` 
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Status da Aula</span>
                                    <Badge className={getStatusColor(classItem.status.value)}>
                                        {classItem.status.label}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Lista de Alunos */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-muted-foreground" />
                                        <CardTitle>Alunos Inscritos</CardTitle>
                                    </div>
                                    <Badge variant="outline" className="font-semibold">
                                        {classItem.students.length}/{classItem.max_students}
                                    </Badge>
                                </div>
                                <CardDescription>
                                    Gerencie os alunos participantes desta aula
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Adicionar Aluno */}
                                {can.manageStudents && availableStudents.length > 0 && classItem.students.length < classItem.max_students && (
                                    <div className="flex gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                                        <Select
                                            value={selectedStudentId}
                                            onValueChange={setSelectedStudentId}
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Selecione um aluno para adicionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableStudents.map((student) => (
                                                    <SelectItem key={student.id} value={student.id.toString()}>
                                                        {student.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            onClick={addStudent}
                                            disabled={!selectedStudentId}
                                        >
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Adicionar
                                        </Button>
                                    </div>
                                )}

                                {/* Lista de Alunos */}
                                <div className="space-y-3">
                                    {classItem.students.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                                            <p className="text-gray-500 font-medium">Nenhum aluno inscrito</p>
                                            <p className="text-sm text-gray-400">Esta aula ainda não possui participantes</p>
                                        </div>
                                    ) : (
                                        classItem.students.map((student) => (
                                            <div key={student.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white font-semibold text-sm">
                                                        {student.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900">{student.name}</p>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            <span>{student.email}</span>
                                                        </div>
                                                        {student.phone && (
                                                            <div className="flex items-center gap-1">
                                                                <Phone className="h-3 w-3" />
                                                                <span>{student.phone}</span>
                                                            </div>
                                                        )}
                                                        {student.plan && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {student.plan.description}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                {can.manageStudents && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeStudent(student.id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <UserMinus className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Mensagens de status */}
                                {classItem.students.length >= classItem.max_students && (
                                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-amber-900">Aula Lotada</p>
                                            <p className="text-sm text-amber-800">
                                                Esta aula atingiu a capacidade máxima de alunos.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {can.manageStudents && availableStudents.length === 0 && classItem.students.length < classItem.max_students && (
                                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <CheckCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900">Sem Alunos Disponíveis</p>
                                            <p className="text-sm text-gray-600">
                                                Não há alunos disponíveis para adicionar nesta aula no momento.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 