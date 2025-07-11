import React from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import PrimaryButton from '@/components/primary-button';
import CpfInput from '@/components/cpf-input';
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

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900">Editar Usuário</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Atualize as informações do usuário e sua função no sistema
                                </p>
                            </div>

                            <form onSubmit={submit} className="mt-6 space-y-6">
                                {/* Informações Básicas */}
                                <div className="border-b pb-6">
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
                                            <Label htmlFor="role">Função no Sistema *</Label>
                                            <Select 
                                                value={data.role} 
                                                onValueChange={(value: string) => setData('role', value)}
                                            >
                                                <SelectTrigger className="mt-1 w-full">
                                                    <SelectValue placeholder="Selecione a função" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(roles).map(([value, label]) => (
                                                        <SelectItem key={value} value={value}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError className="mt-2" message={errors.role} />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Administradores têm acesso completo ao sistema
                                            </p>
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

                                {/* Alterar Senha */}
                                <div className="border-b pb-6">
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
                                    <div className="mt-4">
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <p className="text-sm text-yellow-800">
                                                <strong>Opcional:</strong> Deixe os campos de senha em branco se não quiser alterar a senha atual.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <PrimaryButton disabled={processing}>
                                        Atualizar Usuário
                                    </PrimaryButton>
                                    <a 
                                        href="/users" 
                                        className="text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Cancelar
                                    </a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Edit; 