import { UserRole, ROLE_LABELS, ROLE_COLORS } from '@/lib/types';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
}

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={`role-badge ${ROLE_COLORS[role]} ${sizeClasses[size]}`}>
      {ROLE_LABELS[role]}
    </span>
  );
}
