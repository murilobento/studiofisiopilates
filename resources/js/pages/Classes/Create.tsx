import React from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';
import { PageProps } from '@/types';
import { type BreadcrumbItem } from '@/types';

interface ClassesCreateProps extends PageProps {
    instructors: Array<{
        id: number;
        name: string;
    }>;
    can: {
        chooseInstructor: boolean;
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
    {
        title: 'Nova Aula',
        href: '/classes/create',
    },
];

export default function Create({ instructors, can }: ClassesCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        start_time: '',
        end_time: '',
        max_students: '5',
        instructor_id: '',
        status: 'scheduled',
    });

    // Ao carregar, preencher datas se vierem por query string
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const qsStart = params.get('start_time');
        const qsEnd = params.get('end_time');

        if (qsStart) {
            setData('start_time', qsStart);
            // se end_time não vier, mas o valor no formulário está vazio, calcula +1h
            if (!qsEnd && !data.end_time) {
                const startDate = new Date(qsStart);
                startDate.setHours(startDate.getHours() + 1);
                setData('end_time', startDate.toISOString().slice(0, 16));
            }
        }

        if (qsEnd) {
            setData('end_time', qsEnd);
        }
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/classes');
    };

    // Função para calcular horário de fim baseado no início (1 hora depois)
    const handleStartTimeChange = (value: string) => {
        setData('start_time', value);
        
        if (value && !data.end_time) {
            const startDate = new Date(value);
            startDate.setHours(startDate.getHours() + 1);
            const endTime = startDate.toISOString().slice(0, 16);
            setData('end_time', endTime);
        }
    };

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="Nova Aula" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <Link
                                        href="/classes"
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Voltar
                                    </Link>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">Nova Aula</h3>
                                        <p className="text-sm text-gray-600">Cadastrar nova aula no estúdio</p>
                                    </div>
                                </div>
                            </div>

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
                                                    <SelectValue placeholder="Selecione o instrutor" />
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
                                        <Input
                                            id="start_time"
                                            type="datetime-local"
                                            value={data.start_time}
                                            onChange={(e) => handleStartTimeChange(e.target.value)}
                                            min={new Date().toISOString().slice(0, 16)}
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
                                        <Input
                                            id="end_time"
                                            type="datetime-local"
                                            value={data.end_time}
                                            onChange={(e) => setData('end_time', e.target.value)}
                                            min={data.start_time || new Date().toISOString().slice(0, 16)}
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

                                {/* Informações sobre horários */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">Horários de Funcionamento</h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Segunda a Sexta: 06:00 - 22:00</li>
                                        <li>• Sábado: 08:00 - 18:00</li>
                                        <li>• Domingo: 08:00 - 16:00</li>
                                    </ul>
                                </div>

                                {/* Botões */}
                                <div className="flex justify-end space-x-3">
                                    <Link
                                        href="/classes"
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        {processing ? 'Salvando...' : 'Salvar Aula'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 