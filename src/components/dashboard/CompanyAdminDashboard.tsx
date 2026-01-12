import { useNavigate } from 'react-router-dom';
import { Users, CalendarPlus, CheckCircle, Clock } from 'lucide-react';
import { StatCard } from './StatCard';
import { useCompanyAdminStats } from '@/hooks/useRoleStats';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export function CompanyAdminDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useCompanyAdminStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord Admin Entreprise</h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos employés et suivez les invitations
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
              title="Employés"
              value={stats?.employeesCount || 0}
              icon={Users}
              variant="primary"
            />
            <StatCard
              title="Invitations actives"
              value={stats?.activeInvitationsCount || 0}
              icon={CalendarPlus}
              variant="accent"
            />
            <StatCard
              title="Accès aujourd'hui"
              value={stats?.todayAccessCount || 0}
              icon={Clock}
              variant="success"
            />
            <StatCard
              title="Taux utilisation"
              value={stats?.employeesCount 
                ? `${Math.round((stats.todayAccessCount / stats.employeesCount) * 100)}%`
                : '0%'}
              icon={CheckCircle}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {isLoading ? (
          <Skeleton className="h-[380px] rounded-xl" />
        ) : (
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Invitations des 7 derniers jours</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={stats?.weeklyInvitationsData || []}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUsed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Legend />
                <Area
                  type="monotone"
                  dataKey="created"
                  name="Créées"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorCreated)"
                />
                <Area
                  type="monotone"
                  dataKey="used"
                  name="Utilisées"
                  stroke="hsl(var(--success))"
                  fillOpacity={1}
                  fill="url(#colorUsed)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/employees')}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors text-left group"
            >
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Gérer les employés</p>
                <p className="text-sm text-muted-foreground">Ajouter, modifier ou supprimer</p>
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
                <p className="text-sm text-muted-foreground">Consulter les entrées/sorties</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/reports')}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-success/5 border border-success/20 hover:bg-success/10 transition-colors text-left group"
            >
              <div className="p-3 rounded-xl bg-success/10 group-hover:bg-success/20 transition-colors">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium">Rapports</p>
                <p className="text-sm text-muted-foreground">Générer des rapports</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
