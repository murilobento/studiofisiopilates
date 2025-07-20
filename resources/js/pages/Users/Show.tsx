import React from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Edit,
    Mail,
    Phone,
    CreditCard,
    Percent,
    Users,
    Calendar,
    ArrowLeft,
    User,
    GraduationCap,
    Clock,
    UserCheck,
    Activity,
    TrendingUp,
    BookOpen
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Student {
    id: number;
    name: string;
    email: string;
    plan: {
        id: number;
        name: string;
        price: number;
    } | null;
}

interface ClassSession {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    max_students: number;
    students_count: number;
}

interface UserDetail {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    cpf: string | null;
    commission_rate: number | null;
    is_active: boolean;
    created_at: string;
    students: Student[];
    classes: ClassSession[];
}

interface UserShowProps extends PageProps {
    user: UserDetail;
}

const Show: React.FC<UserShowProps> = ({ auth, user }) => {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Usuários',
            href: '/users',
        },
        {
            title: user.name,
            href: `/users/${user.id}`,
        },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={`Usuário: ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header moderno */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <Badge
                                    variant={user.is_active ? "default" : "secondary"}
                                    className="w-fit"
                                >
                                    {user.is_active ? 'Ativo' : 'Inativo'}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    Membro desde {formatDate(user.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barra de ações */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Activity className="h-4 w-4" />
                                <span>Perfil do Instrutor</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" asChild>
                                    <Link href="/users">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Voltar
                                    </Link>
                                </Button>
                                <Button asChild>
                                    <Link href={`/users/${user.id}/edit`}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                    {/* Informações Pessoais */}
                    <div className="xl:col-span-2">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center text-base sm:text-lg">
                                    <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                    Informações Pessoais
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 sm:space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                        <div className="flex items-center mt-1">
                                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-900">{user.email}</span>
                                        </div>
                                    </div>

                                    {user.phone && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Telefone</label>
                                            <div className="flex items-center mt-1">
                                                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900">{user.phone}</span>
                                            </div>
                                        </div>
                                    )}

                                    {user.cpf && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">CPF</label>
                                            <div className="flex items-center mt-1">
                                                <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900">{user.cpf}</span>
                                            </div>
                                        </div>
                                    )}

                                    {user.commission_rate && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Taxa de Comissão</label>
                                            <div className="flex items-center mt-1">
                                                <Percent className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900">{user.commission_rate}%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-2 xl:grid-cols-1 gap-3 sm:gap-4 xl:gap-6">
                        <Card>
                            <CardHeader className="pb-2 sm:pb-3">
                                <CardTitle className="flex items-center text-sm sm:text-base">
                                    <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                    Alunos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                                    {user.students.length}
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                    Total de alunos
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2 sm:pb-3">
                                <CardTitle className="flex items-center text-sm sm:text-base">
                                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                    Aulas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-2xl sm:text-3xl font-bold text-green-600">
                                    {user.classes.length}
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                    Aulas recentes
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Alunos do Instrutor */}
                {user.students.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base sm:text-lg">Alunos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="min-w-[120px]">Nome</TableHead>
                                                <TableHead className="min-w-[180px] hidden sm:table-cell">Email</TableHead>
                                                <TableHead className="min-w-[100px]">Plano</TableHead>
                                                <TableHead className="min-w-[80px] text-right">Valor</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {user.students.map((student) => (
                                                <TableRow key={student.id}>
                                                    <TableCell className="font-medium">
                                                        <div>
                                                            <div className="font-medium">{student.name}</div>
                                                            <div className="text-xs text-gray-500 sm:hidden">
                                                                {student.email}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden sm:table-cell">{student.email}</TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">
                                                            {student.plan ? student.plan.name : '-'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {student.plan ? formatCurrency(student.plan.price) : '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Aulas Recentes */}
                {user.classes.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center text-base sm:text-lg">
                                <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                Aulas Recentes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="min-w-[140px]">Nome da Aula</TableHead>
                                                <TableHead className="min-w-[150px] hidden md:table-cell">Data/Hora</TableHead>
                                                <TableHead className="min-w-[80px] hidden lg:table-cell">Duração</TableHead>
                                                <TableHead className="min-w-[120px]">Ocupação</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {user.classes.map((classSession) => (
                                                <TableRow key={classSession.id}>
                                                    <TableCell className="font-medium">
                                                        <div>
                                                            <div className="font-medium text-sm">{classSession.name}</div>
                                                            <div className="text-xs text-gray-500 md:hidden">
                                                                {formatDateTime(classSession.start_time)}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell text-sm">
                                                        {formatDateTime(classSession.start_time)}
                                                    </TableCell>
                                                    <TableCell className="hidden lg:table-cell text-sm">
                                                        {new Date(classSession.end_time).getTime() - new Date(classSession.start_time).getTime() > 0
                                                            ? `${Math.floor((new Date(classSession.end_time).getTime() - new Date(classSession.start_time).getTime()) / (1000 * 60))} min`
                                                            : '-'
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                            <span className="text-xs sm:text-sm font-medium">
                                                                {classSession.students_count}/{classSession.max_students}
                                                            </span>
                                                            <div className="w-full sm:w-16 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                                                    style={{
                                                                        width: `${(classSession.students_count / classSession.max_students) * 100}%`
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Estado vazio - sem alunos e aulas */}
                {user.students.length === 0 && user.classes.length === 0 && (
                    <Card>
                        <CardContent className="py-8 sm:py-12">
                            <div className="text-center px-4">
                                <GraduationCap className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
                                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                                    Nenhuma atividade registrada
                                </h3>
                                <p className="text-sm sm:text-base text-gray-500">
                                    Este instrutor ainda não possui alunos ou aulas cadastradas.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
};

export default Show; 