import { useNavigate } from 'react-router-dom';
import { Building2, Users, Shield, Clock, Activity, ArrowRight } from 'lucide-react';
import { StatCard } from './StatCard';
import { AccessChart } from './AccessChart';
import { RecentActivity } from './RecentActivity';
import { useManagerStats } from '@/hooks/useRoleStats';
import { useRecentActivity } from '@/hooks/useAccessLogs';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

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
      {/* Header with live badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight gradient-text">
            {t('dashboard.manager_title', 'Tableau de bord Gestionnaire')}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {t('dashboard.manager_subtitle', 'Gérez votre site, entreprises et gardiens')}
          </p>
        </div>
        <div className="live-badge self-start md:self-center">
          <Activity className="h-3.5 w-3.5" />
          EN DIRECT
        </div>
      </div>

      {/* Stats Cards with staggered animation */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
        ) : (
          <>
            <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
              <StatCard
                title={t('common.companies', 'Entreprises')}
                value={stats?.companiesCount || 0}
                icon={Building2}
                variant="primary"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '80ms' }}>
              <StatCard
                title={t('common.total_employees', 'Employés total')}
                value={stats?.employeesCount || 0}
                icon={Users}
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '160ms' }}>
              <StatCard
                title={t('common.guardians', 'Gardiens')}
                value={stats?.guardiansCount || 0}
                icon={Shield}
                variant="accent"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '240ms' }}>
              <StatCard
                title={t('dashboard.today_access', 'Accès aujourd\'hui')}
                value={stats?.todayAccessCount || 0}
                icon={Clock}
                variant="success"
              />
            </div>
          </>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card rounded-2xl p-6 h-[400px] animate-slide-up" style={{ animationDelay: '300ms' }}>
            <h3 className="text-xl font-bold tracking-tight mb-8">
              {t('dashboard.weekly_access', 'Accès hebdomadaires')}
            </h3>
            <div className="h-[300px]">
              {statsLoading ? (
                <Skeleton className="h-full w-full rounded-xl" />
              ) : (
                <AccessChart data={stats?.weeklyAccessData || []} />
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          {activityLoading ? (
            <Skeleton className="h-[400px] rounded-2xl" />
          ) : (
            <RecentActivity activities={activities} />
          )}
        </div>
      </div>

      {/* Quick Actions - Revamped grid */}
      <div className="glass-card rounded-3xl p-8 animate-slide-up" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black tracking-tight">{t('common.quick_actions', 'Actions rapides')}</h3>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <button
            onClick={() => navigate('/manager/companies')}
            className="group relative overflow-hidden p-6 rounded-2xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-all duration-300 text-left"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Building2 className="h-24 w-24 -mr-8 -mt-8 rotate-12" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="p-3.5 rounded-xl bg-primary/10 w-fit group-hover:scale-110 transition-transform">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="mt-6">
                <p className="font-black text-lg">{t('common.companies', 'Entreprises')}</p>
                <p className="text-sm text-muted-foreground/80 mt-1">{t('dashboard.manage_companies', 'Gérer les entreprises partenaires')}</p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-primary font-bold text-sm">
                Gérer <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/manager/guardians')}
            className="group relative overflow-hidden p-6 rounded-2xl bg-accent/5 border border-accent/10 hover:border-accent/30 transition-all duration-300 text-left"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Shield className="h-24 w-24 -mr-8 -mt-8 rotate-12" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="p-3.5 rounded-xl bg-accent/10 w-fit group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <div className="mt-6">
                <p className="font-black text-lg">{t('common.guardians', 'Gardiens')}</p>
                <p className="text-sm text-muted-foreground/80 mt-1">{t('dashboard.manage_guardians', 'Gérer le personnel de sécurité')}</p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-accent font-bold text-sm">
                Gérer <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/access-history')}
            className="group relative overflow-hidden p-6 rounded-2xl bg-success/5 border border-success/10 hover:border-success/30 transition-all duration-300 text-left"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock className="h-24 w-24 -mr-8 -mt-8 rotate-12" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="p-3.5 rounded-xl bg-success/10 w-fit group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-success" />
              </div>
              <div className="mt-6">
                <p className="font-black text-lg">{t('common.history', 'Historique')}</p>
                <p className="text-sm text-muted-foreground/80 mt-1">{t('dashboard.view_access_history', 'Voir les entrées et sorties')}</p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-success font-bold text-sm">
                Consulter <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
