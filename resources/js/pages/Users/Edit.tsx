import React from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import CpfInput from '@/components/cpf-input';
import { Save, ArrowLeft } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    cpf: string | null;
    commission_rate: number | null;
    is_active: boolean;
    role: string;
}

interface UsersEditProps extends PageProps {
    user: User;
    roles: Record<string, string>;
}

const Edit: React.FC<UsersEditProps> = ({ auth, user, roles }) => {
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
            title: 'Editar',
            href: `/users/${user.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors, reset } = useForm<{
        name: string;
        email: string;
        phone: string;
        cpf: string;
        commission_rate: string;
        password: string;
        password_confirmation: string;
        is_active: boolean;
        role: string;
    }>({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        cpf: user.cpf || '',
        commission_rate: user.commission_rate?.toString() || '',
        password: '',
        password_confirmation: '',
        is_active: user.is_active,
        role: user.role,
    });

    // Função para aplicar máscara de telefone
    function maskPhone(value: string) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('users.update', user.id));
    };

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Usuário" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Editar Usuário</h1>
                    <p className="text-muted-foreground">
                        Atualize as informações do usuário e sua função no sistema
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Informações Básicas */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Nome *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        autoComplete="name"
                                        autoFocus={true}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError className="mt-2" message={errors.name} />
                                </div>

                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full"
                                        autoComplete="email"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('email', e.target.value)}
                                        required
                                    />
                                    <InputError className="mt-2" message={errors.email} />
                                </div>

                                <div>
                                    <Label htmlFor="phone">Telefone</Label>
                                    <Input
                                        id="phone"
                                        type="text"
                                        name="phone"
                                        value={data.phone}
                                        className="mt-1 block w-full"
                                        autoComplete="phone"
                                        onChange={(e) => setData('phone', maskPhone(e.target.value))}
                                        maxLength={15}
                                        placeholder="(11) 99999-9999"
                                    />
                                    <InputError className="mt-2" message={errors.phone} />
                                </div>

                                <div>
                                    <Label htmlFor="cpf">CPF</Label>
                                    <CpfInput
                                        value={data.cpf}
                                        onChange={(value: string) => setData('cpf', value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError className="mt-2" message={errors.cpf} />
                                </div>

                                <div>
                                    <Label htmlFor="commission_rate">Taxa de Comissão (%)</Label>
                                    <Input
                                        id="commission_rate"
                                        type="number"
                                        name="commission_rate"
                                        value={data.commission_rate}
                                        className="mt-1 block w-full"
                                        autoComplete="commission_rate"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('commission_rate', e.target.value)}
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        placeholder="10.00"
                                    />
                                    <InputError className="mt-2" message={errors.commission_rate} />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Porcentagem de comissão sobre as aulas (opcional)
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="role">Função</Label>
                                    <Select
                                        value={data.role}
                                        onValueChange={(value) => setData('role', value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecione a função" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(roles).map(([key, value]) => (
                                                <SelectItem key={key} value={key}>
                                                    {value}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError className="mt-2" message={errors.role} />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked: boolean) => setData('is_active', checked)}
                                    />
                                    <Label htmlFor="is_active">Usuário Ativo</Label>
                                </div>
                                <InputError className="mt-2" message={errors.is_active} />
                            </div>
                        </div>
                    </div>

                    {/* Alterar Senha */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Alterar Senha</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="password">Nova Senha</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('password', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={errors.password} />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Deixe em branco se não quiser alterar a senha
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="password_confirmation">Confirmar Nova Senha</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('password_confirmation', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={errors.password_confirmation} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                    size="sm"
                                >
                                    <a href="/users">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Cancelar
                                    </a>
                                </Button>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => reset()}
                                        size="sm"
                                    >
                                        Desfazer
                                    </Button>
                                    <Button type="submit" disabled={processing} size="sm">
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing ? 'Salvando...' : 'Atualizar Usuário'}
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

export default Edit; 