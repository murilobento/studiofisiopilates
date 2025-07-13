import React, { useState } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    ToggleGroup, 
    ToggleGroupItem 
} from '@/components/ui/toggle-group';
import { Toggle } from '@/components/ui/toggle';
import { 
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
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
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger 
} from '@/components/ui/collapsible';
import InputError from '@/components/input-error';
import PrimaryButton from '@/components/primary-button';
import { 
    Save,
    ArrowLeft,
    Info,
    CheckCircle,
    AlertCircle,
    XCircle,
    Plus,
    Minus,
    Upload,
    Download,
    Eye,
    EyeOff,
    Star,
    Heart,
    Bookmark,
    Tag,
    Calendar,
    Clock,
    MapPin,
    Phone,
    Mail,
    User,
    Settings,
    Image,
    FileText,
    Link,
    Globe,
    Shield,
    Lock,
    Unlock,
    ChevronDown,
    ChevronUp,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Italic,
    Underline,
    Type,
    Palette,
    Zap,
    Target,
    Award,
    Briefcase,
    GraduationCap,
    Home,
    Building,
    Car,
    Plane,
    Camera,
    Mic,
    Video,
    Music,
    Gamepad2,
    Laptop,
    Smartphone,
    Tablet,
    Monitor,
    Printer,
    Headphones,
    Coffee,
    Pizza,
    Utensils,
    ShoppingCart,
    CreditCard,
    Banknote,
    DollarSign,
    TrendingUp,
    BarChart3,
    PieChart,
    LineChart,
    Activity,
    Zap as Lightning,
    Sun,
    Moon,
    CloudRain,
    Snowflake,
    Thermometer,
    Wind,
    Compass,
    Map,
    Navigation,
    Route,
    Flag,
    Anchor,
    Mountain,
    Tree,
    Leaf,
    Flower,
    Sprout,
    Bug,
    Bird,
    Fish,
    Rabbit,
    Dog,
    Cat,
    Turtle,
    Butterfly
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'CRUD Modelo',
        href: '/crud-model',
    },
    {
        title: 'Criar Item',
        href: '/crud-model/create',
    },
];

const Create: React.FC<PageProps> = ({ auth }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedDateTime, setSelectedDateTime] = useState<Date>();
    const [toggleGroupValue, setToggleGroupValue] = useState('');
    const [switchValue, setSwitchValue] = useState(false);
    const [checkboxValue, setCheckboxValue] = useState(false);
    const [toggleValue, setToggleValue] = useState(false);
    const [tags, setTags] = useState<string[]>(['exemplo', 'demo']);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [showDialog, setShowDialog] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        // Campos básicos
        name: '',
        email: '',
        phone: '',
        description: '',
        
        // Campos de seleção
        status: '',
        role: '',
        category: '',
        priority: '',
        
        // Campos numéricos
        price: '',
        quantity: '',
        score: '',
        percentage: '',
        
        // Campos de data
        birth_date: '',
        start_date: '',
        end_date: '',
        
        // Campos booleanos
        is_active: true,
        is_featured: false,
        is_public: true,
        send_notifications: true,
        
        // Campos de texto longo
        bio: '',
        notes: '',
        terms: '',
        
        // Campos especiais
        color: '#3b82f6',
        url: '',
        password: '',
        confirm_password: '',
        
        // Campos de endereço
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: '',
        
        // Campos de mídia
        avatar: '',
        cover_image: '',
        
        // Campos de configuração
        theme: 'light',
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        
        // Campos de permissões
        permissions: [] as string[],
        
        // Campos de metadata
        tags: [] as string[],
        metadata: {} as Record<string, any>,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('crud-model.store'), {
            onSuccess: () => {
                console.log('Item criado com sucesso!');
            },
            onError: (errors) => {
                console.error('Erro ao criar item:', errors);
            }
        });
    };

    const handleTagAdd = (newTag: string) => {
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
            setData('tags', [...tags, newTag]);
        }
    };

    const handleTagRemove = (tagToRemove: string) => {
        const newTags = tags.filter(tag => tag !== tagToRemove);
        setTags(newTags);
        setData('tags', newTags);
    };

    const handlePermissionToggle = (permission: string) => {
        const currentPermissions = data.permissions;
        const newPermissions = currentPermissions.includes(permission)
            ? currentPermissions.filter(p => p !== permission)
            : [...currentPermissions, permission];
        setData('permissions', newPermissions);
    };

    const availablePermissions = [
        { id: 'read', label: 'Leitura', icon: Eye },
        { id: 'write', label: 'Escrita', icon: FileText },
        { id: 'delete', label: 'Exclusão', icon: XCircle },
        { id: 'admin', label: 'Administração', icon: Shield },
    ];

    const imageOptions = [
        { id: 'avatar1', url: 'https://via.placeholder.com/150/3b82f6/ffffff?text=A1', label: 'Avatar 1' },
        { id: 'avatar2', url: 'https://via.placeholder.com/150/ef4444/ffffff?text=A2', label: 'Avatar 2' },
        { id: 'avatar3', url: 'https://via.placeholder.com/150/10b981/ffffff?text=A3', label: 'Avatar 3' },
        { id: 'avatar4', url: 'https://via.placeholder.com/150/f59e0b/ffffff?text=A4', label: 'Avatar 4' },
    ];

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="Criar Item - CRUD Modelo" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Criar Novo Item</h1>
                        <p className="text-muted-foreground">
                            Formulário completo demonstrando todos os componentes disponíveis
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" asChild>
                            <a href="/crud-model">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </a>
                        </Button>
                        <Button form="create-form" type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </div>

                {/* Alertas de Demonstração */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            Este formulário é apenas uma demonstração dos componentes disponíveis.
                        </AlertDescription>
                    </Alert>
                    <Alert className="border-blue-200 bg-blue-50">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                            Todos os campos são opcionais para fins de demonstração.
                        </AlertDescription>
                    </Alert>
                </div>

                <form id="create-form" onSubmit={submit} className="space-y-6">
                    {/* Informações Básicas */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="h-4 w-4 mr-2" />
                                Informações Básicas
                            </CardTitle>
                            <CardDescription>
                                Campos fundamentais para identificação do item
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Nome *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Digite o nome..."
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="email@exemplo.com"
                                        required
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div>
                                    <Label htmlFor="phone">Telefone</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="(11) 99999-9999"
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Ativo</SelectItem>
                                            <SelectItem value="inactive">Inativo</SelectItem>
                                            <SelectItem value="pending">Pendente</SelectItem>
                                            <SelectItem value="archived">Arquivado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Descreva o item..."
                                    rows={3}
                                />
                                <InputError message={errors.description} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Configurações */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Settings className="h-4 w-4 mr-2" />
                                Configurações
                            </CardTitle>
                            <CardDescription>
                                Configurações e preferências do item
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="role">Função</Label>
                                    <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a função" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Administrador</SelectItem>
                                            <SelectItem value="user">Usuário</SelectItem>
                                            <SelectItem value="moderator">Moderador</SelectItem>
                                            <SelectItem value="guest">Visitante</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.role} />
                                </div>

                                <div>
                                    <Label htmlFor="category">Categoria</Label>
                                    <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a categoria" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="premium">Premium</SelectItem>
                                            <SelectItem value="standard">Standard</SelectItem>
                                            <SelectItem value="basic">Básico</SelectItem>
                                            <SelectItem value="trial">Trial</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.category} />
                                </div>

                                <div>
                                    <Label htmlFor="priority">Prioridade</Label>
                                    <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a prioridade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="high">Alta</SelectItem>
                                            <SelectItem value="medium">Média</SelectItem>
                                            <SelectItem value="low">Baixa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.priority} />
                                </div>

                                <div>
                                    <Label htmlFor="theme">Tema</Label>
                                    <Select value={data.theme} onValueChange={(value) => setData('theme', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tema" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="light">Claro</SelectItem>
                                            <SelectItem value="dark">Escuro</SelectItem>
                                            <SelectItem value="system">Sistema</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.theme} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <Label>Alinhamento de Texto</Label>
                                    <ToggleGroup 
                                        type="single" 
                                        value={toggleGroupValue} 
                                        onValueChange={setToggleGroupValue}
                                    >
                                        <ToggleGroupItem value="left" aria-label="Alinhar à esquerda">
                                            <AlignLeft className="h-4 w-4" />
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="center" aria-label="Centralizar">
                                            <AlignCenter className="h-4 w-4" />
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="right" aria-label="Alinhar à direita">
                                            <AlignRight className="h-4 w-4" />
                                        </ToggleGroupItem>
                                    </ToggleGroup>
                                </div>

                                <div className="space-y-4">
                                    <Label>Formatação</Label>
                                    <div className="flex space-x-1">
                                        <Toggle aria-label="Negrito">
                                            <Bold className="h-4 w-4" />
                                        </Toggle>
                                        <Toggle aria-label="Itálico">
                                            <Italic className="h-4 w-4" />
                                        </Toggle>
                                        <Toggle aria-label="Sublinhado">
                                            <Underline className="h-4 w-4" />
                                        </Toggle>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                    <Label htmlFor="is_active">Ativo</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_featured"
                                        checked={data.is_featured}
                                        onCheckedChange={(checked) => setData('is_featured', checked)}
                                    />
                                    <Label htmlFor="is_featured">Destaque</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_public"
                                        checked={data.is_public}
                                        onCheckedChange={(checked) => setData('is_public', checked)}
                                    />
                                    <Label htmlFor="is_public">Público</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="send_notifications"
                                        checked={data.send_notifications}
                                        onCheckedChange={(checked) => setData('send_notifications', checked)}
                                    />
                                    <Label htmlFor="send_notifications">Notificações</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Campos Numéricos */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Valores Numéricos
                            </CardTitle>
                            <CardDescription>
                                Campos para valores, quantidades e métricas
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <Label htmlFor="price">Preço</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                    />
                                    <InputError message={errors.price} />
                                </div>

                                <div>
                                    <Label htmlFor="quantity">Quantidade</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', e.target.value)}
                                        placeholder="0"
                                        min="0"
                                    />
                                    <InputError message={errors.quantity} />
                                </div>

                                <div>
                                    <Label htmlFor="score">Pontuação</Label>
                                    <Input
                                        id="score"
                                        type="number"
                                        value={data.score}
                                        onChange={(e) => setData('score', e.target.value)}
                                        placeholder="0"
                                        min="0"
                                        max="100"
                                    />
                                    <InputError message={errors.score} />
                                </div>

                                <div>
                                    <Label htmlFor="percentage">Porcentagem</Label>
                                    <Input
                                        id="percentage"
                                        type="number"
                                        value={data.percentage}
                                        onChange={(e) => setData('percentage', e.target.value)}
                                        placeholder="0"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    <InputError message={errors.percentage} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Campos de Data */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                Datas e Horários
                            </CardTitle>
                            <CardDescription>
                                Campos para seleção de datas e horários
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <Label>Data de Nascimento</Label>
                                    <DatePicker 
                                        date={selectedDate} 
                                        onDateChange={setSelectedDate}
                                    />
                                    <InputError message={errors.birth_date} />
                                </div>

                                <div>
                                    <Label>Data de Início</Label>
                                    <DateTimePicker
                                        date={selectedDateTime}
                                        onDateChange={setSelectedDateTime}
                                    />
                                    <InputError message={errors.start_date} />
                                </div>

                                <div>
                                    <Label htmlFor="end_date">Data de Fim</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                    />
                                    <InputError message={errors.end_date} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Campos de Mídia */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Image className="h-4 w-4 mr-2" />
                                Mídia e Imagens
                            </CardTitle>
                            <CardDescription>
                                Seleção de avatares e imagens
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label>Avatar</Label>
                                <div className="grid grid-cols-4 gap-4 mt-2">
                                    {imageOptions.map((option) => (
                                        <div key={option.id} className="text-center">
                                            <Avatar 
                                                className={`h-16 w-16 mx-auto cursor-pointer border-2 ${
                                                    selectedImage === option.id 
                                                        ? 'border-primary' 
                                                        : 'border-gray-200'
                                                }`}
                                                onClick={() => setSelectedImage(option.id)}
                                            >
                                                <AvatarImage src={option.url} />
                                                <AvatarFallback>{option.label}</AvatarFallback>
                                            </Avatar>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {option.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="url">URL/Link</Label>
                                <Input
                                    id="url"
                                    type="url"
                                    value={data.url}
                                    onChange={(e) => setData('url', e.target.value)}
                                    placeholder="https://exemplo.com"
                                />
                                <InputError message={errors.url} />
                            </div>

                            <div>
                                <Label htmlFor="color">Cor</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        id="color"
                                        type="color"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        className="w-16"
                                    />
                                    <Input
                                        type="text"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        placeholder="#3b82f6"
                                        className="flex-1"
                                    />
                                </div>
                                <InputError message={errors.color} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permissões */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Shield className="h-4 w-4 mr-2" />
                                Permissões
                            </CardTitle>
                            <CardDescription>
                                Defina as permissões de acesso
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availablePermissions.map((permission) => {
                                    const Icon = permission.icon;
                                    return (
                                        <div key={permission.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={permission.id}
                                                checked={data.permissions.includes(permission.id)}
                                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                                            />
                                            <Label htmlFor={permission.id} className="flex items-center space-x-2">
                                                <Icon className="h-4 w-4" />
                                                <span>{permission.label}</span>
                                            </Label>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tags */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Tag className="h-4 w-4 mr-2" />
                                Tags
                            </CardTitle>
                            <CardDescription>
                                Adicione tags para categorizar o item
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="cursor-pointer">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleTagRemove(tag)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex space-x-2">
                                <Input
                                    placeholder="Digite uma tag..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleTagAdd(e.currentTarget.value);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => {
                                        const input = document.querySelector('input[placeholder="Digite uma tag..."]') as HTMLInputElement;
                                        if (input) {
                                            handleTagAdd(input.value);
                                            input.value = '';
                                        }
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Seção Avançada (Collapsible) */}
                    <Card>
                        <CardHeader>
                            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                                <CollapsibleTrigger asChild>
                                    <CardTitle className="flex items-center justify-between cursor-pointer">
                                        <span className="flex items-center">
                                            <Settings className="h-4 w-4 mr-2" />
                                            Configurações Avançadas
                                        </span>
                                        {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </CardTitle>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <CardDescription className="mt-2">
                                        Configurações adicionais e campos especiais
                                    </CardDescription>
                                    <CardContent className="pt-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="password">Senha</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? "text" : "password"}
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        placeholder="Digite a senha..."
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                                <InputError message={errors.password} />
                                            </div>

                                            <div>
                                                <Label htmlFor="confirm_password">Confirmar Senha</Label>
                                                <Input
                                                    id="confirm_password"
                                                    type="password"
                                                    value={data.confirm_password}
                                                    onChange={(e) => setData('confirm_password', e.target.value)}
                                                    placeholder="Confirme a senha..."
                                                />
                                                <InputError message={errors.confirm_password} />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="bio">Biografia</Label>
                                            <Textarea
                                                id="bio"
                                                value={data.bio}
                                                onChange={(e) => setData('bio', e.target.value)}
                                                placeholder="Conte mais sobre este item..."
                                                rows={4}
                                            />
                                            <InputError message={errors.bio} />
                                        </div>

                                        <div>
                                            <Label htmlFor="notes">Observações</Label>
                                            <Textarea
                                                id="notes"
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                placeholder="Observações internas..."
                                                rows={3}
                                            />
                                            <InputError message={errors.notes} />
                                        </div>
                                    </CardContent>
                                </CollapsibleContent>
                            </Collapsible>
                        </CardHeader>
                    </Card>

                    {/* Botões de Ação */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                                <div className="flex space-x-2">
                                    <Button type="submit" disabled={processing}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing ? 'Salvando...' : 'Salvar Item'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => reset()}>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Limpar
                                    </Button>
                                </div>
                                
                                <div className="flex space-x-2">
                                    <Dialog open={showDialog} onOpenChange={setShowDialog}>
                                        <DialogTrigger asChild>
                                            <Button type="button" variant="outline">
                                                <Eye className="h-4 w-4 mr-2" />
                                                Pré-visualizar
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Pré-visualização</DialogTitle>
                                                <DialogDescription>
                                                    Visualização dos dados preenchidos
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <strong>Nome:</strong> {data.name || 'Não informado'}
                                                    </div>
                                                    <div>
                                                        <strong>Email:</strong> {data.email || 'Não informado'}
                                                    </div>
                                                    <div>
                                                        <strong>Status:</strong> {data.status || 'Não informado'}
                                                    </div>
                                                    <div>
                                                        <strong>Função:</strong> {data.role || 'Não informado'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <strong>Descrição:</strong>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {data.description || 'Não informado'}
                                                    </p>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={() => setShowDialog(false)}>
                                                    Fechar
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                    
                                    <Button type="button" variant="outline" asChild>
                                        <a href="/crud-model">
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Cancelar
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
};

export default Create; 