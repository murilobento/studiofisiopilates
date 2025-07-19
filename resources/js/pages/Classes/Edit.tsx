import React from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';
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
}

interface ClassesEditProps extends PageProps {
    classItem: ClassItem;
    instructors: Array<{
        id: number;
        name:string;
    }>;
    can: {
        chooseInstructor: boolean;
    };
}

export default function Edit(props: ClassesEditProps) {
    const { classItem, instructors, can } = props;

    if (!classItem) {
        return <div className="p-6">Dados da aula não encontrados.</div>;
    }

    const initialStatus = typeof classItem.status === 'string'
        ? classItem.status
        : (classItem.status?.value ?? 'scheduled');

    const { data, setData, put, processing, errors } = useForm({
        title: classItem.title,
        start_time: new Date(classItem.start_time).toISOString().slice(0, 16),
        end_time: new Date(classItem.end_time).toISOString().slice(0, 16),
        max_students: classItem.max_students.toString(),
        instructor_id: classItem.instructor.id.toString(),
        status: initialStatus,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Aulas',
            href: '/classes',
        },
        {
            title: `Editar ${classItem.title}`,
            href: `/classes/${classItem.id}/edit`,
        },
    ];

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/classes/${classItem.id}`);
    };

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${classItem.title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Editar Aula</h1>
                        <p className="text-muted-foreground">{classItem.title}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link
                            href="/classes"
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Link>
                    </div>
                </div>

                {/* Formulário */}
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Título */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                        Título da Aula *
                                    </Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Ex: Pilates Iniciante"
                                        className={`mt-1 ${errors.title ? 'border-red-500' : ''}`}
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                                    )}
                                </div>

                                {/* Instrutor */}
                                {can.chooseInstructor && (
                                    <div>
                                        <Label htmlFor="instructor_id" className="block text-sm font-medium text-gray-700">
                                            Instrutor *
                                        </Label>
                                        <Select
                                            value={data.instructor_id}
                                            onValueChange={(value) => setData('instructor_id', value)}
                                        >
                                            <SelectTrigger className={`mt-1 ${errors.instructor_id ? 'border-red-500' : ''}`}>
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
                                        <Label className="block text-sm font-medium text-gray-700">
                                            Instrutor
                                        </Label>
                                        <Input
                                            value={classItem.instructor.name}
                                            disabled
                                            className="mt-1 bg-gray-50"
                                        />
                                    </div>
                                )}

                                {/* Máximo de Alunos */}
                                <div>
                                    <Label htmlFor="max_students" className="block text-sm font-medium text-gray-700">
                                        Máximo de Alunos
                                    </Label>
                                    <Input
                                        id="max_students"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={data.max_students}
                                        onChange={(e) => setData('max_students', e.target.value)}
                                        className={`mt-1 ${errors.max_students ? 'border-red-500' : ''}`}
                                    />
                                    {errors.max_students && (
                                        <p className="text-red-500 text-sm mt-1">{errors.max_students}</p>
                                    )}
                                </div>

                                {/* Data/Hora de Início */}
                                <div>
                                    <Label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                                        Data e Hora de Início *
                                    </Label>
                                    <DateTimePicker
                                        value={data.start_time}
                                        onChange={(datetime) => setData('start_time', datetime)}
                                        placeholder="Selecione data e hora de início"
                                        className={`mt-1 ${errors.start_time ? 'border-red-500' : ''}`}
                                    />
                                    {errors.start_time && (
                                        <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>
                                    )}
                                </div>

                                {/* Data/Hora de Fim */}
                                <div>
                                    <Label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
                                        Data e Hora de Fim *
                                    </Label>
                                    <DateTimePicker
                                        value={data.end_time}
                                        onChange={(datetime) => setData('end_time', datetime)}
                                        placeholder="Selecione data e hora de fim"
                                        minDate={data.start_time ? new Date(data.start_time) : undefined}
                                        className={`mt-1 ${errors.end_time ? 'border-red-500' : ''}`}
                                    />
                                    {errors.end_time && (
                                        <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>
                                    )}
                                </div>

                                {/* Status */}
                                <div>
                                    <Label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                        Status
                                    </Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) => setData('status', value)}
                                    >
                                        <SelectTrigger className="mt-1">
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

                            {/* Botões */}
                            <div className="flex justify-end space-x-3 pt-6">
                                <Link
                                    href="/classes"
                                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                >
                                    Cancelar
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing ? 'Salvando...' : 'Salvar Alterações'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 