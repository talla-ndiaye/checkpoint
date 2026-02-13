import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  MapPin,
  Users,
  BarChart3,
  History,
  Settings,
  Loader2,
  Menu,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { PWAInstallPrompt } from '@/components/ui/PWAInstallPrompt';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const { user, userRole, loading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const superAdminLinks = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Sites / Building", icon: MapPin, path: "/admin/sites" },
    { label: "Managers", icon: Users, path: "/admin/managers" },
    { label: "Analytiques", icon: BarChart3, path: "/analytics" },
    { label: "Historique", icon: History, path: "/access-history" },
    { label: "Paramètres", icon: Settings, path: "/admin/settings" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userName = user?.user_metadata?.first_name && user?.user_metadata?.last_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    : user?.email || t('common.user');

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Sidebar
        userRole={userRole || 'employee'}
        userName={userName}
        onLogout={signOut}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile header - Fixed flat bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 bg-background/80 backdrop-blur-md">
        <div className="bg-card rounded-2xl px-4 py-3 flex items-center justify-between border border-border shadow-md">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">SecureAccess</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="hover:bg-primary/5 hover:text-primary transition-colors rounded-xl"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <main className="lg:ml-72 min-h-screen relative z-10 pt-20 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 animate-fade-in max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      <PWAInstallPrompt />
    </div>
  );
}
