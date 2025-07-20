import React from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import InputError from '@/components/input-error';
import CpfInput from '@/components/cpf-input';
import { 
    Save, 
    ArrowLeft, 
    UserPlus, 
    User, 
    Mail, 
    Phone, 
    CreditCard, 
    Lock,
    Info,
    RefreshCw
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface UsersCreateProps extends PageProps {
}

const Create: React.FC<UsersCreateProps> = ({ auth }) => {
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
            title: 'Novo Usuário',
            href: '/users/create',
        },
    ];

    const { data, setData, post, processing, errors, reset } = useForm<{
        name: string;
        email: string;
        phone: string;
        cpf: string;
        commission_rate: string;
        password: string;
        password_confirmation: string;
        is_active: boolean;
    }>({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        commission_rate: '',
        password: '',
        password_confirmation: '',
        is_active: true,
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
        post(route('users.store'));
    };

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="Novo Usuário" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header moderno */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                            <UserPlus className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Novo Usuário</h1>
                            <p className="text-muted-foreground">
                                Cadastre um novo instrutor no sistema
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Informações Básicas */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>Informações Pessoais</CardTitle>
                            </div>
                            <CardDescription>
                                Dados básicos do novo instrutor
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked: boolean) => setData('is_active', checked)}
                                    />
                                    <Label htmlFor="is_active">Instrutor Ativo</Label>
                                </div>
                                <InputError className="mt-2" message={errors.is_active} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informações de Acesso */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>Informações de Acesso</CardTitle>
                            </div>
                            <CardDescription>
                                Credenciais para login no sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="password">Senha *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('password', e.target.value)}
                                        required
                                    />
                                    <InputError className="mt-2" message={errors.password} />
                                </div>

                                <div>
                                    <Label htmlFor="password_confirmation">Confirmar Senha *</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                    <InputError className="mt-2" message={errors.password_confirmation} />
                                </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h5 className="font-medium text-blue-900 mb-2">Informações Importantes</h5>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• O email será usado para login no sistema</li>
                                        <li>• O email será automaticamente verificado</li>
                                        <li>• O instrutor poderá alterar sua senha após o primeiro login</li>
                                        <li>• A taxa de comissão é opcional e pode ser definida posteriormente</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Botões de Ação */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                >
                                    <Link href="/users">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Voltar
                                    </Link>
                                </Button>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => reset()}
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Limpar
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing ? 'Salvando...' : 'Criar Instrutor'}
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