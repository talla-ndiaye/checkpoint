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

export function SiteComparisonChart({ data, isLoading }: SiteComparisonChartProps) {
  const chartData = data.map(item => ({
    name: item.siteName.length > 15 ? item.siteName.substring(0, 15) + '...' : item.siteName,
    fullName: item.siteName,
    employés: item.employeeAccess,
    visiteurs: item.visitorAccess,
    total: item.totalAccess,
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Comparaison des sites
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Comparaison des sites
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-muted-foreground">Aucune donnée disponible</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Comparaison des sites
        </CardTitle>
        <CardDescription>
          Volume d'accès par site (7 derniers jours)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                type="number"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                type="category"
                dataKey="name"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [value, name]}
                labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
              />
              <Legend />
              <Bar 
                dataKey="employés" 
                name="Employés" 
                fill="hsl(var(--primary))" 
                radius={[0, 4, 4, 0]}
                stackId="a"
              />
              <Bar 
                dataKey="visiteurs" 
                name="Visiteurs" 
                fill="hsl(var(--muted-foreground))" 
                radius={[0, 4, 4, 0]}
                stackId="a"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
