import { useNavigate } from 'react-router-dom';
import { QrCode, LogIn, LogOut, Clock } from 'lucide-react';
import { StatCard } from './StatCard';
import { useGuardianStats } from '@/hooks/useRoleStats';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export function GuardianDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useGuardianStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord Gardien</h1>
        <p className="text-muted-foreground mt-1">
          Scannez les QR codes et enregistrez les accès
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </>
        ) : (
          <>
            <StatCard
              title="Scans aujourd'hui"
              value={stats?.todayScansCount || 0}
              icon={QrCode}
              variant="primary"
            />
            <StatCard
              title="Entrées"
              value={stats?.todayEntriesCount || 0}
              icon={LogIn}
              variant="success"
            />
            <StatCard
              title="Sorties"
              value={stats?.todayExitsCount || 0}
              icon={LogOut}
              variant="accent"
            />
            <StatCard
              title="Présents"
              value={(stats?.todayEntriesCount || 0) - (stats?.todayExitsCount || 0)}
              icon={Clock}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {isLoading ? (
          <Skeleton className="h-[380px] rounded-xl" />
        ) : (
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Scans des 7 derniers jours</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats?.weeklyScansData || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="scans" 
                  name="Scans"
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/scan')}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors text-left group"
            >
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Scanner un QR Code</p>
                <p className="text-sm text-muted-foreground">Valider un accès</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/access-history')}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-accent/5 border border-accent/20 hover:bg-accent/10 transition-colors text-left group"
            >
              <div className="p-3 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium">Historique des accès</p>
                <p className="text-sm text-muted-foreground">Consulter les derniers scans</p>
              </div>
            </button>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-success/10 border border-success/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <LogIn className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-success">Personnes sur site</p>
                <p className="text-2xl font-bold">
                  {(stats?.todayEntriesCount || 0) - (stats?.todayExitsCount || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
