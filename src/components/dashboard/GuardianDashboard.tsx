import { useNavigate } from 'react-router-dom';
import { Scan, LogIn, LogOut, Users, ShieldCheck } from 'lucide-react';
import { StatCard } from './StatCard';
import { WalkInStatsWidget } from './WalkInStatsWidget';
import { useGuardianStats } from '@/hooks/useRoleStats';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';

export function GuardianDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: stats, isLoading } = useGuardianStats();

  const chartData = stats?.weeklyScansData.map(item => ({
    name: item.date,
    access: item.scans,
  })) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-black tracking-tight gradient-text">
          {t('guardian.dashboard_title', 'Tableau de bord Gardien')}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {t('guardian.dashboard_subtitle', 'Suivi des accès en temps réel')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
        ) : (
          <>
            <StatCard
              title={t('guardian.scans_today', 'Scans aujourd\'hui')}
              value={stats?.todayScansCount || 0}
              icon={Scan}
              variant="primary"
            />
            <StatCard
              title={t('guardian.entries', 'Entrées')}
              value={stats?.todayEntriesCount || 0}
              icon={LogIn}
              variant="success"
            />
            <StatCard
              title={t('guardian.exits', 'Sorties')}
              value={stats?.todayExitsCount || 0}
              icon={LogOut}
              variant="accent"
            />
            <StatCard
              title={t('guardian.on_site', 'Sur site')}
              value={(stats?.todayEntriesCount || 0) - (stats?.todayExitsCount || 0)}
              icon={Users}
            />
          </>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card rounded-2xl p-6 h-[400px]">
            <h3 className="text-xl font-bold tracking-tight mb-8">
              {t('guardian.weekly_activity', 'Activité des 7 derniers jours')}
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" vertical={false} />
                  <XAxis
                    dataKey="name"
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
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                    }}
                    cursor={{ fill: 'hsl(var(--primary)/0.05)' }}
                  />
                  <Bar
                    dataKey="access"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                    name={t('common.access', 'Accès')}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <WalkInStatsWidget />
        </div>

        <div className="glass-card rounded-2xl p-6 h-fit">
          <h3 className="text-xl font-bold tracking-tight mb-8">{t('common.quick_actions', 'Actions rapides')}</h3>
          <div className="grid gap-4">
            <button
              onClick={() => navigate('/scan')}
              className="group w-full flex items-center gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 text-left"
            >
              <div className="p-3.5 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform shadow-inner">
                <Scan className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-base">{t('guardian.scan_title', 'Scanner QR Code')}</p>
                <p className="text-xs text-muted-foreground/80 mt-0.5">{t('guardian.scan_description', 'Scanner un code d\'accès')}</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/scan/id-card')}
              className="group w-full flex items-center gap-4 p-5 rounded-2xl bg-accent/5 border border-accent/10 hover:bg-accent/10 hover:border-accent/30 transition-all duration-300 text-left"
            >
              <div className="p-3.5 rounded-xl bg-accent/10 group-hover:scale-110 transition-transform shadow-inner">
                <ShieldCheck className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-bold text-base">{t('guardian.id_card_scan_title', 'Scanner CNI')}</p>
                <p className="text-xs text-muted-foreground/80 mt-0.5">{t('guardian.id_card_scan_description', 'Enregistrer un visiteur sans invitation')}</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/scan/bulk-exit')}
              className="group w-full flex items-center gap-4 p-5 rounded-2xl bg-warning/5 border border-warning/10 hover:bg-warning/10 hover:border-warning/30 transition-all duration-300 text-left"
            >
              <div className="p-3.5 rounded-xl bg-warning/10 group-hover:scale-110 transition-transform shadow-inner">
                <LogOut className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="font-bold text-base">{t('guardian.bulk_exit_title', 'Sortie groupée')}</p>
                <p className="text-xs text-muted-foreground/80 mt-0.5">{t('guardian.bulk_exit_description', 'Valider plusieurs sorties')}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
