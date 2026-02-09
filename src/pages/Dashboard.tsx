import { useNavigate } from 'react-router-dom';
import { Building2, Users, Shield, CalendarPlus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { AccessChart } from '@/components/dashboard/AccessChart';
import { ManagerDashboard } from '@/components/dashboard/ManagerDashboard';
import { CompanyAdminDashboard } from '@/components/dashboard/CompanyAdminDashboard';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';
import { GuardianDashboard } from '@/components/dashboard/GuardianDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useRecentActivity } from '@/hooks/useAccessLogs';
import { useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const currentLocale = i18n.language === 'en' ? enUS : fr;
  const { user, loading, userRole } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentLogs, isLoading: activityLoading } = useRecentActivity(5);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Transform recent logs to activity format
  const activities = (recentLogs || []).map(log => ({
    id: log.id,
    type: log.action_type as 'entry' | 'exit' | 'invitation',
    userName: log.user_profile
      ? `${log.user_profile.first_name} ${log.user_profile.last_name}`
      : log.invitation?.visitor_name || t('common.unknown'),
    siteName: log.site?.name || t('common.undefined'),
    timestamp: formatDistanceToNow(new Date(log.timestamp), { addSuffix: false, locale: currentLocale })
  }));

  // Render role-specific dashboard
  const renderDashboardContent = () => {
    switch (userRole) {
      case 'manager':
        return <ManagerDashboard />;
      case 'company_admin':
        return <CompanyAdminDashboard />;
      case 'employee':
        return <EmployeeDashboard />;
      case 'guardian':
        return <GuardianDashboard />;
      case 'super_admin':
      default:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
              <p className="text-muted-foreground mt-1">
                {t('dashboard.subtitle')}
              </p>
            </div>

            {/* Stats Grid */}
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
                    title={t('dashboard.active_sites')}
                    value={stats?.sitesCount || 0}
                    icon={Building2}
                    variant="primary"
                  />
                  <StatCard
                    title={t('dashboard.employees')}
                    value={stats?.usersCount || 0}
                    icon={Users}
                  />
                  <StatCard
                    title={t('dashboard.today_access')}
                    value={stats?.todayAccessCount || 0}
                    icon={Shield}
                    variant="accent"
                  />
                  <StatCard
                    title={t('dashboard.active_invitations')}
                    value={stats?.activeInvitationsCount || 0}
                    icon={CalendarPlus}
                    variant="success"
                  />
                </>
              )}
            </div>

            {/* Charts and Activity */}
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

            {/* Quick Actions */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">{t('dashboard.quick_actions')}</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <button
                  onClick={() => navigate('/admin/sites')}
                  className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors text-left group"
                >
                  <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{t('dashboard.manage_sites')}</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.view_all_sites')}</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/manager/companies')}
                  className="flex items-center gap-4 p-4 rounded-xl bg-accent/5 border border-accent/20 hover:bg-accent/10 transition-colors text-left group"
                >
                  <div className="p-3 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">{t('common.companies')}</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.manage_companies_desc')}</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/access-history')}
                  className="flex items-center gap-4 p-4 rounded-xl bg-success/5 border border-success/20 hover:bg-success/10 transition-colors text-left group"
                >
                  <div className="p-3 rounded-xl bg-success/10 group-hover:bg-success/20 transition-colors">
                    <Shield className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">{t('common.history')}</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.view_access')}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      {renderDashboardContent()}
    </DashboardLayout>
  );
}
