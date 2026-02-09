import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning';
}

const variantStyles = {
  default: 'bg-card',
  primary: 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
  accent: 'bg-gradient-to-br from-accent to-accent/80 text-accent-foreground',
  success: 'bg-gradient-to-br from-success to-success/80 text-success-foreground',
  warning: 'bg-gradient-to-br from-warning to-warning/80 text-warning-foreground',
};

const iconStyles = {
  default: 'bg-primary/10 text-primary',
  primary: 'bg-primary-foreground/20 text-primary-foreground',
  accent: 'bg-accent-foreground/20 text-accent-foreground',
  success: 'bg-success-foreground/20 text-success-foreground',
  warning: 'bg-warning-foreground/20 text-warning-foreground',
};

export function StatCard({ title, value, description, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  const isColoredVariant = variant !== 'default';

  return (
    <div className={`stat-card ${variantStyles[variant]} relative overflow-hidden group`}>
      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2">
          <p className={`text-sm font-medium tracking-wide uppercase ${isColoredVariant ? 'text-white/70' : 'text-muted-foreground/80'}`}>
            {title}
          </p>
          <p className="text-3xl font-extrabold tracking-tight">{value}</p>
          {description && (
            <p className={`text-sm leading-relaxed ${isColoredVariant ? 'text-white/60' : 'text-muted-foreground'}`}>
              {description}
            </p>
          )}
          {trend && (
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${trend.isPositive
                ? 'bg-success/10 text-success border border-success/20'
                : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}>
              <span>{trend.isPositive ? '↑' : '↓'} {trend.value}%</span>
            </div>
          )}
        </div>
        <div className={`p-3.5 rounded-2xl ${iconStyles[variant]} shadow-inner transform transition-transform group-hover:scale-110 duration-300`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
