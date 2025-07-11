import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, UserPlus, UserMinus, Users, Clock, Calendar } from 'lucide-react';
import { useState } from 'react';

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

interface Props {
    class: ClassItem;
    availableStudents: Student[];
    can: {
        update: boolean;
        delete: boolean;
        manageStudents: boolean;
    };
}

export default function Show({ class: classItem, availableStudents, can }: Props) {
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    
    const addStudentForm = useForm({
        student_id: '',
    });

    const removeStudentForm = useForm({
        student_id: '',
    });

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
        
        addStudentForm.setData('student_id', selectedStudentId);
        addStudentForm.post(`/classes/${classItem.id}/students`, {
            onSuccess: () => {
                setSelectedStudentId('');
                addStudentForm.reset();
            },
        });
    };

    const removeStudent = (studentId: number) => {
        if (confirm('Tem certeza que deseja remover este aluno da aula?')) {
            removeStudentForm.setData('student_id', studentId.toString());
            removeStudentForm.delete(`/classes/${classItem.id}/students`);
        }
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

    return (
        <AppLayout>
            <Head title={classItem.title} />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/classes">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{classItem.title}</h1>
                            <p className="text-gray-600">Detalhes da aula</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {can.update && (
                            <Button asChild variant="outline">
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Informações da Aula */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informações da Aula</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <p className="font-medium">{startDateTime.date}</p>
                                        <p className="text-sm text-gray-600">
                                            {startDateTime.time} - {endDateTime.time}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <p className="font-medium">Instrutor</p>
                                        <p className="text-sm text-gray-600">{classItem.instructor.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <p className="font-medium">Capacidade</p>
                                        <p className="text-sm text-gray-600">
                                            {classItem.students.length}/{classItem.max_students} alunos
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="font-medium mb-1">Status</p>
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
                                    <CardTitle>Alunos Inscritos</CardTitle>
                                    <Badge variant="outline">
                                        {classItem.students.length}/{classItem.max_students}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Adicionar Aluno */}
                                {can.manageStudents && availableStudents.length > 0 && classItem.students.length < classItem.max_students && (
                                    <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
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
                                            disabled={!selectedStudentId || addStudentForm.processing}
                                        >
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Adicionar
                                        </Button>
                                    </div>
                                )}

                                {/* Lista de Alunos */}
                                <div className="space-y-2">
                                    {classItem.students.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">
                                            Nenhum aluno inscrito nesta aula.
                                        </p>
                                    ) : (
                                        classItem.students.map((student) => (
                                            <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex-1">
                                                    <p className="font-medium">{student.name}</p>
                                                    <div className="flex gap-4 text-sm text-gray-600">
                                                        <span>{student.email}</span>
                                                        {student.phone && <span>{student.phone}</span>}
                                                        {student.plan && <span>Plano: {student.plan.description}</span>}
                                                    </div>
                                                </div>
                                                {can.manageStudents && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeStudent(student.id)}
                                                        disabled={removeStudentForm.processing}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <UserMinus className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Mensagens de limite */}
                                {classItem.students.length >= classItem.max_students && (
                                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                                        <p className="text-yellow-800 text-sm">
                                            Esta aula atingiu a capacidade máxima de alunos.
                                        </p>
                                    </div>
                                )}

                                {can.manageStudents && availableStudents.length === 0 && classItem.students.length < classItem.max_students && (
                                    <div className="bg-gray-50 border p-3 rounded-lg">
                                        <p className="text-gray-600 text-sm">
                                            Não há alunos disponíveis para adicionar nesta aula.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 