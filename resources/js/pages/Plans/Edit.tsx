import React, { useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { 
    Save, 
    ArrowLeft, 
    Edit3, 
    BookOpen, 
    DollarSign, 
    Calendar,
    RefreshCw,
    Info
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Plan {
    id: number;
    description: string;
    frequency: number;
    price: number;
}

interface PlansEditProps extends PageProps {
    plan: Plan;
}

const Edit: React.FC<PlansEditProps> = ({ auth, plan }) => {
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
            title: 'Editar Plano',
            href: `/plans/${plan.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors, reset } = useForm({
        description: plan.description,
        frequency: plan.frequency,
        price: plan.price,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('plans.update', plan.id));
    };

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Plano" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header moderno */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <Edit3 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Editar Plano</h1>
                            <p className="text-muted-foreground">
                                Atualize as informações de "{plan.description}"
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
                                Atualize as configurações do plano
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
                                        onChange={(e) => setData('frequency', parseInt(e.target.value))}
                                        required
                                        min="1"
                                        max="7"
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
                                        onChange={(e) => setData('price', parseFloat(e.target.value))}
                                        required
                                        step="0.01"
                                        min="0"
                                    />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Valor mensal em reais
                                    </p>
                                    <InputError className="mt-2" message={errors.price} />
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                                <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-amber-900 mb-1">Atenção</p>
                                    <p className="text-sm text-amber-800">
                                        Alterações neste plano afetarão apenas novos alunos. Alunos existentes mantêm suas configurações atuais.
                                    </p>
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
                                        Restaurar
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing ? 'Salvando...' : 'Salvar Alterações'}
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
