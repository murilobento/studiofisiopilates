import React, { useRef, useState, useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    Plus, 
    List, 
    Calendar as CalendarIcon, 
    Clock,
    Users,
    Filter,
    Info,
    CheckCircle,
    XCircle,
    Circle,
    MousePointer,
    Move,
    Eye
} from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { router } from '@inertiajs/react';

// Estilos do FullCalendar - v6 não requer imports de CSS separados

import { PageProps } from '@/types';
import { type BreadcrumbItem } from '@/types';

interface CalendarProps extends PageProps {
    instructors: Array<{
        id: number;
        name: string;
        calendar_color?: string;
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
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header moderno */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <CalendarIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Calendário de Aulas</h1>
                            <p className="text-muted-foreground">
                                Visualize e gerencie as aulas agendadas do estúdio
                            </p>
                        </div>
                    </div>
                </div>

                {/* Barra de ações e filtros */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            {/* Ações principais */}
                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" asChild>
                                    <Link href="/classes">
                                        <List className="h-4 w-4 mr-2" />
                                        Ver Listagem
                                    </Link>
                                </Button>
                                {can.chooseInstructor && (
                                    <Button variant="outline" asChild>
                                        <Link href="/users">
                                            <Users className="h-4 w-4 mr-2" />
                                            Gerenciar Cores
                                        </Link>
                                    </Button>
                                )}
                                {can.create && (
                                    <>
                                        <Button variant="secondary" asChild>
                                            <Link href="/recurring-classes/create">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Aula Recorrente
                                            </Link>
                                        </Button>
                                        <Button asChild>
                                            <Link href="/classes/create">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Nova Aula
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>

                            {/* Filtros */}
                            {can.chooseInstructor && (
                                <div className="flex items-center gap-3">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Instrutor:
                                        </label>
                                        <Select
                                            value={selectedInstructor}
                                            onValueChange={setSelectedInstructor}
                                        >
                                            <SelectTrigger className="w-48">
                                                <SelectValue placeholder="Todos os instrutores" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4" />
                                                        Todos os instrutores
                                                    </div>
                                                </SelectItem>
                                                {instructors.map((instructor) => (
                                                    <SelectItem key={instructor.id} value={instructor.id.toString()}>
                                                        {instructor.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Calendário principal */}
                <Card className="flex-1">
                    <CardContent className="p-6">
                        <div className="calendar-wrapper">
                            <FullCalendar
                                ref={calendarRef}
                                {...calendarOptions}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Cards de informações */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cores dos Instrutores */}
                    {can.chooseInstructor && instructors.length > 0 && (
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle className="text-lg">Instrutores</CardTitle>
                                </div>
                                <CardDescription>
                                    Cores dos instrutores no calendário
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {instructors.map((instructor) => (
                                        <div key={instructor.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-4 h-4 rounded-sm border border-gray-300"
                                                    style={{ backgroundColor: instructor.calendar_color || '#3b82f6' }}
                                                ></div>
                                                <span className="font-medium text-gray-900">{instructor.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Legenda de Status */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <Circle className="h-5 w-5 text-muted-foreground" />
                                <CardTitle className="text-lg">Status das Aulas</CardTitle>
                            </div>
                            <CardDescription>
                                Legenda dos status no calendário
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                                    <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                        <span className="font-medium text-blue-900">Aulas Agendadas</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                                    <div className="w-4 h-4 bg-green-500 rounded-sm opacity-30"></div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="font-medium text-green-900">Aulas Concluídas</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                                    <div className="w-4 h-4 bg-red-500 rounded-sm opacity-10"></div>
                                    <div className="flex items-center gap-2">
                                        <XCircle className="h-4 w-4 text-red-600" />
                                        <span className="font-medium text-red-900">Aulas Canceladas</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Guia de uso */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-muted-foreground" />
                                <CardTitle className="text-lg">Como Usar</CardTitle>
                            </div>
                            <CardDescription>
                                Dicas para navegar no calendário
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                                    <Eye className="h-4 w-4 text-gray-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Visualizar Detalhes</p>
                                        <p className="text-sm text-gray-600">Clique em uma aula para ver informações completas</p>
                                    </div>
                                </div>
                                {can.create && (
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                                        <MousePointer className="h-4 w-4 text-gray-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-gray-900">Criar Aula</p>
                                            <p className="text-sm text-gray-600">Selecione um horário vazio para agendar nova aula</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                                    <Move className="h-4 w-4 text-gray-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Reagendar</p>
                                        <p className="text-sm text-gray-600">Arraste eventos para alterar horários</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Funcionamento: Segunda a Sexta, 07:00 às 21:00</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 