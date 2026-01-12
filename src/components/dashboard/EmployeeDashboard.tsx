import { useNavigate } from 'react-router-dom';
import { CalendarPlus, Clock, CheckCircle, QrCode, UserPlus } from 'lucide-react';
import { StatCard } from './StatCard';
import { useEmployeeStats } from '@/hooks/useRoleStats';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  approved: 'Approuvée',
  used: 'Utilisée',
  expired: 'Expirée',
  cancelled: 'Annulée'
};

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-primary/10 text-primary border-primary/20',
  used: 'bg-success/10 text-success border-success/20',
  expired: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20'
};

export function EmployeeDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useEmployeeStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mon espace employé</h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos invitations et consultez vos accès
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
              title="Mes invitations"
              value={stats?.myInvitationsCount || 0}
              icon={CalendarPlus}
              variant="primary"
            />
            <StatCard
              title="En attente"
              value={stats?.pendingInvitationsCount || 0}
              icon={Clock}
              variant="accent"
            />
            <StatCard
              title="Utilisées"
              value={stats?.usedInvitationsCount || 0}
              icon={CheckCircle}
              variant="success"
            />
            <StatCard
              title="Mes accès"
              value={stats?.myAccessCount || 0}
              icon={QrCode}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Invitations récentes</h3>
            <button 
              onClick={() => navigate('/invitations')}
              className="text-sm text-primary hover:underline"
            >
              Voir tout
            </button>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          ) : stats?.recentInvitations && stats.recentInvitations.length > 0 ? (
            <div className="space-y-3">
              {stats.recentInvitations.map((inv, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <UserPlus className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{inv.visitorName}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(inv.visitDate), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={statusColors[inv.status]}>
                    {statusLabels[inv.status] || inv.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarPlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucune invitation récente</p>
            </div>
          )}
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/my-qr')}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors text-left group"
            >
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Mon QR Code</p>
                <p className="text-sm text-muted-foreground">Afficher mon code d'accès</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/invitations')}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-accent/5 border border-accent/20 hover:bg-accent/10 transition-colors text-left group"
            >
              <div className="p-3 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <CalendarPlus className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium">Créer une invitation</p>
                <p className="text-sm text-muted-foreground">Inviter un visiteur</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/access-history')}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-success/5 border border-success/20 hover:bg-success/10 transition-colors text-left group"
            >
              <div className="p-3 rounded-xl bg-success/10 group-hover:bg-success/20 transition-colors">
                <Clock className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium">Mes accès</p>
                <p className="text-sm text-muted-foreground">Consulter mon historique</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
