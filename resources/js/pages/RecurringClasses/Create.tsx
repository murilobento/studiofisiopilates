import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Repeat,
    BookOpen,
    Calendar,
    Clock,
    Users,
    Settings,
    RefreshCw,
    Info
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface CreateProps {
    instructors: { id: number; name: string }[];
    can: {
        chooseInstructor: boolean;
    }
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Agenda',
        href: '/calendar',
    },
    {
        title: 'Aula Recorrente',
        href: '/recurring-classes',
    },
    {
        title: 'Nova Aula Recorrente',
        href: '/recurring-classes/create',
    },
];

export default function Create({ instructors, can }: CreateProps) {
    // Auto-preenchimento das datas (primeiro ao último dia do mês atual)
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        instructor_id: '',
        day_of_week: '',
        start_time: '',
        end_time: '',
        max_students: 5,
        start_date: firstDayOfMonth.toISOString().split('T')[0], // Auto-preenchido
        end_date: lastDayOfMonth.toISOString().split('T')[0], // Auto-preenchido
        auto_replicate_students: true,
        is_active: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('recurring-classes.store'));
    };

    // Função para auto-preenchimento do horário de fim (+1h)
    const handleStartTimeChange = (value: string) => {
        setData('start_time', value);

        if (value) {
            const [hours, minutes] = value.split(':');
            const startDate = new Date();
            startDate.setHours(parseInt(hours), parseInt(minutes));
            startDate.setHours(startDate.getHours() + 1); // +1 hora

            const endTime = startDate.toTimeString().slice(0, 5); // HH:MM
            setData('end_time', endTime);
        }
    };

    const daysOfWeek = [
        { value: '2', label: 'Segunda-feira' },
        { value: '3', label: 'Terça-feira' },
        { value: '4', label: 'Quarta-feira' },
        { value: '5', label: 'Quinta-feira' },
        { value: '6', label: 'Sexta-feira' },
    ];

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="Nova Aula Recorrente" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header moderno */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Repeat className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Nova Aula Recorrente</h1>
                            <p className="text-muted-foreground">
                                Configure um horário fixo na grade semanal
                            </p>
                        </div>
                    </div>
                </div>

                {/* Barra de ações */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Settings className="h-4 w-4" />
                                <span>Configuração de Grade Fixa</span>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href={route('recurring-classes.index')}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Voltar
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <form onSubmit={submit} className="space-y-6">
                    {/* Informações Básicas */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>Informações da Aula</CardTitle>
                            </div>
                            <CardDescription>
                                Configure os detalhes básicos da aula recorrente
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <Label htmlFor="title">Título da Aula *</Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Ex: Pilates Iniciante"
                                        className={`mt-1 ${errors.title ? 'border-red-500' : ''}`}
                                        required
                                    />
                                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                </div>

                                {can.chooseInstructor && (
                                    <div>
                                        <Label htmlFor="instructor_id">Instrutor *</Label>
                                        <Select onValueChange={(value) => setData('instructor_id', value)} value={data.instructor_id}>
                                            <SelectTrigger className={`mt-1 ${errors.instructor_id ? 'border-red-500' : ''}`}>
                                                <SelectValue placeholder="Selecione um instrutor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {instructors.map((instructor) => (
                                                    <SelectItem key={instructor.id} value={instructor.id.toString()}>{instructor.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.instructor_id && <p className="text-red-500 text-sm mt-1">{errors.instructor_id}</p>}
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="day_of_week" className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Dia da Semana *
                                    </Label>
                                    <Select onValueChange={(value) => setData('day_of_week', value)} value={data.day_of_week}>
                                        <SelectTrigger className={`mt-1 ${errors.day_of_week ? 'border-red-500' : ''}`}>
                                            <SelectValue placeholder="Selecione o dia" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {daysOfWeek.map((day) => (
                                                <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.day_of_week && <p className="text-red-500 text-sm mt-1">{errors.day_of_week}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Horários e Datas */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>Horários e Período</CardTitle>
                            </div>
                            <CardDescription>
                                Defina os horários e período de validade da recorrência
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="start_time">Hora de Início *</Label>
                                    <Input
                                        id="start_time"
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => handleStartTimeChange(e.target.value)}
                                        className={`mt-1 ${errors.start_time ? 'border-red-500' : ''}`}
                                        required
                                    />
                                    {errors.start_time && <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="end_time">Hora de Fim *</Label>
                                    <Input
                                        id="end_time"
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        className={`mt-1 ${errors.end_time ? 'border-red-500' : ''}`}
                                        required
                                    />
                                    <p className="text-sm text-muted-foreground mt-1">Auto-preenchido (+1h do início)</p>
                                    {errors.end_time && <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>}
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="start_date">Data de Início *</Label>
                                    <DatePicker
                                        value={data.start_date}
                                        onChange={(date) => setData('start_date', date ? date.toISOString().split('T')[0] : '')}
                                        placeholder="Selecione a data de início"
                                        className={`mt-1 ${errors.start_date ? 'border-red-500' : ''}`}
                                    />
                                    <p className="text-sm text-muted-foreground mt-1">Auto-preenchido (1º dia do mês)</p>
                                    {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="end_date">Data de Fim</Label>
                                    <DatePicker
                                        value={data.end_date}
                                        onChange={(date) => setData('end_date', date ? date.toISOString().split('T')[0] : '')}
                                        placeholder="Selecione a data de fim"
                                        className={`mt-1 ${errors.end_date ? 'border-red-500' : ''}`}
                                    />
                                    <p className="text-sm text-muted-foreground mt-1">Auto-preenchido (último dia do mês)</p>
                                    {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Configurações Avançadas */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>Configurações</CardTitle>
                            </div>
                            <CardDescription>
                                Opções avançadas da aula recorrente
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label htmlFor="max_students" className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Máximo de Alunos
                                </Label>
                                <Input
                                    id="max_students"
                                    type="number"
                                    value={5}
                                    disabled
                                    className="mt-1 bg-gray-100 cursor-not-allowed"
                                />
                                <p className="text-sm text-muted-foreground mt-1">Fixado em 5 alunos por aula</p>
                                {errors.max_students && <p className="text-red-500 text-sm mt-1">{errors.max_students}</p>}
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <Checkbox
                                        id="auto_replicate_students"
                                        checked={data.auto_replicate_students}
                                        onCheckedChange={(checked) => setData('auto_replicate_students', checked as true)}
                                        className="mt-1"
                                    />
                                    <div>
                                        <Label htmlFor="auto_replicate_students" className="font-medium">
                                            Replicação Automática
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Replicar lista de alunos da semana anterior automaticamente
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked as true)}
                                        className="mt-1"
                                    />
                                    <div>
                                        <Label htmlFor="is_active" className="font-medium">
                                            Ativar Recorrência
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Ativar esta recorrência para gerar aulas automaticamente
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-blue-900 mb-1">Como Funciona</p>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Aulas serão geradas automaticamente no período definido</li>
                                        <li>• A replicação de alunos copia a lista da semana anterior</li>
                                        <li>• Você pode desativar a recorrência a qualquer momento</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Botões de Ação */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                >
                                    <Link href={route('recurring-classes.index')}>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Voltar
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    {processing ? 'Salvando...' : 'Salvar e Gerar Recorrências'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
