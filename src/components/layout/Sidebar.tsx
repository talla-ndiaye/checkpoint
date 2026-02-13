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
  ChevronRight,
  Inbox,
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
    { label: t('common.messages'), icon: Inbox, path: '/admin/messages' },
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
      {/* Overlay for mobile with simple semi-transparent background */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar with Solid Theme */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 bg-sidebar border-r border-sidebar-border shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between px-6 py-8 relative">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white/90">SecureAccess</h1>
              <p className="text-xs text-white/50 font-medium tracking-wide">Professional Access</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden text-white/70 hover:text-white hover:bg-white/5"
          >
            <X className="h-6 w-6" />
          </Button>

        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={handleNavClick}
                    className={`nav-link group ${isActive ? 'nav-link-active' : ''}`}
                  >
                    <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'text-white/60 group-hover:text-white group-hover:bg-white/5'}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className={`font-medium tracking-wide flex-1 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-white" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-6">
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center ring-2 ring-white/10">
                <UserCircle className="h-6 w-6 text-white/80" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white/90 truncate">{userName}</p>
                <div className="mt-1">
                  <RoleBadge role={userRole} size="sm" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center bg-black/20 rounded-lg p-2">
                <span className="text-xs text-white/50 uppercase font-medium pl-1">Langue</span>
                <LanguageSwitcher />
              </div>

              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-300 hover:text-white hover:bg-red-500/20 transition-all duration-300 group"
              >
                <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">{t('common.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
