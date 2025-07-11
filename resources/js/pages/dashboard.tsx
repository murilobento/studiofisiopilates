import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Calendar, TrendingUp, MapPin, BookOpen } from 'lucide-react';
import { Link } from '@inertiajs/react';

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                {/* Cards de Estatísticas */}
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.totalStudents}</div>
                            <p className="text-xs text-muted-foreground">
                                Alunos cadastrados
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Planos</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.totalPlans}</div>
                            <p className="text-xs text-muted-foreground">
                                Planos disponíveis
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                            <p className="text-xs text-muted-foreground">
                                Soma dos preços personalizados
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Receita Média</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.averageRevenuePerStudent)}</div>
                            <p className="text-xs text-muted-foreground">
                                Por aluno
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Gráficos e Informações */}
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                    {/* Alunos por Plano */}
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Alunos por Plano</CardTitle>
                            <CardDescription>
                                Distribuição de alunos por tipo de plano
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 sm:space-y-4">
                                {studentsByPlan.map((plan, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                                            <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
                                            <span className="text-sm font-medium truncate">{plan.description}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 flex-shrink-0">
                                            <div className="w-16 sm:w-20 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-500 h-2 rounded-full" 
                                                    style={{ 
                                                        width: `${(plan.total / Math.max(...studentsByPlan.map(p => p.total))) * 100}%` 
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-muted-foreground w-6 sm:w-8 text-right">
                                                {plan.total}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alunos por Cidade */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Top 5 Cidades</CardTitle>
                            <CardDescription>
                                Alunos por cidade
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 sm:space-y-4">
                                {studentsByCity.map((city, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            <span className="text-sm font-medium truncate">{city.city}</span>
                                        </div>
                                        <Badge variant="secondary" className="flex-shrink-0">{city.total}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Planos Populares e Alunos Recentes */}
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                    {/* Planos Mais Populares */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Planos Mais Populares</CardTitle>
                            <CardDescription>
                                Planos com mais alunos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 sm:space-y-4">
                                {popularPlans.map((plan, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium truncate">{plan.description}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatCurrency(plan.price)}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-2">
                                            <p className="font-bold">{plan.student_count}</p>
                                            <p className="text-xs text-muted-foreground">alunos</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alunos Recentes */}
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Alunos Recentes</CardTitle>
                            <CardDescription>
                                Últimos alunos cadastrados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 sm:space-y-4">
                                {recentStudents.map((student) => (
                                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-medium text-blue-600">
                                                    {student.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium truncate">{student.name}</p>
                                                <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-2">
                                            <Badge variant="outline" className="mb-1">{student.plan.description}</Badge>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(student.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <Link 
                                    href={route('students.index')}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Ver todos os alunos →
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Ações Rápidas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ações Rápidas</CardTitle>
                        <CardDescription>
                            Acesse rapidamente as principais funcionalidades
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            <Link href={route('students.create')}>
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex items-center space-x-3">
                                            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium">Cadastrar Aluno</p>
                                                <p className="text-sm text-muted-foreground">Adicionar novo aluno</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            {isAdmin && (
                                <Link href={route('plans.create')}>
                                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                        <CardContent className="p-4 sm:p-6">
                                            <div className="flex items-center space-x-3">
                                                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium">Criar Plano</p>
                                                    <p className="text-sm text-muted-foreground">Adicionar novo plano</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )}

                            <Link href={route('students.index')}>
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex items-center space-x-3">
                                            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium">Gerenciar Alunos</p>
                                                <p className="text-sm text-muted-foreground">Ver e editar alunos</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
