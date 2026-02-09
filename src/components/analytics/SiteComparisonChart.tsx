import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

interface SiteComparison {
  siteId: string;
  siteName: string;
  totalAccess: number;
  entries: number;
  exits: number;
  employeeAccess: number;
  visitorAccess: number;
}

interface SiteComparisonChartProps {
  data: SiteComparison[];
  isLoading?: boolean;
}

import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';

export function SiteComparisonChart({ data, isLoading }: SiteComparisonChartProps) {
  const { t } = useTranslation();

  const chartData = data.map(item => ({
    name: item.siteName.length > 20 ? item.siteName.substring(0, 18) + '...' : item.siteName,
    fullName: item.siteName,
    employés: item.employeeAccess,
    visiteurs: item.visitorAccess,
    total: item.totalAccess,
  }));

  if (isLoading) {
    return <Skeleton className="h-[430px] rounded-2xl" />;
  }

  if (data.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 h-[430px] flex flex-col items-center justify-center opacity-40">
        <Building2 className="h-12 w-12 mb-3" />
        <p className="font-medium">{t('common.no_data', 'Aucune donnée disponible')}</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Comparaison des sites</h3>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-muted text-muted-foreground uppercase tracking-wider">7 derniers jours</span>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" horizontal={false} />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              dx={-5}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
              }}
              formatter={(value, name) => [value, name]}
              labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
              cursor={{ fill: 'hsl(var(--primary)/0.05)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            <Bar
              dataKey="employés"
              name={t('common.employees', 'Employés')}
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
              stackId="a"
              barSize={32}
            />
            <Bar
              dataKey="visiteurs"
              name={t('common.visitors', 'Visiteurs')}
              fill="hsl(var(--accent))"
              radius={[0, 4, 4, 0]}
              stackId="a"
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
