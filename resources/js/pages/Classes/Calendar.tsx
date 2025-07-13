import React, { useRef, useState, useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, List, Calendar as CalendarIcon } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { router } from '@inertiajs/react';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { PageProps } from '@/types';
import { type BreadcrumbItem } from '@/types';

interface CalendarProps extends PageProps {
    instructors: Array<{
        id: number;
        name: string;
    }>;
    can: {
        create: boolean;
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
        title: 'Calendário',
        href: '/calendar',
    },
];

export default function Calendar({ instructors, can }: CalendarProps) {
    const calendarRef = useRef<FullCalendar>(null);
    const [selectedInstructor, setSelectedInstructor] = useState<string>('all');
    const [events, setEvents] = useState([]);

    // Helper para formato local yyyy-MM-ddTHH:MM
    const formatLocal = (date: Date): string => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

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
        locales: [ptBrLocale],
        height: 'auto',
        slotMinTime: '07:00:00',
        slotMaxTime: '21:00:00',
        weekends: false,
        allDaySlot: false,
        slotDuration: '01:00:00',
        snapDuration: '01:00:00',
        slotLabelInterval: '01:00',
        editable: true,
        eventDurationEditable: true,
        droppable: false,
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
                const startTime = formatLocal(info.start);
                const endTime = formatLocal(info.end);
                window.location.href = `/classes/create?start_time=${startTime}&end_time=${endTime}`;
            }
        },
        selectable: can.create,
        selectMirror: true,

        // Ao arrastar um evento, atualizar no backend
        eventDrop: (info: any) => {
            const event = info.event;
            const id = event.id;

            const format = (d: Date | null) => d ? formatLocal(d) : null;
            const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
            const formData = new FormData();
            formData.append('_method', 'PUT');
            formData.append('_token', csrf);
            formData.append('start_time', format(event.start) ?? '');
            formData.append('end_time', format(event.end) ?? '');

            fetch(`/classes/${id}`, {
                method: 'POST', // usando POST + _method
                credentials: 'same-origin',
                body: formData,
            }).then((res) => {
                if (res.ok) {
                    // mantém evento
                } else {
                    info.revert();
                }
            }).catch(() => info.revert());
        },
        // **** NOVO: impedir que o redimensionamento ultrapasse 1 hora ****
        eventResize: (info: any) => {
            const event = info.event;
            const start = event.start;
            const end = event.end;

            // Se por algum motivo não houver datas válidas, reverte
            if (!start || !end) {
                info.revert();
                return;
            }

            // Calcula duração em horas
            const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            if (durationHours > 1) {
                // Duração maior que 1h não é permitida
                info.revert();
                return;
            }

            // Caso duração válida (<=1h), envia atualização ao backend
            const format = (d: Date | null) => d ? formatLocal(d) : null;
            const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
            const formData = new FormData();
            formData.append('_method', 'PUT');
            formData.append('_token', csrf);
            formData.append('start_time', format(start) ?? '');
            formData.append('end_time', format(end) ?? '');

            fetch(`/classes/${event.id}`, {
                method: 'POST',
                credentials: 'same-origin',
                body: formData,
            }).then((res) => {
                if (!res.ok) {
                    info.revert();
                }
            }).catch(() => info.revert());
        },
        eventContent: (arg: any) => {
            const { enrolled_count, max_students } = arg.event.extendedProps;
            const html = `
                <div class="flex flex-col items-center justify-center w-full h-full p-1 text-xs text-center overflow-hidden">
                    <div class="font-semibold">${arg.event.title}</div>
                    <div>Alunos: ${enrolled_count}/${max_students}</div>
                    <div class="underline">Ver mais</div>
                </div>
            `;
            return { html };
        },
    };

    // Função para buscar eventos
    const fetchEvents = async (start: Date, end: Date, successCallback: any, failureCallback: any) => {
        try {
            const params = new URLSearchParams({
                start: start.toISOString(),
                end: end.toISOString(),
            });

            if (selectedInstructor && selectedInstructor !== 'all') {
                params.append('instructor_id', selectedInstructor);
            }

            const response = await fetch(`/api/classes?${params}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
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
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="Agenda - Calendário" />
            
            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight">Calendário de Aulas</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Visualize e gerencie as aulas agendadas
                    </p>
                </div>

                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        {/* Ações */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button variant="outline" asChild size="sm">
                                    <Link href="/classes">
                                        <List className="h-4 w-4 mr-2" />
                                        Ver Listagem
                                    </Link>
                                </Button>
                                {can.create && (
                                    <>
                                        <Button variant="secondary" asChild size="sm">
                                            <Link href="/recurring-classes/create">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Aula Recorrente
                                            </Link>
                                        </Button>
                                        <Button asChild size="sm">
                                            <Link href="/classes/create">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Aula Avulsa
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Filtros */}
                        {can.chooseInstructor && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Filtros</h4>
                                <div className="flex items-center space-x-4">
                                    <div className="flex flex-col space-y-1">
                                        <label className="text-sm font-medium text-gray-700">
                                            Instrutor
                                        </label>
                                        <Select
                                            value={selectedInstructor}
                                            onValueChange={setSelectedInstructor}
                                        >
                                            <SelectTrigger className="w-full sm:w-48">
                                                <SelectValue placeholder="Todos os instrutores" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos</SelectItem>
                                                {instructors.map((instructor) => (
                                                    <SelectItem key={instructor.id} value={instructor.id.toString()}>
                                                        {instructor.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Calendário */}
                        <div className="mb-6 calendar-wrapper">
                            <FullCalendar
                                ref={calendarRef}
                                {...calendarOptions}
                            />
                        </div>

                        {/* Legenda e Informações */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Legenda */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Legenda</h4>
                                <div className="grid grid-cols-1 gap-3 text-sm mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                                        <span>Aulas Agendadas</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                                        <span>Aulas Concluídas</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                                        <span>Aulas Canceladas</span>
                                    </div>
                                </div>
                            </div>

                            {/* Informações */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Informações</h4>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <div className="flex items-start gap-2">
                                        <div className="w-1 h-1 bg-current rounded-full mt-2"></div>
                                        <span>Clique em uma aula para ver detalhes</span>
                                    </div>
                                    {can.create && (
                                        <div className="flex items-start gap-2">
                                            <div className="w-1 h-1 bg-current rounded-full mt-2"></div>
                                            <span>Selecione um horário para criar nova aula</span>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-2">
                                        <div className="w-1 h-1 bg-current rounded-full mt-2"></div>
                                        <span>Funcionamento: Seg-Sex, 07:00 às 21:00</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-1 h-1 bg-current rounded-full mt-2"></div>
                                        <span>Arraste eventos para reagendar</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 