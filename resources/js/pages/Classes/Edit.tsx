import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';

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
}

interface Props {
    class: ClassItem;
    instructors: Array<{
        id: number;
        name: string;
    }>;
    can: {
        chooseInstructor: boolean;
    };
}

export default function Edit({ class: classItem, instructors, can }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: classItem.title,
        start_time: new Date(classItem.start_time).toISOString().slice(0, 16),
        end_time: new Date(classItem.end_time).toISOString().slice(0, 16),
        max_students: classItem.max_students.toString(),
        instructor_id: classItem.instructor.id.toString(),
        status: classItem.status.value,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/classes/${classItem.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Editar ${classItem.title}`} />
            
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
                            <h1 className="text-2xl font-bold">Editar Aula</h1>
                            <p className="text-gray-600">{classItem.title}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações da Aula</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Título */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="title">Título da Aula *</Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Ex: Pilates Iniciante"
                                        className={errors.title ? 'border-red-500' : ''}
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                                    )}
                                </div>

                                {/* Instrutor */}
                                {can.chooseInstructor && (
                                    <div>
                                        <Label htmlFor="instructor_id">Instrutor *</Label>
                                        <Select
                                            value={data.instructor_id}
                                            onValueChange={(value) => setData('instructor_id', value)}
                                        >
                                            <SelectTrigger className={errors.instructor_id ? 'border-red-500' : ''}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {instructors.map((instructor) => (
                                                    <SelectItem key={instructor.id} value={instructor.id.toString()}>
                                                        {instructor.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.instructor_id && (
                                            <p className="text-red-500 text-sm mt-1">{errors.instructor_id}</p>
                                        )}
                                    </div>
                                )}

                                {!can.chooseInstructor && (
                                    <div>
                                        <Label>Instrutor</Label>
                                        <Input
                                            value={classItem.instructor.name}
                                            disabled
                                            className="bg-gray-50"
                                        />
                                    </div>
                                )}

                                {/* Máximo de Alunos */}
                                <div>
                                    <Label htmlFor="max_students">Máximo de Alunos</Label>
                                    <Input
                                        id="max_students"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={data.max_students}
                                        onChange={(e) => setData('max_students', e.target.value)}
                                        className={errors.max_students ? 'border-red-500' : ''}
                                    />
                                    {errors.max_students && (
                                        <p className="text-red-500 text-sm mt-1">{errors.max_students}</p>
                                    )}
                                </div>

                                {/* Data/Hora de Início */}
                                <div>
                                    <Label htmlFor="start_time">Data e Hora de Início *</Label>
                                    <Input
                                        id="start_time"
                                        type="datetime-local"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        className={errors.start_time ? 'border-red-500' : ''}
                                    />
                                    {errors.start_time && (
                                        <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>
                                    )}
                                </div>

                                {/* Data/Hora de Fim */}
                                <div>
                                    <Label htmlFor="end_time">Data e Hora de Fim *</Label>
                                    <Input
                                        id="end_time"
                                        type="datetime-local"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        min={data.start_time}
                                        className={errors.end_time ? 'border-red-500' : ''}
                                    />
                                    {errors.end_time && (
                                        <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>
                                    )}
                                </div>

                                {/* Status */}
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) => setData('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="scheduled">Agendada</SelectItem>
                                            <SelectItem value="completed">Concluída</SelectItem>
                                            <SelectItem value="cancelled">Cancelada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Salvando...' : 'Salvar Alterações'}
                                </Button>
                                <Button asChild type="button" variant="outline">
                                    <Link href="/classes">Cancelar</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
} 