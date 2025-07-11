import React, { useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import PrimaryButton from '@/components/primary-button';
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

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Plano</h3>
                            <form onSubmit={submit} className="mt-6 space-y-6">
                                <div>
                                    <Label htmlFor="description">Descrição</Label>
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
                                    <Label htmlFor="frequency">Frequência (semanal)</Label>
                                    <Input
                                        id="frequency"
                                        type="number"
                                        name="frequency"
                                        value={data.frequency}
                                        className="mt-1 block w-full"
                                        autoComplete="frequency"
                                        onChange={(e) => setData('frequency', parseInt(e.target.value))}
                                        required
                                    />
                                    <InputError className="mt-2" message={errors.frequency} />
                                </div>

                                <div>
                                    <Label htmlFor="price">Preço</Label>
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
                                    />
                                    <InputError className="mt-2" message={errors.price} />
                                </div>

                                <div className="flex items-center gap-4">
                                    <PrimaryButton disabled={processing}>Salvar</PrimaryButton>
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
