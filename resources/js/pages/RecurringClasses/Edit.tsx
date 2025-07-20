import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Repeat, Clock, Calendar, Users, Settings, AlertTriangle, Edit as EditIcon } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface RecurringClass {
    id: number;
    title: string;
    instructor_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    max_students: number;
    start_date: string;
    end_date: string | null;
    auto_replicate_students: boolean;
    is_active: boolean;
}

interface EditProps {
    recurringClass: RecurringClass;
    instructors: { id: number; name: string }[];
    can: {
        chooseInstructor: boolean;
    }
}

export default function Edit({ recurringClass, instructors, can }: EditProps) {
    if (!recurringClass) {
        return <div className="p-6">Dados da aula recorrente não encontrados.</div>;
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
            title: `Editar ${recurringClass.title}`,
            href: `/recurring-classes/${recurringClass.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        title: recurringClass.title,
        instructor_id: recurringClass.instructor_id.toString(),
        day_of_week: recurringClass.day_of_week.toString(),
        start_time: recurringClass.start_time.slice(0, 5),
        end_time: recurringClass.end_time.slice(0, 5),
        max_students: 5,
        start_date: recurringClass.start_date,
        end_date: recurringClass.end_date || '',
        auto_replicate_students: recurringClass.auto_replicate_students,
        is_active: recurringClass.is_active,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('recurring-classes.update', recurringClass.id));
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
            <Head title={`Editar ${recurringClass.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header moderno */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <EditIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Editar Aula Recorrente</h1>
                            <p className="text-muted-foreground">{recurringClass.title}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div></div>
                        <Button variant="outline" asChild>
                            <Link href={route('recurring-classes.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Aviso Importante */}
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-medium text-amber-900 mb-1">Atenção - Regeneração de Aulas</h4>
                            <p className="text-sm text-amber-800">
                                Ao salvar as alterações, todas as aulas futuras vinculadas a este horário serão removidas e novas aulas serão geradas com base nas novas configurações.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Informações Básicas */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Repeat className="h-5 w-5 text-blue-600" />
                                <CardTitle>Informações Básicas</CardTitle>
                            </div>
                            <CardDescription>
                                Edite o título e instrutor da aula recorrente
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
                                    required 
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Instrutor (se admin) */}
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

                                {/* Dia da Semana */}
                                <div>
                                    <Label htmlFor="day_of_week">Dia da Semana *</Label>
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

                    {/* Horários */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-green-600" />
                                <CardTitle>Horários</CardTitle>
                            </div>
                            <CardDescription>
                                Configure os horários da aula recorrente
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    {errors.end_time && <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>}
                                    <p className="text-sm text-muted-foreground mt-1">Auto-preenchido (+1h do início)</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Período de Recorrência */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-orange-600" />
                                <CardTitle>Período de Recorrência</CardTitle>
                            </div>
                            <CardDescription>
                                Defina o período de validade da recorrência
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="start_date">Data de Início *</Label>
                                    <DatePicker
                                        value={data.start_date}
                                        onChange={(date) => setData('start_date', date ? date.toISOString().split('T')[0] : '')}
                                        placeholder="Selecione a data de início"
                                        className={`mt-1 ${errors.start_date ? 'border-red-500' : ''}`}
                                    />
                                    {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="end_date">Data de Fim</Label>
                                    <DatePicker
                                        value={data.end_date}
                                        onChange={(date) => setData('end_date', date ? date.toISOString().split('T')[0] : '')}
                                        placeholder="Selecione a data de fim (opcional)"
                                        className={`mt-1 ${errors.end_date ? 'border-red-500' : ''}`}
                                    />
                                    {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                                    <p className="text-sm text-muted-foreground mt-1">Deixe vazio para recorrência indefinida</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Configurações */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-purple-600" />
                                <CardTitle>Configurações</CardTitle>
                            </div>
                            <CardDescription>
                                Configurações adicionais da aula recorrente
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Máximo de Alunos - Fixado em 5 */}
                            <div>
                                <Label htmlFor="max_students">Máximo de Alunos</Label>
                                <Input 
                                    id="max_students" 
                                    type="number" 
                                    value={5} 
                                    disabled 
                                    className="mt-1 bg-muted cursor-not-allowed" 
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
                                        onCheckedChange={(checked) => setData('auto_replicate_students', Boolean(checked))} 
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
                                        onCheckedChange={(checked) => setData('is_active', Boolean(checked))} 
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
                        </CardContent>
                    </Card>

                    {/* Botões de Ação */}
                    <div className="flex items-center justify-end gap-4 pt-6">
                        <Button variant="outline" asChild>
                            <Link href={route('recurring-classes.index')}>
                                Cancelar
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Salvando...' : 'Salvar e Regenerar Aulas'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
