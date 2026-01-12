import { useNavigate } from 'react-router-dom';
import { Building2, Users, Shield, Clock } from 'lucide-react';
import { StatCard } from './StatCard';
import { AccessChart } from './AccessChart';
import { RecentActivity } from './RecentActivity';
import { useManagerStats } from '@/hooks/useRoleStats';
import { useRecentActivity } from '@/hooks/useAccessLogs';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export function ManagerDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useManagerStats();
  const { data: recentLogs, isLoading: activityLoading } = useRecentActivity(5);

  const activities = (recentLogs || []).map(log => ({
    id: log.id,
    type: log.action_type as 'entry' | 'exit' | 'invitation',
    userName: log.user_profile 
      ? `${log.user_profile.first_name} ${log.user_profile.last_name}`
      : log.invitation?.visitor_name || 'Inconnu',
    siteName: log.site?.name || 'N/A',
    timestamp: formatDistanceToNow(new Date(log.timestamp), { addSuffix: false, locale: fr })
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord Gestionnaire</h1>
        <p className="text-muted-foreground mt-1">
          Gérez votre site, entreprises et gardiens
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </>
        ) : (
          <>
            <StatCard
              title="Entreprises"
              value={stats?.companiesCount || 0}
              icon={Building2}
              variant="primary"
            />
            <StatCard
              title="Employés total"
              value={stats?.employeesCount || 0}
              icon={Users}
            />
            <StatCard
              title="Gardiens"
              value={stats?.guardiansCount || 0}
              icon={Shield}
              variant="accent"
            />
            <StatCard
              title="Accès aujourd'hui"
              value={stats?.todayAccessCount || 0}
              icon={Clock}
              variant="success"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {statsLoading ? (
          <Skeleton className="lg:col-span-2 h-[380px] rounded-xl" />
        ) : (
          <AccessChart data={stats?.weeklyAccessData || []} />
        )}

        {activityLoading ? (
          <Skeleton className="h-[380px] rounded-xl" />
        ) : (
          <RecentActivity activities={activities} />
        )}
      </div>

      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <button 
            onClick={() => navigate('/manager/companies')}
            className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors text-left group"
          >
            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Entreprises</p>
              <p className="text-sm text-muted-foreground">Gérer les entreprises</p>
            </div>
          </button>
          <button 
            onClick={() => navigate('/manager/guardians')}
            className="flex items-center gap-4 p-4 rounded-xl bg-accent/5 border border-accent/20 hover:bg-accent/10 transition-colors text-left group"
          >
            <div className="p-3 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-medium">Gardiens</p>
              <p className="text-sm text-muted-foreground">Gérer les gardiens</p>
            </div>
          </button>
          <button 
            onClick={() => navigate('/access-history')}
            className="flex items-center gap-4 p-4 rounded-xl bg-success/5 border border-success/20 hover:bg-success/10 transition-colors text-left group"
          >
            <div className="p-3 rounded-xl bg-success/10 group-hover:bg-success/20 transition-colors">
              <Clock className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="font-medium">Historique</p>
              <p className="text-sm text-muted-foreground">Voir les accès</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
