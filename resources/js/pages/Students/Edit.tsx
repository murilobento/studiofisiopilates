import React from 'react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import InputError from '@/components/input-error';
import CpfInput from '@/components/cpf-input';
import CepInput from '@/components/cep-input-component';
import { DatePicker } from '@/components/ui/date-picker';
import { Save, ArrowLeft, User, CreditCard, MapPin, Heart, Edit } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { format } from 'date-fns';

interface Plan {
    id: number;
    description: string;
    price: number;
}

interface Instructor {
    id: number;
    name: string;
}

interface Student {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    plan_id: number;
    custom_price: number | null;
    status: string;
    instructor_id: number | null;
    instructor?: Instructor;
    street: string | null;
    number: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    gender: string | null;
    cpf: string | null;
    medical_conditions: string | null;
    medications: string | null;
    allergies: string | null;
    pilates_goals: string | null;
    physical_activity_history: string | null;
    general_notes: string | null;
    birth_date: string | null;
}

interface StudentsEditProps extends PageProps {
    student: Student;
    plans: Plan[];
    instructors: Instructor[];
    can: {
        chooseInstructor: boolean;
    };
}

const EditStudent: React.FC<StudentsEditProps> = ({ auth, student, plans, instructors, can }) => {
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
            title: 'Editar Aluno',
            href: `/students/${student.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors, reset } = useForm({
        name: student.name,
        email: student.email,
        phone: student.phone || '',
        plan_id: student.plan_id,
        custom_price: student.custom_price || '',
        status: student.status || 'ativo',
        instructor_id: student.instructor_id || '',
        birth_date: student.birth_date || '',
        street: student.street || '',
        number: student.number || '',
        neighborhood: student.neighborhood || '',
        city: student.city || '',
        state: student.state || '',
        zip_code: student.zip_code || '',
        gender: student.gender || '',
        cpf: student.cpf || '',
        medical_conditions: student.medical_conditions || '',
        medications: student.medications || '',
        allergies: student.allergies || '',
        pilates_goals: student.pilates_goals || '',
        physical_activity_history: student.physical_activity_history || '',
        general_notes: student.general_notes || '',
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
        put(route('students.update', student.id));
    };

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Aluno" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header moderno */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <Edit className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Editar Aluno</h1>
                            <p className="text-muted-foreground">{student.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div></div>
                        <Button variant="outline" asChild>
                            <a href="/students">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </a>
                        </Button>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Informações Básicas */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-600" />
                                <CardTitle>Informações Básicas</CardTitle>
                            </div>
                            <CardDescription>
                                Dados pessoais e de contato do aluno
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Nome *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="mt-1"
                                        autoComplete="name"
                                        autoFocus={true}
                                        onChange={(e) => setData('name', e.target.value)}
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
                                        className="mt-1"
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
                                        className="mt-1"
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
                                        className="mt-1"
                                    />
                                    <InputError className="mt-2" message={errors.cpf} />
                                </div>

                                <div>
                                    <Label htmlFor="birth_date">Data de Nascimento</Label>
                                    <DatePicker
                                        value={data.birth_date ? new Date(data.birth_date) : undefined}
                                        onChange={(date) => {
                                            const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
                                            setData('birth_date', formattedDate);
                                        }}
                                        placeholder="Selecione a data de nascimento"
                                        className="mt-1"
                                    />
                                    <InputError className="mt-2" message={errors.birth_date} />
                                </div>

                                <div>
                                    <Label htmlFor="gender">Gênero</Label>
                                    <Select
                                        onValueChange={(value) => setData('gender', value)}
                                        value={data.gender}
                                    >
                                        <SelectTrigger className="mt-1">
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
                            </div>

                            <Separator />

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="status"
                                    checked={data.status === 'ativo'}
                                    onCheckedChange={(checked) => setData('status', checked ? 'ativo' : 'inativo')}
                                />
                                <Label htmlFor="status">Aluno Ativo</Label>
                            </div>
                            <InputError className="mt-2" message={errors.status} />
                        </CardContent>
                    </Card>

                    {/* Plano e Preço */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-green-600" />
                                <CardTitle>Plano e Preço</CardTitle>
                            </div>
                            <CardDescription>
                                Configurações de plano e valores
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="plan_id">Plano</Label>
                                    <Select
                                        onValueChange={(value) => {
                                            setData('plan_id', parseInt(value));
                                            // Preencher automaticamente o preço do plano selecionado
                                            const selectedPlan = plans.find(plan => plan.id === parseInt(value));
                                            if (selectedPlan) {
                                                setData('custom_price', selectedPlan.price.toString());
                                            }
                                        }}
                                        value={data.plan_id.toString()}
                                    >
                                        <SelectTrigger className="mt-1">
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
                                    <Label htmlFor="custom_price">Preço Personalizado</Label>
                                    <Input
                                        id="custom_price"
                                        type="number"
                                        name="custom_price"
                                        value={data.custom_price}
                                        className="mt-1"
                                        autoComplete="custom_price"
                                        onChange={(e) => setData('custom_price', e.target.value)}
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Pode ser alterado manualmente
                                    </p>
                                    <InputError className="mt-2" message={errors.custom_price} />
                                </div>

                                {can.chooseInstructor ? (
                                    <div className="md:col-span-2">
                                        <Label htmlFor="instructor_id">Instrutor</Label>
                                        <Select
                                            onValueChange={(value) => setData('instructor_id', value === "0" ? '' : value)}
                                            value={data.instructor_id ? data.instructor_id.toString() : "0"}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Selecione um instrutor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">Nenhum instrutor</SelectItem>
                                                {instructors.map((instructor) => (
                                                    <SelectItem key={instructor.id} value={String(instructor.id)}>
                                                        {instructor.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError className="mt-2" message={errors.instructor_id} />
                                    </div>
                                ) : (
                                    student.instructor && (
                                        <div className="md:col-span-2">
                                            <Label>Instrutor</Label>
                                            <Input
                                                value={student.instructor.name}
                                                disabled
                                                className="mt-1 bg-muted"
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Endereço */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-orange-600" />
                                <CardTitle>Endereço</CardTitle>
                            </div>
                            <CardDescription>
                                Informações de endereço do aluno
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="zip_code">CEP</Label>
                                    <CepInput
                                        value={data.zip_code}
                                        onChange={(value: string) => setData('zip_code', value)}
                                        onAddressFound={handleAddressFound}
                                        className="mt-1"
                                    />
                                    <InputError className="mt-2" message={errors.zip_code} />
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="street">Rua</Label>
                                    <Input
                                        id="street"
                                        type="text"
                                        name="street"
                                        value={data.street}
                                        className="mt-1"
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
                                        className="mt-1"
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
                                        className="mt-1"
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
                                        className="mt-1"
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
                                        className="mt-1"
                                        onChange={(e) => setData('state', e.target.value)}
                                        maxLength={2}
                                        placeholder="SP"
                                    />
                                    <InputError className="mt-2" message={errors.state} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informações de Saúde */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Heart className="h-5 w-5 text-red-600" />
                                <CardTitle>Informações de Saúde</CardTitle>
                            </div>
                            <CardDescription>
                                Histórico médico e objetivos do aluno
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="medical_conditions">Condições Médicas</Label>
                                <Textarea
                                    id="medical_conditions"
                                    name="medical_conditions"
                                    value={data.medical_conditions}
                                    className="mt-1"
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
                                        className="mt-1"
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
                                        className="mt-1"
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
                                        className="mt-1"
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
                                        className="mt-1"
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
                                    className="mt-1"
                                    rows={3}
                                    onChange={(e) => setData('general_notes', e.target.value)}
                                    placeholder="Observações adicionais..."
                                />
                                <InputError className="mt-2" message={errors.general_notes} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Botões de Ação */}
                    <div className="flex items-center justify-end gap-4 pt-6">
                        <Button variant="outline" onClick={() => reset()}>
                            Desfazer
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Salvando...' : 'Atualizar Aluno'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
};

export default EditStudent;