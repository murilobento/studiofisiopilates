import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Eye, Edit, Trash2, UserCheck, UserX, Search, Filter, ChevronLeft, ChevronRight, Users, Shield, GraduationCap, UserCog } from 'lucide-react';
import SuccessAlert from '@/components/success-alert';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { type BreadcrumbItem } from '@/types';

interface Instructor {
    id: number;
    name: string;
    email: string;
    commission_rate: number | null;
    is_active: boolean;
    role: string;
    created_at: string;
    students_count: number;
    classes_count: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedInstructors {
    data: Instructor[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

interface UsersIndexProps extends PageProps {
    users: PaginatedInstructors;
    filters: {
        search?: string;
        role?: string;
        status?: string;
    };
}

const Index: React.FC<UsersIndexProps> = ({ auth, users, filters }) => {
    const { props } = usePage<any>();
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get('/users', {
                search: search || undefined,
                role: roleFilter === 'all' ? undefined : roleFilter,
                status: statusFilter === 'all' ? undefined : statusFilter,
            }, {
                preserveState: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, roleFilter, statusFilter]);
    
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Usuários',
            href: '/users',
        },
    ];

    const handleDelete = (instructor: Instructor) => {
        router.delete(`/users/${instructor.id}`, {
            preserveScroll: true,
        });
    };

    const handleToggleStatus = (instructor: Instructor) => {
        const action = instructor.is_active ? 'desativar' : 'ativar';
        if (confirm(`Tem certeza que deseja ${action} o usuário ${instructor.name}?`)) {
            router.patch(`/users/${instructor.id}/toggle-status`, {}, {
                preserveScroll: true,
            });
        }
    };

    // Calcular estatísticas
    const totalUsers = users.total;
    const activeUsers = users.data.filter(user => user.is_active).length;
    const inactiveUsers = users.data.filter(user => !user.is_active).length;
    const adminUsers = users.data.filter(user => user.role === 'admin').length;
    const instructorUsers = users.data.filter(user => user.role === 'instructor').length;

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuários" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
                            <p className="text-muted-foreground">
                                Gerencie administradores e instrutores do sistema
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Link href="/users/create">
                                <Button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Novo Usuário
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Alertas */}
                    {props.flash?.success && (
                        <SuccessAlert message={props.flash.success} />
                    )}

                    {props.errors?.delete && (
                        <Alert className="border-red-200 bg-red-50">
                            <AlertDescription className="text-red-700">
                                {props.errors.delete}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Cards de Estatísticas */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalUsers}</div>
                                <p className="text-xs text-muted-foreground">
                                    Todos os usuários
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                                <UserCheck className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
                                <p className="text-xs text-muted-foreground">
                                    Contas ativas
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Usuários Inativos</CardTitle>
                                <UserX className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{inactiveUsers}</div>
                                <p className="text-xs text-muted-foreground">
                                    Contas inativas
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Administradores</CardTitle>
                                <Shield className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{adminUsers}</div>
                                <p className="text-xs text-muted-foreground">
                                    Acesso total
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Instrutores</CardTitle>
                                <GraduationCap className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600">{instructorUsers}</div>
                                <p className="text-xs text-muted-foreground">
                                    Professores
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filtros */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Filtros</CardTitle>
                            <CardDescription>
                                Filtre os usuários por nome, função ou status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="flex flex-col space-y-2">
                                    <label className="text-sm font-medium">Buscar</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por nome ou email..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex flex-col space-y-2">
                                    <label className="text-sm font-medium">Função</label>
                                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Função" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas as funções</SelectItem>
                                            <SelectItem value="admin">Administrador</SelectItem>
                                            <SelectItem value="instructor">Instrutor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos os status</SelectItem>
                                            <SelectItem value="active">Ativo</SelectItem>
                                            <SelectItem value="inactive">Inativo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabela de Usuários */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Usuários</CardTitle>
                            <CardDescription>
                                Visualize e gerencie todos os usuários do sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Função</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Alunos</TableHead>
                                            <TableHead>Aulas</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.data.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                        {user.role === 'admin' ? 'Administrador' : 'Instrutor'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={user.is_active ? 'default' : 'destructive'}>
                                                        {user.is_active ? 'Ativo' : 'Inativo'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{user.students_count}</TableCell>
                                                <TableCell>{user.classes_count}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/users/${user.id}`}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    Visualizar
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/users/${user.id}/edit`}>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Editar
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                                                                {user.is_active ? (
                                                                    <>
                                                                        <UserX className="h-4 w-4 mr-2" />
                                                                        Desativar
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UserCheck className="h-4 w-4 mr-2" />
                                                                        Ativar
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <DropdownMenuItem 
                                                                        className="text-red-600 focus:text-red-600"
                                                                        onSelect={(e) => e.preventDefault()}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                        Excluir
                                                                    </DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Tem certeza que deseja excluir o usuário {user.name}? Esta ação não pode ser desfeita.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                        <AlertDialogAction 
                                                                            onClick={() => handleDelete(user)}
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                        >
                                                                            Excluir
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Paginação */}
                            <div className="flex items-center justify-between space-x-2 py-4">
                                <div className="flex-1 text-sm text-muted-foreground">
                                    Mostrando {users.from} até {users.to} de {users.total} usuários
                                </div>
                                <div className="flex items-center space-x-2">
                                    {users.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(link.url);
                                                }
                                            }}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
            </div>
        </AuthenticatedLayout>
    );
};

export default Index; 