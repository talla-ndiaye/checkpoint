import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Clock } from 'lucide-react';

interface PeakHour {
  hour: number;
  count: number;
  label: string;
}

interface PeakHoursCardProps {
  peakHours: PeakHour[];
  isLoading?: boolean;
}

export function PeakHoursCard({ peakHours, isLoading }: PeakHoursCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Heures de pointe
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[150px]">
          <div className="animate-pulse text-muted-foreground">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  if (peakHours.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Heures de pointe
          </CardTitle>
          <CardDescription>Aujourd'hui</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[150px]">
          <div className="text-muted-foreground text-center">
            Pas encore d'activité aujourd'hui
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Heures de pointe
        </CardTitle>
        <CardDescription>Périodes les plus actives aujourd'hui</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {peakHours.map((peak, index) => (
            <div 
              key={peak.hour}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <Badge 
                  variant={index === 0 ? "default" : "secondary"}
                  className="h-8 w-8 rounded-full flex items-center justify-center p-0"
                >
                  {index + 1}
                </Badge>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{peak.label}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{peak.count}</span>
                <span className="text-sm text-muted-foreground">accès</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
