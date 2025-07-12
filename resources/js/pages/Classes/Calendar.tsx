import React, { useRef, useState, useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, List } from 'lucide-react';
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
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Agenda</h3>
                                    <p className="text-sm text-gray-600">Visualização em calendário das aulas</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href="/classes"
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        <List className="h-4 w-4 mr-2" />
                                        Listagem
                                    </Link>
                                    {can.create && (
                                        <Link
                                            href="/classes/create"
                                            className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Nova Aula
                                        </Link>
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
                                                <SelectTrigger className="w-48">
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
                            <div className="mb-6">
                                <FullCalendar
                                    ref={calendarRef}
                                    {...calendarOptions}
                                />
                            </div>

                            {/* Legenda */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Legenda</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
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
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>• Clique em uma aula para ver detalhes</p>
                                    {can.create && <p>• Selecione um horário vazio para criar uma nova aula</p>}
                                    <p>• Horário de funcionamento: Segunda a Sexta, 07:00 às 21:00</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 