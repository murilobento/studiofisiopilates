import React, { useState } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { DataTable } from "@/components/ui/data-table";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
// ...existing code...
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
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
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger 
} from '@/components/ui/dialog';
import { 
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger 
} from '@/components/ui/sheet';
import { 
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger 
} from '@/components/ui/collapsible';
import {
  Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Settings, Activity, Users, BarChart3, ChevronDown, ChevronUp, Info, CheckCircle, XCircle, AlertCircle, Download, Upload, RefreshCw, Star, Clock, SlidersHorizontal, DollarSign, Tag, Github, ExternalLink, Copy, AlignLeft, AlignCenter, AlignRight, Navigation, Check, X
} from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Calendar } from '@/components/ui/calendar';
import { 
    Popover,
    PopoverContent,
    PopoverTrigger 
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { 
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger 
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    ToggleGroup, 
    ToggleGroupItem 
} from '@/components/ui/toggle-group';
import { Toggle } from '@/components/ui/toggle';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger 
} from '@/components/ui/navigation-menu';
import { 
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { PageProps, BreadcrumbItem as BreadcrumbType } from '@/types';
import { ColumnDef, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';

// Tipos mockados para o CRUD
interface CrudItem {
    id: number;
    name: string;
    email: string;
    status: 'active' | 'inactive' | 'pending';
    role: 'admin' | 'user' | 'moderator';
    created_at: string;
    updated_at: string;
    score: number;
    category: string;
    description: string;
    price: number;
    is_featured: boolean;
    tags: string[];
    image_url?: string;
    phone?: string;
    address?: string;
    birth_date?: string;
    permissions: string[];
    last_login?: string;
}

interface CrudIndexProps extends PageProps {
    // Dados mockados
}

const breadcrumbs: BreadcrumbType[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'CRUD Modelo',
        href: '/crud-model',
    },
];

// Dados mockados para demonstração
const mockData: CrudItem[] = [
    {
        id: 1,
        name: 'João Silva',
        email: 'joao@example.com',
        status: 'active',
        role: 'admin',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-20T14:45:00Z',
        score: 85,
        category: 'Premium',
        description: 'Usuário administrador com acesso completo ao sistema',
        price: 99.99,
        is_featured: true,
        tags: ['admin', 'premium', 'featured'],
        image_url: 'https://via.placeholder.com/150',
        phone: '(11) 99999-9999',
        address: 'Rua das Flores, 123',
        birth_date: '1990-05-15',
        permissions: ['read', 'write', 'delete', 'manage'],
        last_login: '2024-01-20T09:15:00Z'
    },
    {
        id: 2,
        name: 'Maria Santos',
        email: 'maria@example.com',
        status: 'inactive',
        role: 'user',
        created_at: '2024-01-10T08:20:00Z',
        updated_at: '2024-01-18T16:30:00Z',
        score: 72,
        category: 'Standard',
        description: 'Usuário padrão com acesso limitado',
        price: 49.99,
        is_featured: false,
        tags: ['user', 'standard'],
        phone: '(11) 88888-8888',
        address: 'Avenida Central, 456',
        birth_date: '1985-08-22',
        permissions: ['read', 'write'],
        last_login: '2024-01-18T15:45:00Z'
    },
    {
        id: 3,
        name: 'Pedro Oliveira',
        email: 'pedro@example.com',
        status: 'pending',
        role: 'moderator',
        created_at: '2024-01-12T12:00:00Z',
        updated_at: '2024-01-19T11:20:00Z',
        score: 91,
        category: 'Premium',
        description: 'Moderador com permissões especiais',
        price: 79.99,
        is_featured: true,
        tags: ['moderator', 'premium', 'pending'],
        phone: '(11) 77777-7777',
        address: 'Rua dos Jardins, 789',
        birth_date: '1992-12-03',
        permissions: ['read', 'write', 'moderate'],
        last_login: '2024-01-19T10:30:00Z'
    }
];

// Colunas da tabela
const columns: ColumnDef<CrudItem>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => <div className="font-medium">{row.getValue('id')}</div>,
    },
    {
        accessorKey: 'name',
        header: 'Nome',
        cell: ({ row }) => (
            <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={row.original.image_url} />
                    <AvatarFallback>{row.original.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-medium">{row.getValue('name')}</div>
                    <div className="text-sm text-muted-foreground">{row.original.email}</div>
                </div>
            </div>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            const variants = {
                active: 'default',
                inactive: 'destructive',
                pending: 'secondary'
            } as const;
            
            const labels = {
                active: 'Ativo',
                inactive: 'Inativo',
                pending: 'Pendente'
            } as const;
            
            return (
                <Badge variant={variants[status as keyof typeof variants]}>
                    {labels[status as keyof typeof labels]}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'role',
        header: 'Função',
        cell: ({ row }) => {
            const role = row.getValue('role') as string;
            const labels = {
                admin: 'Administrador',
                user: 'Usuário',
                moderator: 'Moderador'
            } as const;
            
            return (
                <Badge variant="outline">
                    {labels[role as keyof typeof labels]}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'score',
        header: 'Pontuação',
        cell: ({ row }) => {
            const score = row.getValue('score') as number;
            return (
                <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${score}%` }}
                        />
                    </div>
                    <span className="text-sm font-medium">{score}%</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'price',
        header: 'Preço',
        cell: ({ row }) => {
            const price = row.getValue('price') as number;
            return (
                <div className="text-right font-medium">
                    R$ {price.toFixed(2)}
                </div>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const item = row.original;
            
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => console.log('View:', item.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log('Edit:', item.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log('Copy:', item.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copiar ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={() => console.log('Delete:', item.id)}
                            className="text-red-600"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

const Index: React.FC<CrudIndexProps> = ({ auth }) => {
    const [data, setData] = useState<CrudItem[]>(mockData);
    const [globalFilter, setGlobalFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [showSheet, setShowSheet] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedDateTime, setSelectedDateTime] = useState<Date>();
    const [textareaValue, setTextareaValue] = useState('');
    const [switchValue, setSwitchValue] = useState(false);
    const [checkboxValue, setCheckboxValue] = useState(false);
    const [toggleValue, setToggleValue] = useState(false);
    const [toggleGroupValue, setToggleGroupValue] = useState('');
    const [selectValue, setSelectValue] = useState('');

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: 'includesString',
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    // Estatísticas calculadas
    const totalItems = data.length;
    const activeItems = data.filter(item => item.status === 'active').length;
    const inactiveItems = data.filter(item => item.status === 'inactive').length;
    const pendingItems = data.filter(item => item.status === 'pending').length;
    const avgScore = Math.round(data.reduce((acc, item) => acc + item.score, 0) / data.length);
    const totalRevenue = data.reduce((acc, item) => acc + item.price, 0);

    const handleBulkAction = (action: string) => {
        console.log(`Ação em lote: ${action} nos itens:`, selectedItems);
        setSelectedItems([]);
    };

    const handleRefresh = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            console.log('Dados atualizados!');
        }, 1000);
    };

    const handleExport = () => {
        console.log('Exportando dados...');
    };

    const handleImport = () => {
        console.log('Importando dados...');
    };

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="CRUD Modelo - Todos os Componentes" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">CRUD Modelo Completo</h1>
                        <p className="text-muted-foreground">
                            Demonstração de todos os componentes do shadcn/ui disponíveis
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Atualizar dados</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        
                        <Button variant="outline" size="sm" onClick={handleExport}>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        
                        <Button variant="outline" size="sm" onClick={handleImport}>
                            <Upload className="h-4 w-4 mr-2" />
                            Importar
                        </Button>
                        
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Item
                        </Button>
                    </div>
                </div>

                {/* Alertas de Demonstração */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            Este é um alerta informativo para demonstração.
                        </AlertDescription>
                    </Alert>
                    
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            Operação realizada com sucesso!
                        </AlertDescription>
                    </Alert>
                    
                    <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                            Atenção: Esta é uma demonstração.
                        </AlertDescription>
                    </Alert>
                    
                    <Alert className="border-red-200 bg-red-50">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            Erro: Este é um alerta de erro.
                        </AlertDescription>
                    </Alert>
                </div>

                {/* Cards de Estatísticas */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalItems}</div>
                            <p className="text-xs text-muted-foreground">
                                +10% em relação ao mês anterior
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Itens Ativos</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{activeItems}</div>
                            <p className="text-xs text-muted-foreground">
                                {Math.round((activeItems / totalItems) * 100)}% do total
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Itens Inativos</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{inactiveItems}</div>
                            <p className="text-xs text-muted-foreground">
                                {Math.round((inactiveItems / totalItems) * 100)}% do total
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{pendingItems}</div>
                            <p className="text-xs text-muted-foreground">
                                Aguardando aprovação
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pontuação Média</CardTitle>
                            <BarChart3 className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{avgScore}%</div>
                            <p className="text-xs text-muted-foreground">
                                +5% em relação ao mês anterior
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                            <DollarSign className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">R$ {totalRevenue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                                +15% em relação ao mês anterior
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Demonstração de Componentes */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Componentes de Entrada */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Settings className="h-4 w-4 mr-2" />
                                Componentes de Entrada
                            </CardTitle>
                            <CardDescription>
                                Demonstração de inputs, selects, switches e outros componentes
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="demo-input">Input de Texto</Label>
                                    <Input id="demo-input" placeholder="Digite algo..." />
                                </div>
                                
                                <div>
                                    <Label htmlFor="demo-select">Select</Label>
                                    <Select value={selectValue} onValueChange={setSelectValue}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma opção" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="option1">Opção 1</SelectItem>
                                            <SelectItem value="option2">Opção 2</SelectItem>
                                            <SelectItem value="option3">Opção 3</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div>
                                    <Label htmlFor="demo-date">Date Picker</Label>
                                    <DatePicker value={selectedDate} onChange={setSelectedDate} />
                                </div>
                                
                                <div>
                                    <Label htmlFor="demo-datetime">DateTime Picker</Label>
                                    <DateTimePicker value={selectedDateTime} onChange={setSelectedDateTime} />
                                </div>
                            </div>
                            
                            <div>
                                <Label htmlFor="demo-textarea">Textarea</Label>
                                <Textarea 
                                    id="demo-textarea" 
                                    placeholder="Digite uma mensagem mais longa..." 
                                    value={textareaValue}
                                    onChange={(e) => setTextareaValue(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Switch 
                                        id="demo-switch" 
                                        checked={switchValue} 
                                        onCheckedChange={setSwitchValue} 
                                    />
                                    <Label htmlFor="demo-switch">Switch</Label>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="demo-checkbox" 
                                        checked={checkboxValue} 
                                        onCheckedChange={(checked) => setCheckboxValue(checked === true)} 
                                    />
                                    <Label htmlFor="demo-checkbox">Checkbox</Label>
                                </div>
                                
                                <Toggle 
                                    pressed={toggleValue} 
                                    onPressedChange={setToggleValue}
                                    aria-label="Toggle demo"
                                >
                                    <Star className="h-4 w-4" />
                                </Toggle>
                            </div>
                            
                            <div>
                                <Label>Toggle Group</Label>
                                <ToggleGroup type="single" value={toggleGroupValue} onValueChange={setToggleGroupValue}>
                                    <ToggleGroupItem value="left">
                                        <AlignLeft className="h-4 w-4" />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="center">
                                        <AlignCenter className="h-4 w-4" />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="right">
                                        <AlignRight className="h-4 w-4" />
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Componentes de Navegação e Overlay */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Navigation className="h-4 w-4 mr-2" />
                                Componentes de Navegação e Overlay
                            </CardTitle>
                            <CardDescription>
                                Demonstração de dialogs, sheets, popovers e outros overlays
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">Abrir Dialog</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Exemplo de Dialog</DialogTitle>
                                            <DialogDescription>
                                                Este é um exemplo de dialog modal.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <p>Conteúdo do dialog aqui.</p>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                
                                <Sheet open={showSheet} onOpenChange={setShowSheet}>
                                    <SheetTrigger asChild>
                                        <Button variant="outline">Abrir Sheet</Button>
                                    </SheetTrigger>
                                    <SheetContent>
                                        <SheetHeader>
                                            <SheetTitle>Exemplo de Sheet</SheetTitle>
                                            <SheetDescription>
                                                Este é um exemplo de sheet lateral.
                                            </SheetDescription>
                                        </SheetHeader>
                                        <div className="py-4">
                                            <p>Conteúdo do sheet aqui.</p>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                                
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline">Abrir Popover</Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <div className="grid gap-4">
                                            <div className="space-y-2">
                                                <h4 className="font-medium leading-none">Popover</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Este é um exemplo de popover.
                                                </p>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline">Alert Dialog</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Confirmar Ação</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta ação não pode ser desfeita. Tem certeza?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction>Confirmar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            
                            <Collapsible open={isCollapsed} onOpenChange={setIsCollapsed}>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" className="w-full justify-between">
                                        Seção Colapsível
                                        {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-2">
                                    <div className="rounded-md border px-4 py-3 text-sm">
                                        Conteúdo da seção colapsível 1
                                    </div>
                                    <div className="rounded-md border px-4 py-3 text-sm">
                                        Conteúdo da seção colapsível 2
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                            
                            <div className="flex space-x-2">
                                <Avatar>
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <Avatar>
                                    <AvatarImage src="https://github.com/vercel.png" />
                                    <AvatarFallback>VC</AvatarFallback>
                                </Avatar>
                                <Avatar>
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Skeleton Loading Demo */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Activity className="h-4 w-4 mr-2" />
                            Skeleton Loading Demo
                        </CardTitle>
                        <CardDescription>
                            Demonstração de skeletons para loading states
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Filtros Avançados */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center">
                                <Filter className="h-4 w-4 mr-2" />
                                Filtros Avançados
                            </span>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <SlidersHorizontal className="h-4 w-4 mr-2" />
                                {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                            </Button>
                        </CardTitle>
                        <CardDescription>
                            Filtre e pesquise os dados da tabela
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Pesquisar em todos os campos..."
                                        value={globalFilter ?? ""}
                                        onChange={(event) => setGlobalFilter(event.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button variant="outline" size="sm">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filtros
                                </Button>
                            </div>
                            
                            {showFilters && (
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <Label htmlFor="status-filter">Status</Label>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Todos os status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos os status</SelectItem>
                                                <SelectItem value="active">Ativo</SelectItem>
                                                <SelectItem value="inactive">Inativo</SelectItem>
                                                <SelectItem value="pending">Pendente</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="role-filter">Função</Label>
                                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Todas as funções" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas as funções</SelectItem>
                                                <SelectItem value="admin">Administrador</SelectItem>
                                                <SelectItem value="user">Usuário</SelectItem>
                                                <SelectItem value="moderator">Moderador</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="date-filter">Data</Label>
                                        <DatePicker value={selectedDate} onChange={setSelectedDate} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Tabela Principal */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Dados da Tabela</span>
                            <div className="flex items-center space-x-2">
                                {selectedItems.length > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="secondary">
                                            {selectedItems.length} selecionado(s)
                                        </Badge>
                                        <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')}>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Excluir Selecionados
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardTitle>
                        <CardDescription>
                            Tabela demonstrando todos os dados com paginação e ordenação
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <DataTable columns={columns} data={data} table={table} />
                        </div>
                        
                        {/* Paginação */}
                        <div className="flex items-center justify-between space-x-2 py-4">
                            <div className="flex-1 text-sm text-muted-foreground">
                                Mostrando {table.getRowModel().rows.length} de {data.length} resultado(s)
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    Próximo
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Demonstração de Breadcrumbs */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Navigation className="h-4 w-4 mr-2" />
                            Demonstração de Breadcrumbs
                        </CardTitle>
                        <CardDescription>
                            Exemplo de navegação estrutural
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/crud-model">CRUD Modelo</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Demonstração</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </CardContent>
                </Card>

                {/* Demonstração de Badges e Tags */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Tag className="h-4 w-4 mr-2" />
                            Badges e Tags
                        </CardTitle>
                        <CardDescription>
                            Diferentes variações de badges e tags
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Badge>Default</Badge>
                                <Badge variant="secondary">Secondary</Badge>
                                <Badge variant="destructive">Destructive</Badge>
                                <Badge variant="outline">Outline</Badge>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                <Badge className="bg-blue-500">Personalizado</Badge>
                                <Badge className="bg-green-500">Sucesso</Badge>
                                <Badge className="bg-yellow-500">Alerta</Badge>
                                <Badge className="bg-purple-500">Info</Badge>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="border-blue-300 text-blue-600">
                                    <Star className="h-3 w-3 mr-1" />
                                    Destacado
                                </Badge>
                                <Badge variant="outline" className="border-green-300 text-green-600">
                                    <Check className="h-3 w-3 mr-1" />
                                    Aprovado
                                </Badge>
                                <Badge variant="outline" className="border-red-300 text-red-600">
                                    <X className="h-3 w-3 mr-1" />
                                    Rejeitado
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Separador */}
                <div className="flex items-center my-4">
                    <Separator className="flex-1" />
                    <span className="px-4 text-sm text-muted-foreground">Fim da demonstração</span>
                    <Separator className="flex-1" />
                </div>

                {/* Footer da demonstração */}
                <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-semibold">CRUD Modelo Completo</h3>
                            <p className="text-sm text-muted-foreground">
                                Esta página demonstra todos os componentes do shadcn/ui disponíveis no projeto.
                                Use como referência para criar páginas consistentes e funcionais.
                            </p>
                            <div className="flex justify-center space-x-2 mt-4">
                                <Button variant="outline" size="sm">
                                    <Github className="h-4 w-4 mr-2" />
                                    Código Fonte
                                </Button>
                                <Button variant="outline" size="sm">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Documentação
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
};

export default Index; 