import { Link, useLocation } from 'react-router-dom';
import {
  Building2,
  Users,
  Shield,
  Briefcase,
  UserCircle,
  QrCode,
  CalendarPlus,
  History,
  FileBarChart,
  Settings,
  LogOut,
  LayoutDashboard,
  X,
  BarChart3,
  CreditCard,
} from 'lucide-react';
import { UserRole, ROLE_LABELS } from '@/lib/types';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

interface SidebarProps {
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const getMenuItemsByRole = (t: any): Record<UserRole, { label: string; icon: React.ElementType; path: string }[]> => ({
  super_admin: [
    { label: t('common.dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    { label: t('common.sites'), icon: Building2, path: '/admin/sites' },
    { label: t('common.managers'), icon: Users, path: '/admin/managers' },
    { label: t('common.history'), icon: History, path: '/access-history' },
    { label: t('common.analytics'), icon: BarChart3, path: '/analytics' },
    { label: t('common.reports'), icon: FileBarChart, path: '/reports' },
    { label: t('common.settings'), icon: Settings, path: '/admin/settings' },
  ],
  manager: [
    { label: t('common.dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    { label: t('common.guardians'), icon: Shield, path: '/manager/guardians' },
    { label: t('common.companies'), icon: Briefcase, path: '/manager/companies' },
    { label: t('common.company_admins'), icon: UserCircle, path: '/manager/company-admins' },
    { label: t('common.history'), icon: History, path: '/access-history' },
    { label: t('common.analytics'), icon: BarChart3, path: '/analytics' },
    { label: t('common.reports'), icon: FileBarChart, path: '/reports' },
  ],
  guardian: [
    { label: t('common.dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    { label: t('common.scan_qr'), icon: QrCode, path: '/scan' },
    { label: t('common.scan_id'), icon: CreditCard, path: '/scan/id-card' },
    { label: t('common.bulk_exit'), icon: LogOut, path: '/scan/bulk-exit' },
    { label: t('common.history'), icon: History, path: '/access-history' },
  ],
  company_admin: [
    { label: t('common.dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    { label: t('common.employees'), icon: Users, path: '/employees' },
    { label: t('common.history'), icon: History, path: '/access-history' },
    { label: t('common.reports'), icon: FileBarChart, path: '/reports' },
  ],
  employee: [
    { label: t('common.dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    { label: t('common.my_qr'), icon: QrCode, path: '/my-qr' },
    { label: t('common.invitations'), icon: CalendarPlus, path: '/invitations' },
    { label: t('common.history'), icon: History, path: '/access-history' },
  ],
});

export function Sidebar({ userRole, userName, onLogout, isOpen = true, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const menuItems = getMenuItemsByRole(t)[userRole];

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-sidebar-foreground">SecureAccess</h1>
              <p className="text-xs text-sidebar-foreground/60">{t('common.access_management')}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden text-sidebar-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={handleNavClick}
                    className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <UserCircle className="h-6 w-6 text-sidebar-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
              <RoleBadge role={userRole} size="sm" />
            </div>
            <LanguageSwitcher />
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">{t('common.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
