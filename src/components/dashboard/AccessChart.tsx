import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface AccessChartProps {
  data: { date: string; entries: number; exits: number }[];
}

export function AccessChart({ data }: AccessChartProps) {
  return (
    <div className="lg:col-span-2 glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Statistiques d'accès (7 derniers jours)</h3>
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="date" 
              className="text-xs fill-muted-foreground"
              tick={{ fill: 'hsl(215, 16%, 47%)' }}
            />
            <YAxis 
              className="text-xs fill-muted-foreground"
              tick={{ fill: 'hsl(215, 16%, 47%)' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(214, 32%, 91%)',
                borderRadius: '0.5rem'
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="entries"
              name="Entrées"
              stroke="hsl(142, 76%, 36%)"
              fillOpacity={1}
              fill="url(#colorEntries)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="exits"
              name="Sorties"
              stroke="hsl(38, 92%, 50%)"
              fillOpacity={1}
              fill="url(#colorExits)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
