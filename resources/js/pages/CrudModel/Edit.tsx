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
import { Switch } from '@/components/ui/switch';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
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
import InputError from '@/components/input-error';
import { 
    Save,
    ArrowLeft,
    Eye,
    Trash2,
    Edit,
    AlertCircle,
    CheckCircle,
    User,
    Settings,
    Calendar,
    Shield,
    Tag,
    X,
    Plus
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface CrudEditProps extends PageProps {
    item: {
        id: number;
        name: string;
        email: string;
        phone: string;
        status: string;
        role: string;
        description: string;
        is_active: boolean;
        is_featured: boolean;
        created_at: string;
        updated_at: string;
    };
}

const Edit: React.FC<CrudEditProps> = ({ auth, item }) => {
    const [tags, setTags] = useState<string[]>(['edição', 'exemplo']);
    const [selectedDate, setSelectedDate] = useState<Date>();

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
            title: `Editar ${item.name}`,
            href: `/crud-model/${item.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors, reset } = useForm({
        name: item.name || '',
        email: item.email || '',
        phone: item.phone || '',
        status: item.status || '',
        role: item.role || '',
        description: item.description || '',
        is_active: item.is_active || false,
        is_featured: item.is_featured || false,
        tags: [] as string[],
        notes: '',
        updated_reason: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('crud-model.update', item.id), {
            onSuccess: () => {
                console.log('Item atualizado com sucesso!');
            },
            onError: (errors) => {
                console.error('Erro ao atualizar item:', errors);
            }
        });
    };

    const handleDelete = () => {
        console.log('Excluir item:', item.id);
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

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${item.name} - CRUD Modelo`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Editar Item</h1>
                        <p className="text-muted-foreground">
                            Editando: {item.name} (ID: {item.id})
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" asChild>
                            <a href="/crud-model">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </a>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href={`/crud-model/${item.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                            </a>
                        </Button>
                        <Button form="edit-form" type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </div>

                {/* Status do Item */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Status do Item</span>
                            <div className="flex items-center space-x-2">
                                <Badge variant={item.is_active ? 'default' : 'destructive'}>
                                    {item.is_active ? 'Ativo' : 'Inativo'}
                                </Badge>
                                <Badge variant="outline">
                                    {item.role || 'Sem função'}
                                </Badge>
                            </div>
                        </CardTitle>
                        <CardDescription>
                            Criado em: {new Date(item.created_at).toLocaleDateString('pt-BR')} | 
                            Última atualização: {new Date(item.updated_at).toLocaleDateString('pt-BR')}
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Alerta de Edição */}
                <Alert className="border-blue-200 bg-blue-50">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                        Você está editando um item existente. Todas as alterações serão registradas no histórico.
                    </AlertDescription>
                </Alert>

                <form id="edit-form" onSubmit={submit} className="space-y-6">
                    {/* Informações Básicas */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="h-4 w-4 mr-2" />
                                Informações Básicas
                            </CardTitle>
                            <CardDescription>
                                Atualize as informações fundamentais do item
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
                                Atualize as configurações do item
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
                                    <Label>Data de Atualização</Label>
                                    <DatePicker 
                                        date={selectedDate} 
                                        onDateChange={setSelectedDate}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                    <Label htmlFor="is_active">Item Ativo</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_featured"
                                        checked={data.is_featured}
                                        onCheckedChange={(checked) => setData('is_featured', checked)}
                                    />
                                    <Label htmlFor="is_featured">Item em Destaque</Label>
                                </div>
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
                                Gerencie as tags do item
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

                    {/* Histórico de Alterações */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                Histórico de Alterações
                            </CardTitle>
                            <CardDescription>
                                Registre o motivo desta atualização
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="updated_reason">Motivo da Atualização</Label>
                                <Textarea
                                    id="updated_reason"
                                    value={data.updated_reason}
                                    onChange={(e) => setData('updated_reason', e.target.value)}
                                    placeholder="Descreva o motivo desta atualização..."
                                    rows={2}
                                />
                                <InputError message={errors.updated_reason} />
                            </div>

                            <div>
                                <Label htmlFor="notes">Observações Adicionais</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Observações internas sobre a edição..."
                                    rows={3}
                                />
                                <InputError message={errors.notes} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Botões de Ação */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                                <div className="flex space-x-2">
                                    <Button type="submit" disabled={processing}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing ? 'Salvando...' : 'Salvar Alterações'}
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => reset()}
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Desfazer
                                    </Button>
                                </div>
                                
                                <div className="flex space-x-2">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        asChild
                                    >
                                        <a href={`/crud-model/${item.id}`}>
                                            <Eye className="h-4 w-4 mr-2" />
                                            Visualizar
                                        </a>
                                    </Button>
                                    
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button 
                                                type="button" 
                                                variant="destructive"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Excluir
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                                                    Confirmar Exclusão
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Tem certeza que deseja excluir o item "{item.name}"? 
                                                    Esta ação não pode ser desfeita.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction 
                                                    onClick={handleDelete}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    Excluir Item
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
};

export default Edit; 