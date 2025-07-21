import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeftIcon } from 'lucide-react';

interface CreateProps {
  categories: string[];
}

export default function Create({ categories }: CreateProps) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    amount: '',
    type: 'fixed',
    category: '',
    due_day: '',
    is_active: true,
  });

  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Se estiver usando uma categoria personalizada, use-a
    if (showCustomCategory && customCategory) {
      setData('category', customCategory);
    }
    
    post(route('recurring-expenses.store'));
  };

  return (
    <>
      <Head title="Nova Despesa Recorrente" />
      
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Link href={route('recurring-expenses.index')} className="mr-4">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Nova Despesa Recorrente</h1>
        </div>
        
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Informações da Despesa</CardTitle>
              <CardDescription>
                Preencha os dados da nova despesa recorrente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    placeholder="Ex: Aluguel, Conta de Luz"
                    required
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo <span className="text-red-500">*</span></Label>
                  <RadioGroup
                    value={data.type}
                    onValueChange={value => setData('type', value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fixed" id="fixed" />
                      <Label htmlFor="fixed">Valor Fixo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="variable" id="variable" />
                      <Label htmlFor="variable">Valor Variável</Label>
                    </div>
                  </RadioGroup>
                  {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.type === 'fixed' && (
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor <span className="text-red-500">*</span></Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={data.amount}
                      onChange={e => setData('amount', e.target.value)}
                      placeholder="0,00"
                      required={data.type === 'fixed'}
                    />
                    {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="due_day">Dia de Vencimento <span className="text-red-500">*</span></Label>
                  <Input
                    id="due_day"
                    type="number"
                    min="1"
                    max="31"
                    value={data.due_day}
                    onChange={e => setData('due_day', e.target.value)}
                    placeholder="Ex: 10"
                    required
                  />
                  {errors.due_day && <p className="text-red-500 text-sm">{errors.due_day}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria <span className="text-red-500">*</span></Label>
                  {!showCustomCategory ? (
                    <>
                      <Select
                        value={data.category}
                        onValueChange={(value) => {
                          if (value === 'custom') {
                            setShowCustomCategory(true);
                          } else {
                            setData('category', value);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                          <SelectItem value="custom">Outra categoria...</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <div className="flex space-x-2">
                      <Input
                        value={customCategory}
                        onChange={e => setCustomCategory(e.target.value)}
                        placeholder="Nova categoria"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCustomCategory(false);
                          setCustomCategory('');
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                  {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={e => setData('description', e.target.value)}
                  placeholder="Detalhes adicionais sobre a despesa"
                  rows={4}
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href={route('recurring-expenses.index')}>
                <Button variant="outline" type="button">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={processing}>Salvar Despesa</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}