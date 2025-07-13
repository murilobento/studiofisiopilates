import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { ArrowLeft } from 'lucide-react';
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

const breadcrumbs = (recurringClass: RecurringClass): BreadcrumbItem[] => [
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

export default function Edit({ recurringClass, instructors, can }: EditProps) {
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
        <AuthenticatedLayout breadcrumbs={breadcrumbs(recurringClass)}>
            <Head title={`Editar ${recurringClass.title}`} />
            
            <div className="py-12">
                <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <Link
                                        href={route('recurring-classes.index')}
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Voltar
                                    </Link>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">Editar Aula Recorrente</h3>
                                        <p className="text-sm text-gray-600">Modificar horário fixo na grade</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    <strong>Atenção:</strong> Ao salvar as alterações, todas as aulas futuras vinculadas a este horário serão removidas e novas aulas serão geradas com base nas novas configurações.
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                {/* Título */}
                                <div>
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
                                        required 
                                    />
                                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                </div>

                                {/* Instrutor (se admin) */}
                                {can.chooseInstructor && (
                                    <div>
                                        <Label htmlFor="instructor_id" className="block text-sm font-medium text-gray-700">
                                            Instrutor *
                                        </Label>
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
                                    <Label htmlFor="day_of_week" className="block text-sm font-medium text-gray-700">
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

                                {/* Horários */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                                            Hora de Início *
                                        </Label>
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
                                        <Label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
                                            Hora de Fim *
                                        </Label>
                                        <Input 
                                            id="end_time" 
                                            type="time" 
                                            value={data.end_time} 
                                            onChange={(e) => setData('end_time', e.target.value)} 
                                            className={`mt-1 ${errors.end_time ? 'border-red-500' : ''}`}
                                            required 
                                        />
                                        {errors.end_time && <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>}
                                        <p className="text-sm text-gray-500 mt-1">Auto-preenchido (+1h do início)</p>
                                    </div>
                                </div>
                                
                                {/* Datas de Validade */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                                            Data de Início da Recorrência *
                                        </Label>
                                        <DatePicker
                                            value={data.start_date}
                                            onChange={(date) => setData('start_date', date ? date.toISOString().split('T')[0] : '')}
                                            placeholder="Selecione a data de início"
                                            className={`mt-1 ${errors.start_date ? 'border-red-500' : ''}`}
                                        />
                                        {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                                            Data de Fim da Recorrência
                                        </Label>
                                        <DatePicker
                                            value={data.end_date}
                                            onChange={(date) => setData('end_date', date ? date.toISOString().split('T')[0] : '')}
                                            placeholder="Selecione a data de fim (opcional)"
                                            className={`mt-1 ${errors.end_date ? 'border-red-500' : ''}`}
                                        />
                                        {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                                    </div>
                                </div>

                                {/* Máximo de Alunos - Fixado em 5 */}
                                <div>
                                    <Label htmlFor="max_students" className="block text-sm font-medium text-gray-700">
                                        Máximo de Alunos
                                    </Label>
                                    <Input 
                                        id="max_students" 
                                        type="number" 
                                        value={5} 
                                        disabled 
                                        className="mt-1 bg-gray-100 cursor-not-allowed" 
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Fixado em 5 alunos por aula</p>
                                    {errors.max_students && <p className="text-red-500 text-sm mt-1">{errors.max_students}</p>}
                                </div>
                                
                                {/* Opções */}
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="auto_replicate_students" 
                                            checked={data.auto_replicate_students} 
                                            onCheckedChange={(checked) => setData('auto_replicate_students', checked === true)} 
                                        />
                                        <Label htmlFor="auto_replicate_students" className="text-sm font-medium text-gray-700">
                                            Replicar lista de alunos da semana anterior automaticamente
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="is_active" 
                                            checked={data.is_active} 
                                            onCheckedChange={(checked) => setData('is_active', checked === true)} 
                                        />
                                        <Label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                            Ativar esta recorrência
                                        </Label>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-end gap-4 pt-6">
                                    <Link 
                                        href={route('recurring-classes.index')} 
                                        className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                                    >
                                        Cancelar
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Salvando...' : 'Salvar e Regenerar Aulas'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
