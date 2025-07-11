import React from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import InputError from '@/components/input-error';
import PrimaryButton from '@/components/primary-button';
import CpfInput from '@/components/cpf-input';
import CepInput from '@/components/cep-input-component';
import { type BreadcrumbItem } from '@/types';

interface Plan {
    id: number;
    description: string;
    price: number;
}

interface Instructor {
    id: number;
    name: string;
}

interface StudentsCreateProps extends PageProps {
    plans: Plan[];
    instructors: Instructor[];
    can: {
        chooseInstructor: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Alunos',
        href: '/students',
    },
    {
        title: 'Cadastrar Aluno',
        href: '/students/create',
    },
];

const Create: React.FC<StudentsCreateProps> = ({ auth, plans, instructors, can }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        plan_id: '',
        custom_price: '',
        status: 'ativo',
        instructor_id: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zip_code: '',
        gender: '',
        cpf: '',
        medical_conditions: '',
        medications: '',
        allergies: '',
        pilates_goals: '',
        physical_activity_history: '',
        general_notes: '',
    });

    // Função para aplicar máscara de telefone
    function maskPhone(value: string) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    }

    const handleAddressFound = (address: any) => {
        setData('street', address.logradouro || '');
        setData('neighborhood', address.bairro || '');
        setData('city', address.localidade || '');
        setData('state', address.uf || '');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('students.store'));
    };

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="Cadastrar Aluno" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Cadastrar Novo Aluno</h3>
                            <form onSubmit={submit} className="mt-6 space-y-6">
                                {/* Informações Básicas */}
                                <div className="border-b pb-6">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name">Nome</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                name="name"
                                                value={data.name}
                                                className="mt-1 block w-full"
                                                autoComplete="name"
                                                autoFocus={true}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                            />
                                            <InputError className="mt-2" message={errors.name} />
                                        </div>

                                        <div>
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                className="mt-1 block w-full"
                                                autoComplete="email"
                                                onChange={(e) => setData('email', e.target.value)}
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
                                            <Label htmlFor="gender">Gênero</Label>
                                            <Select
                                                onValueChange={(value) => setData('gender', value)}
                                                value={data.gender}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecione o gênero" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="masculino">Masculino</SelectItem>
                                                    <SelectItem value="feminino">Feminino</SelectItem>
                                                    <SelectItem value="outro">Outro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError className="mt-2" message={errors.gender} />
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="status"
                                                checked={data.status === 'ativo'}
                                                onCheckedChange={(checked) => setData('status', checked ? 'ativo' : 'inativo')}
                                            />
                                            <Label htmlFor="status">Aluno Ativo</Label>
                                        </div>
                                        <InputError className="mt-2" message={errors.status} />
                                    </div>
                                </div>

                                {/* Plano e Preço */}
                                <div className="border-b pb-6">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Plano e Preço</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="plan_id">Plano</Label>
                                            <Select
                                                onValueChange={(value) => {
                                                    setData('plan_id', value);
                                                    // Preencher automaticamente o preço do plano selecionado
                                                    const selectedPlan = plans.find(plan => plan.id === parseInt(value));
                                                    if (selectedPlan) {
                                                        setData('custom_price', selectedPlan.price.toString());
                                                    }
                                                }}
                                                value={data.plan_id}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecione um plano" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {plans.map((plan) => (
                                                        <SelectItem key={plan.id} value={String(plan.id)}>
                                                            {plan.description} - R$ {plan.price.toFixed(2)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError className="mt-2" message={errors.plan_id} />
                                        </div>

                                        <div>
                                            <Label htmlFor="custom_price">Preço Personalizado <span className="text-gray-500 text-xs">(pode ser alterado manualmente)</span></Label>
                                            <Input
                                                id="custom_price"
                                                type="number"
                                                name="custom_price"
                                                value={data.custom_price}
                                                className="mt-1 block w-full"
                                                autoComplete="custom_price"
                                                onChange={(e) => setData('custom_price', e.target.value)}
                                                step="0.01"
                                            />
                                            <InputError className="mt-2" message={errors.custom_price} />
                                        </div>

                                        {can.chooseInstructor && (
                                            <div>
                                                <Label htmlFor="instructor_id">Instrutor</Label>
                                                <Select
                                                    onValueChange={(value) => setData('instructor_id', value)}
                                                    value={data.instructor_id}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Selecione um instrutor" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {instructors.map((instructor) => (
                                                            <SelectItem key={instructor.id} value={String(instructor.id)}>
                                                                {instructor.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError className="mt-2" message={errors.instructor_id} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Endereço */}
                                <div className="border-b pb-6">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Endereço</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="zip_code">CEP</Label>
                                            <CepInput
                                                value={data.zip_code}
                                                onChange={(value: string) => setData('zip_code', value)}
                                                onAddressFound={handleAddressFound}
                                                className="mt-1 block w-full"
                                            />
                                            <InputError className="mt-2" message={errors.zip_code} />
                                        </div>
                                        
                                        <div>
                                            <Label htmlFor="street">Rua</Label>
                                            <Input
                                                id="street"
                                                type="text"
                                                name="street"
                                                value={data.street}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('street', e.target.value)}
                                            />
                                            <InputError className="mt-2" message={errors.street} />
                                        </div>
                                        
                                        <div>
                                            <Label htmlFor="number">Número</Label>
                                            <Input
                                                id="number"
                                                type="text"
                                                name="number"
                                                value={data.number}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('number', e.target.value)}
                                            />
                                            <InputError className="mt-2" message={errors.number} />
                                        </div>
                                        
                                        <div>
                                            <Label htmlFor="neighborhood">Bairro</Label>
                                            <Input
                                                id="neighborhood"
                                                type="text"
                                                name="neighborhood"
                                                value={data.neighborhood}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('neighborhood', e.target.value)}
                                            />
                                            <InputError className="mt-2" message={errors.neighborhood} />
                                        </div>
                                        
                                        <div>
                                            <Label htmlFor="city">Cidade</Label>
                                            <Input
                                                id="city"
                                                type="text"
                                                name="city"
                                                value={data.city}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('city', e.target.value)}
                                            />
                                            <InputError className="mt-2" message={errors.city} />
                                        </div>
                                        
                                        <div>
                                            <Label htmlFor="state">Estado</Label>
                                            <Input
                                                id="state"
                                                type="text"
                                                name="state"
                                                value={data.state}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('state', e.target.value)}
                                            />
                                            <InputError className="mt-2" message={errors.state} />
                                        </div>
                                    </div>
                                </div>

                                {/* Informações de Saúde */}
                                <div className="border-b pb-6">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Informações de Saúde</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="medical_conditions">Condições Médicas</Label>
                                            <Textarea
                                                id="medical_conditions"
                                                name="medical_conditions"
                                                value={data.medical_conditions}
                                                className="mt-1 block w-full"
                                                rows={3}
                                                onChange={(e) => setData('medical_conditions', e.target.value)}
                                                placeholder="Descreva condições médicas relevantes..."
                                            />
                                            <InputError className="mt-2" message={errors.medical_conditions} />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="medications">Medicamentos</Label>
                                                <Textarea
                                                    id="medications"
                                                    name="medications"
                                                    value={data.medications}
                                                    className="mt-1 block w-full"
                                                    rows={3}
                                                    onChange={(e) => setData('medications', e.target.value)}
                                                    placeholder="Liste medicamentos em uso..."
                                                />
                                                <InputError className="mt-2" message={errors.medications} />
                                            </div>

                                            <div>
                                                <Label htmlFor="allergies">Alergias</Label>
                                                <Textarea
                                                    id="allergies"
                                                    name="allergies"
                                                    value={data.allergies}
                                                    className="mt-1 block w-full"
                                                    rows={3}
                                                    onChange={(e) => setData('allergies', e.target.value)}
                                                    placeholder="Descreva alergias conhecidas..."
                                                />
                                                <InputError className="mt-2" message={errors.allergies} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="pilates_goals">Objetivos no Pilates</Label>
                                                <Textarea
                                                    id="pilates_goals"
                                                    name="pilates_goals"
                                                    value={data.pilates_goals}
                                                    className="mt-1 block w-full"
                                                    rows={3}
                                                    onChange={(e) => setData('pilates_goals', e.target.value)}
                                                    placeholder="Descreva os objetivos do aluno..."
                                                />
                                                <InputError className="mt-2" message={errors.pilates_goals} />
                                            </div>

                                            <div>
                                                <Label htmlFor="physical_activity_history">Histórico de Atividade Física</Label>
                                                <Textarea
                                                    id="physical_activity_history"
                                                    name="physical_activity_history"
                                                    value={data.physical_activity_history}
                                                    className="mt-1 block w-full"
                                                    rows={3}
                                                    onChange={(e) => setData('physical_activity_history', e.target.value)}
                                                    placeholder="Descreva histórico de atividades físicas..."
                                                />
                                                <InputError className="mt-2" message={errors.physical_activity_history} />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="general_notes">Observações Gerais</Label>
                                            <Textarea
                                                id="general_notes"
                                                name="general_notes"
                                                value={data.general_notes}
                                                className="mt-1 block w-full"
                                                rows={3}
                                                onChange={(e) => setData('general_notes', e.target.value)}
                                                placeholder="Observações adicionais..."
                                            />
                                            <InputError className="mt-2" message={errors.general_notes} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <PrimaryButton disabled={processing}>Cadastrar Aluno</PrimaryButton>
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
