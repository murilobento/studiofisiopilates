import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { DownloadIcon, FileTextIcon, FileSpreadsheetIcon, CalendarIcon, BarChartIcon, PieChartIcon, LineChartIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transaction {
  id: number;
  type: 'income' | 'expense' | 'commission';
  category: string;
  description: string;
  amount: number;
  transaction_date: string;
  reference_id: number | null;
  reference_type: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    name: string;
  };
}

interface CategoryData {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  commissions: number;
  profit: number;
}

interface ReportProps {
  report: {
    period: {
      start: string;
      end: string;
    };
    summary: {
      total_income: number;
      total_expenses: number;
      total_commissions: number;
      profit: number;
      profit_margin: number;
    };
    by_type: {
      income: {
        total: number;
        count: number;
        by_category: CategoryData[];
      };
      expenses: {
        total: number;
        count: number;
        by_category: CategoryData[];
      };
      commissions: {
        total: number;
        count: number;
      };
    };
    monthly_trend: MonthlyData[];
    transactions: Transaction[];
  };
  indicators: {
    profit_margin: number;
    expense_ratio: number;
    commission_ratio: number;
    average_daily_income: number;
    average_daily_expense: number;
    average_daily_profit: number;
  };
  startDate: string;
  endDate: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

export default function Report({ report, indicators, startDate, endDate }: ReportProps) {
  const [start, setStart] = useState<Date | undefined>(new Date(startDate));
  const [end, setEnd] = useState<Date | undefined>(new Date(endDate));
  const [activeTab, setActiveTab] = useState('summary');

  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  // Aplicar filtros de data
  const applyDateFilter = () => {
    if (!start || !end) return;
    
    router.get(route('financial.report'), {
      start_date: format(start, 'yyyy-MM-dd'),
      end_date: format(end, 'yyyy-MM-dd'),
    }, {
      preserveState: true,
      replace: true,
    });
  };

  // Exportar para PDF
  const exportToPdf = () => {
    router.post(route('financial.export-pdf'), {
      start_date: format(start, 'yyyy-MM-dd'),
      end_date: format(end, 'yyyy-MM-dd'),
    });
  };

  // Exportar para Excel
  const exportToExcel = () => {
    router.post(route('financial.export-excel'), {
      start_date: format(start, 'yyyy-MM-dd'),
      end_date: format(end, 'yyyy-MM-dd'),
    });
  };

  return (
    <>
      <Head title="Relatório Financeiro" />
      
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Relatório Financeiro</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToPdf}>
              <FileTextIcon className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button variant="outline" size="sm" onClick={exportToExcel}>
              <FileSpreadsheetIcon className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Filtro de período */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Data Inicial</Label>
                <DatePicker
                  date={start}
                  setDate={setStart}
                  locale={ptBR}
                  className="w-full"
                />
              </div>
              <div>
                <Label>Data Final</Label>
                <DatePicker
                  date={end}
                  setDate={setEnd}
                  locale={ptBR}
                  className="w-full"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={applyDateFilter}>Aplicar Filtro</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(report.summary.total_income)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {report.by_type.income.count} transações
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(report.summary.total_expenses)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {report.by_type.expenses.count} transações
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Comissões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(report.summary.total_commissions)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {report.by_type.commissions.count} transações
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lucro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(report.summary.profit)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Margem: {report.summary.profit_margin.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="summary" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="summary">Resumo</TabsTrigger>
            <TabsTrigger value="charts">Gráficos</TabsTrigger>
            <TabsTrigger value="indicators">Indicadores</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Receitas por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead>%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.by_type.income.by_category.map((category) => (
                        <TableRow key={category.category}>
                          <TableCell>{category.category}</TableCell>
                          <TableCell>{formatCurrency(category.total)}</TableCell>
                          <TableCell>{category.count}</TableCell>
                          <TableCell>{category.percentage.toFixed(2)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Despesas por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead>%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.by_type.expenses.by_category.map((category) => (
                        <TableRow key={category.category}>
                          <TableCell>{category.category}</TableCell>
                          <TableCell>{formatCurrency(category.total)}</TableCell>
                          <TableCell>{category.count}</TableCell>
                          <TableCell>{category.percentage.toFixed(2)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Evolução Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mês</TableHead>
                      <TableHead>Receitas</TableHead>
                      <TableHead>Despesas</TableHead>
                      <TableHead>Comissões</TableHead>
                      <TableHead>Lucro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.monthly_trend.map((month) => (
                      <TableRow key={month.month}>
                        <TableCell>{month.month}</TableCell>
                        <TableCell>{formatCurrency(month.income)}</TableCell>
                        <TableCell>{formatCurrency(month.expenses)}</TableCell>
                        <TableCell>{formatCurrency(month.commissions)}</TableCell>
                        <TableCell>{formatCurrency(month.profit)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Receitas vs Despesas</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={report.monthly_trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="income" name="Receitas" fill="#8884d8" />
                      <Bar dataKey="expenses" name="Despesas" fill="#82ca9d" />
                      <Bar dataKey="commissions" name="Comissões" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Evolução do Lucro</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={report.monthly_trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Line type="monotone" dataKey="profit" name="Lucro" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Receitas</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={report.by_type.income.by_category}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total"
                        label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {report.by_type.income.by_category.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Despesas</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={report.by_type.expenses.by_category}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total"
                        label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {report.by_type.expenses.by_category.map((entry, index) => (
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
          </TabsContent>

          <TabsContent value="indicators">
            <Card>
              <CardHeader>
                <CardTitle>Indicadores Financeiros</CardTitle>
                <CardDescription>
                  Período: {formatDate(report.period.start)} a {formatDate(report.period.end)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-medium">Margem de Lucro</h3>
                    <div className="text-2xl font-bold">{indicators.profit_margin.toFixed(2)}%</div>
                    <p className="text-sm text-muted-foreground">
                      Percentual de lucro em relação à receita total
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Índice de Despesas</h3>
                    <div className="text-2xl font-bold">{indicators.expense_ratio.toFixed(2)}%</div>
                    <p className="text-sm text-muted-foreground">
                      Percentual de despesas em relação à receita total
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Índice de Comissões</h3>
                    <div className="text-2xl font-bold">{indicators.commission_ratio.toFixed(2)}%</div>
                    <p className="text-sm text-muted-foreground">
                      Percentual de comissões em relação à receita total
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Média Diária de Receitas</h3>
                    <div className="text-2xl font-bold">{formatCurrency(indicators.average_daily_income)}</div>
                    <p className="text-sm text-muted-foreground">
                      Valor médio de receitas por dia no período
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Média Diária de Despesas</h3>
                    <div className="text-2xl font-bold">{formatCurrency(indicators.average_daily_expense)}</div>
                    <p className="text-sm text-muted-foreground">
                      Valor médio de despesas por dia no período
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Média Diária de Lucro</h3>
                    <div className="text-2xl font-bold">{formatCurrency(indicators.average_daily_profit)}</div>
                    <p className="text-sm text-muted-foreground">
                      Valor médio de lucro por dia no período
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transações Financeiras</CardTitle>
                <CardDescription>
                  Período: {formatDate(report.period.start)} a {formatDate(report.period.end)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Criado por</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                        <TableCell>
                          {transaction.type === 'income' && 'Receita'}
                          {transaction.type === 'expense' && 'Despesa'}
                          {transaction.type === 'commission' && 'Comissão'}
                        </TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell>{transaction.creator?.name || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}