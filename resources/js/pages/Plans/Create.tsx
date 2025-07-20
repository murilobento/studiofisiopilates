import React from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import {
    Save,
    ArrowLeft,
    CreditCard,
    BookOpen,
    DollarSign,
    Calendar,
    RefreshCw,
    Info
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Planos',
        href: '/plans',
    },
    {
        title: 'Criar Plano',
        href: '/plans/create',
    },
];

const Create: React.FC<PageProps> = ({ auth }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        description: '',
        frequency: '',
        price: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('plans.store'));
    };

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="Criar Plano" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header moderno */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Novo Plano</h1>
                            <p className="text-muted-foreground">
                                Cadastre um novo plano de aulas no sistema
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Informações do Plano */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>Detalhes do Plano</CardTitle>
                            </div>
                            <CardDescription>
                                Configure as informações básicas do plano
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <Label htmlFor="description">Descrição do Plano *</Label>
                                    <Input
                                        id="description"
                                        type="text"
                                        name="description"
                                        value={data.description}
                                        className="mt-1 block w-full"
                                        autoComplete="description"
                                        autoFocus={true}
                                        onChange={(e) => setData('description', e.target.value)}
                                        required
                                        placeholder="Ex: Pilates Iniciante - 2x por semana"
                                    />
                                    <InputError className="mt-2" message={errors.description} />
                                </div>

                                <div>
                                    <Label htmlFor="frequency" className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Frequência Semanal *
                                    </Label>
                                    <Input
                                        id="frequency"
                                        type="number"
                                        name="frequency"
                                        value={data.frequency}
                                        className="mt-1 block w-full"
                                        autoComplete="frequency"
                                        onChange={(e) => setData('frequency', e.target.value)}
                                        required
                                        min="1"
                                        max="7"
                                        placeholder="2"
                                    />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Quantas aulas por semana
                                    </p>
                                    <InputError className="mt-2" message={errors.frequency} />
                                </div>

                                <div>
                                    <Label htmlFor="price" className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Preço Sugerido *
                                    </Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        name="price"
                                        value={data.price}
                                        className="mt-1 block w-full"
                                        autoComplete="price"
                                        onChange={(e) => setData('price', e.target.value)}
                                        required
                                        step="0.01"
                                        min="0"
                                        placeholder="150.00"
                                    />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Valor mensal em reais
                                    </p>
                                    <InputError className="mt-2" message={errors.price} />
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-blue-900 mb-1">Informações Importantes</p>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• O preço é sugerido e pode ser personalizado por aluno</li>
                                        <li>• A frequência define quantas aulas o aluno pode fazer por semana</li>
                                        <li>• Planos podem ser editados após a criação</li>
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
                                    <Link href="/plans">
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
                                        {processing ? 'Salvando...' : 'Criar Plano'}
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
