import { useNavigate } from 'react-router-dom';
import { CalendarPlus, Clock, CheckCircle, QrCode, UserPlus, ArrowRight } from 'lucide-react';
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
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight gradient-text">
          {t('dashboard.employee_title', 'Mon espace employé')}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {t('dashboard.employee_subtitle', 'Gérez vos invitations et consultez vos accès')}
        </p>
      </div>

      {/* Stats Cards with staggered animation */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
        ) : (
          <>
            <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
              <StatCard
                title={t('dashboard.my_invitations', 'Mes invitations')}
                value={stats?.myInvitationsCount || 0}
                icon={CalendarPlus}
                variant="primary"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '80ms' }}>
              <StatCard
                title={t('common.pending', 'En attente')}
                value={stats?.pendingInvitationsCount || 0}
                icon={Clock}
                variant="accent"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '160ms' }}>
              <StatCard
                title={t('common.used', 'Utilisées')}
                value={stats?.usedInvitationsCount || 0}
                icon={CheckCircle}
                variant="success"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '240ms' }}>
              <StatCard
                title={t('dashboard.my_access', 'Mes accès')}
                value={stats?.myAccessCount || 0}
                icon={QrCode}
              />
            </div>
          </>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Invitations with glass card styling */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-8 flex flex-col animate-slide-up" style={{ animationDelay: '350ms' }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 shadow-inner">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-black tracking-tight">{t('dashboard.recent_invitations', 'Invitations récentes')}</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/invitations')}
              className="text-primary hover:text-primary hover:bg-primary/5 font-black rounded-xl border-primary/20"
            >
              {t('common.view_all', 'Voir tout')}
            </Button>
          </div>

          <div className="flex-1 space-y-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
            ) : stats?.recentInvitations && stats.recentInvitations.length > 0 ? (
              <div className="space-y-3">
                {stats.recentInvitations.map((inv, index) => (
                  <div
                    key={index}
                    className="group flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UserPlus className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-black text-lg truncate group-hover:text-primary transition-colors">{inv.visitorName}</p>
                        <p className="text-sm text-muted-foreground/60 mt-0.5">
                          {format(new Date(inv.visitDate), 'dd MMMM yyyy', { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`px-4 py-1 rounded-full border shadow-sm font-black text-xs ${statusColors[inv.status]}`}>
                      {statusLabels[inv.status] || inv.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-56 opacity-40 text-center">
                <div className="p-6 rounded-full bg-muted/20 mb-4">
                  <CalendarPlus className="h-12 w-12" />
                </div>
                <p className="font-black text-lg uppercase tracking-widest">
                  {t('dashboard.no_recent_invitations', 'Aucune invitation')}
                </p>
                <p className="text-sm mt-1">Commencez par créer une invitation pour votre visiteur.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions for mobile focus */}
        <div className="glass-card rounded-3xl p-8 animate-slide-up" style={{ animationDelay: '450ms' }}>
          <h3 className="text-2xl font-black tracking-tight mb-8 font-black">{t('common.quick_actions', 'Actions rapides')}</h3>
          <div className="grid gap-4">
            <button
              onClick={() => navigate('/my-qr')}
              className="group relative overflow-hidden p-6 rounded-2xl bg-primary/5 border border-primary/10 hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 text-left"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <QrCode className="h-20 w-20 -mr-6 -mt-6 rotate-12" />
              </div>
              <div className="flex flex-col gap-4">
                <div className="p-3.5 rounded-xl bg-primary/10 w-fit group-hover:scale-110 transition-transform shadow-inner">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-black text-lg">{t('dashboard.my_qr_code', 'Mon QR Code')}</p>
                  <p className="text-sm text-muted-foreground/80 mt-1 leading-relaxed">{t('dashboard.my_qr_code_description', 'Afficher mon badge digital d\'accès')}</p>
                </div>
                <div className="mt-2 flex items-center gap-2 text-primary font-bold text-sm">
                  Ouvrir <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/invitations')}
              className="group relative overflow-hidden p-6 rounded-2xl bg-accent/5 border border-accent/10 hover:border-accent/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 text-left"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <CalendarPlus className="h-20 w-20 -mr-6 -mt-6 rotate-12" />
              </div>
              <div className="flex flex-col gap-4">
                <div className="p-3.5 rounded-xl bg-accent/10 w-fit group-hover:scale-110 transition-transform shadow-inner">
                  <CalendarPlus className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-black text-lg">{t('dashboard.create_invitation', 'Nouvelle invitation')}</p>
                  <p className="text-sm text-muted-foreground/80 mt-1 leading-relaxed">{t('dashboard.create_invitation_description', 'Enregistrer un nouveau visiteur')}</p>
                </div>
                <div className="mt-2 flex items-center gap-2 text-accent font-bold text-sm">
                  Inviter <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
