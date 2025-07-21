import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, CalendarIcon, PieChartIcon, BarChartIcon, LineChartIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardProps {
  dashboardData: {
    current_month: {
      income: number;
      expenses: number;
      commissions: number;
      profit: number;
      profit_margin: number;
    };
    last_month: {
      income: number;
      expenses: number;
      commissions: number;
      profit: number;
      profit_margin: number;
    };
    changes: {
      income: number;
      expenses: number;
      profit: number;
    };
    upcoming_expenses: Array<{
      id: number;
      name: string;
      amount: number;
      due_day: number;
      category: string;
    }>;
    pending_commissions: Array<{
      id: number;
      instructor: string;
      amount: number;
      created_at: string;
    }>;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Dashboard({ dashboardData }: DashboardProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Dados para o gráfico de distribuição de despesas
  const expenseDistributionData = [
    { name: 'Despesas Fixas', value: dashboardData.current_month.expenses * 0.6 }, // Exemplo - substituir por dados reais
    { name: 'Despesas Variáveis', value: dashboardData.current_month.expenses * 0.3 }, // Exemplo - substituir por dados reais
    { name: 'Comissões', value: dashboardData.current_month.commissions },
  ];

  // Dados para o gráfico de evolução mensal
  const monthlyTrendData = [
    { name: 'Jan', receitas: 4000, despesas: 2400, comissoes: 800 },
    { name: 'Fev', receitas: 3000, despesas: 1398, comissoes: 700 },
    { name: 'Mar', receitas: 2000, despesas: 9800, comissoes: 600 },
    { name: 'Abr', receitas: 2780, despesas: 3908, comissoes: 750 },
    { name: 'Mai', receitas: 1890, despesas: 4800, comissoes: 500 },
    { name: 'Jun', receitas: 2390, despesas: 3800, comissoes: 650 },
    { name: 'Jul', receitas: 3490, despesas: 4300, comissoes: 900 },
  ];

  return (
    <>
      <Head title="Dashboard Financeiro" />
      
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard Financeiro</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="expenses">Despesas</TabsTrigger>
            <TabsTrigger value="income">Receitas</TabsTrigger>
            <TabsTrigger value="commissions">Comissões</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Cards de resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Receitas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(dashboardData.current_month.income)}</div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {dashboardData.changes.income > 0 ? (
                      <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={dashboardData.changes.income > 0 ? 'text-green-500' : 'text-red-500'}>
                      {Math.abs(dashboardData.changes.income)}% em relação ao mês anterior
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(dashboardData.current_month.expenses + dashboardData.current_month.commissions)}</div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {dashboardData.changes.expenses < 0 ? (
                      <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={dashboardData.changes.expenses < 0 ? 'text-green-500' : 'text-red-500'}>
                      {Math.abs(dashboardData.changes.expenses)}% em relação ao mês anterior
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Lucro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(dashboardData.current_month.profit)}</div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {dashboardData.changes.profit > 0 ? (
                      <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={dashboardData.changes.profit > 0 ? 'text-green-500' : 'text-red-500'}>
                      {Math.abs(dashboardData.changes.profit)}% em relação ao mês anterior
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Margem de Lucro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.current_month.profit_margin.toFixed(2)}%</div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {dashboardData.current_month.profit_margin > dashboardData.last_month.profit_margin ? (
                      <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={dashboardData.current_month.profit_margin > dashboardData.last_month.profit_margin ? 'text-green-500' : 'text-red-500'}>
                      {Math.abs(dashboardData.current_month.profit_margin - dashboardData.last_month.profit_margin).toFixed(2)}% em relação ao mês anterior
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Evolução Mensal</CardTitle>
                  <CardDescription>Receitas vs Despesas vs Comissões</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Line type="monotone" dataKey="receitas" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="despesas" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="comissoes" stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Despesas</CardTitle>
                  <CardDescription>Mês atual</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {expenseDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Próximas despesas e comissões pendentes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Próximas Despesas</CardTitle>
                  <CardDescription>Despesas com vencimento nos próximos 7 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.upcoming_expenses.length > 0 ? (
                      dashboardData.upcoming_expenses.map((expense) => (
                        <div key={expense.id} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <div className="font-medium">{expense.name}</div>
                            <div className="text-sm text-muted-foreground">Vence dia {expense.due_day}</div>
                          </div>
                          <div className="font-medium">{formatCurrency(expense.amount)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        Não há despesas com vencimento próximo.
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver todas as despesas
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Comissões Pendentes</CardTitle>
                  <CardDescription>Comissões a serem pagas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.pending_commissions.length > 0 ? (
                      dashboardData.pending_commissions.map((commission) => (
                        <div key={commission.id} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <div className="font-medium">{commission.instructor}</div>
                            <div className="text-sm text-muted-foreground">Gerada em {commission.created_at}</div>
                          </div>
                          <div className="font-medium">{formatCurrency(commission.amount)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        Não há comissões pendentes.
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver todas as comissões
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Despesas</CardTitle>
                <CardDescription>Detalhamento de despesas por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Conteúdo da aba de despesas...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Receitas</CardTitle>
                <CardDescription>Detalhamento de receitas por fonte</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Conteúdo da aba de receitas...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Comissões</CardTitle>
                <CardDescription>Detalhamento de comissões por instrutor</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Conteúdo da aba de comissões...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}