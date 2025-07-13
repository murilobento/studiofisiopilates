import React, { useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { Save, ArrowLeft } from 'lucide-react';
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

            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Editar Plano</h1>
                    <p className="text-muted-foreground">
                        Atualize as informações do plano de aulas
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Informações do Plano */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Informações do Plano</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <Label htmlFor="description">Descrição *</Label>
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
                                    />
                                    <InputError className="mt-2" message={errors.description} />
                                </div>

                                <div>
                                    <Label htmlFor="frequency">Frequência (semanal) *</Label>
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
                                    />
                                    <InputError className="mt-2" message={errors.frequency} />
                                </div>

                                <div>
                                    <Label htmlFor="price">Preço *</Label>
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
                                    <InputError className="mt-2" message={errors.price} />
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
                                    <a href="/plans">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Voltar
                                    </a>
                                </Button>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => reset()}
                                        size="sm"
                                    >
                                        Restaurar
                                    </Button>
                                    <Button type="submit" disabled={processing} size="sm">
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
