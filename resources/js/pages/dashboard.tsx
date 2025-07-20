import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Users,
    DollarSign,
    Calendar,
    TrendingUp,
    MapPin,
    BookOpen,
    Activity,
    Clock,
    UserPlus,
    CalendarPlus,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Zap
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    stats: {
        totalStudents: number;
        totalPlans: number;
        totalRevenue: number;
        averageRevenuePerStudent: number;
    };
    studentsByPlan: Array<{
        description: string;
        total: number;
    }>;
    studentsByCity: Array<{
        city: string;
        total: number;
    }>;
    studentsByMonth: Array<{
        month: string;
        total: number;
    }>;
    popularPlans: Array<{
        description: string;
        price: number;
        student_count: number;
    }>;
    recentStudents: Array<{
        id: number;
        name: string;
        email: string;
        created_at: string;
        plan: {
            description: string;
        };
    }>;
}

export default function Dashboard({
    stats,
    studentsByPlan,
    studentsByCity,
    studentsByMonth,
    popularPlans,
    recentStudents
}: DashboardProps) {
    const { props } = usePage<any>();
    const user = props.auth?.user;
    const isAdmin = user?.role === 'admin';

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header com saudação */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {getGreeting()}, {user?.name}! 👋
                    </h1>
                    <p className="text-muted-foreground">
                        Aqui está um resumo do seu estúdio hoje
                    </p>
                </div>

                {/* Cards principais - design moderno */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                        Alunos Ativos
                                    </p>
                                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                                        {stats.totalStudents}
                                    </p>
                                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                                        Total cadastrados
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                        Receita Mensal
                                    </p>
                                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                                        {formatCurrency(stats.totalRevenue)}
                                    </p>
                                    <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1 flex items-center gap-1">
                                        <ArrowUpRight className="h-3 w-3" />
                                        Receita total
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                        Planos Ativos
                                    </p>
                                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                                        {stats.totalPlans}
                                    </p>
                                    <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                                        Opções disponíveis
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                        Ticket Médio
                                    </p>
                                    <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                                        {formatCurrency(stats.averageRevenuePerStudent)}
                                    </p>
                                    <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">
                                        Por aluno
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Seção de análises */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                    {/* Distribuição por Planos */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Distribuição por Planos</CardTitle>
                                    <CardDescription>
                                        Como seus alunos estão distribuídos
                                    </CardDescription>
                                </div>
                                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {studentsByPlan.map((plan, index) => {
                                    const maxValue = Math.max(...studentsByPlan.map(p => p.total));
                                    const percentage = maxValue > 0 ? (plan.total / maxValue) * 100 : 0;
                                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];

                                    return (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                                                    <span className="font-medium">{plan.description}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-muted-foreground">{plan.total} alunos</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ({Math.round((plan.total / stats.totalStudents) * 100) || 0}%)
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-500 ${colors[index % colors.length]}`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Localização dos Alunos */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Principais Cidades</CardTitle>
                                    <CardDescription>
                                        Onde seus alunos estão
                                    </CardDescription>
                                </div>
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {studentsByCity.map((city, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-xs font-bold text-blue-600">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <span className="font-medium">{city.city}</span>
                                        </div>
                                        <Badge variant="secondary" className="font-semibold">
                                            {city.total}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Planos e Alunos Recentes */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {/* Planos Mais Populares */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Planos Mais Populares</CardTitle>
                                    <CardDescription>
                                        Seus planos com melhor performance
                                    </CardDescription>
                                </div>
                                <Activity className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {popularPlans.map((plan, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-semibold">{plan.description}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatCurrency(plan.price)}/mês
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-blue-600">{plan.student_count}</p>
                                            <p className="text-xs text-muted-foreground">alunos</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alunos Recentes */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Novos Alunos</CardTitle>
                                    <CardDescription>
                                        Últimas matrículas realizadas
                                    </CardDescription>
                                </div>
                                <UserPlus className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentStudents.map((student) => (
                                    <div key={student.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                                            <span className="text-white font-semibold">
                                                {student.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate">{student.name}</p>
                                            <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {student.plan.description}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(student.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t">
                                <Link
                                    href="/students"
                                    className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    Ver todos os alunos
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Ações Rápidas */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                                <CardDescription>
                                    Acesse rapidamente as principais funcionalidades
                                </CardDescription>
                            </div>
                            <Zap className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                            <Link href="/students/create">
                                <div className="group p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 cursor-pointer border border-blue-200/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <UserPlus className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-blue-900">Novo Aluno</p>
                                            <p className="text-sm text-blue-600">Cadastrar matrícula</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/calendar">
                                <div className="group p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-200 cursor-pointer border border-green-200/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Calendar className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-green-900">Agenda</p>
                                            <p className="text-sm text-green-600">Ver calendário</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/classes/create">
                                <div className="group p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 cursor-pointer border border-purple-200/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <CalendarPlus className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-purple-900">Nova Aula</p>
                                            <p className="text-sm text-purple-600">Agendar sessão</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/students">
                                <div className="group p-6 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 transition-all duration-200 cursor-pointer border border-orange-200/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Users className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-orange-900">Alunos</p>
                                            <p className="text-sm text-orange-600">Gerenciar lista</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
