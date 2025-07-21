import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { BarChartIcon, LineChartIcon, PieChartIcon } from 'lucide-react';

// Tipos de gráficos suportados
type ChartType = 'bar' | 'line' | 'pie' | 'area';

// Dados para o gráfico
interface ChartData {
  [key: string]: string | number;
}

// Configuração de série
interface Series {
  dataKey: string;
  name?: string;
  color?: string;
  type?: 'bar' | 'line' | 'area';
}

// Propriedades do componente
interface FinancialChartProps {
  title: string;
  description?: string;
  data: ChartData[];
  type: ChartType;
  series: Series[];
  height?: number | string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  stacked?: boolean;
  colors?: string[];
  xAxisDataKey?: string;
  currencyFormat?: boolean;
  percentFormat?: boolean;
}

// Cores padrão para os gráficos
const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

export default function FinancialChart({
  title,
  description,
  data,
  type,
  series,
  height = 300,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  stacked = false,
  colors = DEFAULT_COLORS,
  xAxisDataKey = 'name',
  currencyFormat = false,
  percentFormat = false,
}: FinancialChartProps) {
  // Formatar valores para o tooltip
  const formatValue = (value: number) => {
    if (currencyFormat) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }
    
    if (percentFormat) {
      return `${value.toFixed(2)}%`;
    }
    
    return value;
  };

  // Renderizar o gráfico apropriado com base no tipo
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxisDataKey} />
              <YAxis />
              {showTooltip && <Tooltip formatter={(value) => formatValue(Number(value))} />}
              {showLegend && <Legend />}
              {series.map((s, index) => (
                <Bar 
                  key={s.dataKey} 
                  dataKey={s.dataKey} 
                  name={s.name || s.dataKey} 
                  fill={s.color || colors[index % colors.length]} 
                  stackId={stacked ? 'stack' : undefined}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxisDataKey} />
              <YAxis />
              {showTooltip && <Tooltip formatter={(value) => formatValue(Number(value))} />}
              {showLegend && <Legend />}
              {series.map((s, index) => (
                <Line 
                  key={s.dataKey} 
                  type="monotone" 
                  dataKey={s.dataKey} 
                  name={s.name || s.dataKey} 
                  stroke={s.color || colors[index % colors.length]} 
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey={series[0].dataKey}
                nameKey={xAxisDataKey}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              {showTooltip && <Tooltip formatter={(value) => formatValue(Number(value))} />}
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxisDataKey} />
              <YAxis />
              {showTooltip && <Tooltip formatter={(value) => formatValue(Number(value))} />}
              {showLegend && <Legend />}
              {series.map((s, index) => (
                <Area 
                  key={s.dataKey} 
                  type="monotone" 
                  dataKey={s.dataKey} 
                  name={s.name || s.dataKey} 
                  fill={s.color || colors[index % colors.length]} 
                  stroke={s.color || colors[index % colors.length]}
                  stackId={stacked ? 'stack' : undefined}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
        
      default:
        return <div>Tipo de gráfico não suportado</div>;
    }
  };

  // Ícone do tipo de gráfico
  const renderChartIcon = () => {
    switch (type) {
      case 'bar':
        return <BarChartIcon className="h-4 w-4 text-muted-foreground" />;
      case 'line':
        return <LineChartIcon className="h-4 w-4 text-muted-foreground" />;
      case 'pie':
        return <PieChartIcon className="h-4 w-4 text-muted-foreground" />;
      case 'area':
        return <LineChartIcon className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-0.5">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {renderChartIcon()}
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}