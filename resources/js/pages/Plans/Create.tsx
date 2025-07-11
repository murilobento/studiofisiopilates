import React from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import PrimaryButton from '@/components/primary-button';
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

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Criar Novo Plano</h3>
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
                                        onChange={(e) => setData('frequency', e.target.value)}
                                        required
                                    />
                                    <InputError className="mt-2" message={errors.frequency} />
                                </div>

                                <div>
                                    <Label htmlFor="price">Preço Sugerido</Label>
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

export default Create;
