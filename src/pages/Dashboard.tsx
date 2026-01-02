import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Shield, QrCode, CalendarPlus, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { UserRole } from '@/lib/types';

// Mock data - will be replaced with real data from Supabase
const mockActivities = [
  { id: '1', type: 'entry' as const, userName: 'Marie Martin', siteName: 'Tour Eiffel Business', timestamp: 'Il y a 5 min' },
  { id: '2', type: 'exit' as const, userName: 'Jean Dupont', siteName: 'Tour Eiffel Business', timestamp: 'Il y a 12 min' },
  { id: '3', type: 'invitation' as const, userName: 'Sophie Bernard', siteName: 'La Défense Center', timestamp: 'Il y a 25 min' },
  { id: '4', type: 'entry' as const, userName: 'Pierre Durand', siteName: 'Marseille Hub', timestamp: 'Il y a 32 min' },
  { id: '5', type: 'exit' as const, userName: 'Claire Petit', siteName: 'Lyon Tech Park', timestamp: 'Il y a 45 min' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  // Mock user data - will be replaced with auth context
  const [userRole] = useState<UserRole>('super_admin');
  const [userName] = useState('Admin Test');

  const handleLogout = () => {
    navigate('/auth');
  };

  return (
    <DashboardLayout userRole={userRole} userName={userName} onLogout={handleLogout}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">
            Vue d'ensemble de l'activité et des statistiques
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Sites actifs"
            value={12}
            description="3 nouveaux ce mois"
            icon={Building2}
            variant="primary"
          />
          <StatCard
            title="Utilisateurs"
            value={1284}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Accès aujourd'hui"
            value={342}
            icon={Shield}
            variant="accent"
          />
          <StatCard
            title="Invitations actives"
            value={28}
            icon={CalendarPlus}
            variant="success"
          />
        </div>

        {/* Charts and Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Activity Chart Placeholder */}
          <div className="lg:col-span-2 glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Statistiques d'accès</h3>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="text-center">
                <QrCode className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  Graphique des accès
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Données en temps réel
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <RecentActivity activities={mockActivities} />
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <button className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors text-left group">
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Nouveau site</p>
                <p className="text-sm text-muted-foreground">Ajouter un bâtiment</p>
              </div>
            </button>
            <button className="flex items-center gap-4 p-4 rounded-xl bg-accent/5 border border-accent/20 hover:bg-accent/10 transition-colors text-left group">
              <div className="p-3 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium">Nouvel utilisateur</p>
                <p className="text-sm text-muted-foreground">Créer un compte</p>
              </div>
            </button>
            <button className="flex items-center gap-4 p-4 rounded-xl bg-success/5 border border-success/20 hover:bg-success/10 transition-colors text-left group">
              <div className="p-3 rounded-xl bg-success/10 group-hover:bg-success/20 transition-colors">
                <QrCode className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium">Scanner QR</p>
                <p className="text-sm text-muted-foreground">Vérifier un accès</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
