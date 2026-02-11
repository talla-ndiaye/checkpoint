import { useNavigate } from 'react-router-dom';
import { CalendarPlus, Clock, CheckCircle, QrCode, UserPlus } from 'lucide-react';
import { StatCard } from './StatCard';
import { useEmployeeStats } from '@/hooks/useRoleStats';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export function EmployeeDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: stats, isLoading } = useEmployeeStats();

  const statusLabels: Record<string, string> = {
    pending: t('common.pending'),
    approved: t('common.approved'),
    used: t('common.used'),
    expired: t('common.expired'),
    cancelled: t('common.cancelled')
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    approved: 'bg-primary/10 text-primary border-primary/20',
    used: 'bg-success/10 text-success border-success/20',
    expired: 'bg-muted text-muted-foreground',
    cancelled: 'bg-destructive/10 text-destructive border-destructive/20'
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-black tracking-tight gradient-text">
          {t('dashboard.employee_title', 'Mon espace employé')}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {t('dashboard.employee_subtitle', 'Gérez vos invitations et consultez vos accès')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
        ) : (
          <>
            <StatCard
              title={t('dashboard.my_invitations', 'Mes invitations')}
              value={stats?.myInvitationsCount || 0}
              icon={CalendarPlus}
              variant="primary"
            />
            <StatCard
              title={t('common.pending', 'En attente')}
              value={stats?.pendingInvitationsCount || 0}
              icon={Clock}
              variant="accent"
            />
            <StatCard
              title={t('common.used', 'Utilisées')}
              value={stats?.usedInvitationsCount || 0}
              icon={CheckCircle}
              variant="success"
            />
            <StatCard
              title={t('dashboard.my_access', 'Mes accès')}
              value={stats?.myAccessCount || 0}
              icon={QrCode}
            />
          </>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">{t('dashboard.recent_invitations', 'Invitations récentes')}</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/invitations')}
              className="text-primary hover:text-primary hover:bg-primary/10 font-bold"
            >
              {t('common.view_all', 'Voir tout')}
            </Button>
          </div>

          <div className="flex-1 space-y-3">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
            ) : stats?.recentInvitations && stats.recentInvitations.length > 0 ? (
              <div className="space-y-3">
                {stats.recentInvitations.map((inv, index) => (
                  <div
                    key={index}
                    className="group flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 hover:border-primary/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UserPlus className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-base truncate">{inv.visitorName}</p>
                        <p className="text-xs text-muted-foreground/80 mt-0.5">
                          {format(new Date(inv.visitDate), 'dd MMMM yyyy', { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`px-2.5 py-0.5 rounded-full border shadow-sm font-bold text-xs ${statusColors[inv.status]}`}>
                      {statusLabels[inv.status] || inv.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 opacity-40">
                <CalendarPlus className="h-12 w-12 mb-3" />
                <p className="font-medium text-sm">
                  {t('dashboard.no_recent_invitations', 'Aucune invitation récente')}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xl font-bold tracking-tight mb-8">{t('common.quick_actions', 'Actions rapides')}</h3>
          <div className="grid gap-4">
            <button
              onClick={() => navigate('/my-qr')}
              className="group w-full flex items-center gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 text-left"
            >
              <div className="p-3.5 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform shadow-inner">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-base">{t('dashboard.my_qr_code', 'Mon QR Code')}</p>
                <p className="text-xs text-muted-foreground/80 mt-0.5">{t('dashboard.my_qr_code_description', 'Afficher mon code d\'accès')}</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/invitations')}
              className="group w-full flex items-center gap-4 p-5 rounded-2xl bg-accent/5 border border-accent/10 hover:bg-accent/10 hover:border-accent/30 transition-all duration-300 text-left"
            >
              <div className="p-3.5 rounded-xl bg-accent/10 group-hover:scale-110 transition-transform shadow-inner">
                <CalendarPlus className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-bold text-base">{t('dashboard.create_invitation', 'Créer une invitation')}</p>
                <p className="text-xs text-muted-foreground/80 mt-0.5">{t('dashboard.create_invitation_description', 'Inviter un visiteur')}</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/access-history')}
              className="group w-full flex items-center gap-4 p-5 rounded-2xl bg-success/5 border border-success/10 hover:bg-success/10 hover:border-success/30 transition-all duration-300 text-left"
            >
              <div className="p-3.5 rounded-xl bg-success/10 group-hover:scale-110 transition-transform shadow-inner">
                <Clock className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="font-bold text-base">{t('dashboard.my_access', 'Mes accès')}</p>
                <p className="text-xs text-muted-foreground/80 mt-0.5">{t('dashboard.my_access_description', 'Consulter mon historique')}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
