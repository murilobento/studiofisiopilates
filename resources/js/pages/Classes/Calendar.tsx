import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Plus, List } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface Props {
    instructors: Array<{
        id: number;
        name: string;
    }>;
    can: {
        create: boolean;
        chooseInstructor: boolean;
    };
}

export default function Calendar({ instructors, can }: Props) {
    const calendarRef = useRef<FullCalendar>(null);
    const [selectedInstructor, setSelectedInstructor] = useState<string>('');
    const [events, setEvents] = useState([]);

    // Configurações do FullCalendar
    const calendarOptions = {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        initialView: 'timeGridWeek',
        locale: 'pt-br',
        height: 'auto',
        slotMinTime: '07:00:00',
        slotMaxTime: '21:00:00',
        weekends: false,
        allDaySlot: false,
        slotDuration: '00:30:00',
        businessHours: {
            daysOfWeek: [1, 2, 3, 4, 5], // Segunda a sexta
            startTime: '07:00',
            endTime: '21:00',
        },
        events: (fetchInfo: any, successCallback: any, failureCallback: any) => {
            fetchEvents(fetchInfo.start, fetchInfo.end, successCallback, failureCallback);
        },
        eventClick: (info: any) => {
            // Redirecionar para detalhes da aula
            window.location.href = `/classes/${info.event.id}`;
        },
        select: (info: any) => {
            if (can.create) {
                // Redirecionar para criar aula com horário pré-selecionado
                const startTime = info.start.toISOString().slice(0, 16);
                const endTime = info.end.toISOString().slice(0, 16);
                window.location.href = `/classes/create?start_time=${startTime}&end_time=${endTime}`;
            }
        },
        selectable: can.create,
        selectMirror: true,
        eventContent: (arg: any) => {
            const event = arg.event;
            const props = event.extendedProps;
            
            return {
                html: `
                    <div class="p-1 text-xs">
                        <div class="font-medium truncate">${event.title}</div>
                        <div class="text-xs opacity-75">${props.instructor}</div>
                        <div class="text-xs opacity-75">${props.enrolled_count}/${props.max_students} alunos</div>
                    </div>
                `
            };
        },
    };

    // Função para buscar eventos
    const fetchEvents = async (start: Date, end: Date, successCallback: any, failureCallback: any) => {
        try {
            const params = new URLSearchParams({
                start: start.toISOString(),
                end: end.toISOString(),
            });

            if (selectedInstructor) {
                params.append('instructor_id', selectedInstructor);
            }

            const response = await fetch(`/api/classes?${params}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao carregar eventos');
            }

            const events = await response.json();
            successCallback(events);
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
            failureCallback(error);
        }
    };

    // Recarregar eventos quando instrutor mudar
    useEffect(() => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.refetchEvents();
        }
    }, [selectedInstructor]);

    return (
        <AppLayout>
            <Head title="Agenda - Calendário" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Agenda</h1>
                        <p className="text-gray-600">Visualização em calendário das aulas</p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href="/classes">
                                <List className="h-4 w-4 mr-2" />
                                Listagem
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
                                    <Select
                                        value={selectedInstructor}
                                        onValueChange={setSelectedInstructor}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todos os instrutores" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Todos</SelectItem>
                                            {instructors.map((instructor) => (
                                                <SelectItem key={instructor.id} value={instructor.id.toString()}>
                                                    {instructor.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Calendário */}
                <Card>
                    <CardContent className="p-4">
                        <FullCalendar
                            ref={calendarRef}
                            {...calendarOptions}
                        />
                    </CardContent>
                </Card>

                {/* Legenda */}
                <Card>
                    <CardHeader>
                        <CardTitle>Legenda</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                <span>Aulas Agendadas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded"></div>
                                <span>Aulas Concluídas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-500 rounded"></div>
                                <span>Aulas Canceladas</span>
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                            <p>• Clique em uma aula para ver detalhes</p>
                            {can.create && <p>• Selecione um horário vazio para criar uma nova aula</p>}
                            <p>• Horário de funcionamento: Segunda a Sexta, 07:00 às 21:00</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 