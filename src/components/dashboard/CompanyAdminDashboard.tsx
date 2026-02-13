import { useNavigate } from 'react-router-dom';
import { Users, CalendarPlus, CheckCircle, Clock, Activity, ArrowRight } from 'lucide-react';
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

import { useTranslation } from 'react-i18next';

export function CompanyAdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: stats, isLoading } = useCompanyAdminStats();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with live badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight gradient-text">
            {t('dashboard.company_admin_title', 'Tableau de bord Admin Entreprise')}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {t('dashboard.company_admin_subtitle', 'Gérez vos employés et suivez les invitations')}
          </p>
        </div>
        <div className="live-badge self-start md:self-center">
          <Activity className="h-3.5 w-3.5" />
          ACTIVE
        </div>
      </div>

      {/* Stats Cards with staggered animation */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
        ) : (
          <>
            <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
              <StatCard
                title={t('common.employees', 'Employés')}
                value={stats?.employeesCount || 0}
                icon={Users}
                variant="primary"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '80ms' }}>
              <StatCard
                title={t('dashboard.active_invitations', 'Invitations actives')}
                value={stats?.activeInvitationsCount || 0}
                icon={CalendarPlus}
                variant="accent"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '160ms' }}>
              <StatCard
                title={t('dashboard.today_access', 'Accès aujourd\'hui')}
                value={stats?.todayAccessCount || 0}
                icon={Clock}
                variant="success"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '240ms' }}>
              <StatCard
                title={t('dashboard.usage_rate', 'Taux utilisation')}
                value={stats?.employeesCount
                  ? `${Math.round((stats.todayAccessCount / stats.employeesCount) * 100)}%`
                  : '0%'}
                icon={CheckCircle}
              />
            </div>
          </>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {isLoading ? (
          <Skeleton className="h-[430px] rounded-2xl" />
        ) : (
          <div className="glass-card rounded-3xl p-6 h-full animate-slide-up" style={{ animationDelay: '300ms' }}>
            <h3 className="text-2xl font-black tracking-tight mb-8">
              {t('dashboard.weekly_invitations', 'Invitations des 7 derniers jours')}
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
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
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '16px',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Area
                    type="monotone"
                    dataKey="created"
                    name={t('common.created', 'Créées')}
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCreated)"
                  />
                  <Area
                    type="monotone"
                    dataKey="used"
                    name={t('common.used', 'Utilisées')}
                    stroke="hsl(var(--success))"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorUsed)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="glass-card rounded-3xl p-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h3 className="text-2xl font-black tracking-tight mb-8 font-black">{t('common.quick_actions', 'Actions rapides')}</h3>
          <div className="grid gap-4">
            <button
              onClick={() => navigate('/employees')}
              className="group relative overflow-hidden p-6 rounded-2xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-all duration-300 text-left"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="h-20 w-20 -mr-6 -mt-6 rotate-12" />
              </div>
              <div className="flex gap-4 items-center">
                <div className="p-3.5 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform shadow-inner">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-black text-lg">{t('dashboard.manage_employees', 'Gérer les employés')}</p>
                  <p className="text-sm text-muted-foreground/80 mt-0.5">{t('dashboard.manage_employees_desc', 'Ajouter, modifier ou supprimer le personnel')}</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/access-history')}
              className="group relative overflow-hidden p-6 rounded-2xl bg-accent/5 border border-accent/10 hover:border-accent/30 transition-all duration-300 text-left"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Clock className="h-20 w-20 -mr-6 -mt-6 rotate-12" />
              </div>
              <div className="flex gap-4 items-center">
                <div className="p-3.5 rounded-xl bg-accent/10 group-hover:scale-110 transition-transform shadow-inner">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-black text-lg">{t('dashboard.access_history', 'Historique des accès')}</p>
                  <p className="text-sm text-muted-foreground/80 mt-0.5">{t('dashboard.access_history_desc', 'Consulter les flux d\'entrées/sorties')}</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="group relative overflow-hidden p-6 rounded-2xl bg-success/5 border border-success/10 hover:border-success/30 transition-all duration-300 text-left"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <CheckCircle className="h-20 w-20 -mr-6 -mt-6 rotate-12" />
              </div>
              <div className="flex gap-4 items-center">
                <div className="p-3.5 rounded-xl bg-success/10 group-hover:scale-110 transition-transform shadow-inner">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="font-black text-lg">{t('common.reports', 'Rapports')}</p>
                  <p className="text-sm text-muted-foreground/80 mt-0.5">{t('dashboard.reports_desc', 'Générer des rapports d\'activité')}</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
