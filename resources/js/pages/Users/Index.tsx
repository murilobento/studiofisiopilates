import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { MoreHorizontal, Plus, Eye, Edit, Trash2, UserCheck, UserX, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
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

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuários" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Usuários do Sistema</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Gerencie administradores e instrutores
                                    </p>
                                </div>
                                <Link href="/users/create">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Novo Usuário
                                    </Button>
                                </Link>
                            </div>

                            {/* Mensagem de Sucesso */}
                            {props.flash?.success && (
                                <div className="mb-6">
                                    <SuccessAlert message={props.flash.success} />
                                </div>
                            )}

                            {/* Mensagem de Erro */}
                            {props.errors?.delete && (
                                <div className="mb-6">
                                    <Alert className="border-red-200 bg-red-50">
                                        <AlertDescription className="text-red-700">
                                            {props.errors.delete}
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            )}

                            {/* Filtros */}
                            <div className="bg-gray-50 border rounded-lg p-4 mb-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Buscar por nome ou email..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="w-full md:w-48">
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

                                    <div className="w-full md:w-48">
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos os status</SelectItem>
                                                <SelectItem value="active">Ativos</SelectItem>
                                                <SelectItem value="inactive">Inativos</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {(search || roleFilter !== 'all' || statusFilter !== 'all') && (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSearch('');
                                                setRoleFilter('all');
                                                setStatusFilter('all');
                                            }}
                                        >
                                            <Filter className="h-4 w-4 mr-2" />
                                            Limpar
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {users.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-gray-500">
                                        <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        {(search || roleFilter !== 'all' || statusFilter !== 'all') ? (
                                            <>
                                                <h3 className="text-lg font-medium mb-2">Nenhum usuário encontrado</h3>
                                                <p className="text-sm mb-6">
                                                    Nenhum usuário corresponde aos filtros aplicados. 
                                                    Tente ajustar os critérios de busca.
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSearch('');
                                                        setRoleFilter('all');
                                                        setStatusFilter('all');
                                                    }}
                                                >
                                                    <Filter className="h-4 w-4 mr-2" />
                                                    Limpar Filtros
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <h3 className="text-lg font-medium mb-2">Nenhum usuário encontrado</h3>
                                                <p className="text-sm mb-6">Comece criando o primeiro usuário do sistema.</p>
                                                <Link href="/instructors/create">
                                                    <Button>
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Criar Primeiro Usuário
                                                    </Button>
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nome</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Função</TableHead>
                                                <TableHead>Comissão</TableHead>
                                                <TableHead>Alunos</TableHead>
                                                <TableHead>Aulas</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.data.map((instructor: Instructor) => (
                                                <TableRow key={instructor.id}>
                                                    <TableCell className="font-medium">
                                                        {instructor.name}
                                                    </TableCell>
                                                    <TableCell>{instructor.email}</TableCell>
                                                    <TableCell>
                                                        <Badge 
                                                            variant={instructor.role === 'admin' ? "default" : "secondary"}
                                                        >
                                                            {instructor.role === 'admin' ? 'Administrador' : 'Instrutor'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {instructor.commission_rate 
                                                            ? `${instructor.commission_rate}%` 
                                                            : '-'
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {instructor.students_count}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {instructor.classes_count}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge 
                                                            variant={instructor.is_active ? 'secondary' : 'destructive'}
                                                            className={instructor.is_active ? 'bg-green-100 text-green-800 border-green-200' : ''}
                                                        >
                                                            {instructor.is_active ? 'Ativo' : 'Inativo'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Abrir menu</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/users/${instructor.id}`}>
                                                                        <Eye className="h-4 w-4 mr-2" />
                                                                        Visualizar
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/users/${instructor.id}/edit`}>
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                        Editar
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    onClick={() => handleToggleStatus(instructor)}
                                                                >
                                                                    {instructor.is_active ? (
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
                                                                            onSelect={(e) => e.preventDefault()}
                                                                            className="text-red-600"
                                                                        >
                                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                                            Excluir
                                                                        </DropdownMenuItem>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário{' '}
                                                                                <strong>{instructor.name}</strong> do sistema.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                            <AlertDialogAction 
                                                                                onClick={() => handleDelete(instructor)}
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
                            )}

                            {/* Paginação */}
                            {users.last_page > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <div className="text-sm text-gray-500">
                                        Mostrando {users.from} até {users.to} de {users.total} resultados
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        {users.links.map((link, index) => {
                                            if (!link.url) {
                                                return (
                                                    <span 
                                                        key={index}
                                                        className="px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            }

                                            const isActive = link.active;
                                            const isPrevious = link.label.includes('Previous') || link.label.includes('&laquo;');
                                            const isNext = link.label.includes('Next') || link.label.includes('&raquo;');

                                            return (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    preserveState
                                                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                                                        isActive
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {isPrevious ? (
                                                        <ChevronLeft className="h-4 w-4" />
                                                    ) : isNext ? (
                                                        <ChevronRight className="h-4 w-4" />
                                                    ) : (
                                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Index; 