import { useState } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Separator } from '@/components/ui/separator';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { ArrowLeft, AlertTriangle, BookOpen, Clock, Users, Calendar, Edit as EditIcon } from 'lucide-react';
import { FormEventHandler } from 'react';
import { PageProps } from '@/types';
import { type BreadcrumbItem } from '@/types';
import SuccessAlert from '@/components/success-alert';

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
        name: string;
    }>;
    can: {
        chooseInstructor: boolean;
    };
    flash?: {
        message?: string;
        success?: string;
        error?: string;
    };
}

export default function Edit(props: ClassesEditProps) {
    const { classItem, instructors, can } = props;
    const { auth, flash } = usePage<any>().props;
    const [showConflictDialog, setShowConflictDialog] = useState(false);
    const [conflictDetails, setConflictDetails] = useState<{
        existingClass: string;
        instructor: string;
        time: string;
    } | null>(null);
    const [pendingSubmit, setPendingSubmit] = useState(false);

    if (!classItem) {
        return <div className="p-6">Dados da aula não encontrados.</div>;
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
            title: `Editar ${classItem.title}`,
            href: `/classes/${classItem.id}/edit`,
        },
    ];

    const initialStatus = typeof classItem.status === 'string'
        ? classItem.status
        : (classItem.status?.value ?? 'scheduled');

    // Função para converter data para formato local (Brasil)
    const toLocalDateTime = (dateString: string) => {
        const date = new Date(dateString);
        // Formatar para datetime-local sem conversão UTC
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const { data, setData, put, processing, errors } = useForm({
        title: classItem.title,
        start_time: toLocalDateTime(classItem.start_time),
        end_time: toLocalDateTime(classItem.end_time),
        max_students: classItem.max_students.toString(),
        instructor_id: classItem.instructor.id.toString(),
        status: initialStatus,
    });

    // Função para verificar conflitos de horário
    const checkTimeConflict = async (instructorId: string, startTime: string, endTime: string) => {
        if (!instructorId || !startTime || !endTime) return false;

        try {
            console.log('Verificando conflito (Edit):', { instructorId, startTime, endTime, excludeClassId: classItem.id });
            
            const response = await fetch('/api/classes/check-conflict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    instructor_id: instructorId,
                    start_time: startTime,
                    end_time: endTime,
                    exclude_class_id: classItem.id, // Excluir a própria aula da verificação
                }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Resultado da verificação (Edit):', result);
                return result.hasConflict ? result : false;
            } else {
                console.error('Erro na resposta da API (Edit):', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Erro ao verificar conflito:', error);
        }
        return false;
    };

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        // Determinar o instrutor (se for instrutor, usar o próprio ID)
        const instructorId = data.instructor_id || (auth.user.role === 'instructor' ? auth.user.id.toString() : '');

        if (!instructorId) {
            put(`/classes/${classItem.id}`);
            return;
        }

        // Verificar conflito de horário apenas se mudou horários ou instrutor
        const hasTimeChanged = data.start_time !== toLocalDateTime(classItem.start_time) ||
            data.end_time !== toLocalDateTime(classItem.end_time);
        const hasInstructorChanged = data.instructor_id !== classItem.instructor.id.toString();

        if (hasTimeChanged || hasInstructorChanged) {
            const conflict = await checkTimeConflict(instructorId, data.start_time, data.end_time);

            if (conflict) {
                const instructor = instructors.find(i => i.id.toString() === instructorId) || { name: auth.user.name };
                setConflictDetails({
                    existingClass: conflict.existingClass.title,
                    instructor: instructor.name,
                    time: `${new Date(conflict.existingClass.start_time).toLocaleString('pt-BR')} - ${new Date(conflict.existingClass.end_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
                });
                setShowConflictDialog(true);
                setPendingSubmit(true);
                return;
            }
        }

        put(`/classes/${classItem.id}`);
    };

    const handleConfirmSubmit = () => {
        setShowConflictDialog(false);
        setPendingSubmit(false);
        // Submeter mesmo com conflito (admin pode forçar)
        put(`/classes/${classItem.id}`);
    };

    const handleCancelSubmit = () => {
        setShowConflictDialog(false);
        setPendingSubmit(false);
    };

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${classItem.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header moderno */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <EditIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Editar Aula</h1>
                            <p className="text-muted-foreground">{classItem.title}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div></div>
                        <Button variant="outline" asChild>
                            <Link href="/classes">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Alertas */}
                {flash?.success && (
                    <SuccessAlert message={flash.success} />
                )}

                <form onSubmit={submit} className="space-y-6">
                    {/* Informações Básicas */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                <CardTitle>Informações Básicas</CardTitle>
                            </div>
                            <CardDescription>
                                Edite o título e instrutor da aula
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Título */}
                            <div>
                                <Label htmlFor="title">Título da Aula *</Label>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Instrutor */}
                                {can.chooseInstructor ? (
                                    <div>
                                        <Label htmlFor="instructor_id">Instrutor *</Label>
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
                                ) : (
                                    <div>
                                        <Label>Instrutor</Label>
                                        <Input
                                            value={classItem.instructor.name}
                                            disabled
                                            className="mt-1 bg-muted"
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
                                        className={`mt-1 ${errors.max_students ? 'border-red-500' : ''}`}
                                    />
                                    {errors.max_students && (
                                        <p className="text-red-500 text-sm mt-1">{errors.max_students}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Horários */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-green-600" />
                                <CardTitle>Horários</CardTitle>
                            </div>
                            <CardDescription>
                                Ajuste data e horário da aula
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Data/Hora de Início */}
                                <div>
                                    <Label htmlFor="start_time">Data e Hora de Início *</Label>
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
                                    <Label htmlFor="end_time">Data e Hora de Fim *</Label>
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
                            </div>

                            {/* Informações sobre horários */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-blue-900 mb-2">Horários de Funcionamento</h4>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            <li>• Segunda a Sexta: 06:00 - 22:00</li>
                                            <li>• Sábado: 08:00 - 18:00</li>
                                            <li>• Domingo: 08:00 - 16:00</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Configurações */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-purple-600" />
                                <CardTitle>Configurações</CardTitle>
                            </div>
                            <CardDescription>
                                Status e configurações adicionais da aula
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <Label htmlFor="status">Status</Label>
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
                        </CardContent>
                    </Card>

                    {/* Botões de Ação */}
                    <div className="flex items-center justify-end gap-4 pt-6">
                        <Button variant="outline" asChild>
                            <Link href="/classes">
                                Cancelar
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* AlertDialog para conflito de horários */}
            <AlertDialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <AlertDialogTitle className="text-lg">Conflito de Horário Detectado</AlertDialogTitle>
                                <AlertDialogDescription className="text-sm text-muted-foreground">
                                    Já existe uma aula agendada neste horário
                                </AlertDialogDescription>
                            </div>
                        </div>
                    </AlertDialogHeader>

                    {conflictDetails && (
                        <div className="my-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <h4 className="font-semibold text-orange-900 mb-2">Detalhes do Conflito:</h4>
                            <div className="space-y-2 text-sm text-orange-800">
                                <div>
                                    <span className="font-medium">Instrutor:</span> {conflictDetails.instructor}
                                </div>
                                <div>
                                    <span className="font-medium">Aula Existente:</span> {conflictDetails.existingClass}
                                </div>
                                <div>
                                    <span className="font-medium">Horário:</span> {conflictDetails.time}
                                </div>
                            </div>
                        </div>
                    )}

                    <AlertDialogDescription>
                        {auth.user.role === 'admin'
                            ? 'Como administrador, você pode prosseguir mesmo com o conflito, mas isso pode causar problemas de agendamento.'
                            : 'Por favor, escolha um horário diferente para evitar conflitos de agenda.'
                        }
                    </AlertDialogDescription>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelSubmit}>
                            Cancelar
                        </AlertDialogCancel>
                        {auth.user.role === 'admin' && (
                            <AlertDialogAction
                                onClick={handleConfirmSubmit}
                                className="bg-orange-600 hover:bg-orange-700"
                            >
                                Prosseguir Mesmo Assim
                            </AlertDialogAction>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
} 