import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DailyData {
  date: string;
  entries: number;
  exits: number;
  employees: number;
  visitors: number;
}

interface DailyTrendChartProps {
  data: DailyData[];
  isLoading?: boolean;
}

import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';

export function DailyTrendChart({ data, isLoading }: DailyTrendChartProps) {
  const { t } = useTranslation();

  const chartData = data.map(item => ({
    ...item,
    name: format(parseISO(item.date), 'dd MMM', { locale: fr }),
    total: item.entries + item.exits,
  }));

  if (isLoading) {
    return <Skeleton className="h-[430px] rounded-2xl" />;
  }

  return (
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Évolution des accès</h3>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-muted text-muted-foreground uppercase tracking-wider">7 derniers jours</span>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
              }}
            />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            <Line
              type="monotone"
              dataKey="employees"
              name={t('common.employees', 'Employés')}
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4, stroke: 'hsl(var(--background))' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="visitors"
              name={t('common.visitors', 'Visiteurs')}
              stroke="hsl(var(--accent))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4, stroke: 'hsl(var(--background))' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
