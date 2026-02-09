import { LogIn, LogOut, Clock, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWalkInStats } from '@/hooks/useWalkInStats';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';

export function WalkInStatsWidget() {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useWalkInStats();

  if (isLoading) {
    return <Skeleton className="h-[320px] rounded-2xl" />;
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
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <UserX className="h-5 w-5 text-accent" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Visiteurs sans invitation</h3>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-muted text-muted-foreground uppercase tracking-wider">CNI</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-1 p-4 rounded-xl bg-success/5 border border-success/10 group hover:bg-success/10 transition-colors">
          <div className="flex items-center justify-between">
            <LogIn className="h-4 w-4 text-success" />
            <span className="text-2xl font-black text-success tabular-nums">{entries}</span>
          </div>
          <p className="text-xs font-bold text-success/60 uppercase tracking-widest mt-1">Entrées</p>
        </div>
        <div className="flex flex-col gap-1 p-4 rounded-xl bg-accent/5 border border-accent/10 group hover:bg-accent/10 transition-colors">
          <div className="flex items-center justify-between">
            <LogOut className="h-4 w-4 text-accent" />
            <span className="text-2xl font-black text-accent tabular-nums">{exits}</span>
          </div>
          <p className="text-xs font-bold text-accent/60 uppercase tracking-widest mt-1">Sorties</p>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-sm font-bold text-muted-foreground">Ratio sortie/entrée</span>
            <span className="text-lg font-black">{exitRatio}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-success to-accent transition-all duration-1000 ease-out"
              style={{ width: `${exitRatio}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between p-4 rounded-xl bg-warning/5 border border-warning/10 hover:bg-warning/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <UserX className="h-4 w-4 text-warning" />
              </div>
              <span className="text-sm font-bold">Sorties en attente</span>
            </div>
            <span className="text-xl font-black text-warning tabular-nums">{pending}</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-bold">Durée moyenne</span>
            </div>
            <span className="text-xl font-black tabular-nums">{formatDuration(stats?.averageStayMinutes ?? null)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
