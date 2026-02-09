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

import { useTranslation } from 'react-i18next';

export function ManagerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useManagerStats();
  const { data: recentLogs, isLoading: activityLoading } = useRecentActivity(5);

  const activities = (recentLogs || []).map(log => ({
    id: log.id,
    type: log.action_type as 'entry' | 'exit' | 'invitation',
    userName: log.user_profile
      ? `${log.user_profile.first_name} ${log.user_profile.last_name}`
      : log.invitation?.visitor_name || t('common.unknown'),
    siteName: log.site?.name || 'N/A',
    timestamp: formatDistanceToNow(new Date(log.timestamp), { addSuffix: false, locale: fr })
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-black tracking-tight gradient-text">
          {t('dashboard.manager_title', 'Tableau de bord Gestionnaire')}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {t('dashboard.manager_subtitle', 'Gérez votre site, entreprises et gardiens')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
        ) : (
          <>
            <StatCard
              title={t('common.companies', 'Entreprises')}
              value={stats?.companiesCount || 0}
              icon={Building2}
              variant="primary"
            />
            <StatCard
              title={t('common.total_employees', 'Employés total')}
              value={stats?.employeesCount || 0}
              icon={Users}
            />
            <StatCard
              title={t('common.guardians', 'Gardiens')}
              value={stats?.guardiansCount || 0}
              icon={Shield}
              variant="accent"
            />
            <StatCard
              title={t('dashboard.today_access', 'Accès aujourd\'hui')}
              value={stats?.todayAccessCount || 0}
              icon={Clock}
              variant="success"
            />
          </>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          {statsLoading ? (
            <Skeleton className="h-[380px] rounded-xl" />
          ) : (
            <AccessChart data={stats?.weeklyAccessData || []} />
          )}
        </div>

        <div className="h-full">
          {activityLoading ? (
            <Skeleton className="h-[430px] rounded-2xl" />
          ) : (
            <RecentActivity activities={activities} />
          )}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-xl font-bold tracking-tight mb-8">{t('common.quick_actions', 'Actions rapides')}</h3>
        <div className="grid gap-6 md:grid-cols-3">
          <button
            onClick={() => navigate('/manager/companies')}
            className="group flex items-center gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 text-left"
          >
            <div className="p-3.5 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform shadow-inner">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-base">{t('common.companies', 'Entreprises')}</p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">{t('dashboard.manage_companies', 'Gérer les entreprises')}</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/manager/guardians')}
            className="group flex items-center gap-4 p-5 rounded-2xl bg-accent/5 border border-accent/10 hover:bg-accent/10 hover:border-accent/30 transition-all duration-300 text-left"
          >
            <div className="p-3.5 rounded-xl bg-accent/10 group-hover:scale-110 transition-transform shadow-inner">
              <Shield className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="font-bold text-base">{t('common.guardians', 'Gardiens')}</p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">{t('dashboard.manage_guardians', 'Gérer les gardiens')}</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/access-history')}
            className="group flex items-center gap-4 p-5 rounded-2xl bg-success/5 border border-success/10 hover:bg-success/10 hover:border-success/30 transition-all duration-300 text-left"
          >
            <div className="p-3.5 rounded-xl bg-success/10 group-hover:scale-110 transition-transform shadow-inner">
              <Clock className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="font-bold text-base">{t('common.history', 'Historique')}</p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">{t('dashboard.view_access_history', 'Voir les accès')}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
