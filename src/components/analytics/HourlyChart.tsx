import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface HourlyData {
  hour: number;
  entries: number;
  exits: number;
  total: number;
}

interface HourlyChartProps {
  data: HourlyData[];
  isLoading?: boolean;
}

export function HourlyChart({ data, isLoading }: HourlyChartProps) {
  const chartData = data.map(item => ({
    ...item,
    name: `${item.hour.toString().padStart(2, '0')}h`,
  }));

  if (isLoading) {
    return <Skeleton className="h-[430px] rounded-2xl" />;
  }

  return (
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Fréquentation horaire</h3>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-muted text-muted-foreground uppercase tracking-wider">Aujourd'hui</span>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
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
              cursor={{ fill: 'hsl(var(--primary)/0.05)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            <Bar
              dataKey="entries"
              name="Entrées"
              fill="hsl(var(--primary))"
              radius={[6, 6, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="exits"
              name="Sorties"
              fill="hsl(var(--muted-foreground))"
              opacity={0.5}
              radius={[6, 6, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
