import { LogIn, LogOut, Clock, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWalkInStats } from '@/hooks/useWalkInStats';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

export function WalkInStatsWidget() {
  const { data: stats, isLoading } = useWalkInStats();

  if (isLoading) {
    return <Skeleton className="h-[280px] rounded-xl" />;
  }

  const entries = stats?.todayEntries || 0;
  const exits = stats?.todayExits || 0;
  const pending = stats?.pendingExits || 0;
  const exitRatio = entries > 0 ? Math.round((exits / entries) * 100) : 0;

  const formatDuration = (minutes: number | null) => {
    if (minutes === null) return '—';
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}min`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Visiteurs sans invitation (CNI)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
            <LogIn className="h-5 w-5 text-success" />
            <div>
              <p className="text-2xl font-bold">{entries}</p>
              <p className="text-xs text-muted-foreground">Entrées</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
            <LogOut className="h-5 w-5 text-accent" />
            <div>
              <p className="text-2xl font-bold">{exits}</p>
              <p className="text-xs text-muted-foreground">Sorties</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ratio sortie/entrée</span>
            <span className="font-medium">{exitRatio}%</span>
          </div>
          <Progress value={exitRatio} className="h-2" />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
          <div className="flex items-center gap-2">
            <UserX className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium">Sorties en attente</span>
          </div>
          <span className="text-lg font-bold text-warning">{pending}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Durée moyenne de séjour</span>
          </div>
          <span className="text-lg font-bold">{formatDuration(stats?.averageStayMinutes ?? null)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
